/**
 * Explicit aliases for spelling variants normalization alone can't catch
 * (different words for the same thing, not just punctuation/casing).
 */
const EXPLICIT_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  postgres: "postgresql",
  k8s: "kubernetes",
  reactjs: "react",
  vuejs: "vue",
  nodejs: "node",
  golang: "go",
};

/** Lowercases and strips dots/spaces so "React.js"/"React"/"react js" all collapse to the same key, then applies EXPLICIT_ALIASES. */
export function normalizeSkillName(skill: string): string {
  const stripped = skill.toLowerCase().replace(/[.\s]/g, "");
  return EXPLICIT_ALIASES[stripped] ?? stripped;
}

export type SkillMatchType = "exact" | "partial" | "none";

/**
 * Exact: normalized forms are identical (covers spelling variants via
 * normalizeSkillName). Partial: one normalized form contains the other
 * (e.g. resume "AWS" vs. JD "AWS EC2" — broader experience that may
 * cover the specific requirement, but isn't confirmed).
 */
export function compareSkills(a: string, b: string): SkillMatchType {
  const normalizedA = normalizeSkillName(a);
  const normalizedB = normalizeSkillName(b);

  if (normalizedA === normalizedB) return "exact";
  if (normalizedA.includes(normalizedB) || normalizedB.includes(normalizedA)) return "partial";
  return "none";
}
