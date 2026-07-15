"use client"; // reads the live editor draft + writes to IndexedDB on click

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";

/** Snapshots the current resume draft into Phase 13 history, keyed by the draft's own id so re-saving updates the same record instead of duplicating it. */
export function SaveResumeButton() {
  const toSourceResume = useResumeEditorStore((state) => state.toSourceResume);
  const saveSourceResume = useHistoryStore((state) => state.saveSourceResume);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveSourceResume(toSourceResume());
      toast.success("Resume saved to history");
    } catch {
      toast.error("Could not save the resume");
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
