import { compareSkills } from "@/features/matching-engine/skillNormalization";
import { extractKnownTermMentions } from "@/lib/keywordExtraction";
import type { JobDescription } from "@/types/job-description";

type SkillListSource = Pick<JobDescription, "requiredSkills" | "preferredSkills">;

/** Required-skill mentions count double a preferred-skill mention — mirrors the matching engine's 70/30 weighting philosophy. */
const REQUIRED_WEIGHT = 2;
const PREFERRED_WEIGHT = 1;

/**
 * How relevant a block of free text (an experience/project entry, or a
 * single bullet) is to a job description, by counting mentions of its
 * required/preferred skills. Reuses the same term-matching used for
 * keyword extraction (lib/keywordExtraction.ts) so a bullet mentioning
 * "React.js" still counts toward a JD requirement of "React".
 */
export function scoreTextRelevance(text: string, jobDescription: SkillListSource): number {
  const requiredHits = extractKnownTermMentions(text, jobDescription.requiredSkills).length;
  const preferredHits = extractKnownTermMentions(text, jobDescription.preferredSkills).length;
  return requiredHits * REQUIRED_WEIGHT + preferredHits * PREFERRED_WEIGHT;
}

/** Whether a single skill name matches (exactly or partially) any of the job description's required/preferred skills. */
export function scoreSkillRelevance(skillName: string, jobDescription: SkillListSource): number {
  const matchesRequired = jobDescription.requiredSkills.some(
    (jdSkill) => compareSkills(skillName, jdSkill) !== "none",
  );
  const matchesPreferred = jobDescription.preferredSkills.some(
    (jdSkill) => compareSkills(skillName, jdSkill) !== "none",
  );
  return (matchesRequired ? REQUIRED_WEIGHT : 0) + (matchesPreferred ? PREFERRED_WEIGHT : 0);
}

/**
 * Stable-sorts items by descending relevance score — ties keep their
 * original relative order (Array.prototype.sort is spec-guaranteed
 * stable), so equally-relevant items don't get arbitrarily reshuffled.
 * Never adds, removes, or renames items — reordering only, per
 * docs/PROJECT_GOAL.md "never invent".
 */
export function reorderByRelevance<T>(items: T[], scoreOf: (item: T) => number): T[] {
  return [...items]
    .map((item, index) => ({ item, index, score: scoreOf(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ item }) => item);
}
