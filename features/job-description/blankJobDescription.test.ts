import { describe, expect, it } from "vitest";

import {
  createBlankJobDescription,
  createJobDescriptionFromText,
} from "@/features/job-description/blankJobDescription";
import { jobDescriptionSchema } from "@/lib/validation/jobDescription.schema";

describe("createBlankJobDescription", () => {
  it("produces a JobDescription that fails validation on the empty required title and rawText", () => {
    const jd = createBlankJobDescription();
    const result = jobDescriptionSchema.safeParse(jd);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.path.join("."))).toEqual(["rawText", "title"]);
    }
  });

  it("generates a unique id per call", () => {
    const a = createBlankJobDescription();
    const b = createBlankJobDescription();
    expect(a.id).not.toBe(b.id);
  });
});

describe("createJobDescriptionFromText", () => {
  it("builds a valid JobDescription with title, company, and keywords extracted", () => {
    const jd = createJobDescriptionFromText(
      "Backend Engineer\nAcme Corp · Remote\n\nWe use Node.js and PostgreSQL.",
      "resume.pdf",
    );

    expect(jd.title).toBe("Backend Engineer");
    expect(jd.company).toBe("Acme Corp");
    expect(jd.keywords).toEqual(["Node.js", "PostgreSQL"]);
    expect(jd.rawText).toContain("We use Node.js");
    expect(jd.requiredSkills).toEqual([]);
    expect(jd.preferredSkills).toEqual([]);

    const result = jobDescriptionSchema.safeParse(jd);
    expect(result.success).toBe(true);
  });
});
