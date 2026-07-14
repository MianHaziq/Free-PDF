import type { z } from "zod";

import type { tailoredResumeSchema } from "@/lib/validation/tailoredResume.schema";

export type TailoredResume = z.infer<typeof tailoredResumeSchema>;
