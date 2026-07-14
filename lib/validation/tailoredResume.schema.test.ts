import { describe, expect, it } from "vitest";

import {
  tailoredResumeSchema,
  validateTailoredResumeReferences,
} from "@/lib/validation/tailoredResume.schema";

const sourceResumeId = "11111111-1111-4111-8111-111111111111";
const jobDescriptionId = "33333333-3333-4333-8333-333333333333";

const validTailoredResume = {
  id: "66666666-6666-4666-8666-666666666666",
  sourceResumeId,
  jobDescriptionId,
  createdAt: "2026-01-01T00:00:00.000Z",
  generationMethod: "rule-based" as const,
  content: {
    contact: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "Tailored backend-focused summary.",
    originalSummary: "Original full-stack summary.",
    skills: [
      { name: "Node.js", category: "Backend", confidence: "high" as const },
    ],
    experience: [],
    projects: [],
  },
  atsReportId: "44444444-4444-4444-8444-444444444444",
};

describe("tailoredResumeSchema", () => {
  it("accepts a fully valid tailored resume", () => {
    expect(tailoredResumeSchema.safeParse(validTailoredResume).success).toBe(
      true,
    );
  });

  it("rejects duplicate skill names in content (case-insensitive)", () => {
    const result = tailoredResumeSchema.safeParse({
      ...validTailoredResume,
      content: {
        ...validTailoredResume.content,
        skills: [
          { name: "Node.js", category: null, confidence: "high" },
          { name: "node.js", category: null, confidence: "medium" },
        ],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid generationMethod", () => {
    const result = tailoredResumeSchema.safeParse({
      ...validTailoredResume,
      generationMethod: "manual",
    });
    expect(result.success).toBe(false);
  });
});

describe("validateTailoredResumeReferences", () => {
  const existingSourceResumeIds = [sourceResumeId];
  const existingJobDescriptionIds = [jobDescriptionId];

  it("accepts references that exist", () => {
    const result = validateTailoredResumeReferences(
      { sourceResumeId, jobDescriptionId },
      existingSourceResumeIds,
      existingJobDescriptionIds,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects an orphaned sourceResumeId", () => {
    const result = validateTailoredResumeReferences(
      { sourceResumeId: "does-not-exist", jobDescriptionId },
      existingSourceResumeIds,
      existingJobDescriptionIds,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("orphaned-source-resume");
    }
  });

  it("rejects an orphaned jobDescriptionId", () => {
    const result = validateTailoredResumeReferences(
      { sourceResumeId, jobDescriptionId: "does-not-exist" },
      existingSourceResumeIds,
      existingJobDescriptionIds,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toContain("orphaned-job-description");
    }
  });

  it("reports both errors when both references are orphaned", () => {
    const result = validateTailoredResumeReferences(
      { sourceResumeId: "missing-1", jobDescriptionId: "missing-2" },
      existingSourceResumeIds,
      existingJobDescriptionIds,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(2);
    }
  });
});
