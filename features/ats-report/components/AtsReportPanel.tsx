"use client"; // reads live resume + job description store state to compute the report

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAtsReport } from "@/features/ats-report/generateAtsReport";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Phase 10's ATS Report surfaced live: the formal docs/DATA_MODEL.md
 * AtsReport content (score, matched/missing keywords, strengths,
 * weaknesses, suggestions) generated from the same resume/job
 * description data as the match panel, but framed as a complete,
 * self-contained report rather than raw match data.
 */
export function AtsReportPanel() {
  const hasMounted = useHasMounted();
  const resumeState = useResumeEditorStore((state) => state);
  const jobDescriptionState = useJobDescriptionStore((state) => state);

  const outcome = useMemo(
    () => generateAtsReport(resumeState.toSourceResume(), jobDescriptionState.toJobDescription()),
    [resumeState, jobDescriptionState],
  );

  // Server-rendered HTML never has persisted store data (no IndexedDB during
  // SSR) — wait until after hydration to render content that depends on it,
  // or the server/client trees can disagree (see hooks/useHasMounted.ts).
  if (!hasMounted || !outcome.success) {
    return null;
  }

  const { report } = outcome;

  return (
    <Card>
      <CardHeader>
        <CardTitle>ATS Report</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">ATS score</p>
          <p className="text-3xl font-bold">{report.score}%</p>
        </div>

        {report.strengths.length > 0 ? (
          <div>
            <p className="font-medium">Strengths</p>
            <ul className="list-disc pl-5">
              {report.strengths.map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {report.weaknesses.length > 0 ? (
          <div>
            <p className="font-medium">Weaknesses</p>
            <ul className="list-disc pl-5">
              {report.weaknesses.map((weakness) => (
                <li key={weakness}>{weakness}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {report.suggestions.length > 0 ? (
          <div>
            <p className="font-medium">Suggestions</p>
            <ul className="list-disc pl-5">
              {report.suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <p>
            <span className="font-medium">Matched keywords:</span>{" "}
            {report.matchedKeywords.length > 0 ? report.matchedKeywords.join(", ") : "None yet"}
          </p>
          <p>
            <span className="font-medium">Missing keywords:</span>{" "}
            {report.missingKeywords.length > 0 ? report.missingKeywords.join(", ") : "None"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
