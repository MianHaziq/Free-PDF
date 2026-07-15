/** "Jane Doe" -> "Jane_Doe_Resume.pdf". Falls back to a generic name when there's no name yet. */
export function buildExportFilename(fullName: string, extension: "pdf" | "docx"): string {
  const trimmed = fullName.trim();
  if (!trimmed) return `Resume.${extension}`;
  return `${trimmed.replace(/\s+/g, "_")}_Resume.${extension}`;
}
