import { describe, expect, it } from "vitest";

import { createBlankSourceResume } from "@/features/resume-editor/blankResume";
import { sourceResumeSchema } from "@/lib/validation/sourceResume.schema";

describe("createBlankSourceResume", () => {
  it("produces a resume that satisfies the schema except for the empty required fullName", () => {
    const resume = createBlankSourceResume();
    const result = sourceResumeSchema.safeParse(resume);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join("."))).toEqual([
        "contact.fullName",
      ]);
    }
  });

  it("generates a unique id and timestamps each call", () => {
    const a = createBlankSourceResume();
    const b = createBlankSourceResume();
    expect(a.id).not.toBe(b.id);
    expect(a.createdAt).toBeTruthy();
  });

  it("has empty arrays for every array-based section", () => {
    const resume = createBlankSourceResume();
    expect(resume.skills).toEqual([]);
    expect(resume.experience).toEqual([]);
    expect(resume.projects).toEqual([]);
    expect(resume.education).toEqual([]);
    expect(resume.certifications).toEqual([]);
    expect(resume.unclassifiedBlocks).toEqual([]);
  });
});
