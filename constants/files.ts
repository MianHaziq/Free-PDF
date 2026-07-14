/**
 * Resume import constraints.
 * See docs/PARSING_STRATEGY.md ("Very large files" failure mode).
 */

export const SUPPORTED_RESUME_IMPORT_FORMATS = ["pdf", "docx", "json"] as const;

export type SupportedResumeImportFormat =
  (typeof SUPPORTED_RESUME_IMPORT_FORMATS)[number];

export const MAX_RESUME_FILE_SIZE_MB = 5;

export const MAX_RESUME_PAGE_COUNT = 10;
