"use client"; // controlled textarea writing straight through to the store

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useResumeEditorStore } from "@/features/resume-editor/store";

export function SummarySection() {
  const summary = useResumeEditorStore((state) => state.summary);
  const setSummary = useResumeEditorStore((state) => state.setSummary);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label="Professional summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          rows={4}
        />
      </CardContent>
    </Card>
  );
}
