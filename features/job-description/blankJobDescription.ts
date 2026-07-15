import { v4 as uuidv4 } from "uuid";

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
 * pdf/docx upload), running the first-pass title/company/keyword
 * heuristics. requiredSkills/preferredSkills/experienceLevel are left
 * empty for the user to fill in — splitting keywords into required vs.
 * preferred needs contextual language analysis, which is Phase 7's job.
 */
export function createJobDescriptionFromText(
  rawText: string,
  label = "Untitled Job Description",
): JobDescription {
  const { title, company } = extractTitleAndCompany(rawText);

  return {
    id: uuidv4(),
    label,
    createdAt: new Date().toISOString(),
    rawText,
    title,
    company,
    requiredSkills: [],
    preferredSkills: [],
    experienceLevel: null,
    keywords: extractKeywords(rawText),
  };
}
