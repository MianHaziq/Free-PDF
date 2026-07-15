import type { z } from "zod";

import type {
  tailoredResumeContentSchema,
  tailoredResumeSchema,
} from "@/lib/validation/tailoredResume.schema";

export type TailoredResume = z.infer<typeof tailoredResumeSchema>;
export type TailoredResumeContent = z.infer<typeof tailoredResumeContentSchema>;
