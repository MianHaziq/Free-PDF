import { describe, expect, it } from "vitest";

import { detectJdFileFormat, validateJdFile } from "@/features/job-description/fileValidation";

describe("detectJdFileFormat", () => {
  it("detects pdf and docx by extension", () => {
    expect(detectJdFileFormat("job.pdf")).toBe("pdf");
    expect(detectJdFileFormat("job.DOCX")).toBe("docx");
  });

  it("returns null for json (no trusted path for job descriptions)", () => {
    expect(detectJdFileFormat("job.json")).toBeNull();
  });

  it("returns null for unsupported extensions", () => {
    expect(detectJdFileFormat("job.txt")).toBeNull();
  });
});

describe("validateJdFile", () => {
  function makeFile(name: string, sizeBytes: number): File {
    return new File([new Uint8Array(sizeBytes)], name);
  }

  it("accepts a valid pdf under the size limit", () => {
    expect(validateJdFile(makeFile("job.pdf", 1024)).valid).toBe(true);
  });

  it("rejects an empty file", () => {
    const result = validateJdFile(makeFile("job.pdf", 0));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("empty-file");
  });

  it("rejects a file over the size limit", () => {
    const result = validateJdFile(makeFile("job.pdf", 6 * 1024 * 1024));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("file-too-large");
  });

  it("rejects an unsupported format", () => {
    const result = validateJdFile(makeFile("job.json", 1024));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error.code).toBe("unsupported-format");
  });
});
