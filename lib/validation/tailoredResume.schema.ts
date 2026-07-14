import { z } from "zod";

import {
  contactInfoSchema,
  experienceEntrySchema,
  hasDuplicateSkillNames,
  projectEntrySchema,
  skillEntrySchema,
} from "@/lib/validation/shared.schema";

export const tailoredResumeContentSchema = z
  .object({
    contact: contactInfoSchema,
    summary: z.string(),
    originalSummary: z.string(),
    skills: z.array(skillEntrySchema),
    experience: z.array(experienceEntrySchema),
    projects: z.array(projectEntrySchema),
  })
  .refine((content) => !hasDuplicateSkillNames(content.skills), {
    error: "Duplicate skill names are not allowed (case-insensitive)",
    path: ["skills"],
  });

export const tailoredResumeSchema = z.object({
  id: z.uuid(),
  sourceResumeId: z.uuid(),
  jobDescriptionId: z.uuid(),
  createdAt: z.iso.datetime(),
  generationMethod: z.enum(["rule-based", "ai-assisted"]),
  content: tailoredResumeContentSchema,
  atsReportId: z.uuid(),
});

export type TailoredResumeReferenceError =
  | "orphaned-source-resume"
  | "orphaned-job-description";

export type TailoredResumeReferenceResult =
  | { valid: true }
  | { valid: false; errors: TailoredResumeReferenceError[] };

/**
 * Rejects a TailoredResume whose sourceResumeId or jobDescriptionId does not
 * reference an existing record. Schema validation alone cannot enforce this
 * (see docs/DATA_MODEL.md), since it depends on records stored elsewhere.
 */
export function validateTailoredResumeReferences(
  candidate: Pick<
    z.infer<typeof tailoredResumeSchema>,
    "sourceResumeId" | "jobDescriptionId"
  >,
  existingSourceResumeIds: readonly string[],
  existingJobDescriptionIds: readonly string[],
): TailoredResumeReferenceResult {
  const errors: TailoredResumeReferenceError[] = [];

  if (!existingSourceResumeIds.includes(candidate.sourceResumeId)) {
    errors.push("orphaned-source-resume");
  }
  if (!existingJobDescriptionIds.includes(candidate.jobDescriptionId)) {
    errors.push("orphaned-job-description");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}
