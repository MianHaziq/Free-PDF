import { describe, expect, it } from "vitest";

import { generateAtsReport } from "@/features/ats-report/generateAtsReport";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";

function makeJobDescription(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "jd-1",
    label: "Test JD",
    createdAt: "2026-01-01T00:00:00.000Z",
    rawText: "",
    title: "Backend Engineer",
    company: null,
    requiredSkills: [],
    preferredSkills: [],
    experienceLevel: null,
    keywords: [],
    ...overrides,
  };
}

function makeResume(overrides: Partial<SourceResume> = {}): SourceResume {
  return {
    id: "resume-1",
    label: "Test Resume",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sourceFormat: "json",
    contact: {
      fullName: "Jane Doe",
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    unclassifiedBlocks: [],
    ...overrides,
  };
}

describe("generateAtsReport", () => {
  it("fails rather than fabricating a score when the job description has no skills", () => {
    const outcome = generateAtsReport(makeResume(), makeJobDescription());
    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.reason).toContain("Add required or preferred skills");
    }
  });

  it("produces a score within 0-100 bounds", () => {
    const resume = makeResume({
      skills: [{ name: "React", category: null, confidence: "high" }],
    });
    const jd = makeJobDescription({ requiredSkills: ["React", "Node.js"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.score).toBeGreaterThanOrEqual(0);
      expect(outcome.report.score).toBeLessThanOrEqual(100);
    }
  });

  it("reports matched and missing keywords", () => {
    const resume = makeResume({
      skills: [{ name: "React", category: null, confidence: "high" }],
    });
    const jd = makeJobDescription({ requiredSkills: ["React", "Kubernetes"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.matchedKeywords).toEqual(["React"]);
      expect(outcome.report.missingKeywords).toEqual(["Kubernetes"]);
    }
  });

  it("lists a strength for full required-skill coverage", () => {
    const resume = makeResume({
      skills: [{ name: "React", category: null, confidence: "high" }],
    });
    const jd = makeJobDescription({ requiredSkills: ["React"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(
        outcome.report.strengths.some((s) => s.includes("Covers every required skill")),
      ).toBe(true);
    }
  });

  it("flags missing required skills, an empty summary, and no experience as weaknesses", () => {
    const resume = makeResume({ summary: "" });
    const jd = makeJobDescription({ requiredSkills: ["React"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.weaknesses).toEqual(
        expect.arrayContaining([
          "Missing required skills: React.",
          "No professional summary provided.",
          "No work experience listed.",
        ]),
      );
    }
  });

  it("flags unreviewed unclassified content from import as a weakness and suggestion", () => {
    const resume = makeResume({
      unclassifiedBlocks: [{ rawText: "some raw text", suggestedSection: null, confidence: "low" }],
    });
    const jd = makeJobDescription({ requiredSkills: ["React"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.weaknesses.some((w) => w.includes("haven't been reviewed"))).toBe(true);
      expect(outcome.report.suggestions.some((s) => s.includes("unclassified items"))).toBe(true);
    }
  });

  it("never lists a skill the resume doesn't have as matched", () => {
    const resume = makeResume();
    const jd = makeJobDescription({ requiredSkills: ["Kubernetes"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.matchedKeywords).toEqual([]);
      expect(outcome.report.missingKeywords).toEqual(["Kubernetes"]);
    }
  });

  it("carries forward the matching engine's conditionally-phrased recommendations as suggestions", () => {
    const resume = makeResume();
    const jd = makeJobDescription({ requiredSkills: ["Kubernetes"] });
    const outcome = generateAtsReport(resume, jd);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.report.suggestions.some((s) => s.includes("If you have relevant experience"))).toBe(
        true,
      );
    }
  });
});
