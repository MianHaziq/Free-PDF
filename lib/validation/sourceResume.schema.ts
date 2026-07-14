import { z } from "zod";

import { SUPPORTED_RESUME_IMPORT_FORMATS } from "@/constants/files";
import {
  certificationEntrySchema,
  contactInfoSchema,
  educationEntrySchema,
  experienceEntrySchema,
  hasDuplicateSkillNames,
  projectEntrySchema,
  skillEntrySchema,
  unclassifiedBlockSchema,
} from "@/lib/validation/shared.schema";

export const sourceResumeSchema = z
  .object({
    id: z.uuid(),
    label: z.string().trim().min(1, "label is required"),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    sourceFormat: z.enum(SUPPORTED_RESUME_IMPORT_FORMATS),
    contact: contactInfoSchema,
    summary: z.string(),
    skills: z.array(skillEntrySchema),
    experience: z.array(experienceEntrySchema),
    projects: z.array(projectEntrySchema),
    education: z.array(educationEntrySchema),
    certifications: z.array(certificationEntrySchema),
    unclassifiedBlocks: z.array(unclassifiedBlockSchema),
  })
  .refine((resume) => !hasDuplicateSkillNames(resume.skills), {
    error: "Duplicate skill names are not allowed (case-insensitive)",
    path: ["skills"],
  });
