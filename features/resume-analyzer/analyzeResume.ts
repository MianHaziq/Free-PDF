import { KNOWN_TECH_SKILLS } from "@/constants/techSkills";
import {
  calculateTotalExperienceMonths,
  monthsToYears,
} from "@/features/resume-analyzer/experienceDuration";
import { dedupeCaseInsensitive } from "@/lib/dedupe";
import { extractKnownTermMentions } from "@/lib/keywordExtraction";
import type { SourceResume } from "@/types/resume";

/** analyzeResume only needs these fields — narrower than SourceResume so callers (e.g. a live editor store) can pass exactly what they track, without an awkward dummy full-resume object. */
export type AnalyzableResume = Pick<
  SourceResume,
  "summary" | "skills" | "experience" | "projects" | "certifications"
>;

export interface ResumeAnalysis {
  /** Explicitly listed skills (from resume.skills), as-authored by the user/editor. */
  skills: string[];
  /** Tech mentioned anywhere in free text (summary, bullets, project descriptions) but not necessarily listed as a formal skill. */
  technologies: string[];
  /** Union of skills + technologies, deduplicated — the full ATS-relevant keyword set for this resume. */
  keywords: string[];
  certifications: string[];
  totalYearsOfExperience: number;
  roleCount: number;
  projectCount: number;
  skillCount: number;
  certificationCount: number;
}

function collectFreeText(resume: AnalyzableResume): string {
  const parts: string[] = [resume.summary];

  for (const entry of resume.experience) {
    parts.push(entry.role, entry.company, ...entry.bullets);
  }
  for (const entry of resume.projects) {
    parts.push(entry.name, entry.description, ...entry.technologies, ...entry.bullets);
  }

  return parts.filter(Boolean).join("\n");
}

/**
 * Analyzes an already-structured resume (post Phase 3 import + Phase 4
 * review) to extract a full keyword set and compute statistics, feeding
 * the later Matching Engine (Phase 8) and ATS Report (Phase 10). Unlike
 * Phase 3's parser, this trusts the resume's own structured fields —
 * there's no confidence/unclassified handling here, since the user has
 * already reviewed everything in the editor.
 */
export function analyzeResume(resume: AnalyzableResume): ResumeAnalysis {
  const skills = resume.skills.map((skill) => skill.name).filter(Boolean);
  const technologies = extractKnownTermMentions(collectFreeText(resume), KNOWN_TECH_SKILLS);
  const keywords = dedupeCaseInsensitive([...skills, ...technologies]);

  const totalMonths = calculateTotalExperienceMonths(resume.experience);

  return {
    skills,
    technologies,
    keywords,
    certifications: resume.certifications.map((cert) => cert.name).filter(Boolean),
    totalYearsOfExperience: monthsToYears(totalMonths),
    roleCount: resume.experience.length,
    projectCount: resume.projects.length,
    skillCount: resume.skills.length,
    certificationCount: resume.certifications.length,
  };
}
