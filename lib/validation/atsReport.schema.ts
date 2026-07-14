import { z } from "zod";

export const atsReportSchema = z.object({
  id: z.uuid(),
  tailoredResumeId: z.uuid(),
  createdAt: z.iso.datetime(),
  score: z.number().min(0).max(100),
  matchedKeywords: z.array(z.string().trim().min(1)),
  missingKeywords: z.array(z.string().trim().min(1)),
  strengths: z.array(z.string().trim().min(1)),
  weaknesses: z.array(z.string().trim().min(1)),
  suggestions: z.array(z.string().trim().min(1)),
});
