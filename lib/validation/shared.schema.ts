import { z } from "zod";

/**
 * Reusable primitives for docs/DATA_MODEL.md entities.
 * Zod schemas are the source of truth; TS types are inferred from them
 * (see types/) to avoid maintaining duplicate shape definitions.
 */

/** "YYYY-MM" or "YYYY-MM-DD". */
export const isoDateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    "Date must be in YYYY-MM or YYYY-MM-DD format",
  );

export const confidenceSchema = z.enum(["high", "medium", "low"]);

export const contactInfoSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required"),
  email: z.email().nullable(),
  phone: z.string().trim().min(1).nullable(),
  location: z.string().trim().min(1).nullable(),
  linkedin: z.string().trim().min(1).nullable(),
  github: z.string().trim().min(1).nullable(),
  website: z.string().trim().min(1).nullable(),
});

export const skillEntrySchema = z.object({
  name: z.string().trim().min(1, "skill name is required"),
  category: z.string().trim().min(1).nullable(),
  confidence: confidenceSchema,
});

export const experienceEntrySchema = z.object({
  id: z.uuid(),
  company: z.string().trim().min(1, "company is required"),
  role: z.string().trim().min(1, "role is required"),
  startDate: isoDateSchema,
  endDate: isoDateSchema.nullable(),
  bullets: z.array(z.string().trim().min(1)),
  relevanceTags: z.array(z.string().trim().min(1)),
});

export const projectEntrySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "project name is required"),
  description: z.string().trim().min(1, "project description is required"),
  technologies: z.array(z.string().trim().min(1)),
  bullets: z.array(z.string().trim().min(1)),
  relevanceTags: z.array(z.string().trim().min(1)),
});

export const educationEntrySchema = z.object({
  institution: z.string().trim().min(1, "institution is required"),
  degree: z.string().trim().min(1, "degree is required"),
  field: z.string().trim().min(1).nullable(),
  startDate: isoDateSchema.nullable(),
  endDate: isoDateSchema.nullable(),
});

export const certificationEntrySchema = z.object({
  name: z.string().trim().min(1, "certification name is required"),
  issuer: z.string().trim().min(1).nullable(),
  date: isoDateSchema.nullable(),
});

export const unclassifiedBlockSchema = z.object({
  rawText: z.string().trim().min(1, "rawText is required"),
  suggestedSection: z.string().trim().min(1).nullable(),
  confidence: z.literal("low"),
});

/** Rejects duplicate skill names (case-insensitive) within a resume. */
export function hasDuplicateSkillNames(skills: { name: string }[]): boolean {
  const seen = new Set<string>();
  for (const skill of skills) {
    const key = skill.name.trim().toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
