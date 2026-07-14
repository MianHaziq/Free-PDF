import { describe, expect, it } from "vitest";

import { parseEducationSection } from "@/features/resume-import/educationExtractor";

describe("parseEducationSection", () => {
  it("extracts degree, institution, and dates, dropping trailing location", () => {
    const [entry] = parseEducationSection([
      "Bachelor in Software Development, Springfield State University, Springfield 11/2021 – 07/2025",
    ]);
    expect(entry.degree).toBe("Bachelor in Software Development");
    expect(entry.institution).toBe("Springfield State University");
    expect(entry.startDate).toBe("2021-11");
    expect(entry.endDate).toBe("2025-07");
  });

  it("handles a line with no dates", () => {
    const [entry] = parseEducationSection(["B.S. Computer Science, State University"]);
    expect(entry.degree).toBe("B.S. Computer Science");
    expect(entry.institution).toBe("State University");
    expect(entry.startDate).toBeNull();
    expect(entry.endDate).toBeNull();
  });

  it("puts unsplittable text into degree rather than guessing an institution", () => {
    const [entry] = parseEducationSection(["Computer Science"]);
    expect(entry.degree).toBe("Computer Science");
    expect(entry.institution).toBe("");
  });

  it("produces one entry per non-empty line", () => {
    const entries = parseEducationSection([
      "Degree One, Institution One 01/2018 – 01/2020",
      "Degree Two, Institution Two 01/2020 – 01/2022",
    ]);
    expect(entries).toHaveLength(2);
  });
});
