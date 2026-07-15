"use client"; // reads live resume + job description store state, generates + persists the tailored resume/report pair on click

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { generateAtsReport } from "@/features/ats-report/generateAtsReport";
import { useHistoryStore } from "@/features/history/store";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { tailorResume } from "@/features/tailoring-engine/tailorResume";

/**
 * Saves the currently-previewed tailored resume + ATS report as a real,
 * linked docs/DATA_MODEL.md TailoredResume/AtsReport pair. Auto-saves
 * the current source resume and job description drafts first (using
 * their own ids) so the FK references are always valid — the user
 * shouldn't have to remember to save those separately before this works.
 */
export function SaveTailoredResumeButton() {
  const toSourceResume = useResumeEditorStore((state) => state.toSourceResume);
  const toJobDescription = useJobDescriptionStore((state) => state.toJobDescription);
  const saveSourceResume = useHistoryStore((state) => state.saveSourceResume);
  const saveJobDescription = useHistoryStore((state) => state.saveJobDescription);
  const saveTailoredResumeWithReport = useHistoryStore((state) => state.saveTailoredResumeWithReport);

  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);

    const resume = toSourceResume();
    const jobDescription = toJobDescription();
    const outcome = generateAtsReport(resume, jobDescription);

    if (!outcome.success) {
      toast.error(outcome.reason);
      setIsSaving(false);
      return;
    }

    try {
      await saveSourceResume(resume);
      await saveJobDescription(jobDescription);

      const content = tailorResume(resume, jobDescription);
      const result = await saveTailoredResumeWithReport({
        sourceResumeId: resume.id,
        jobDescriptionId: jobDescription.id,
        content,
        report: outcome.report,
      });

      if (!result.success) {
        toast.error("Could not save: the source resume or job description reference is missing.");
        return;
      }

      toast.success("Tailored resume saved to history");
    } catch {
      toast.error("Could not save to history");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Button type="button" size="sm" onClick={() => void handleSave()} disabled={isSaving}>
      {isSaving ? "Saving…" : "Save to History"}
    </Button>
  );
}
