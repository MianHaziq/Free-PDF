import { compareSkills } from "@/features/matching-engine/skillNormalization";
import type { ResumeAnalysis } from "@/features/resume-analyzer/analyzeResume";
import type { JobDescription } from "@/types/job-description";

const MAX_SUMMARY_SKILLS = 5;

/** Finds the resume's own wording for each JD skill it matches (exact or partial), preserving the resume's original casing rather than the JD's. */
function findMatchedResumeSkills(resumeKeywords: string[], jdSkills: string[]): string[] {
  const matched: string[] = [];
  const seen = new Set<string>();

  for (const jdSkill of jdSkills) {
    const hit = resumeKeywords.find((resumeSkill) => compareSkills(jdSkill, resumeSkill) !== "none");
    if (hit && !seen.has(hit.toLowerCase())) {
      seen.add(hit.toLowerCase());
      matched.push(hit);
    }
  }

  return matched;
}

function formatSkillList(skills: string[]): string {
  if (skills.length === 0) return "";
  if (skills.length === 1) return skills[0];
  if (skills.length === 2) return `${skills[0]} and ${skills[1]}`;
  return `${skills.slice(0, -1).join(", ")}, and ${skills[skills.length - 1]}`;
}

/**
 * Generates a truthful, template-filled summary from the resume's own
 * data — no AI, no invented claims. Every skill mentioned is one the
 * resume's own keywords actually matched against the job description;
 * years of experience comes straight from analyzeResume's date-range
 * calculation. (See docs/TECH_STACK_AND_AI_ARCHITECTURE.md: rewriting
 * a summary's *prose* is an optional AI feature — this is the required
 * rule-based fallback that must work without it.) The caller is always
 * expected to keep the original summary too
 * (TailoredResume.content.originalSummary) for comparison/audit.
 */
export function generateTailoredSummary(
  analysis: Pick<ResumeAnalysis, "keywords" | "totalYearsOfExperience">,
  jobDescription: Pick<JobDescription, "requiredSkills" | "preferredSkills" | "title">,
): string {
  const matchedRequired = findMatchedResumeSkills(analysis.keywords, jobDescription.requiredSkills);
  const matchedPreferred = findMatchedResumeSkills(
    analysis.keywords,
    jobDescription.preferredSkills,
  ).filter(
    (skill) => !matchedRequired.some((required) => required.toLowerCase() === skill.toLowerCase()),
  );
  const topSkills = [...matchedRequired, ...matchedPreferred].slice(0, MAX_SUMMARY_SKILLS);

  const experiencePhrase =
    analysis.totalYearsOfExperience > 0
      ? `${analysis.totalYearsOfExperience} years of experience`
      : "Experience";
  const rolePhrase = jobDescription.title ? ` for ${jobDescription.title} roles` : "";

  if (topSkills.length === 0) {
    return `${experiencePhrase} in software engineering${rolePhrase}.`;
  }

  return `${experiencePhrase} with ${formatSkillList(topSkills)}${rolePhrase}.`;
}
