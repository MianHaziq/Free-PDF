"use client"; // textarea + file input + async import handling + local status state

import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { importJobDescriptionFromFile } from "@/features/job-description/importJobDescription";
import { useJobDescriptionStore } from "@/features/job-description/store";

type ImportStatus = "idle" | "loading" | "error";

export function PasteOrUploadPanel() {
  const loadFromText = useJobDescriptionStore((state) => state.loadFromText);
  const loadFromImport = useJobDescriptionStore((state) => state.loadFromImport);
  const resetToBlank = useJobDescriptionStore((state) => state.resetToBlank);

  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleAnalyzePastedText() {
    if (!pastedText.trim()) return;
    loadFromText(pastedText, "Pasted job description");
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setStatus("loading");
    setErrorMessage(null);

    const outcome = await importJobDescriptionFromFile(file);

    if (!outcome.success) {
      setStatus("error");
      setErrorMessage(outcome.error.message);
      return;
    }

    loadFromImport(outcome.jobDescription);
    setStatus("idle");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paste or upload a job description</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          aria-label="Paste job description text"
          placeholder="Paste the full job posting text here…"
          rows={6}
          value={pastedText}
          onChange={(event) => setPastedText(event.target.value)}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleAnalyzePastedText} disabled={!pastedText.trim()}>
            Analyze pasted text
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Importing…" : "Upload file (PDF, DOCX)"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload job description file"
          />
          <Button type="button" variant="ghost" onClick={() => resetToBlank()}>
            Start blank
          </Button>
        </div>
        {errorMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
