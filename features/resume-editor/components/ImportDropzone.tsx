"use client"; // file input + async import handling + local status state

import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { importResume } from "@/features/resume-import/importResume";

type ImportStatus = "idle" | "loading" | "error";

export function ImportDropzone() {
  const loadFromParseResult = useResumeEditorStore((state) => state.loadFromParseResult);
  const resetToBlank = useResumeEditorStore((state) => state.resetToBlank);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later

    if (!file) return;

    setStatus("loading");
    setErrorMessage(null);

    const outcome = await importResume(file);

    if (!outcome.success) {
      setStatus("error");
      setErrorMessage(outcome.error.message);
      return;
    }

    loadFromParseResult(outcome.result, file.name);
    setStatus("idle");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import or start a resume</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Importing…" : "Upload resume (PDF, DOCX, JSON)"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.json"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Upload resume file"
        />
        <Button type="button" variant="outline" onClick={() => resetToBlank()}>
          Start blank resume
        </Button>
        {errorMessage ? (
          <p role="alert" className="w-full text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
