"use client"; // reads the live editor draft + writes to IndexedDB on click

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/features/history/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";

type Status = "idle" | "saving" | "saved" | "error";

/** Snapshots the current resume draft into Phase 13 history, keyed by the draft's own id so re-saving updates the same record instead of duplicating it. */
export function SaveResumeButton() {
  const toSourceResume = useResumeEditorStore((state) => state.toSourceResume);
  const saveSourceResume = useHistoryStore((state) => state.saveSourceResume);
  const [status, setStatus] = useState<Status>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveSourceResume(toSourceResume());
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => void handleSave()} disabled={status === "saving"}>
        {status === "saving" ? "Saving…" : "Save to History"}
      </Button>
      {status === "saved" ? <span className="text-sm text-muted-foreground">Saved</span> : null}
      {status === "error" ? (
        <span role="alert" className="text-sm text-destructive">
          Could not save.
        </span>
      ) : null}
    </div>
  );
}
