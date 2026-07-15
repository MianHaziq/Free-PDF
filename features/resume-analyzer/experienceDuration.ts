import type { ExperienceEntry } from "@/types/resume";

interface MonthRange {
  startMonth: number;
  endMonth: number;
}

function parseYearMonth(date: string): number | null {
  const match = /^(\d{4})-(\d{2})/.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return year * 12 + (month - 1);
}

function currentYearMonth(): number {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
}

/**
 * Computes total distinct months of professional experience by merging
 * overlapping/adjacent date ranges — concurrent roles aren't double-
 * counted, and gaps between roles aren't counted at all. Entries with an
 * unparseable/missing startDate are skipped rather than guessed (see
 * docs/PROJECT_GOAL.md "never misrepresent years of experience").
 */
export function calculateTotalExperienceMonths(entries: ExperienceEntry[]): number {
  const ranges: MonthRange[] = [];

  for (const entry of entries) {
    const startMonth = parseYearMonth(entry.startDate);
    if (startMonth === null) continue;

    const endMonth = entry.endDate ? parseYearMonth(entry.endDate) : currentYearMonth();
    if (endMonth === null || endMonth < startMonth) continue;

    ranges.push({ startMonth, endMonth });
  }

  if (ranges.length === 0) return 0;

  ranges.sort((a, b) => a.startMonth - b.startMonth);

  let totalMonths = 0;
  let currentStart = ranges[0].startMonth;
  let currentEnd = ranges[0].endMonth;

  for (let i = 1; i < ranges.length; i++) {
    const range = ranges[i];
    if (range.startMonth <= currentEnd + 1) {
      currentEnd = Math.max(currentEnd, range.endMonth);
    } else {
      totalMonths += currentEnd - currentStart + 1;
      currentStart = range.startMonth;
      currentEnd = range.endMonth;
    }
  }
  totalMonths += currentEnd - currentStart + 1;

  return totalMonths;
}

/** Rounded to one decimal place (e.g. 2.5 years). */
export function monthsToYears(months: number): number {
  return Math.round((months / 12) * 10) / 10;
}
