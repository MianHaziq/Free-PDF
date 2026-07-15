import { matchResumeToJobDescription, type MatchResult } from "@/features/matching-engine/matchResumeToJobDescription";
import { analyzeResume, type ResumeAnalysis } from "@/features/resume-analyzer/analyzeResume";
import { dedupeCaseInsensitive } from "@/lib/dedupe";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";

/**
 * The substantive fields of docs/DATA_MODEL.md's AtsReport entity.
 * id/tailoredResumeId/createdAt are assigned when it's actually
 * persisted (Phase 13) alongside a real TailoredResume record — this is
 * the pure content-generation step.
 */
export interface AtsReportContent {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export type AtsReportOutcome =
  | { success: true; report: AtsReportContent }
  | { success: false; reason: string };

function buildStrengths(
  resume: SourceResume,
  analysis: ResumeAnalysis,
  matchResult: MatchResult,
): string[] {
  const strengths: string[] = [];

  if (matchResult.requiredMatch.exact.length > 0) {
    strengths.push(`Matches required skills: ${matchResult.requiredMatch.exact.join(", ")}.`);
  }
  if (matchResult.requiredMatch.missing.length === 0 && matchResult.requiredMatch.exact.length > 0) {
    strengths.push("Covers every required skill listed in the job description.");
  }
  if (analysis.totalYearsOfExperience > 0) {
    strengths.push(`${analysis.totalYearsOfExperience} years of relevant experience.`);
  }
  if (resume.certifications.length > 0) {
    strengths.push(
      `Lists ${resume.certifications.length} certification(s): ${analysis.certifications.join(", ")}.`,
    );
  }

  return strengths;
}

function buildWeaknesses(resume: SourceResume, matchResult: MatchResult): string[] {
  const weaknesses: string[] = [];

  if (matchResult.requiredMatch.missing.length > 0) {
    weaknesses.push(`Missing required skills: ${matchResult.requiredMatch.missing.join(", ")}.`);
  }
  if (!resume.summary.trim()) {
    weaknesses.push("No professional summary provided.");
  }
  if (resume.experience.length === 0) {
    weaknesses.push("No work experience listed.");
  }
  if (resume.unclassifiedBlocks.length > 0) {
    weaknesses.push(
      `${resume.unclassifiedBlocks.length} section(s) from import haven't been reviewed yet.`,
    );
  }

  return weaknesses;
}

/** Starts from the matching engine's own recommendations (already conditionally-phrased, never fabricating a skill) and adds resume-hygiene suggestions. */
function buildSuggestions(resume: SourceResume, matchResult: MatchResult): string[] {
  const suggestions = [...matchResult.recommendations];

  if (!resume.summary.trim()) {
    suggestions.push("Add a professional summary highlighting your most relevant experience.");
  }
  if (resume.unclassifiedBlocks.length > 0) {
    suggestions.push(
      "Review the unclassified items in the editor's \"Needs review\" panel and move them into the right section.",
    );
  }

  return suggestions;
}

/**
 * Generates docs/DATA_MODEL.md's AtsReport content by combining Phase 6's
 * resume analysis and Phase 8's matching engine into a score, matched/
 * missing keywords, and qualitative strengths/weaknesses/suggestions.
 * Refuses to fabricate a score when the job description has no
 * required/preferred skills to compare against — see MatchResult.score's
 * null case (docs/PROJECT_GOAL.md "never invent").
 */
export function generateAtsReport(
  resume: SourceResume,
  jobDescription: JobDescription,
): AtsReportOutcome {
  const analysis = analyzeResume(resume);
  const matchResult = matchResumeToJobDescription(analysis.keywords, jobDescription);

  if (matchResult.score === null) {
    return {
      success: false,
      reason:
        "Add required or preferred skills to the job description before generating an ATS report.",
    };
  }

  const matchedKeywords = dedupeCaseInsensitive([
    ...matchResult.requiredMatch.exact,
    ...matchResult.requiredMatch.partial.map((match) => match.jdSkill),
    ...matchResult.preferredMatch.exact,
    ...matchResult.preferredMatch.partial.map((match) => match.jdSkill),
  ]);
  const missingKeywords = dedupeCaseInsensitive([
    ...matchResult.requiredMatch.missing,
    ...matchResult.preferredMatch.missing,
  ]);

  return {
    success: true,
    report: {
      score: matchResult.score,
      matchedKeywords,
      missingKeywords,
      strengths: buildStrengths(resume, analysis, matchResult),
      weaknesses: buildWeaknesses(resume, matchResult),
      suggestions: buildSuggestions(resume, matchResult),
    },
  };
}
