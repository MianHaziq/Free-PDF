import { describe, expect, it } from "vitest";

import { parseSkillsSection } from "@/features/resume-import/skillsExtractor";

describe("parseSkillsSection", () => {
  it("parses category-labeled lines with high confidence", () => {
    const entries = parseSkillsSection([
      "Languages: JavaScript, TypeScript, Python",
      "Frontend: React.js, Next.js, Redux",
    ]);

    expect(entries).toHaveLength(6);
    expect(entries[0]).toEqual({
      name: "JavaScript",
      category: "Languages",
      confidence: "high",
    });
    expect(entries.every((e) => e.confidence === "high")).toBe(true);
  });

  it("parses a plain comma list with medium confidence and no category", () => {
    const entries = parseSkillsSection(["React, Node.js, PostgreSQL"]);
    expect(entries).toEqual([
      { name: "React", category: null, confidence: "medium" },
      { name: "Node.js", category: null, confidence: "medium" },
      { name: "PostgreSQL", category: null, confidence: "medium" },
    ]);
  });

  it("handles a colon with no space after it", () => {
    const entries = parseSkillsSection(["Backend:Node.js, Express.js"]);
    expect(entries[0].category).toBe("Backend");
    expect(entries[0].name).toBe("Node.js");
  });

  it("handles a stray double colon in the source text", () => {
    const entries = parseSkillsSection([
      "Databases & Storage:: PostgreSQL, MongoDB",
    ]);
    expect(entries[0].category).toBe("Databases & Storage");
    expect(entries[0].name).toBe("PostgreSQL");
  });

  it("deduplicates skill names case-insensitively across lines", () => {
    const entries = parseSkillsSection([
      "Languages: JavaScript, TypeScript",
      "Other: javascript, Go",
    ]);
    expect(entries.map((e) => e.name)).toEqual([
      "JavaScript",
      "TypeScript",
      "Go",
    ]);
  });

  it("keeps a single unsplittable line as one low-confidence skill", () => {
    const entries = parseSkillsSection(["Full stack development experience"]);
    expect(entries).toEqual([
      {
        name: "Full stack development experience",
        category: null,
        confidence: "low",
      },
    ]);
  });
});
