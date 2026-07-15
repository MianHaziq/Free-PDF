import { describe, expect, it } from "vitest";

import { classifyRequiredAndPreferredSkills } from "@/features/job-description/skillClassifier";

describe("classifyRequiredAndPreferredSkills", () => {
  it("splits skills into required and preferred based on section headers", () => {
    const rawText = [
      "Senior Backend Engineer",
      "",
      "About us: we build great software.",
      "",
      "Requirements:",
      "- 5+ years with Node.js",
      "- Strong knowledge of PostgreSQL",
      "",
      "Nice to have:",
      "- Experience with Docker",
      "- Familiarity with GraphQL",
    ].join("\n");

    const result = classifyRequiredAndPreferredSkills(rawText);
    expect(result.requiredSkills).toEqual(["Node.js", "PostgreSQL"]);
    expect(result.preferredSkills).toEqual(["Docker", "GraphQL"]);
  });

  it("recognizes alternate header phrasing (Must Have / Bonus)", () => {
    const rawText = ["Must Have:", "React and TypeScript", "", "Bonus:", "AWS experience"].join(
      "\n",
    );
    const result = classifyRequiredAndPreferredSkills(rawText);
    expect(result.requiredSkills).toEqual(["React", "TypeScript"]);
    expect(result.preferredSkills).toEqual(["AWS"]);
  });

  it("does not misfire on an ordinary sentence that merely starts with a header word", () => {
    const rawText = [
      "Backend Engineer",
      "Requirements for this role are flexible depending on background, but Python is expected.",
    ].join("\n");
    const result = classifyRequiredAndPreferredSkills(rawText);
    // The sentence isn't an exact header match, so nothing is classified as required.
    expect(result.requiredSkills).toEqual([]);
  });

  it("leaves both buckets empty when there are no recognizable section headers", () => {
    const result = classifyRequiredAndPreferredSkills(
      "We use React and Node.js to build our platform.",
    );
    expect(result.requiredSkills).toEqual([]);
    expect(result.preferredSkills).toEqual([]);
  });

  it("does not list the same skill in both required and preferred", () => {
    const rawText = [
      "Requirements:",
      "React experience required.",
      "",
      "Nice to have:",
      "More React experience is a plus, plus Redux.",
    ].join("\n");
    const result = classifyRequiredAndPreferredSkills(rawText);
    expect(result.requiredSkills).toEqual(["React"]);
    expect(result.preferredSkills).toEqual(["Redux"]);
  });
});
