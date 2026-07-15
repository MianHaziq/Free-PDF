import { KNOWN_TECH_SKILLS } from "@/constants/techSkills";
import { extractKnownTermMentions } from "@/lib/keywordExtraction";

const REQUIRED_HEADERS = [
  "requirements",
  "required skills",
  "required qualifications",
  "must have",
  "must haves",
  "minimum qualifications",
  "basic qualifications",
  "what you'll need",
  "what you need",
  "qualifications",
];

const PREFERRED_HEADERS = [
  "preferred",
  "preferred skills",
  "preferred qualifications",
  "nice to have",
  "nice-to-have",
  "nice to haves",
  "bonus points",
  "bonus",
  "pluses",
  "good to have",
];

const MAX_HEADER_WORDS = 6;

type SectionKind = "required" | "preferred" | "other";

/** Only an exact match (after stripping a trailing colon) counts as a header — a loose "starts with" check would misfire on ordinary sentences like "Requirements for this role are flexible." */
function matchHeaderKind(normalizedLine: string): SectionKind | null {
  if (REQUIRED_HEADERS.includes(normalizedLine)) return "required";
  if (PREFERRED_HEADERS.includes(normalizedLine)) return "preferred";
  return null;
}

/**
 * Splits job description text into required/preferred/other sections
 * based on common heading language ("Requirements:", "Nice to have:",
 * etc.), then scans each section for recognized tech skills
 * (constants/techSkills.ts). Skills mentioned outside an explicit
 * required/preferred heading are left out of both buckets rather than
 * guessed — they still appear in the flat keyword list from
 * textAnalysis.ts's extractKeywords.
 */
export function classifyRequiredAndPreferredSkills(rawText: string): {
  requiredSkills: string[];
  preferredSkills: string[];
} {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let currentKind: SectionKind = "other";
  const buckets: Record<SectionKind, string[]> = { required: [], preferred: [], other: [] };

  for (const line of lines) {
    const wordCount = line.split(/\s+/).length;
    if (wordCount <= MAX_HEADER_WORDS) {
      const normalized = line.toLowerCase().replace(/:$/, "").trim();
      const headerKind = matchHeaderKind(normalized);
      if (headerKind) {
        currentKind = headerKind;
        continue;
      }
    }
    buckets[currentKind].push(line);
  }

  const requiredSkills = extractKnownTermMentions(buckets.required.join("\n"), KNOWN_TECH_SKILLS);
  const preferredCandidates = extractKnownTermMentions(
    buckets.preferred.join("\n"),
    KNOWN_TECH_SKILLS,
  );

  const requiredLower = new Set(requiredSkills.map((skill) => skill.toLowerCase()));
  const preferredSkills = preferredCandidates.filter(
    (skill) => !requiredLower.has(skill.toLowerCase()),
  );

  return { requiredSkills, preferredSkills };
}
