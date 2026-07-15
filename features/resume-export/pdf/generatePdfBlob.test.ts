import { describe, expect, it } from "vitest";

import { generatePdfBlob } from "@/features/resume-export/pdf/generatePdfBlob";
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
  projects: [],
  education: [],
  certifications: [],
};

describe("generatePdfBlob", () => {
  it("generates a non-empty PDF blob for the classic template", async () => {
    const blob = await generatePdfBlob(sampleData, "classic");
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe("application/pdf");
  });

  it("generates a non-empty PDF blob for the modern template", async () => {
    const blob = await generatePdfBlob(sampleData, "modern");
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe("application/pdf");
  });

  it("still generates a valid PDF for an almost-empty resume", async () => {
    const blob = await generatePdfBlob(
      { ...sampleData, summary: "", skills: [], experience: [] },
      "classic",
    );
    expect(blob.size).toBeGreaterThan(0);
  });
});
