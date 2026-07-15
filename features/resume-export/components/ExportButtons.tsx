"use client"; // triggers async PDF/DOCX generation + a browser download on click

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { buildExportFilename } from "@/features/resume-export/buildExportFilename";
import { generateDocxBlob } from "@/features/resume-export/docx/generateDocxBlob";
import { downloadBlob } from "@/features/resume-export/downloadBlob";
import { generatePdfBlob } from "@/features/resume-export/pdf/generatePdfBlob";
import type { PreviewResumeData, TemplateId } from "@/features/resume-preview/types";

interface ExportButtonsProps {
  data: PreviewResumeData;
  templateId: TemplateId;
}

type ExportStatus = "idle" | "pdf" | "docx";

/** Phase 12: downloads an actual PDF/DOCX file matching whatever template/version is currently being previewed. */
export function ExportButtons({ data, templateId }: ExportButtonsProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");

  async function handleDownloadPdf() {
    setStatus("pdf");
    try {
      const blob = await generatePdfBlob(data, templateId);
      downloadBlob(blob, buildExportFilename(data.contact.fullName, "pdf"));
    } finally {
      setStatus("idle");
    }
  }

  async function handleDownloadDocx() {
    setStatus("docx");
    try {
      const blob = await generateDocxBlob(data);
      downloadBlob(blob, buildExportFilename(data.contact.fullName, "docx"));
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={handleDownloadPdf} disabled={status !== "idle"}>
        {status === "pdf" ? "Generating…" : "Download PDF"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleDownloadDocx}
        disabled={status !== "idle"}
      >
        {status === "docx" ? "Generating…" : "Download DOCX"}
      </Button>
    </div>
  );
}
