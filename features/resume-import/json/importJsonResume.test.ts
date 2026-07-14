import { describe, expect, it } from "vitest";

import { importJsonResume } from "@/features/resume-import/json/importJsonResume";

const validResume = {
  id: "11111111-1111-4111-8111-111111111111",
  label: "Main Resume 2026",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  sourceFormat: "json" as const,
  contact: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: null,
    location: null,
    linkedin: null,
    github: null,
    website: null,
  },
  summary: "Backend engineer.",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  unclassifiedBlocks: [],
};

describe("importJsonResume", () => {
  it("accepts a valid resume JSON export (trusted path)", () => {
    const result = importJsonResume(JSON.stringify(validResume));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.resume.contact.fullName).toBe("Jane Doe");
    }
  });

  it("rejects malformed JSON with a clear error, not a crash", () => {
    const result = importJsonResume("{ not valid json");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("invalid-json");
  });

  it("rejects JSON that doesn't match the resume schema", () => {
    const result = importJsonResume(JSON.stringify({ foo: "bar" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("invalid-json-schema");
      expect(result.error.message).toContain("expected resume format");
    }
  });

  it("rejects a resume with duplicate skill names", () => {
    const result = importJsonResume(
      JSON.stringify({
        ...validResume,
        skills: [
          { name: "React", category: null, confidence: "high" },
          { name: "react", category: null, confidence: "medium" },
        ],
      }),
    );
    expect(result.success).toBe(false);
  });
});
