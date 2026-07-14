import { findDateRangeAnchor } from "@/features/resume-import/dateParsing";
import type { EducationEntry } from "@/types/resume";

/**
 * Real-world education sections are usually one line per degree:
 * "Degree, Institution, Location StartDate – EndDate". Location isn't part
 * of EducationEntry, so it's intentionally dropped rather than merged into
 * another field.
 */
export function parseEducationSection(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const dateMatch = findDateRangeAnchor(line);
    const textWithoutDates = dateMatch
      ? (
          line.slice(0, dateMatch.matchIndex) +
          " " +
          line.slice(dateMatch.matchIndex + dateMatch.matchedText.length)
        )
          .replace(/\s+/g, " ")
          .trim()
      : line;

    const parts = textWithoutDates
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const degree = parts[0] ?? "";
    const institution = parts[1] ?? "";

    entries.push({
      institution,
      degree,
      field: null,
      startDate: dateMatch?.startDate ?? null,
      endDate: dateMatch?.endDate ?? null,
    });
  }

  return entries;
}
