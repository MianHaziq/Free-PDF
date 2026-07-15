"use client"; // reads the live job description draft + writes to IndexedDB on click

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history/store";
import { useJobDescriptionStore } from "@/features/job-description/store";

/** Snapshots the current job description draft into Phase 13 history, keyed by the draft's own id so re-saving updates the same record instead of duplicating it. */
export function SaveJobDescriptionButton() {
  const toJobDescription = useJobDescriptionStore((state) => state.toJobDescription);
  const saveJobDescription = useHistoryStore((state) => state.saveJobDescription);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveJobDescription(toJobDescription());
      toast.success("Job description saved to history");
    } catch {
      toast.error("Could not save the job description");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={() => void handleSave()} disabled={isSaving}>
      {isSaving ? "Saving…" : "Save to History"}
    </Button>
  );
}
