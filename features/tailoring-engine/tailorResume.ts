import { generateTailoredSummary } from "@/features/tailoring-engine/generateTailoredSummary";
import {
  reorderByRelevance,
  scoreSkillRelevance,
  scoreTextRelevance,
} from "@/features/tailoring-engine/relevanceScoring";
import { analyzeResume } from "@/features/resume-analyzer/analyzeResume";
import type { JobDescription } from "@/types/job-description";
import type { TailoredResumeContent } from "@/types/tailored-resume";
import type { ExperienceEntry, ProjectEntry, SourceResume } from "@/types/resume";

function experienceEntryText(entry: ExperienceEntry): string {
  return [entry.role, entry.company, ...entry.bullets].join(" ");
}

function projectEntryText(entry: ProjectEntry): string {
  return [entry.name, entry.description, ...entry.technologies, ...entry.bullets].join(" ");
}

function reorderBullets(bullets: string[], jobDescription: JobDescription): string[] {
  return reorderByRelevance(bullets, (bullet) => scoreTextRelevance(bullet, jobDescription));
}

/**
 * Rule-based resume tailoring (docs/Resume_Tailoring_Platform_Development_Plan.md
 * Phase 9): reorders skills, experience, projects, and each entry's own
 * bullets toward the job description's required/preferred skills, and
 * fills a truthful summary template. This never adds, removes, or
 * rewrites the *content* of any bullet/skill/entry — only their order
 * and the summary change (docs/PROJECT_GOAL.md "never invent
 * experience... only reorganize and improve existing information").
 * AI-based prose rewriting is a separate, optional enhancement (see
 * docs/TECH_STACK_AND_AI_ARCHITECTURE.md) layered on top of this later,
 * not required for the app to be fully functional.
 */
export function tailorResume(
  resume: SourceResume,
  jobDescription: JobDescription,
): TailoredResumeContent {
  const analysis = analyzeResume(resume);

  const skills = reorderByRelevance(resume.skills, (skill) =>
    scoreSkillRelevance(skill.name, jobDescription),
  );

  const experience = reorderByRelevance(resume.experience, (entry) =>
    scoreTextRelevance(experienceEntryText(entry), jobDescription),
  ).map((entry) => ({ ...entry, bullets: reorderBullets(entry.bullets, jobDescription) }));

  const projects = reorderByRelevance(resume.projects, (entry) =>
    scoreTextRelevance(projectEntryText(entry), jobDescription),
  ).map((entry) => ({ ...entry, bullets: reorderBullets(entry.bullets, jobDescription) }));

  return {
    contact: resume.contact,
    summary: generateTailoredSummary(analysis, jobDescription),
    originalSummary: resume.summary,
    skills,
    experience,
    projects,
  };
}
