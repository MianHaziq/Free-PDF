"use client"; // reads live resume + job description store state to compute the tailored preview

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { tailorResume } from "@/features/tailoring-engine/tailorResume";

/**
 * Phase 9's tailoring engine surfaced live, appended to the match page:
 * a read-only reordered view (skills/experience/projects prioritized
 * toward the job description) plus a template-generated summary shown
 * next to the untouched original for comparison. A full print-ready
 * layout is Phase 11's job — this just proves the tailoring itself.
 */
export function TailoredResumePreview() {
  const resumeState = useResumeEditorStore((state) => state);
  const jobDescriptionState = useJobDescriptionStore((state) => state);

  const tailored = useMemo(
    () => tailorResume(resumeState.toSourceResume(), jobDescriptionState.toJobDescription()),
    [resumeState, jobDescriptionState],
  );

  const hasJobDescriptionSkills =
    jobDescriptionState.requiredSkills.length > 0 || jobDescriptionState.preferredSkills.length > 0;

  if (!hasJobDescriptionSkills) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tailored Resume Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <div>
          <p className="font-medium">Tailored summary</p>
          <p>{tailored.summary}</p>
          {tailored.originalSummary ? (
            <p className="mt-1 text-muted-foreground">Original: {tailored.originalSummary}</p>
          ) : null}
        </div>

        <div>
          <p className="font-medium">Skills (reordered)</p>
          <p>{tailored.skills.map((skill) => skill.name).join(", ") || "—"}</p>
        </div>

        {tailored.experience.length > 0 ? (
          <div>
            <p className="font-medium">Experience (reordered)</p>
            <ul className="flex flex-col gap-2">
              {tailored.experience.map((entry) => (
                <li key={entry.id}>
                  <p className="font-medium">
                    {entry.role} — {entry.company}
                  </p>
                  <ul className="list-disc pl-5">
                    {entry.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tailored.projects.length > 0 ? (
          <div>
            <p className="font-medium">Projects (reordered)</p>
            <ul className="flex flex-col gap-2">
              {tailored.projects.map((entry) => (
                <li key={entry.id}>
                  <p className="font-medium">{entry.name}</p>
                  <ul className="list-disc pl-5">
                    {entry.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
