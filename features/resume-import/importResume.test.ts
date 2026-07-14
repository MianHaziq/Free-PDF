import { describe, expect, it, vi } from "vitest";

import { importResume } from "@/features/resume-import/importResume";

vi.mock("@/features/resume-import/pdf/extractPdfResume", () => ({
  extractPdfLines: vi.fn(),
}));
vi.mock("@/features/resume-import/docx/extractDocxResume", () => ({
  extractDocxLines: vi.fn(),
}));

const { extractPdfLines } = await import(
  "@/features/resume-import/pdf/extractPdfResume"
);
const { extractDocxLines } = await import(
  "@/features/resume-import/docx/extractDocxResume"
);

const validResumeJson = {
  id: "11111111-1111-4111-8111-111111111111",
  label: "Main Resume 2026",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  sourceFormat: "json" as const,
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
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  unclassifiedBlocks: [],
};

describe("importResume", () => {
  it("rejects an unsupported file format before dispatching to any adapter", async () => {
    const file = new File(["hello"], "resume.txt");
    const outcome = await importResume(file);
    expect(outcome.success).toBe(false);
    if (!outcome.success) expect(outcome.error.code).toBe("unsupported-format");
  });

  it("imports a valid JSON resume via the trusted path at high confidence", async () => {
    const file = new File([JSON.stringify(validResumeJson)], "resume.json");
    const outcome = await importResume(file);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.result.sourceFormat).toBe("json");
      expect(outcome.result.contact.confidence).toBe("high");
      expect(outcome.result.contact.value.fullName).toBe("Jane Doe");
    }
  });

  it("dispatches a .pdf file to the pdf adapter and classifies the lines", async () => {
    vi.mocked(extractPdfLines).mockResolvedValue({
      success: true,
      result: {
        pageCount: 1,
        lines: [
          { text: "Jane Doe", relativeFontSize: 2, isBold: false, isReconstructed: false },
          { text: "SUMMARY", relativeFontSize: 1.2, isBold: false, isReconstructed: false },
          { text: "Backend engineer.", relativeFontSize: 1, isBold: false, isReconstructed: false },
        ],
      },
    });

    const file = new File(["%PDF-1.4 fake"], "resume.pdf");
    const outcome = await importResume(file);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.result.sourceFormat).toBe("pdf");
      expect(outcome.result.summary.value).toBe("Backend engineer.");
    }
  });

  it("propagates a pdf extraction error with a clear message", async () => {
    vi.mocked(extractPdfLines).mockResolvedValue({
      success: false,
      errorCode: "corrupted-file",
    });

    const file = new File(["broken"], "resume.pdf");
    const outcome = await importResume(file);
    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.error.code).toBe("corrupted-file");
      expect(outcome.error.message).toContain("corrupted");
    }
  });

  it("dispatches a .docx file to the docx adapter and classifies the lines", async () => {
    vi.mocked(extractDocxLines).mockResolvedValue({
      success: true,
      result: {
        lines: [
          { text: "Jane Doe", relativeFontSize: 2, isBold: false, isReconstructed: false },
          { text: "SKILLS", relativeFontSize: 1.2, isBold: false, isReconstructed: false },
          { text: "React, Node.js", relativeFontSize: 1, isBold: false, isReconstructed: false },
        ],
      },
    });

    const file = new File(["PK fake docx"], "resume.docx");
    const outcome = await importResume(file);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.result.sourceFormat).toBe("docx");
      expect(outcome.result.skills.map((s) => s.name)).toContain("React");
    }
  });
});
