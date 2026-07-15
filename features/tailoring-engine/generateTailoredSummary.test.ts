import { describe, expect, it } from "vitest";

import { generateTailoredSummary } from "@/features/tailoring-engine/generateTailoredSummary";

function jd(requiredSkills: string[], preferredSkills: string[] = [], title = "") {
  return { requiredSkills, preferredSkills, title };
}

describe("generateTailoredSummary", () => {
  it("includes years of experience and matched skills using the resume's own wording", () => {
    const summary = generateTailoredSummary(
      { keywords: ["React", "Node.js"], totalYearsOfExperience: 3 },
      jd(["React.js"], [], "Frontend Engineer"),
    );
    expect(summary).toBe("3 years of experience with React for Frontend Engineer roles.");
  });

  it("never mentions a skill the resume doesn't actually have", () => {
    const summary = generateTailoredSummary(
      { keywords: ["React"], totalYearsOfExperience: 2 },
      jd(["Kubernetes", "React"]),
    );
    expect(summary).not.toContain("Kubernetes");
    expect(summary).toContain("React");
  });

  it("prioritizes required matches over preferred, deduplicated", () => {
    const summary = generateTailoredSummary(
      { keywords: ["React", "Docker"], totalYearsOfExperience: 1 },
      jd(["React"], ["React", "Docker"]),
    );
    expect(summary).toBe("1 years of experience with React and Docker.");
  });

  it("caps the skill list at 5", () => {
    const summary = generateTailoredSummary(
      { keywords: ["A", "B", "C", "D", "E", "F"], totalYearsOfExperience: 1 },
      jd(["A", "B", "C", "D", "E", "F"]),
    );
    expect(summary).toBe("1 years of experience with A, B, C, D, and E.");
  });

  it("falls back to a generic, honest statement when there's no experience and no matches", () => {
    const summary = generateTailoredSummary(
      { keywords: [], totalYearsOfExperience: 0 },
      jd(["Kubernetes"]),
    );
    expect(summary).toBe("Experience in software engineering.");
  });

  it("omits the role phrase when the job description has no title", () => {
    const summary = generateTailoredSummary(
      { keywords: ["React"], totalYearsOfExperience: 1 },
      jd(["React"], [], ""),
    );
    expect(summary).toBe("1 years of experience with React.");
  });
});
