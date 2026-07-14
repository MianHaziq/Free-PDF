import { describe, expect, it } from "vitest";

import { findDateRangeAnchor } from "@/features/resume-import/dateParsing";

describe("findDateRangeAnchor", () => {
  it("parses MM/YYYY - Present", () => {
    const result = findDateRangeAnchor(
      "Acme Corp, Associate Software Engineer 12/2025 – Present",
    );
    expect(result?.startDate).toBe("2025-12");
    expect(result?.endDate).toBeNull();
  });

  it("parses MM/YYYY - MM/YYYY", () => {
    const result = findDateRangeAnchor("Some Role 04/2026 – 06/2026");
    expect(result?.startDate).toBe("2026-04");
    expect(result?.endDate).toBe("2026-06");
  });

  it("parses full month names", () => {
    const result = findDateRangeAnchor("Role January 2022 - March 2023");
    expect(result?.startDate).toBe("2022-01");
    expect(result?.endDate).toBe("2023-03");
  });

  it("parses abbreviated month names", () => {
    const result = findDateRangeAnchor("Role Jan 2022 - Mar 2023");
    expect(result?.startDate).toBe("2022-01");
    expect(result?.endDate).toBe("2023-03");
  });

  it("returns null when no date range is present", () => {
    expect(findDateRangeAnchor("Just a bullet point with no dates")).toBeNull();
  });

  it("returns null for a bare year range (would require inventing a month)", () => {
    expect(findDateRangeAnchor("Role 2022 - 2024")).toBeNull();
  });

  it("reports matchIndex and matchedText for splitting the heading", () => {
    const line = "Acme Corp, Associate Software Engineer 12/2025 – Present";
    const result = findDateRangeAnchor(line);
    expect(result).not.toBeNull();
    if (result) {
      expect(line.slice(0, result.matchIndex).trim()).toBe(
        "Acme Corp, Associate Software Engineer",
      );
    }
  });
});
