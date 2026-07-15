import { describe, expect, it } from "vitest";

import { buildContactLine } from "@/features/resume-preview/buildContactLine";

const baseContact = {
  fullName: "Jane Doe",
  email: null,
  phone: null,
  location: null,
  linkedin: null,
  github: null,
  website: null,
};

describe("buildContactLine", () => {
  it("joins only the non-null fields with a pipe separator", () => {
    expect(
      buildContactLine({ ...baseContact, email: "jane@example.com", phone: "+1 555 0100" }),
    ).toBe("jane@example.com | +1 555 0100");
  });

  it("omits fullName", () => {
    expect(buildContactLine({ ...baseContact, email: "jane@example.com" })).not.toContain(
      "Jane Doe",
    );
  });

  it("returns an empty string when nothing is set", () => {
    expect(buildContactLine(baseContact)).toBe("");
  });
});
