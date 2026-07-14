import type { ISODateString } from "@/types/common";

const MONTH_NAME_TO_NUMBER: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

/** Matches "MM/YYYY" or "Month YYYY" (full or abbreviated month name). */
const SINGLE_DATE_REGEX = /(\d{1,2})\/(\d{4})|([A-Za-z]{3,9})\.?\s+(\d{4})\b/;

const RANGE_END_REGEX =
  /^\s*[-–—]\s*(Present|Current|\d{1,2}\/\d{4}|[A-Za-z]{3,9}\.?\s+\d{4})/i;

function parseSingleDate(text: string): ISODateString | null {
  const match = SINGLE_DATE_REGEX.exec(text);
  if (!match) return null;

  if (match[1] && match[2]) {
    const month = Number(match[1]);
    if (month < 1 || month > 12) return null;
    return `${match[2]}-${match[1].padStart(2, "0")}`;
  }

  if (match[3] && match[4]) {
    const month = MONTH_NAME_TO_NUMBER[match[3].toLowerCase()];
    if (!month) return null;
    return `${match[4]}-${month}`;
  }

  return null;
}

export interface DateRangeMatch {
  startDate: ISODateString;
  endDate: ISODateString | null;
  matchedText: string;
  matchIndex: number;
}

/**
 * Finds a "start – end" (or "start – Present") date range anchor in a line
 * of resume text. Only recognizes explicit month+year formats; bare years
 * are intentionally not treated as anchors since we cannot honestly assign
 * a month without inventing data (see docs/PROJECT_GOAL.md "never invent").
 */
export function findDateRangeAnchor(line: string): DateRangeMatch | null {
  const startMatch = SINGLE_DATE_REGEX.exec(line);
  if (!startMatch || startMatch.index === undefined) return null;

  const startDate = parseSingleDate(startMatch[0]);
  if (!startDate) return null;

  const afterStart = line.slice(startMatch.index + startMatch[0].length);
  const rangeMatch = RANGE_END_REGEX.exec(afterStart);
  if (!rangeMatch) return null;

  const endToken = rangeMatch[1];
  let endDate: ISODateString | null;
  if (/present|current/i.test(endToken)) {
    endDate = null;
  } else {
    const parsedEndDate = parseSingleDate(endToken);
    if (!parsedEndDate) return null;
    endDate = parsedEndDate;
  }

  return {
    startDate,
    endDate,
    matchedText: line.slice(
      startMatch.index,
      startMatch.index + startMatch[0].length + rangeMatch[0].length,
    ),
    matchIndex: startMatch.index,
  };
}
