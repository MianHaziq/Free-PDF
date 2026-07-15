import { describe, expect, it } from "vitest";

import {
  reorderByRelevance,
  scoreSkillRelevance,
  scoreTextRelevance,
} from "@/features/tailoring-engine/relevanceScoring";

function jd(requiredSkills: string[], preferredSkills: string[] = []) {
  return { requiredSkills, preferredSkills };
}

describe("scoreTextRelevance", () => {
  it("weights a required-skill mention higher than a preferred one", () => {
    const requiredScore = scoreTextRelevance("Built with React.", jd(["React"], []));
    const preferredScore = scoreTextRelevance("Built with React.", jd([], ["React"]));
    expect(requiredScore).toBeGreaterThan(preferredScore);
  });

  it("recognizes spelling variants via the shared normalizer", () => {
    expect(scoreTextRelevance("Used React.js daily.", jd(["React"]))).toBeGreaterThan(0);
  });

  it("returns 0 for text with no relevant mentions", () => {
    expect(scoreTextRelevance("Worked on internal tooling.", jd(["Kubernetes"]))).toBe(0);
  });
});

describe("scoreSkillRelevance", () => {
  it("scores a required match higher than a preferred match", () => {
    expect(scoreSkillRelevance("React", jd(["React"], []))).toBeGreaterThan(
      scoreSkillRelevance("React", jd([], ["React"])),
    );
  });

  it("scores an unrelated skill as 0", () => {
    expect(scoreSkillRelevance("COBOL", jd(["React"], ["Docker"]))).toBe(0);
  });
});

describe("reorderByRelevance", () => {
  it("moves higher-scoring items to the front", () => {
    const items = ["low", "high", "mid"];
    const scores: Record<string, number> = { low: 1, high: 10, mid: 5 };
    expect(reorderByRelevance(items, (item) => scores[item])).toEqual(["high", "mid", "low"]);
  });

  it("preserves original relative order for tied scores (stable)", () => {
    const items = [
      { id: "a", score: 1 },
      { id: "b", score: 1 },
      { id: "c", score: 1 },
    ];
    const result = reorderByRelevance(items, (item) => item.score);
    expect(result.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("never adds or removes items", () => {
    const items = [1, 2, 3, 4];
    const result = reorderByRelevance(items, (item) => item);
    expect(result).toHaveLength(items.length);
    expect(new Set(result)).toEqual(new Set(items));
  });
});
