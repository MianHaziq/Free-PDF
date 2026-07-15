import { describe, expect, it } from "vitest";

import { buildPreviewData } from "@/features/resume-preview/buildPreviewData";
import type { SourceResume } from "@/types/resume";
import type { TailoredResumeContent } from "@/types/tailored-resume";

function makeResume(): SourceResume {
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
    summary: "Original summary.",
    skills: [{ name: "React", category: null, confidence: "high" }],
    experience: [],
    projects: [],
    education: [{ institution: "State U", degree: "B.S.", field: null, startDate: null, endDate: null }],
    certifications: [{ name: "AWS Certified", issuer: null, date: null }],
    unclassifiedBlocks: [],
  };
}

describe("buildPreviewData", () => {
  it("uses the source resume directly when no tailored content is given", () => {
    const resume = makeResume();
    const data = buildPreviewData(resume);
    expect(data.summary).toBe("Original summary.");
    expect(data.skills).toEqual(resume.skills);
    expect(data.education).toEqual(resume.education);
  });

  it("uses tailored contact/summary/skills/experience/projects, but the source's education/certifications", () => {
    const resume = makeResume();
    const tailored: TailoredResumeContent = {
      contact: resume.contact,
      summary: "Tailored summary.",
      originalSummary: resume.summary,
      skills: [{ name: "Node.js", category: null, confidence: "high" }],
      experience: [],
      projects: [],
    };

    const data = buildPreviewData(resume, tailored);
    expect(data.summary).toBe("Tailored summary.");
    expect(data.skills).toEqual([{ name: "Node.js", category: null, confidence: "high" }]);
    // Not part of TailoredResumeContent — always from the source resume.
    expect(data.education).toEqual(resume.education);
    expect(data.certifications).toEqual(resume.certifications);
  });
});
