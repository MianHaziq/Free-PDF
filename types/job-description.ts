import type { z } from "zod";

import type { jobDescriptionSchema } from "@/lib/validation/jobDescription.schema";

export type JobDescription = z.infer<typeof jobDescriptionSchema>;
