import { MAX_RESUME_PAGE_COUNT } from "@/constants/files";
import { extractDocxLines } from "@/features/resume-import/docx/extractDocxResume";
import { validateResumeFile } from "@/features/resume-import/fileValidation";
import { importJsonResume } from "@/features/resume-import/json/importJsonResume";
import { extractPdfLines } from "@/features/resume-import/pdf/extractPdfResume";
import { classifyResumeLines } from "@/features/resume-import/sectionClassifier";
import type {
  ResumeImportOutcome,
  ResumeParseResult,
} from "@/features/resume-import/types";
import type { SourceResume } from "@/types/resume";

/** JSON is already schema-validated (trusted path); wrap it into the same shape as a pdf/docx parse result, all at high confidence. */
function wrapTrustedResumeAsParseResult(
  resume: SourceResume,
): ResumeParseResult {
  return {
    sourceFormat: "json",
    contact: { value: resume.contact, confidence: "high" },
    summary: { value: resume.summary, confidence: "high" },
    skills: resume.skills,
    experience: resume.experience,
    projects: resume.projects,
    education: resume.education,
    certifications: resume.certifications,
    unclassifiedBlocks: resume.unclassifiedBlocks,
    warnings: [],
  };
}

function describeExtractionError(
  code: "corrupted-file" | "too-many-pages" | "no-extractable-text",
): string {
  switch (code) {
    case "corrupted-file":
      return "The file could not be read. It may be corrupted or password-protected.";
    case "too-many-pages":
      return `The file has more than ${MAX_RESUME_PAGE_COUNT} pages.`;
    case "no-extractable-text":
      return "No extractable text was found. If this is a scanned/image-only PDF, re-export it as a text-based PDF or DOCX.";
  }
}

/**
 * Top-level Resume Import Module entry point (docs/PARSING_STRATEGY.md).
 * Validates the file, dispatches to the format-specific adapter, and
 * (for pdf/docx) runs the extracted lines through the shared section
 * classifier. JSON re-imports skip extraction entirely (trusted path).
 */
export async function importResume(file: File): Promise<ResumeImportOutcome> {
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (validation.format === "json") {
    const text = await file.text();
    const outcome = importJsonResume(text);
    if (!outcome.success) return { success: false, error: outcome.error };
    return {
      success: true,
      result: wrapTrustedResumeAsParseResult(outcome.resume),
    };
  }

  const buffer = await file.arrayBuffer();

  if (validation.format === "pdf") {
    const extraction = await extractPdfLines(buffer);
    if (!extraction.success) {
      return {
        success: false,
        error: {
          code: extraction.errorCode,
          message: describeExtractionError(extraction.errorCode),
        },
      };
    }
    return {
      success: true,
      result: {
        sourceFormat: "pdf",
        ...classifyResumeLines(extraction.result.lines),
      },
    };
  }

  const extraction = await extractDocxLines(buffer);
  if (!extraction.success) {
    return {
      success: false,
      error: {
        code: extraction.errorCode,
        message: describeExtractionError(extraction.errorCode),
      },
    };
  }
  return {
    success: true,
    result: {
      sourceFormat: "docx",
      ...classifyResumeLines(extraction.result.lines),
    },
  };
}
