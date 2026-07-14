import type { ResumeLine } from "@/features/resume-import/types";

const BLOCK_TAGS = new Set([
  "P",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "TD",
  "TH",
]);

const HEADING_FONT_RATIOS: Record<string, number> = {
  H1: 2,
  H2: 1.6,
  H3: 1.3,
  H4: 1.15,
  H5: 1.15,
  H6: 1.15,
};

/** True when the element's entire text is wrapped in a single bold run. */
function isEntirelyBold(element: Element): boolean {
  const fullText = (element.textContent ?? "").trim();
  if (!fullText) return false;

  const boldChildren = Array.from(element.children).filter(
    (child) => child.tagName === "STRONG" || child.tagName === "B",
  );
  if (boldChildren.length !== 1) return false;

  return (boldChildren[0].textContent ?? "").trim() === fullText;
}

function walk(node: ParentNode, lines: ResumeLine[]): void {
  for (const child of Array.from(node.children)) {
    const tag = child.tagName;

    if (BLOCK_TAGS.has(tag)) {
      const text = (child.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text) {
        lines.push({
          text,
          relativeFontSize: HEADING_FONT_RATIOS[tag] ?? 1,
          isBold: isEntirelyBold(child),
          // Tables are the DOCX equivalent of PDF's multi-column layouts
          // (see docs/PARSING_STRATEGY.md); cells are flagged accordingly.
          isReconstructed: tag === "TD" || tag === "TH",
        });
      }
      // The element's full text was already captured; don't double-count
      // nested block tags (e.g. a <p> inside an <li>).
      continue;
    }

    walk(child, lines);
  }
}

/**
 * Converts mammoth's HTML output into format-agnostic ResumeLines, using
 * heading tags and fully-bold paragraphs as header signals, list items as
 * bullets, and table cells walked in document order (see
 * docs/PARSING_STRATEGY.md "DOCX (via mammoth)").
 */
export function buildLinesFromHtml(html: string): ResumeLine[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  const lines: ResumeLine[] = [];
  walk(document.body, lines);
  return lines;
}
