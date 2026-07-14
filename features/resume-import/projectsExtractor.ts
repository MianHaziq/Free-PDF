import { v4 as uuidv4 } from "uuid";

import {
  collectBullets,
  segmentLinesByDateAnchor,
} from "@/features/resume-import/entrySegmentation";
import type { ProjectEntry } from "@/types/resume";

export interface ProjectsExtractionResult {
  entries: ProjectEntry[];
  leftoverLines: string[];
}

/**
 * Real-world project sections (like experience) use one date-anchored
 * heading per entry followed by bullet lines. There's no separate
 * "description" line distinguishable from bullets, so description is left
 * empty for the user to fill in rather than duplicating a bullet into it.
 * technologies is left empty unless a dedicated line is added in a future
 * iteration (this resume format doesn't separate them per-project).
 */
export function parseProjectsSection(lines: string[]): ProjectsExtractionResult {
  const { segments, leftoverLines } = segmentLinesByDateAnchor(lines);

  const entries: ProjectEntry[] = segments.map((segment) => ({
    id: uuidv4(),
    name: segment.heading,
    description: "",
    technologies: [],
    bullets: collectBullets(segment.bodyLines),
    relevanceTags: [],
  }));

  return { entries, leftoverLines };
}
