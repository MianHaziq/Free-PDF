import type { ResumeLine } from "@/features/resume-import/types";

export interface PdfTextItemInput {
  str: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
}

export interface PdfPageInput {
  items: PdfTextItemInput[];
  pageWidth: number;
}

const Y_CLUSTER_TOLERANCE = 2;
const WORD_GAP_RATIO = 0.15;
const COLUMN_GAP_MIN_RATIO_OF_PAGE_WIDTH = 0.15;
const MIN_LINES_PER_COLUMN = 3;
/** A real second column carries a meaningful share of the page's text, not just a few short right-aligned fragments (e.g. dates). */
const MIN_COLUMN_TEXT_SHARE = 0.15;

interface RawLine {
  y: number;
  leftX: number;
  maxFontSize: number;
  text: string;
}

/**
 * Groups items into lines by y-proximity across the full page width, then
 * joins each line's words left-to-right. Must run before column splitting:
 * a line's items (e.g. a heading followed by a right-aligned date) share a
 * y-position and must stay together, or date-anchor detection downstream
 * breaks (see experienceExtractor.ts).
 */
function clusterItemsIntoLines(items: PdfTextItemInput[]): RawLine[] {
  const clusters: { y: number; items: PdfTextItemInput[] }[] = [];
  for (const item of items) {
    let cluster = clusters.find(
      (c) => Math.abs(c.y - item.y) <= Y_CLUSTER_TOLERANCE,
    );
    if (!cluster) {
      cluster = { y: item.y, items: [] };
      clusters.push(cluster);
    }
    cluster.items.push(item);
  }

  return clusters.map((cluster) => {
    const sorted = [...cluster.items].sort((a, b) => a.x - b.x);
    let text = "";
    let prevEnd: number | null = null;
    let maxFontSize = 0;

    for (const item of sorted) {
      maxFontSize = Math.max(maxFontSize, item.fontSize);
      if (prevEnd !== null) {
        const gap = item.x - prevEnd;
        if (gap > WORD_GAP_RATIO * item.fontSize) {
          text += " ";
        }
      }
      text += item.str;
      prevEnd = item.x + item.width;
    }

    return {
      y: cluster.y,
      leftX: sorted[0].x,
      maxFontSize,
      text: text.trim(),
    };
  });
}

/**
 * Detects a persistent x-gap splitting whole lines' left-edges into two
 * stable groups (a two-column/sidebar layout), requiring both a minimum
 * line count and a minimum share of the page's total text in the smaller
 * group. This rules out false positives like a handful of right-aligned
 * dates on otherwise single-column lines (see docs/PARSING_STRATEGY.md
 * "Multi-column / sidebar templates").
 */
function splitIntoColumnOrder(
  lines: RawLine[],
  pageWidth: number,
): { ordered: RawLine[]; isReconstructed: boolean } {
  const byReadingOrder = () => ({
    ordered: [...lines].sort((a, b) => b.y - a.y),
    isReconstructed: false,
  });

  if (lines.length < MIN_LINES_PER_COLUMN * 2) return byReadingOrder();

  const sortedByX = [...lines].sort((a, b) => a.leftX - b.leftX);
  let bestGapIndex = -1;
  let bestGap = 0;

  for (let i = 1; i < sortedByX.length; i++) {
    const gap = sortedByX[i].leftX - sortedByX[i - 1].leftX;
    if (gap > bestGap) {
      bestGap = gap;
      bestGapIndex = i;
    }
  }

  const gapThreshold = COLUMN_GAP_MIN_RATIO_OF_PAGE_WIDTH * pageWidth;
  if (bestGapIndex === -1 || bestGap < gapThreshold) return byReadingOrder();

  const leftColumn = sortedByX.slice(0, bestGapIndex);
  const rightColumn = sortedByX.slice(bestGapIndex);
  if (
    leftColumn.length < MIN_LINES_PER_COLUMN ||
    rightColumn.length < MIN_LINES_PER_COLUMN
  ) {
    return byReadingOrder();
  }

  const totalChars = lines.reduce((sum, l) => sum + l.text.length, 0);
  const smallerColumnChars = Math.min(
    leftColumn.reduce((sum, l) => sum + l.text.length, 0),
    rightColumn.reduce((sum, l) => sum + l.text.length, 0),
  );
  if (totalChars === 0 || smallerColumnChars / totalChars < MIN_COLUMN_TEXT_SHARE) {
    return byReadingOrder();
  }

  leftColumn.sort((a, b) => b.y - a.y);
  rightColumn.sort((a, b) => b.y - a.y);

  return { ordered: [...leftColumn, ...rightColumn], isReconstructed: true };
}

function computeBodyFontSize(pages: PdfPageInput[]): number {
  const counts = new Map<number, number>();
  for (const page of pages) {
    for (const item of page.items) {
      if (!item.str.trim()) continue;
      const rounded = Math.round(item.fontSize * 10) / 10;
      counts.set(rounded, (counts.get(rounded) ?? 0) + item.str.length);
    }
  }

  let mode = 0;
  let modeCount = -1;
  for (const [fontSize, count] of counts) {
    if (count > modeCount) {
      modeCount = count;
      mode = fontSize;
    }
  }

  return mode || 1;
}

/**
 * Converts pdf.js text-content items (already reduced to plain data: str,
 * position, width, font size) into format-agnostic ResumeLines in reading
 * order. Pure and synchronous so it's fully unit-testable without pdf.js.
 */
export function buildLinesFromPdfPages(pages: PdfPageInput[]): ResumeLine[] {
  const bodyFontSize = computeBodyFontSize(pages);
  const lines: ResumeLine[] = [];

  for (const page of pages) {
    const nonEmptyItems = page.items.filter((it) => it.str.trim().length > 0);
    const rawLines = clusterItemsIntoLines(nonEmptyItems);
    const { ordered, isReconstructed } = splitIntoColumnOrder(
      rawLines,
      page.pageWidth,
    );

    for (const rawLine of ordered) {
      if (!rawLine.text) continue;
      lines.push({
        text: rawLine.text,
        relativeFontSize: rawLine.maxFontSize / bodyFontSize,
        // pdf.js text content alone doesn't reliably expose bold/regular
        // without cross-referencing font descriptors; relativeFontSize
        // carries the header-detection signal for PDF instead.
        isBold: false,
        isReconstructed,
      });
    }
  }

  return lines;
}
