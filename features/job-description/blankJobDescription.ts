import { v4 as uuidv4 } from "uuid";

import { inferExperienceLevel } from "@/features/job-description/experienceLevelExtraction";
import { classifyRequiredAndPreferredSkills } from "@/features/job-description/skillClassifier";
import { extractKeywords, extractTitleAndCompany } from "@/features/job-description/textAnalysis";
import type { JobDescription } from "@/types/job-description";

export function createBlankJobDescription(): JobDescription {
  return {
    id: uuidv4(),
    label: "Untitled Job Description",
    createdAt: new Date().toISOString(),
    rawText: "",
    title: "",
    company: null,
    requiredSkills: [],
    preferredSkills: [],
    experienceLevel: null,
    keywords: [],
  };
}

/**
 * Builds a JobDescription from raw text (pasted, or flattened from a
 * pdf/docx upload), running the Phase 5 title/company/keyword heuristics
 * plus the Phase 7 required-vs-preferred skill split and experience
 * level inference. Everything here is a starting suggestion, editable
 * afterward in the job description form — never treated as final.
 */
export function createJobDescriptionFromText(
  rawText: string,
  label = "Untitled Job Description",
): JobDescription {
  const { title, company } = extractTitleAndCompany(rawText);
  const { requiredSkills, preferredSkills } = classifyRequiredAndPreferredSkills(rawText);

  return {
    id: uuidv4(),
    label,
    createdAt: new Date().toISOString(),
    rawText,
    title,
    company,
    requiredSkills,
    preferredSkills,
    experienceLevel: inferExperienceLevel(title, rawText),
    keywords: extractKeywords(rawText),
  };
}
