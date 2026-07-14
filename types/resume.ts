import type { z } from "zod";

import type {
  certificationEntrySchema,
  contactInfoSchema,
  educationEntrySchema,
  experienceEntrySchema,
  projectEntrySchema,
  skillEntrySchema,
  unclassifiedBlockSchema,
} from "@/lib/validation/shared.schema";
import type { sourceResumeSchema } from "@/lib/validation/sourceResume.schema";

export type ContactInfo = z.infer<typeof contactInfoSchema>;
export type SkillEntry = z.infer<typeof skillEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationEntrySchema>;
export type UnclassifiedBlock = z.infer<typeof unclassifiedBlockSchema>;
export type SourceResume = z.infer<typeof sourceResumeSchema>;
