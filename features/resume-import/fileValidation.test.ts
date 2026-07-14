import { describe, expect, it } from "vitest";

import {
  detectResumeFormat,
  validateResumeFile,
} from "@/features/resume-import/fileValidation";

describe("detectResumeFormat", () => {
  it("detects pdf, docx, and json by extension", () => {
    expect(detectResumeFormat("resume.pdf")).toBe("pdf");
    expect(detectResumeFormat("resume.DOCX")).toBe("docx");
    expect(detectResumeFormat("resume.json")).toBe("json");
  });

  it("returns null for unsupported extensions", () => {
    expect(detectResumeFormat("resume.txt")).toBeNull();
    expect(detectResumeFormat("resume")).toBeNull();
  });
});

describe("validateResumeFile", () => {
  function makeFile(name: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], name);
  }

  it("accepts a valid pdf under the size limit", () => {
    const result = validateResumeFile(makeFile("resume.pdf", 1024));
    expect(result.valid).toBe(true);
  });

  it("rejects an empty file", () => {
    const result = validateResumeFile(makeFile("resume.pdf", 0));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("empty-file");
  });

  it("rejects a file over the size limit", () => {
    const result = validateResumeFile(
      makeFile("resume.pdf", 6 * 1024 * 1024),
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("file-too-large");
  });

  it("rejects an unsupported format", () => {
    const result = validateResumeFile(makeFile("resume.txt", 1024));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("unsupported-format");
  });
});
