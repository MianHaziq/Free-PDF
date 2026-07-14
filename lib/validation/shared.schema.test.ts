import { describe, expect, it } from "vitest";

import {
  contactInfoSchema,
  hasDuplicateSkillNames,
  isoDateSchema,
} from "@/lib/validation/shared.schema";

describe("isoDateSchema", () => {
  it("accepts YYYY-MM", () => {
    expect(isoDateSchema.safeParse("2024-01").success).toBe(true);
  });

  it("accepts YYYY-MM-DD", () => {
    expect(isoDateSchema.safeParse("2024-01-15").success).toBe(true);
  });

  it("rejects malformed dates", () => {
    expect(isoDateSchema.safeParse("2024/01").success).toBe(false);
    expect(isoDateSchema.safeParse("Jan 2024").success).toBe(false);
    expect(isoDateSchema.safeParse("").success).toBe(false);
  });
});

describe("contactInfoSchema", () => {
  const valid = {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "+1 555 0100",
    location: "Remote",
    linkedin: null,
    github: null,
    website: null,
  };

  it("accepts a valid contact with nullable fields", () => {
    expect(contactInfoSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an empty fullName", () => {
    const result = contactInfoSchema.safeParse({ ...valid, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email instead of silently accepting it", () => {
    const result = contactInfoSchema.safeParse({
      ...valid,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("hasDuplicateSkillNames", () => {
  it("returns false for unique skills", () => {
    expect(
      hasDuplicateSkillNames([{ name: "React" }, { name: "Node.js" }]),
    ).toBe(false);
  });

  it("returns true for case-insensitive duplicates", () => {
    expect(
      hasDuplicateSkillNames([{ name: "React" }, { name: "react" }]),
    ).toBe(true);
  });
});
