"use client"; // subscribes to live save-status updates

import { useSaveStatusStore } from "@/features/resume-editor/storage";

const STATUS_LABEL: Record<string, string> = {
  idle: "",
  pending: "Saving…",
  saved: "Saved",
};

export function SaveStatusIndicator() {
  const status = useSaveStatusStore((state) => state.status);
  const label = STATUS_LABEL[status];
  if (!label) return null;

  return (
    <p aria-live="polite" className="text-sm text-muted-foreground">
      {label}
    </p>
  );
}
