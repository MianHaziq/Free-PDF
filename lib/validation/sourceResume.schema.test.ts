import { describe, expect, it } from "vitest";

import { sourceResumeSchema } from "@/lib/validation/sourceResume.schema";

const validResume = {
  id: "11111111-1111-4111-8111-111111111111",
  label: "Main Resume 2026",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  sourceFormat: "pdf" as const,
  contact: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    website: null,
  },
  summary: "Backend engineer with 5 years of experience.",
  skills: [
    { name: "Node.js", category: "Backend", confidence: "high" as const },
    { name: "PostgreSQL", category: "Backend", confidence: "high" as const },
  ],
  experience: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      company: "Acme Corp",
      role: "Backend Engineer",
      startDate: "2022-01",
      endDate: null,
      bullets: ["Built REST APIs serving 1M+ requests/day."],
      relevanceTags: ["backend"],
    },
  ],
  projects: [],
  education: [
    {
      institution: "State University",
      degree: "B.S. Computer Science",
      field: null,
      startDate: "2016-09",
      endDate: "2020-05",
    },
  ],
  certifications: [],
  unclassifiedBlocks: [],
};

describe("sourceResumeSchema", () => {
  it("accepts a fully valid resume", () => {
    const result = sourceResumeSchema.safeParse(validResume);
    expect(result.success).toBe(true);
  });

  it("rejects a resume missing a required field", () => {
    const withoutId: Record<string, unknown> = { ...validResume };
    delete withoutId.id;
    const result = sourceResumeSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
  });

  it("rejects an empty required string field", () => {
    const result = sourceResumeSchema.safeParse({
      ...validResume,
      label: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate skill names (case-insensitive)", () => {
    const result = sourceResumeSchema.safeParse({
      ...validResume,
      skills: [
        { name: "React", category: null, confidence: "high" },
        { name: "react", category: null, confidence: "medium" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid experience date", () => {
    const result = sourceResumeSchema.safeParse({
      ...validResume,
      experience: [
        {
          ...validResume.experience[0],
          startDate: "22-01",
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts endDate: null to mean current", () => {
    const result = sourceResumeSchema.safeParse(validResume);
    expect(result.success).toBe(true);
  });

  it("rejects an unsupported sourceFormat instead of guessing", () => {
    const result = sourceResumeSchema.safeParse({
      ...validResume,
      sourceFormat: "txt",
    });
    expect(result.success).toBe(false);
  });
});
