"use client"; // template/source selection state + live store reads

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { ExportButtons } from "@/features/resume-export/components/ExportButtons";
import { buildPreviewData } from "@/features/resume-preview/buildPreviewData";
import { ClassicTemplate } from "@/features/resume-preview/components/ClassicTemplate";
import { ModernTemplate } from "@/features/resume-preview/components/ModernTemplate";
import type { TemplateId } from "@/features/resume-preview/types";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { tailorResume } from "@/features/tailoring-engine/tailorResume";
import { useHasMounted } from "@/hooks/useHasMounted";

type SourceMode = "current" | "tailored";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
];

/**
 * Phase 11: a live, print-friendly, ATS-safe resume preview with a
 * choice of templates, and (when a job description has been analyzed)
 * a toggle between the current resume and Phase 9's tailored version.
 */
export function ResumePreview() {
  const hasMounted = useHasMounted();
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [source, setSource] = useState<SourceMode>("current");

  const resumeState = useResumeEditorStore((state) => state);
  const jobDescriptionState = useJobDescriptionStore((state) => state);

  const hasJobDescriptionSkills =
    jobDescriptionState.requiredSkills.length > 0 || jobDescriptionState.preferredSkills.length > 0;

  const previewData = useMemo(() => {
    const resume = resumeState.toSourceResume();
    if (source === "tailored" && hasJobDescriptionSkills) {
      const tailored = tailorResume(resume, jobDescriptionState.toJobDescription());
      return buildPreviewData(resume, tailored);
    }
    return buildPreviewData(resume);
  }, [resumeState, jobDescriptionState, source, hasJobDescriptionSkills]);

  // See hooks/useHasMounted.ts — SSR never has persisted store data.
  if (!hasMounted) return null;

  const TemplateComponent = templateId === "classic" ? ClassicTemplate : ModernTemplate;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Template:</span>
          {TEMPLATES.map((template) => (
            <Button
              key={template.id}
              type="button"
              size="sm"
              variant={templateId === template.id ? "default" : "outline"}
              onClick={() => setTemplateId(template.id)}
            >
              {template.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Version:</span>
          <Button
            type="button"
            size="sm"
            variant={source === "current" ? "default" : "outline"}
            onClick={() => setSource("current")}
          >
            Current resume
          </Button>
          <Button
            type="button"
            size="sm"
            variant={source === "tailored" ? "default" : "outline"}
            disabled={!hasJobDescriptionSkills}
            onClick={() => setSource("tailored")}
          >
            Tailored for job
          </Button>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
        <ExportButtons data={previewData} templateId={templateId} />
      </div>
      <TemplateComponent data={previewData} />
    </div>
  );
}
