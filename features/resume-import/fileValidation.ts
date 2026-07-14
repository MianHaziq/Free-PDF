import {
  MAX_RESUME_FILE_SIZE_MB,
  SUPPORTED_RESUME_IMPORT_FORMATS,
  type SupportedResumeImportFormat,
} from "@/constants/files";
import type { ResumeImportError } from "@/features/resume-import/types";

const EXTENSION_TO_FORMAT: Record<string, SupportedResumeImportFormat> = {
  pdf: "pdf",
  docx: "docx",
  json: "json",
};

/** Extension-based detection (MIME types are unreliable across browsers/OS). */
export function detectResumeFormat(
  fileName: string,
): SupportedResumeImportFormat | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_FORMAT[extension] ?? null;
}

export type ResumeFileValidationResult =
  | { valid: true; format: SupportedResumeImportFormat }
  | { valid: false; error: ResumeImportError };

export function validateResumeFile(file: File): ResumeFileValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: { code: "empty-file", message: "The selected file is empty." },
    };
  }

  const maxBytes = MAX_RESUME_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: {
        code: "file-too-large",
        message: `File exceeds the ${MAX_RESUME_FILE_SIZE_MB}MB limit.`,
      },
    };
  }

  const format = detectResumeFormat(file.name);
  if (!format) {
    return {
      valid: false,
      error: {
        code: "unsupported-format",
        message: `Unsupported file type. Supported formats: ${SUPPORTED_RESUME_IMPORT_FORMATS.join(", ")}.`,
      },
    };
  }

  return { valid: true, format };
}
