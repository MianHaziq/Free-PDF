import { describe, expect, it } from "vitest";

import { jobDescriptionSchema } from "@/lib/validation/jobDescription.schema";

const validJobDescription = {
  id: "33333333-3333-4333-8333-333333333333",
  label: "Backend Engineer - Acme Corp",
  createdAt: "2026-01-01T00:00:00.000Z",
  rawText: "We are looking for a backend engineer...",
  title: "Backend Engineer",
  company: "Acme Corp",
  requiredSkills: ["Node.js", "PostgreSQL"],
  preferredSkills: ["Redis"],
  experienceLevel: "Mid",
  keywords: ["REST", "Docker"],
};

describe("jobDescriptionSchema", () => {
  it("accepts a fully valid job description", () => {
    expect(jobDescriptionSchema.safeParse(validJobDescription).success).toBe(
      true,
    );
  });

  it("accepts a null company instead of requiring a placeholder", () => {
    const result = jobDescriptionSchema.safeParse({
      ...validJobDescription,
      company: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty rawText", () => {
    const result = jobDescriptionSchema.safeParse({
      ...validJobDescription,
      rawText: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const withoutTitle: Record<string, unknown> = { ...validJobDescription };
    delete withoutTitle.title;
    const result = jobDescriptionSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });
});
