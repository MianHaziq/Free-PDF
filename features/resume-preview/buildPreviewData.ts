import type { PreviewResumeData } from "@/features/resume-preview/types";
import type { TailoredResumeContent } from "@/types/tailored-resume";
import type { SourceResume } from "@/types/resume";

/**
 * Builds the unified preview shape from either the plain resume, or a
 * tailored version (Phase 9) layered on top of it — tailoring only
 * touches contact/summary/skills/experience/projects
 * (TailoredResumeContent), so education/certifications always come
 * straight from the source resume.
 */
export function buildPreviewData(
  resume: SourceResume,
  tailored?: TailoredResumeContent,
): PreviewResumeData {
  if (tailored) {
    return {
      contact: tailored.contact,
      summary: tailored.summary,
      skills: tailored.skills,
      experience: tailored.experience,
      projects: tailored.projects,
      education: resume.education,
      certifications: resume.certifications,
    };
  }

  return {
    contact: resume.contact,
    summary: resume.summary,
    skills: resume.skills,
    experience: resume.experience,
    projects: resume.projects,
    education: resume.education,
    certifications: resume.certifications,
  };
}
