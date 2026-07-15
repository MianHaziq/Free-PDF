import { extractDocxLines } from "@/features/resume-import/docx/extractDocxResume";
import { describeExtractionError } from "@/features/resume-import/extractionErrorMessages";
import { extractPdfLines } from "@/features/resume-import/pdf/extractPdfResume";
import type { ResumeLine } from "@/features/resume-import/types";
import { createJobDescriptionFromText } from "@/features/job-description/blankJobDescription";
import { validateJdFile, type JdFileValidationError } from "@/features/job-description/fileValidation";
import type { JobDescription } from "@/types/job-description";

export interface JdImportError {
  code: string;
  message: string;
}

export type JdImportOutcome =
  | { success: true; jobDescription: JobDescription }
  | { success: false; error: JdImportError };

function linesToRawText(lines: ResumeLine[]): string {
  return lines.map((line) => line.text).join("\n");
}

/**
 * Job Description Module import (docs/PARSING_STRATEGY.md doesn't cover
 * JDs directly, but the same "never silently produce wrong data"
 * principle applies less here: unlike a resume, a job description has no
 * section structure to misclassify — it's just reused as flattened raw
 * text). Reuses the Phase 3 pdf/docx adapters rather than duplicating
 * pdf.js/mammoth wiring.
 */
export async function importJobDescriptionFromFile(file: File): Promise<JdImportOutcome> {
  const validation = validateJdFile(file);
  if (!validation.valid) {
    return { success: false, error: toJdImportError(validation.error) };
  }

  const buffer = await file.arrayBuffer();

  if (validation.format === "pdf") {
    const extraction = await extractPdfLines(buffer);
    if (!extraction.success) {
      return {
        success: false,
        error: { code: extraction.errorCode, message: describeExtractionError(extraction.errorCode) },
      };
    }
    return {
      success: true,
      jobDescription: createJobDescriptionFromText(
        linesToRawText(extraction.result.lines),
        file.name,
      ),
    };
  }

  const extraction = await extractDocxLines(buffer);
  if (!extraction.success) {
    return {
      success: false,
      error: { code: extraction.errorCode, message: describeExtractionError(extraction.errorCode) },
    };
  }
  return {
    success: true,
    jobDescription: createJobDescriptionFromText(linesToRawText(extraction.result.lines), file.name),
  };
}

function toJdImportError(error: JdFileValidationError): JdImportError {
  return { code: error.code, message: error.message };
}

/** The "paste text" import path — always succeeds (no extraction to fail). */
export function importJobDescriptionFromText(rawText: string, label?: string): JobDescription {
  return createJobDescriptionFromText(rawText, label);
}
