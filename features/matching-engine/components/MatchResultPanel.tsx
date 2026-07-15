"use client"; // reads live resume + job description store state to compute the match

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobDescriptionStore } from "@/features/job-description/store";
import { matchResumeToJobDescription } from "@/features/matching-engine/matchResumeToJobDescription";
import { analyzeResume } from "@/features/resume-analyzer/analyzeResume";
import { useResumeEditorStore } from "@/features/resume-editor/store";

/**
 * Phase 8's matching engine surfaced live: reads both the resume draft
 * and job description draft (each independently auto-saved) and shows
 * the ATS score, matched/missing skills, and recommendations without
 * requiring any extra "run match" step.
 */
export function MatchResultPanel() {
  const summary = useResumeEditorStore((state) => state.summary);
  const skills = useResumeEditorStore((state) => state.skills);
  const experience = useResumeEditorStore((state) => state.experience);
  const projects = useResumeEditorStore((state) => state.projects);
  const certifications = useResumeEditorStore((state) => state.certifications);

  const jobTitle = useJobDescriptionStore((state) => state.title);
  const requiredSkills = useJobDescriptionStore((state) => state.requiredSkills);
  const preferredSkills = useJobDescriptionStore((state) => state.preferredSkills);

  const result = useMemo(() => {
    const analysis = analyzeResume({
      summary,
      skills: skills.map((entry) => entry.data),
      experience,
      projects,
      certifications: certifications.map((entry) => entry.data),
    });
    return matchResumeToJobDescription(analysis.keywords, { requiredSkills, preferredSkills });
  }, [summary, skills, experience, projects, certifications, requiredSkills, preferredSkills]);

  const hasJobDescriptionSkills = requiredSkills.length > 0 || preferredSkills.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{jobTitle ? `Match for ${jobTitle}` : "Match"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {!hasJobDescriptionSkills ? (
          <p className="text-muted-foreground">
            Add required or preferred skills on the Job Description page to see a match score.
          </p>
        ) : (
          <>
            <div>
              <p className="text-muted-foreground">ATS match score</p>
              <p className="text-3xl font-bold">
                {result.score !== null ? `${result.score}%` : "—"}
              </p>
            </div>
            {result.requiredMatch.exact.length > 0 ? (
              <p>
                <span className="font-medium">Matched required:</span>{" "}
                {result.requiredMatch.exact.join(", ")}
              </p>
            ) : null}
            {result.requiredMatch.partial.length > 0 ? (
              <p>
                <span className="font-medium">Partially matched:</span>{" "}
                {result.requiredMatch.partial
                  .map((match) => `${match.jdSkill} (~${match.resumeSkill})`)
                  .join(", ")}
              </p>
            ) : null}
            {result.requiredMatch.missing.length > 0 ? (
              <p>
                <span className="font-medium">Missing required:</span>{" "}
                {result.requiredMatch.missing.join(", ")}
              </p>
            ) : null}
            {result.preferredMatch.missing.length > 0 ? (
              <p>
                <span className="font-medium">Missing preferred:</span>{" "}
                {result.preferredMatch.missing.join(", ")}
              </p>
            ) : null}
            {result.recommendations.length > 0 ? (
              <ul className="list-disc pl-5">
                {result.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
