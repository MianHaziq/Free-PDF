import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { MAX_RESUME_PAGE_COUNT } from "@/constants/files";
import {
  buildLinesFromPdfPages,
  type PdfPageInput,
  type PdfTextItemInput,
} from "@/features/resume-import/pdf/buildPdfLines";
import type { ResumeLine } from "@/features/resume-import/types";

export interface PdfExtractionResult {
  lines: ResumeLine[];
  pageCount: number;
}

export type PdfExtractionErrorCode =
  | "corrupted-file"
  | "too-many-pages"
  | "no-extractable-text";

export type PdfExtractionOutcome =
  | { success: true; result: PdfExtractionResult }
  | { success: false; errorCode: PdfExtractionErrorCode };

/**
 * Extracts format-agnostic ResumeLines from a PDF using pdf.js. Runs
 * without a separate worker thread (useWorkerFetch: false) so it works
 * identically in the browser and in this project's Node-based test suite.
 */
export async function extractPdfLines(
  data: ArrayBuffer,
): Promise<PdfExtractionOutcome> {
  const loadingTask = getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    disableFontFace: true,
  });

  let numPages: number;
  const pages: PdfPageInput[] = [];

  try {
    const document = await loadingTask.promise;
    numPages = document.numPages;

    if (numPages > MAX_RESUME_PAGE_COUNT) {
      return { success: false, errorCode: "too-many-pages" };
    }

    for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();

      const items: PdfTextItemInput[] = [];
      for (const raw of textContent.items) {
        if (!("str" in raw) || !raw.str.trim()) continue;
        items.push({
          str: raw.str,
          x: raw.transform[4],
          y: raw.transform[5],
          width: raw.width,
          fontSize: raw.height || raw.transform[0],
        });
      }

      pages.push({ items, pageWidth: viewport.width });
    }
  } catch {
    return { success: false, errorCode: "corrupted-file" };
  }

  const lines = buildLinesFromPdfPages(pages);
  if (lines.length === 0) {
    return { success: false, errorCode: "no-extractable-text" };
  }

  return { success: true, result: { lines, pageCount: numPages } };
}
