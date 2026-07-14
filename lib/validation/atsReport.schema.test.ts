import { describe, expect, it } from "vitest";

import { atsReportSchema } from "@/lib/validation/atsReport.schema";

const validAtsReport = {
  id: "44444444-4444-4444-8444-444444444444",
  tailoredResumeId: "55555555-5555-4555-8555-555555555555",
  createdAt: "2026-01-01T00:00:00.000Z",
  score: 82,
  matchedKeywords: ["Node.js"],
  missingKeywords: ["Kubernetes"],
  strengths: ["Strong backend experience"],
  weaknesses: ["No cloud certifications"],
  suggestions: ["Add a project demonstrating CI/CD"],
};

describe("atsReportSchema", () => {
  it("accepts a valid report", () => {
    expect(atsReportSchema.safeParse(validAtsReport).success).toBe(true);
  });

  it("accepts boundary scores 0 and 100", () => {
    expect(
      atsReportSchema.safeParse({ ...validAtsReport, score: 0 }).success,
    ).toBe(true);
    expect(
      atsReportSchema.safeParse({ ...validAtsReport, score: 100 }).success,
    ).toBe(true);
  });

  it("rejects scores outside 0-100", () => {
    expect(
      atsReportSchema.safeParse({ ...validAtsReport, score: -1 }).success,
    ).toBe(false);
    expect(
      atsReportSchema.safeParse({ ...validAtsReport, score: 101 }).success,
    ).toBe(false);
  });
});
