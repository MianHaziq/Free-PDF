import { describe, expect, it } from "vitest";

import { matchResumeToJobDescription } from "@/features/matching-engine/matchResumeToJobDescription";

function jd(requiredSkills: string[], preferredSkills: string[] = []) {
  return { requiredSkills, preferredSkills };
}

describe("matchResumeToJobDescription", () => {
  it("scores a perfect required-skill match at 100", () => {
    const result = matchResumeToJobDescription(["React", "Node.js"], jd(["React", "Node.js"]));
    expect(result.score).toBe(100);
    expect(result.requiredMatch.exact).toEqual(["React", "Node.js"]);
    expect(result.requiredMatch.missing).toEqual([]);
  });

  it("recognizes spelling-variant matches as exact", () => {
    const result = matchResumeToJobDescription(["React"], jd(["React.js"]));
    expect(result.requiredMatch.exact).toEqual(["React.js"]);
  });

  it("credits a partial match at half weight", () => {
    // Resume has broad "AWS"; JD wants the specific "AWS EC2" — partial, not exact.
    const result = matchResumeToJobDescription(["AWS"], jd(["AWS EC2"]));
    expect(result.requiredMatch.partial).toEqual([{ jdSkill: "AWS EC2", resumeSkill: "AWS" }]);
    expect(result.score).toBe(50);
  });

  it("reports missing skills the resume has no match for at all", () => {
    const result = matchResumeToJobDescription(["React"], jd(["React", "Kubernetes"]));
    expect(result.requiredMatch.missing).toEqual(["Kubernetes"]);
    expect(result.score).toBe(50);
  });

  it("weights required skills more heavily than preferred (70/30)", () => {
    // All required matched (100), none preferred matched (0):
    // 100*0.7 + 0*0.3 = 70
    const result = matchResumeToJobDescription(["React"], jd(["React"], ["Docker"]));
    expect(result.score).toBe(70);
  });

  it("gives full marks for a category with no listed skills instead of penalizing it", () => {
    // No preferred skills listed at all — shouldn't drag the score down.
    const result = matchResumeToJobDescription(["React"], jd(["React"], []));
    expect(result.score).toBe(100);
  });

  it("returns a null score when the job description has no required or preferred skills at all", () => {
    const result = matchResumeToJobDescription(["React"], jd([], []));
    expect(result.score).toBeNull();
  });

  it("reports everything as missing when the resume has no matching keywords", () => {
    const result = matchResumeToJobDescription([], jd(["React", "Node.js"]));
    expect(result.requiredMatch.missing).toEqual(["React", "Node.js"]);
    expect(result.score).toBe(0);
  });

  it("never recommends fabricating a skill — missing-skill wording is conditional", () => {
    const result = matchResumeToJobDescription([], jd(["Kubernetes"]));
    const missingRec = result.recommendations.find((r) => r.includes("Missing required skills"));
    expect(missingRec).toContain("If you have relevant experience");
  });

  it("praises a strong match when all required skills are covered", () => {
    const result = matchResumeToJobDescription(["React", "Node.js"], jd(["React", "Node.js"]));
    expect(result.recommendations.some((r) => r.includes("Strong match"))).toBe(true);
  });
});
