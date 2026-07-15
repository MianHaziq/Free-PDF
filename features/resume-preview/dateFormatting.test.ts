import { describe, expect, it } from "vitest";

import { formatDateRange, formatMonthYear } from "@/features/resume-preview/dateFormatting";

describe("formatMonthYear", () => {
  it("formats a YYYY-MM date", () => {
    expect(formatMonthYear("2022-01")).toBe("Jan 2022");
    expect(formatMonthYear("2024-12")).toBe("Dec 2024");
  });

  it("returns the raw string unchanged when it doesn't parse, rather than guessing", () => {
    expect(formatMonthYear("not-a-date")).toBe("not-a-date");
    expect(formatMonthYear("")).toBe("");
  });
});

describe("formatDateRange", () => {
  it("formats a start and end date", () => {
    expect(formatDateRange("2022-01", "2022-12")).toBe("Jan 2022 – Dec 2022");
  });

  it("shows 'Present' for a null end date (current role)", () => {
    expect(formatDateRange("2022-01", null)).toBe("Jan 2022 – Present");
  });

  it("returns an empty string when there's no start date at all", () => {
    expect(formatDateRange("", null)).toBe("");
  });
});
