import { compareSkills } from "@/features/matching-engine/skillNormalization";
import type { JobDescription } from "@/types/job-description";

export interface CategoryMatch {
  exact: string[];
  partial: { jdSkill: string; resumeSkill: string }[];
  missing: string[];
}

export interface MatchResult {
  requiredMatch: CategoryMatch;
  preferredMatch: CategoryMatch;
  /** 0-100, weighted 70% required / 30% preferred. Null when the job description has no required or preferred skills to compare against — there's nothing honest to score. */
  score: number | null;
  recommendations: string[];
}

const REQUIRED_WEIGHT = 0.7;
const PREFERRED_WEIGHT = 0.3;
const PARTIAL_MATCH_CREDIT = 0.5;

function matchCategory(jdSkills: string[], resumeKeywords: string[]): CategoryMatch {
  const exact: string[] = [];
  const partial: { jdSkill: string; resumeSkill: string }[] = [];
  const missing: string[] = [];

  for (const jdSkill of jdSkills) {
    const exactHit = resumeKeywords.find((resumeSkill) => compareSkills(jdSkill, resumeSkill) === "exact");
    if (exactHit) {
      exact.push(jdSkill);
      continue;
    }

    const partialHit = resumeKeywords.find(
      (resumeSkill) => compareSkills(jdSkill, resumeSkill) === "partial",
    );
    if (partialHit) {
      partial.push({ jdSkill, resumeSkill: partialHit });
      continue;
    }

    missing.push(jdSkill);
  }

  return { exact, partial, missing };
}

/** No required/preferred skills in this category means nothing was demanded of it — full marks, not zero. */
function categoryScore(category: CategoryMatch, total: number): number {
  if (total === 0) return 100;
  const points = category.exact.length + category.partial.length * PARTIAL_MATCH_CREDIT;
  return (points / total) * 100;
}

/**
 * Never suggests fabricating a skill — missing/partial recommendations
 * are always phrased conditionally ("if you have this experience"), per
 * docs/PROJECT_GOAL.md's "never invent" rule.
 */
function buildRecommendations(requiredMatch: CategoryMatch, preferredMatch: CategoryMatch): string[] {
  const recommendations: string[] = [];

  if (requiredMatch.missing.length > 0) {
    recommendations.push(
      `Missing required skills: ${requiredMatch.missing.join(", ")}. If you have relevant experience with these, add them to your Skills section or mention them in a bullet.`,
    );
  }

  if (requiredMatch.partial.length > 0) {
    const pairs = requiredMatch.partial
      .map((match) => `"${match.resumeSkill}" for "${match.jdSkill}"`)
      .join(", ");
    recommendations.push(
      `You may already have related experience but the wording differs: ${pairs}. Use the job description's exact term if it truthfully applies.`,
    );
  }

  if (preferredMatch.missing.length > 0) {
    recommendations.push(
      `Preferred (not required) skills you don't currently list: ${preferredMatch.missing.join(", ")}.`,
    );
  }

  if (requiredMatch.missing.length === 0 && requiredMatch.exact.length > 0) {
    recommendations.push("Strong match — your resume covers all of this job's required skills.");
  }

  return recommendations;
}

/**
 * Compares a resume's full keyword set (features/resume-analyzer/analyzeResume.ts)
 * against a job description's required/preferred skills. Feeds the later
 * Tailoring Engine (Phase 9, reorders content toward matched skills) and
 * ATS Report (Phase 10, wraps this into the persisted AtsReport entity).
 */
export function matchResumeToJobDescription(
  resumeKeywords: string[],
  jobDescription: Pick<JobDescription, "requiredSkills" | "preferredSkills">,
): MatchResult {
  const requiredMatch = matchCategory(jobDescription.requiredSkills, resumeKeywords);
  const preferredMatch = matchCategory(jobDescription.preferredSkills, resumeKeywords);

  const requiredTotal = jobDescription.requiredSkills.length;
  const preferredTotal = jobDescription.preferredSkills.length;

  let score: number | null;
  if (requiredTotal === 0 && preferredTotal === 0) {
    score = null;
  } else if (requiredTotal === 0) {
    score = Math.round(categoryScore(preferredMatch, preferredTotal));
  } else if (preferredTotal === 0) {
    score = Math.round(categoryScore(requiredMatch, requiredTotal));
  } else {
    score = Math.round(
      categoryScore(requiredMatch, requiredTotal) * REQUIRED_WEIGHT +
        categoryScore(preferredMatch, preferredTotal) * PREFERRED_WEIGHT,
    );
  }

  return {
    requiredMatch,
    preferredMatch,
    score,
    recommendations: buildRecommendations(requiredMatch, preferredMatch),
  };
}
