import { findDateRangeAnchor } from "@/features/resume-import/dateParsing";
import type { CertificationEntry } from "@/types/resume";

const LEADING_LABEL_REGEX = /^certifications?[,:]?\s*/i;

/**
 * Certification formats vary too widely to structure reliably in general.
 * This only handles the common "Name" + "Certification, Issuer" two-line
 * pattern with high confidence; anything more complex returns null so the
 * caller falls back to an unclassified block rather than guessing (see
 * docs/PARSING_STRATEGY.md "Core Principle").
 */
export function parseCertificationsSection(
  lines: string[],
): CertificationEntry[] | null {
  const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);

  if (nonEmptyLines.length === 0) return [];
  if (nonEmptyLines.length > 2) return null;

  const [name, issuerLine] = nonEmptyLines;
  let issuer: string | null = null;
  let date: string | null = null;

  if (issuerLine) {
    const dateMatch = findDateRangeAnchor(issuerLine);
    const withoutDate = dateMatch
      ? issuerLine.slice(0, dateMatch.matchIndex).trim()
      : issuerLine;
    const cleaned = withoutDate
      .replace(LEADING_LABEL_REGEX, "")
      .replace(/,\s*$/, "")
      .trim();
    issuer = cleaned || null;
    date = dateMatch?.startDate ?? null;
  }

  return [{ name, issuer, date }];
}
