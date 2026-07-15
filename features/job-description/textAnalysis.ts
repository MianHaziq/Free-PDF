import { KNOWN_TECH_SKILLS } from "@/constants/techSkills";

const COMPANY_LABEL_REGEX = /^company\s*:\s*(.+)$/i;
const HEADER_LINE_SEPARATORS = ["·", "•", "|", " - ", " – ", " — "];
const MAX_COMPANY_SEGMENT_WORDS = 6;

/**
 * Best-effort title/company extraction. Only trusts two patterns common
 * across job boards: the pasted text's first line as the title (near-
 * universal convention), and either an explicit "Company: X" label or a
 * short "Company · Location"-style second line. Anything less clear is
 * left null rather than guessed (same philosophy as
 * docs/PARSING_STRATEGY.md's resume parsing rules).
 */
export function extractTitleAndCompany(rawText: string): {
  title: string;
  company: string | null;
} {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const title = lines[0] ?? "";

  for (const line of lines.slice(0, 10)) {
    const labelMatch = COMPANY_LABEL_REGEX.exec(line);
    if (labelMatch) {
      return { title, company: labelMatch[1].trim() };
    }
  }

  const secondLine = lines[1];
  if (secondLine) {
    for (const separator of HEADER_LINE_SEPARATORS) {
      const index = secondLine.indexOf(separator);
      if (index <= 0) continue;

      const candidate = secondLine.slice(0, index).trim();
      if (candidate && candidate.split(/\s+/).length <= MAX_COMPANY_SEGMENT_WORDS) {
        return { title, company: candidate };
      }
    }
  }

  return { title, company: null };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans text for recognizable tech skills/technologies (constants/techSkills.ts),
 * returning canonical names in first-appearance order, deduplicated.
 * Splitting required vs. preferred is Phase 7's job (needs contextual
 * "must have" vs "nice to have" language analysis) — this is a flat,
 * undifferentiated first pass.
 */
export function extractKeywords(rawText: string): string[] {
  const matches: { skill: string; index: number }[] = [];

  for (const skill of KNOWN_TECH_SKILLS) {
    const pattern = new RegExp(
      `(?<![A-Za-z0-9_])${escapeRegExp(skill)}(?![A-Za-z0-9_])`,
      "i",
    );
    const match = pattern.exec(rawText);
    if (match) {
      matches.push({ skill, index: match.index });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const found: string[] = [];
  for (const { skill } of matches) {
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(skill);
  }

  return found;
}
