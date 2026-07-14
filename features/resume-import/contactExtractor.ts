import type { Confidence } from "@/types/common";
import type { ContactInfo } from "@/types/resume";
import type { ParsedSection } from "@/features/resume-import/types";

const EMAIL_REGEX = /[\w.+-]+\s*@\s*[\w-]+(?:\s*\.\s*[\w-]+)+/;
const PHONE_REGEX = /\+?[\d][\d\s().-]{7,}\d/;
const URL_REGEX = /(https?:\/\/\S+|(?:www\.)?[\w-]+\.[a-z]{2,}\/\S+)/i;

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function extractEmail(lines: string[]): string | null {
  for (const line of lines) {
    const match = EMAIL_REGEX.exec(line);
    if (match) return match[0].replace(/\s+/g, "");
  }
  return null;
}

function extractPhone(lines: string[]): string | null {
  for (const line of lines) {
    const match = PHONE_REGEX.exec(line);
    if (match && countDigits(match[0]) >= 9) return match[0].trim();
  }
  return null;
}

/**
 * Only returns a URL when one is actually present in the text. A bare label
 * like "LinkedIn" with no extractable href is left null rather than guessed
 * (see docs/PARSING_STRATEGY.md "icons instead of text labels").
 */
function extractUrlContaining(
  lines: string[],
  domainHint: string,
): string | null {
  for (const line of lines) {
    if (!line.toLowerCase().includes(domainHint)) continue;
    const match = URL_REGEX.exec(line);
    if (match) return match[0];
  }
  return null;
}

function extractOtherWebsite(
  lines: string[],
  excludeSubstrings: string[],
): string | null {
  for (const line of lines) {
    const match = URL_REGEX.exec(line);
    if (!match) continue;
    const lower = match[0].toLowerCase();
    if (excludeSubstrings.some((s) => lower.includes(s))) continue;
    return match[0];
  }
  return null;
}

function extractLocation(lines: string[]): string | null {
  for (const line of lines) {
    for (const segment of line.split("|")) {
      const trimmed = segment.trim();
      if (!trimmed.includes(",")) continue;
      if (EMAIL_REGEX.test(trimmed)) continue;
      if (countDigits(trimmed) > 4) continue;
      if (URL_REGEX.test(trimmed)) continue;
      return trimmed;
    }
  }
  return null;
}

function hasBareLabelWithoutUrl(lines: string[], label: string): boolean {
  const hasLabel = lines.some((line) =>
    line.toLowerCase().includes(label),
  );
  const hasUrl = lines.some(
    (line) => line.toLowerCase().includes(label) && URL_REGEX.test(line),
  );
  return hasLabel && !hasUrl;
}

export interface ContactExtractionResult {
  section: ParsedSection<ContactInfo>;
  warnings: string[];
}

/**
 * Extracts contact details from the lines appearing before the first
 * classified section header (name, title, contact line in most resumes).
 * The first line is treated as the full name.
 */
export function extractContactInfo(
  preHeaderLines: string[],
): ContactExtractionResult {
  const fullName = (preHeaderLines[0] ?? "").trim();
  const rest = preHeaderLines.slice(1);

  const email = extractEmail(rest);
  const phone = extractPhone(rest);
  const linkedin = extractUrlContaining(rest, "linkedin");
  const github = extractUrlContaining(rest, "github");
  const website = extractOtherWebsite(rest, ["linkedin", "github"]);
  const location = extractLocation(rest);

  const foundCount = [email, phone, linkedin, github, website, location].filter(
    (v) => v !== null,
  ).length;
  const confidence: Confidence =
    foundCount >= 2 ? "high" : foundCount === 1 ? "medium" : "low";

  const warnings: string[] = [];
  if (hasBareLabelWithoutUrl(rest, "linkedin")) {
    warnings.push(
      "A LinkedIn label was found but no extractable URL; add it manually.",
    );
  }
  if (hasBareLabelWithoutUrl(rest, "github")) {
    warnings.push(
      "A GitHub label was found but no extractable URL; add it manually.",
    );
  }

  return {
    section: {
      value: { fullName, email, phone, location, linkedin, github, website },
      confidence,
    },
    warnings,
  };
}
