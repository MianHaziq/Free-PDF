import { findDateRangeAnchor } from "@/features/resume-import/dateParsing";
import type { ISODateString } from "@/types/common";

const BULLET_MARKER_REGEX = /^[•\-*●▪]\s*/;

function endsWithTerminalPunctuation(text: string): boolean {
  return /[.!?]\s*$/.test(text);
}

/**
 * Groups wrapped PDF/DOCX lines into bullets. A line without a bullet
 * marker is treated as a continuation of the previous bullet unless that
 * bullet already ended with terminal punctuation (heuristic for "this is a
 * new sub-heading, not a line-wrap").
 */
export function collectBullets(lines: string[]): string[] {
  const bullets: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBulletMarked = BULLET_MARKER_REGEX.test(line);
    const text = line.replace(BULLET_MARKER_REGEX, "").trim();
    if (!text) continue;

    const previous = bullets[bullets.length - 1];
    const shouldContinuePrevious =
      !isBulletMarked &&
      previous !== undefined &&
      !endsWithTerminalPunctuation(previous);

    if (shouldContinuePrevious) {
      bullets[bullets.length - 1] = `${previous} ${text}`.trim();
    } else {
      bullets.push(text);
    }
  }

  return bullets;
}

export interface DateAnchoredSegment {
  heading: string;
  startDate: ISODateString;
  endDate: ISODateString | null;
  bodyLines: string[];
}

export interface SegmentationResult {
  segments: DateAnchoredSegment[];
  /** Lines before the first anchor, which cannot be confidently attributed to any entry. */
  leftoverLines: string[];
}

/**
 * Splits a section's lines into entries anchored by "start – end" date
 * ranges (see dateParsing.ts). Used for both Experience and Projects,
 * whose real-world layouts both use one date-anchored heading per entry
 * followed by free-form bullet lines.
 */
export function segmentLinesByDateAnchor(lines: string[]): SegmentationResult {
  const anchors: {
    lineIndex: number;
    heading: string;
    startDate: ISODateString;
    endDate: ISODateString | null;
  }[] = [];

  lines.forEach((line, lineIndex) => {
    const match = findDateRangeAnchor(line);
    if (!match) return;

    const heading = (
      line.slice(0, match.matchIndex) +
      " " +
      line.slice(match.matchIndex + match.matchedText.length)
    )
      .replace(/\s+/g, " ")
      .trim();

    anchors.push({
      lineIndex,
      heading,
      startDate: match.startDate,
      endDate: match.endDate,
    });
  });

  if (anchors.length === 0) {
    return { segments: [], leftoverLines: lines };
  }

  const leftoverLines = lines.slice(0, anchors[0].lineIndex);
  const segments: DateAnchoredSegment[] = anchors.map((anchor, i) => {
    const nextLineIndex =
      i + 1 < anchors.length ? anchors[i + 1].lineIndex : lines.length;
    return {
      heading: anchor.heading,
      startDate: anchor.startDate,
      endDate: anchor.endDate,
      bodyLines: lines.slice(anchor.lineIndex + 1, nextLineIndex),
    };
  });

  return { segments, leftoverLines };
}
