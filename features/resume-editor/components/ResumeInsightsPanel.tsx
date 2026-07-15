"use client"; // recomputes insights from the live resume draft on every relevant change

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeResume } from "@/features/resume-analyzer/analyzeResume";
import { useResumeEditorStore } from "@/features/resume-editor/store";
import { useHasMounted } from "@/hooks/useHasMounted";

/**
 * Surfaces Phase 6's resume analysis (docs/Resume_Tailoring_Platform_Development_Plan.md
 * "Generate resume statistics") directly in the editor, and flags tech
 * mentioned in bullets/projects that hasn't been added to the Skills
 * section — a quick, actionable nudge for ATS keyword coverage.
 */
export function ResumeInsightsPanel() {
  const hasMounted = useHasMounted();
  const summary = useResumeEditorStore((state) => state.summary);
  const skills = useResumeEditorStore((state) => state.skills);
  const experience = useResumeEditorStore((state) => state.experience);
  const projects = useResumeEditorStore((state) => state.projects);
  const certifications = useResumeEditorStore((state) => state.certifications);

  const analysis = useMemo(
    () =>
      analyzeResume({
        summary,
        skills: skills.map((entry) => entry.data),
        experience,
        projects,
        certifications: certifications.map((entry) => entry.data),
      }),
    [summary, skills, experience, projects, certifications],
  );

  const skillNamesLower = new Set(analysis.skills.map((skill) => skill.toLowerCase()));
  const undeclaredTechnologies = analysis.technologies.filter(
    (tech) => !skillNamesLower.has(tech.toLowerCase()),
  );

  // See hooks/useHasMounted.ts — SSR never has persisted store data, so
  // these stats would otherwise flash from 0 to their real value post-hydration.
  if (!hasMounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Years of experience</dt>
            <dd className="text-lg font-semibold">{analysis.totalYearsOfExperience}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Roles</dt>
            <dd className="text-lg font-semibold">{analysis.roleCount}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Projects</dt>
            <dd className="text-lg font-semibold">{analysis.projectCount}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Skills listed</dt>
            <dd className="text-lg font-semibold">{analysis.skillCount}</dd>
          </div>
        </dl>
        {undeclaredTechnologies.length > 0 ? (
          <p className="text-muted-foreground">
            Mentioned in your bullets but not listed as skills:{" "}
            <span className="text-foreground">{undeclaredTechnologies.join(", ")}</span>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
