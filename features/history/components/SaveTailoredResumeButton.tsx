"use client"; // reads live resume + job description store state, generates + persists the tailored resume/report pair on click

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { generateAtsReport } from "@/features/ats-report/generateAtsReport";
import { useHistoryStore } from "@/features/history/store";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { tailorResume } from "@/features/tailoring-engine/tailorResume";

type Status = "idle" | "saving" | "saved" | "error";

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

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);

    const resume = toSourceResume();
    const jobDescription = toJobDescription();
    const outcome = generateAtsReport(resume, jobDescription);

    if (!outcome.success) {
      setStatus("error");
      setErrorMessage(outcome.reason);
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
        setStatus("error");
        setErrorMessage("Could not save: the source resume or job description reference is missing.");
        return;
      }

      setStatus("saved");
    } catch {
      setStatus("error");
      setErrorMessage("Could not save to history.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" onClick={() => void handleSave()} disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save to History"}
      </Button>
      {status === "saved" ? <span className="text-sm text-muted-foreground">Saved</span> : null}
      {errorMessage ? (
        <span role="alert" className="text-sm text-destructive">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
