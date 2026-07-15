import { MAX_RESUME_PAGE_COUNT } from "@/constants/files";

export type DocumentExtractionErrorCode =
  | "corrupted-file"
  | "too-many-pages"
  | "no-extractable-text";

/** Shared PDF/DOCX extraction error messages, reused by both resume and job description import (both sit on top of the same pdf/docx adapters). */
export function describeExtractionError(code: DocumentExtractionErrorCode): string {
  switch (code) {
    case "corrupted-file":
      return "The file could not be read. It may be corrupted or password-protected.";
    case "too-many-pages":
      return `The file has more than ${MAX_RESUME_PAGE_COUNT} pages.`;
    case "no-extractable-text":
      return "No extractable text was found. If this is a scanned/image-only PDF, re-export it as a text-based PDF or DOCX.";
  }
}
