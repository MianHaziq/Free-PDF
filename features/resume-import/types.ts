import type { SupportedResumeImportFormat } from "@/constants/files";
import type { CanonicalResumeSection } from "@/constants/sections";
import type { Confidence } from "@/types/common";
import type {
  CertificationEntry,
  ContactInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillEntry,
  UnclassifiedBlock,
} from "@/types/resume";

/**
 * A single line of extracted resume text, already reconstructed into
 * reading order by the format-specific adapter (pdf/docx). This is the
 * shared intermediate representation consumed by sectionClassifier.
 */
export interface ResumeLine {
  text: string;
  /** Relative font size vs. the page/document's body text baseline. 1 = body size. */
  relativeFontSize: number;
  /** True when the source format marked this run as bold (docx) or unknown (pdf). */
  isBold: boolean;
  /** True when reading order for this line required column/table reconstruction. */
  isReconstructed: boolean;
}

export interface ParsedSection<T> {
  value: T;
  confidence: Confidence;
}

export interface ResumeParseResult {
  sourceFormat: SupportedResumeImportFormat;
  contact: ParsedSection<ContactInfo>;
  summary: ParsedSection<string>;
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  unclassifiedBlocks: UnclassifiedBlock[];
  warnings: string[];
}

/** A run of lines classified under one canonical section, in document order. */
export interface ClassifiedSection {
  section: CanonicalResumeSection;
  headerConfidence: Confidence;
  /** The raw header text as it appeared in the document (empty for the leading pre-header run). */
  headerText: string;
  lines: ResumeLine[];
}

export type ResumeImportErrorCode =
  | "unsupported-format"
  | "file-too-large"
  | "too-many-pages"
  | "empty-file"
  | "no-extractable-text"
  | "corrupted-file"
  | "invalid-json"
  | "invalid-json-schema";

export interface ResumeImportError {
  code: ResumeImportErrorCode;
  message: string;
}

export type ResumeImportOutcome =
  | { success: true; result: ResumeParseResult }
  | { success: false; error: ResumeImportError };
