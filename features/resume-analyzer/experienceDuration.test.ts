import { describe, expect, it, vi } from "vitest";

import {
  calculateTotalExperienceMonths,
  monthsToYears,
} from "@/features/resume-analyzer/experienceDuration";
import type { ExperienceEntry } from "@/types/resume";

function entry(overrides: Partial<ExperienceEntry> = {}): ExperienceEntry {
  return {
    id: "1",
    company: "Acme",
    role: "Engineer",
    startDate: "2022-01",
    endDate: "2022-12",
    bullets: [],
    relevanceTags: [],
    ...overrides,
  };
}

describe("calculateTotalExperienceMonths", () => {
  it("computes a single role's duration inclusively", () => {
    // Jan through Dec 2022 inclusive = 12 months.
    expect(calculateTotalExperienceMonths([entry({ startDate: "2022-01", endDate: "2022-12" })])).toBe(
      12,
    );
  });

  it("sums non-overlapping, non-adjacent roles with a gap between them", () => {
    const entries = [
      entry({ startDate: "2020-01", endDate: "2020-06" }), // 6 months
      entry({ startDate: "2021-01", endDate: "2021-06" }), // 6 months, gap before it
    ];
    expect(calculateTotalExperienceMonths(entries)).toBe(12);
  });

  it("merges back-to-back roles with no gap into one continuous span", () => {
    const entries = [
      entry({ startDate: "2022-01", endDate: "2022-12" }),
      entry({ startDate: "2023-01", endDate: "2023-06" }),
    ];
    // 2022-01 through 2023-06 inclusive = 18 months, not 12+6=18 coincidentally
    // equal here, so use a case where double counting would differ:
    expect(calculateTotalExperienceMonths(entries)).toBe(18);
  });

  it("does not double-count overlapping concurrent roles", () => {
    const entries = [
      entry({ startDate: "2022-01", endDate: "2022-12" }),
      entry({ startDate: "2022-06", endDate: "2023-03" }), // overlaps with the first
    ];
    // Merged span: 2022-01 through 2023-03 inclusive = 15 months (not 12+10=22)
    expect(calculateTotalExperienceMonths(entries)).toBe(15);
  });

  it("skips entries with an unparseable or missing startDate rather than guessing", () => {
    const entries = [
      entry({ startDate: "", endDate: null }),
      entry({ startDate: "2022-01", endDate: "2022-06" }),
    ];
    expect(calculateTotalExperienceMonths(entries)).toBe(6);
  });

  it("treats a null endDate as ongoing (through the current month)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15)); // June 2024

    const entries = [entry({ startDate: "2024-01", endDate: null })];
    // Jan through June 2024 inclusive = 6 months.
    expect(calculateTotalExperienceMonths(entries)).toBe(6);

    vi.useRealTimers();
  });

  it("returns 0 for an empty list", () => {
    expect(calculateTotalExperienceMonths([])).toBe(0);
  });
});

describe("monthsToYears", () => {
  it("rounds to one decimal place", () => {
    expect(monthsToYears(18)).toBe(1.5);
    expect(monthsToYears(10)).toBe(0.8);
    expect(monthsToYears(0)).toBe(0);
  });
});
