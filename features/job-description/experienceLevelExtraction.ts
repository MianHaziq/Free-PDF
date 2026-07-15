const YEARS_PLUS_REGEX = /(\d{1,2})\+\s*years?/i;
const YEARS_RANGE_REGEX = /(\d{1,2})\s*[-–—]\s*(\d{1,2})\s*years?/i;
const YEARS_BARE_REGEX = /(\d{1,2})\s*years?(?:\s+of)?\s+experience/i;

const TITLE_LEVEL_PATTERNS: { pattern: RegExp; level: string }[] = [
  { pattern: /\bprincipal\b/i, level: "Principal" },
  { pattern: /\bstaff\b/i, level: "Staff" },
  { pattern: /\blead\b/i, level: "Lead" },
  { pattern: /\bsenior\b|\bsr\.?\b/i, level: "Senior" },
  { pattern: /\bmid[\s-]?level\b/i, level: "Mid-level" },
  { pattern: /\bjunior\b|\bjr\.?\b/i, level: "Junior" },
  { pattern: /\bentry[\s-]?level\b|\bintern(ship)?\b/i, level: "Entry-level" },
];

/**
 * Best-effort experience-level inference. Prefers an explicit years
 * mention in the body text (most concrete signal); falls back to a
 * seniority keyword in the title. Returns null rather than guessing when
 * neither signal is present.
 */
export function inferExperienceLevel(title: string, rawText: string): string | null {
  const plusMatch = YEARS_PLUS_REGEX.exec(rawText);
  if (plusMatch) return `${plusMatch[1]}+ years`;

  const rangeMatch = YEARS_RANGE_REGEX.exec(rawText);
  if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]} years`;

  const bareMatch = YEARS_BARE_REGEX.exec(rawText);
  if (bareMatch) return `${bareMatch[1]} years`;

  for (const { pattern, level } of TITLE_LEVEL_PATTERNS) {
    if (pattern.test(title)) return level;
  }

  return null;
}
