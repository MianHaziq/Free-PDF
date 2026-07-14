import type { z } from "zod";

import type { atsReportSchema } from "@/lib/validation/atsReport.schema";

export type AtsReport = z.infer<typeof atsReportSchema>;
