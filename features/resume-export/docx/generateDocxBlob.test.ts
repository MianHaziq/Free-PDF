import { describe, expect, it } from "vitest";

import { generateDocxBlob } from "@/features/resume-export/docx/generateDocxBlob";
import type { PreviewResumeData } from "@/features/resume-preview/types";

const sampleData: PreviewResumeData = {
  contact: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    website: null,
  },
  summary: "Backend engineer.",
  skills: [{ name: "React", category: null, confidence: "high" }],
  experience: [
    {
      id: "e1",
      company: "Acme",
      role: "Engineer",
      startDate: "2022-01",
      endDate: null,
      bullets: ["Built things."],
      relevanceTags: [],
    },
  ],
  projects: [
    {
      id: "p1",
      name: "Project A",
      description: "A cool project.",
      technologies: [],
      bullets: ["Did stuff."],
      relevanceTags: [],
    },
  ],
  education: [
    { institution: "State U", degree: "B.S.", field: null, startDate: "2018-09", endDate: "2022-05" },
  ],
  certifications: [{ name: "AWS Certified", issuer: "Amazon", date: null }],
};

describe("generateDocxBlob", () => {
  it("generates a non-empty DOCX blob with every section populated", async () => {
    const blob = await generateDocxBlob(sampleData);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toContain("wordprocessingml");
  });

  it("still generates a valid DOCX for an almost-empty resume", async () => {
    const blob = await generateDocxBlob({
      ...sampleData,
      summary: "",
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
    });
    expect(blob.size).toBeGreaterThan(0);
  });
});
