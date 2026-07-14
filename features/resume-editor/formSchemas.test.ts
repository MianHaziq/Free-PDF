import { describe, expect, it } from "vitest";

import { contactFormSchema } from "@/features/resume-editor/formSchemas";

describe("contactFormSchema", () => {
  const base = {
    fullName: "Jane Doe",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  };

  it("accepts an empty string for optional fields", () => {
    const result = contactFormSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("still validates a non-empty, malformed email", () => {
    const result = contactFormSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts a valid, non-empty email", () => {
    const result = contactFormSchema.safeParse({ ...base, email: "jane@example.com" });
    expect(result.success).toBe(true);
  });

  it("still requires a non-empty fullName", () => {
    const result = contactFormSchema.safeParse({ ...base, fullName: "" });
    expect(result.success).toBe(false);
  });
});
