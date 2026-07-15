import { MAX_RESUME_FILE_SIZE_MB } from "@/constants/files";

/** Job descriptions support paste/PDF/DOCX (no JSON trusted path — see dev plan Phase 5). */
export const SUPPORTED_JD_IMPORT_FORMATS = ["pdf", "docx"] as const;
export type SupportedJdImportFormat = (typeof SUPPORTED_JD_IMPORT_FORMATS)[number];

const EXTENSION_TO_FORMAT: Record<string, SupportedJdImportFormat> = {
  pdf: "pdf",
  docx: "docx",
};

export function detectJdFileFormat(fileName: string): SupportedJdImportFormat | null {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_FORMAT[extension] ?? null;
}

export interface JdFileValidationError {
  code: "unsupported-format" | "file-too-large" | "empty-file";
  message: string;
}

export type JdFileValidationResult =
  | { valid: true; format: SupportedJdImportFormat }
  | { valid: false; error: JdFileValidationError };

/** Reuses the resume file size limit (constants/files.ts) — job postings are typically much shorter than resumes anyway, so a separate limit isn't warranted. */
export function validateJdFile(file: File): JdFileValidationResult {
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

  const format = detectJdFileFormat(file.name);
  if (!format) {
    return {
      valid: false,
      error: {
        code: "unsupported-format",
        message: `Unsupported file type. Supported formats: ${SUPPORTED_JD_IMPORT_FORMATS.join(", ")}.`,
      },
    };
  }

  return { valid: true, format };
}
