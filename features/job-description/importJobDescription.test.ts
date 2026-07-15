import { describe, expect, it, vi } from "vitest";

import {
  importJobDescriptionFromFile,
  importJobDescriptionFromText,
} from "@/features/job-description/importJobDescription";

vi.mock("@/features/resume-import/pdf/extractPdfResume", () => ({
  extractPdfLines: vi.fn(),
}));
vi.mock("@/features/resume-import/docx/extractDocxResume", () => ({
  extractDocxLines: vi.fn(),
}));

const { extractPdfLines } = await import("@/features/resume-import/pdf/extractPdfResume");
const { extractDocxLines } = await import("@/features/resume-import/docx/extractDocxResume");

describe("importJobDescriptionFromText", () => {
  it("builds a JobDescription directly from pasted text", () => {
    const jd = importJobDescriptionFromText("Backend Engineer\nAcme Corp · Remote\n\nUses React.");
    expect(jd.title).toBe("Backend Engineer");
    expect(jd.company).toBe("Acme Corp");
    expect(jd.keywords).toContain("React");
  });
});

describe("importJobDescriptionFromFile", () => {
  it("rejects an unsupported file format before dispatching to any adapter", async () => {
    const file = new File(["hello"], "job.txt");
    const outcome = await importJobDescriptionFromFile(file);
    expect(outcome.success).toBe(false);
    if (!outcome.success) expect(outcome.error.code).toBe("unsupported-format");
  });

  it("dispatches a .pdf file to the pdf adapter and flattens lines to rawText", async () => {
    vi.mocked(extractPdfLines).mockResolvedValue({
      success: true,
      result: {
        pageCount: 1,
        lines: [
          { text: "Backend Engineer", relativeFontSize: 1.5, isBold: false, isReconstructed: false },
          { text: "Uses Node.js.", relativeFontSize: 1, isBold: false, isReconstructed: false },
        ],
      },
    });

    const file = new File(["%PDF-1.4 fake"], "job.pdf");
    const outcome = await importJobDescriptionFromFile(file);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.jobDescription.title).toBe("Backend Engineer");
      expect(outcome.jobDescription.rawText).toContain("Uses Node.js.");
      expect(outcome.jobDescription.keywords).toContain("Node.js");
    }
  });

  it("propagates a pdf extraction error with a clear message", async () => {
    vi.mocked(extractPdfLines).mockResolvedValue({
      success: false,
      errorCode: "no-extractable-text",
    });

    const file = new File(["broken"], "job.pdf");
    const outcome = await importJobDescriptionFromFile(file);
    expect(outcome.success).toBe(false);
    if (!outcome.success) {
      expect(outcome.error.code).toBe("no-extractable-text");
    }
  });

  it("dispatches a .docx file to the docx adapter", async () => {
    vi.mocked(extractDocxLines).mockResolvedValue({
      success: true,
      result: {
        lines: [
          { text: "Frontend Engineer", relativeFontSize: 1.5, isBold: false, isReconstructed: false },
        ],
      },
    });

    const file = new File(["PK fake docx"], "job.docx");
    const outcome = await importJobDescriptionFromFile(file);
    expect(outcome.success).toBe(true);
    if (outcome.success) {
      expect(outcome.jobDescription.title).toBe("Frontend Engineer");
    }
  });
});
