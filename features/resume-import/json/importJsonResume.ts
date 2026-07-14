import type { ResumeImportError } from "@/features/resume-import/types";
import { sourceResumeSchema } from "@/lib/validation/sourceResume.schema";
import type { SourceResume } from "@/types/resume";

export type JsonImportOutcome =
  | { success: true; resume: SourceResume }
  | { success: false; error: ResumeImportError };

/**
 * JSON is the "trusted" re-import path (see docs/PARSING_STRATEGY.md):
 * skip line/section extraction entirely and validate directly against the
 * schema built in Phase 2.
 */
export function importJsonResume(rawText: string): JsonImportOutcome {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      success: false,
      error: { code: "invalid-json", message: "The file is not valid JSON." },
    };
  }

  const result = sourceResumeSchema.safeParse(parsed);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const detail = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "unknown validation error";
    return {
      success: false,
      error: {
        code: "invalid-json-schema",
        message: `The JSON does not match the expected resume format (${detail}).`,
      },
    };
  }

  return { success: true, resume: result.data };
}
