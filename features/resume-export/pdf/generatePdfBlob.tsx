import { pdf } from "@react-pdf/renderer";

import { ClassicPdfDocument } from "@/features/resume-export/pdf/ClassicPdfDocument";
import { ModernPdfDocument } from "@/features/resume-export/pdf/ModernPdfDocument";
import type { PreviewResumeData, TemplateId } from "@/features/resume-preview/types";

/** Renders the same template the user is currently previewing to an actual downloadable PDF file. */
export async function generatePdfBlob(
  data: PreviewResumeData,
  templateId: TemplateId,
): Promise<Blob> {
  const document =
    templateId === "classic" ? <ClassicPdfDocument data={data} /> : <ModernPdfDocument data={data} />;

  return pdf(document).toBlob();
}
