import { z } from "zod";

export const jobDescriptionSchema = z.object({
  id: z.uuid(),
  label: z.string().trim().min(1, "label is required"),
  createdAt: z.iso.datetime(),
  rawText: z.string().trim().min(1, "rawText is required"),
  title: z.string().trim().min(1, "title is required"),
  company: z.string().trim().min(1).nullable(),
  requiredSkills: z.array(z.string().trim().min(1)),
  preferredSkills: z.array(z.string().trim().min(1)),
  experienceLevel: z.string().trim().min(1).nullable(),
  keywords: z.array(z.string().trim().min(1)),
});
