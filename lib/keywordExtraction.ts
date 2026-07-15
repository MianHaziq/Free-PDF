function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans text for occurrences of any term in `dictionary` (whole-word,
 * case-insensitive), returning canonical dictionary names in
 * first-appearance order, deduplicated. Shared by the job description
 * module (constants/techSkills.ts scan) and the resume analyzer.
 */
export function extractKnownTermMentions(
  text: string,
  dictionary: readonly string[],
): string[] {
  const matches: { term: string; index: number }[] = [];

  for (const term of dictionary) {
    const pattern = new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(term)}(?![A-Za-z0-9_])`, "i");
    const match = pattern.exec(text);
    if (match) {
      matches.push({ term, index: match.index });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const found: string[] = [];
  for (const { term } of matches) {
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(term);
  }

  return found;
}
