import type {
  CertificationEntry,
  ContactInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillEntry,
} from "@/types/resume";

/**
 * The shape every preview template renders. Wider than a single
 * DATA_MODEL type since a "tailored" preview mixes Phase 9's reordered
 * TailoredResumeContent (contact/summary/skills/experience/projects)
 * with the untouched SourceResume's education/certifications — those
 * aren't part of TailoredResumeContent since tailoring doesn't reorder
 * them.
 */
export interface PreviewResumeData {
  contact: ContactInfo;
  summary: string;
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
}

/** Shared by the preview (HTML) and export (PDF) template pickers. */
export type TemplateId = "classic" | "modern";
