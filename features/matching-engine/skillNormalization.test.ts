import { describe, expect, it } from "vitest";

import { compareSkills, normalizeSkillName } from "@/features/matching-engine/skillNormalization";

describe("normalizeSkillName", () => {
  it("collapses punctuation/casing variants to the same key", () => {
    expect(normalizeSkillName("React.js")).toBe(normalizeSkillName("React"));
    expect(normalizeSkillName("Node.js")).toBe(normalizeSkillName("Node"));
  });

  it("applies explicit aliases for different-word variants", () => {
    expect(normalizeSkillName("JS")).toBe(normalizeSkillName("JavaScript"));
    expect(normalizeSkillName("TS")).toBe(normalizeSkillName("TypeScript"));
    expect(normalizeSkillName("Postgres")).toBe(normalizeSkillName("PostgreSQL"));
  });
});

describe("compareSkills", () => {
  it("treats identical skills as an exact match", () => {
    expect(compareSkills("React", "React")).toBe("exact");
  });

  it("treats spelling variants as an exact match", () => {
    expect(compareSkills("React.js", "React")).toBe("exact");
    expect(compareSkills("JS", "JavaScript")).toBe("exact");
  });

  it("treats a broader/narrower term as a partial match", () => {
    expect(compareSkills("AWS", "AWS EC2")).toBe("partial");
    expect(compareSkills("AWS EC2", "AWS")).toBe("partial");
  });

  it("treats unrelated skills as no match", () => {
    expect(compareSkills("React", "PostgreSQL")).toBe("none");
  });
});
