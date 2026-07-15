import { describe, expect, it } from "vitest";

import { buildExportFilename } from "@/features/resume-export/buildExportFilename";

describe("buildExportFilename", () => {
  it("replaces spaces with underscores and appends the extension", () => {
    expect(buildExportFilename("Jane Doe", "pdf")).toBe("Jane_Doe_Resume.pdf");
    expect(buildExportFilename("Jane Doe", "docx")).toBe("Jane_Doe_Resume.docx");
  });

  it("falls back to a generic name when there's no name yet", () => {
    expect(buildExportFilename("", "pdf")).toBe("Resume.pdf");
  });
});
