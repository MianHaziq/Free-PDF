import { convertToHtml } from "mammoth";

import { buildLinesFromHtml } from "@/features/resume-import/docx/buildDocxLines";
import type { ResumeLine } from "@/features/resume-import/types";

export interface DocxExtractionResult {
  lines: ResumeLine[];
}

export type DocxExtractionErrorCode = "corrupted-file" | "no-extractable-text";

export type DocxExtractionOutcome =
  | { success: true; result: DocxExtractionResult }
  | { success: false; errorCode: DocxExtractionErrorCode };

/** Extracts format-agnostic ResumeLines from a DOCX file via mammoth. */
export async function extractDocxLines(
  data: ArrayBuffer,
): Promise<DocxExtractionOutcome> {
  let html: string;
  try {
    const conversion = await convertToHtml({ arrayBuffer: data });
    html = conversion.value;
  } catch {
    return { success: false, errorCode: "corrupted-file" };
  }

  const lines = buildLinesFromHtml(html);
  if (lines.length === 0) {
    return { success: false, errorCode: "no-extractable-text" };
  }

  return { success: true, result: { lines } };
}
