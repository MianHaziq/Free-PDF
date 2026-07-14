import type { Confidence } from "@/types/common";
import type { SkillEntry } from "@/types/resume";

const MAX_CATEGORY_LABEL_WORDS = 4;
const MAX_CATEGORY_LABEL_LENGTH = 40;

/**
 * Parses a "Skills" section into individual entries. Handles both
 * "Category: skill1, skill2" lines and plain delimited lists, splitting
 * on commas, bullets, and pipes.
 */
export function parseSkillsSection(lines: string[]): SkillEntry[] {
  const entries: SkillEntry[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    let category: string | null = null;
    let listText = line;

    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && colonIndex <= MAX_CATEGORY_LABEL_LENGTH) {
      const label = line.slice(0, colonIndex).trim();
      if (label.length > 0 && label.split(/\s+/).length <= MAX_CATEGORY_LABEL_WORDS) {
        category = label;
        // Handles a stray double colon in the source text (e.g. "Label:: value").
        listText = line.slice(colonIndex + 1).replace(/^:+/, "");
      }
    }

    const tokens = listText
      .split(/[,•|]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const confidence: Confidence =
      category && tokens.length > 1
        ? "high"
        : tokens.length > 1
          ? "medium"
          : "low";

    for (const token of tokens) {
      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ name: token, category, confidence });
    }
  }

  return entries;
}
