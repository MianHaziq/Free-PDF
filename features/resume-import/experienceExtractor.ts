import { v4 as uuidv4 } from "uuid";

import {
  collectBullets,
  segmentLinesByDateAnchor,
} from "@/features/resume-import/entrySegmentation";
import type { ExperienceEntry } from "@/types/resume";

const HEADING_SEPARATORS = [",", " – ", " — ", " - ", " | ", " at ", " @ "];

/**
 * Splits a heading like "Acme Corp, Associate Software Engineer" into
 * company/role. Falls back to putting the whole heading in `company` with
 * an empty `role` rather than guessing which part is which.
 */
function splitCompanyAndRole(heading: string): {
  company: string;
  role: string;
} {
  for (const separator of HEADING_SEPARATORS) {
    const index = heading.indexOf(separator);
    if (index > 0) {
      return {
        company: heading.slice(0, index).trim(),
        role: heading.slice(index + separator.length).trim(),
      };
    }
  }
  return { company: heading.trim(), role: "" };
}

export interface ExperienceExtractionResult {
  entries: ExperienceEntry[];
  leftoverLines: string[];
}

export function parseExperienceSection(
  lines: string[],
): ExperienceExtractionResult {
  const { segments, leftoverLines } = segmentLinesByDateAnchor(lines);

  const entries: ExperienceEntry[] = segments.map((segment) => {
    const { company, role } = splitCompanyAndRole(segment.heading);
    return {
      id: uuidv4(),
      company,
      role,
      startDate: segment.startDate,
      endDate: segment.endDate,
      bullets: collectBullets(segment.bodyLines),
      relevanceTags: [],
    };
  });

  return { entries, leftoverLines };
}
