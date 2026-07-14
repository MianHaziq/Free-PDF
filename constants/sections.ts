/**
 * Canonical resume sections and the header keywords used to classify them.
 * See docs/PARSING_STRATEGY.md ("Section Classification").
 * The keyword list is intentionally extendable, not hardcoded to English-only.
 */

export const CANONICAL_RESUME_SECTIONS = [
  "contact-info",
  "professional-summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "unclassified",
] as const;

export type CanonicalResumeSection = (typeof CANONICAL_RESUME_SECTIONS)[number];

export const SECTION_HEADER_KEYWORDS: Record<
  Exclude<CanonicalResumeSection, "unclassified">,
  string[]
> = {
  "contact-info": ["contact", "contact information"],
  "professional-summary": [
    "summary",
    "professional summary",
    "profile",
    "about me",
    "objective",
  ],
  skills: ["skills", "technical skills", "core competencies", "technologies"],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
  ],
  projects: ["projects", "what i've built", "personal projects"],
  education: ["education", "academic background"],
  certifications: ["certifications", "certificates", "licenses"],
};
