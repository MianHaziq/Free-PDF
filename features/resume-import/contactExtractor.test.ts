import { describe, expect, it } from "vitest";

import { extractContactInfo } from "@/features/resume-import/contactExtractor";

describe("extractContactInfo", () => {
  it("extracts name, email, phone, and location from a pipe-delimited contact line", () => {
    const result = extractContactInfo([
      "Jane Doe",
      "Software Engineer | Full Stack Developer",
      "jane@example.com|+1 (555) 123-4567|Springfield, IL|LinkedIn|Github",
    ]);

    expect(result.section.value.fullName).toBe("Jane Doe");
    expect(result.section.value.email).toBe("jane@example.com");
    expect(result.section.value.phone).toBe("+1 (555) 123-4567");
    expect(result.section.value.location).toBe("Springfield, IL");
    expect(result.section.confidence).toBe("high");
  });

  it("leaves linkedin/github null when only a bare label is present, and warns", () => {
    const result = extractContactInfo([
      "Jane Doe",
      "jane@example.com|+1 (555) 123-4567|LinkedIn|Github",
    ]);

    expect(result.section.value.linkedin).toBeNull();
    expect(result.section.value.github).toBeNull();
    expect(result.warnings.some((w) => w.includes("LinkedIn"))).toBe(true);
    expect(result.warnings.some((w) => w.includes("GitHub"))).toBe(true);
  });

  it("extracts an actual linkedin URL when present", () => {
    const result = extractContactInfo([
      "Jane Doe",
      "linkedin.com/in/janedoe",
    ]);
    expect(result.section.value.linkedin).toBe("linkedin.com/in/janedoe");
    expect(result.warnings).toHaveLength(0);
  });

  it("returns low confidence and all-null details when nothing is extractable", () => {
    const result = extractContactInfo(["Jane Doe"]);
    expect(result.section.confidence).toBe("low");
    expect(result.section.value.email).toBeNull();
    expect(result.section.value.phone).toBeNull();
  });

  it("does not fabricate a location from digit-heavy or email-containing segments", () => {
    const result = extractContactInfo([
      "Jane Doe",
      "jane@example.com, backup@example.com",
    ]);
    expect(result.section.value.location).toBeNull();
  });
});
