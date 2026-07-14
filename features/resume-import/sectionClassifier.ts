import {
  SECTION_HEADER_KEYWORDS,
  type CanonicalResumeSection,
} from "@/constants/sections";
import { parseCertificationsSection } from "@/features/resume-import/certificationsExtractor";
import { extractContactInfo } from "@/features/resume-import/contactExtractor";
import { parseEducationSection } from "@/features/resume-import/educationExtractor";
import { parseExperienceSection } from "@/features/resume-import/experienceExtractor";
import { parseProjectsSection } from "@/features/resume-import/projectsExtractor";
import { parseSkillsSection } from "@/features/resume-import/skillsExtractor";
import type {
  ClassifiedSection,
  ResumeLine,
  ResumeParseResult,
} from "@/features/resume-import/types";
import type { Confidence } from "@/types/common";
import type { UnclassifiedBlock } from "@/types/resume";

const MAX_HEADER_WORDS = 6;

/**
 * Real section headers are only slightly larger than body text (e.g. 10pt
 * vs. 9pt body). A document's name/title lines are dramatically larger
 * (e.g. 23pt/15.5pt), so they fall outside this range and are correctly
 * excluded rather than misdetected as section headers.
 */
const VISUAL_HEADER_FONT_RATIO_MIN = 1.05;
const VISUAL_HEADER_FONT_RATIO_MAX = 1.45;

interface HeaderMatch {
  lineIndex: number;
  /** null = looks like a header visually/structurally, but keyword unmatched. */
  section: CanonicalResumeSection | null;
  confidence: Confidence;
  headerText: string;
}

function matchSectionKeyword(
  normalized: string,
): { section: CanonicalResumeSection; confidence: Confidence } | null {
  let partial: { section: CanonicalResumeSection; confidence: Confidence } | null =
    null;

  for (const [section, keywords] of Object.entries(SECTION_HEADER_KEYWORDS) as [
    CanonicalResumeSection,
    string[],
  ][]) {
    for (const keyword of keywords) {
      if (normalized === keyword) {
        return { section, confidence: "high" };
      }
      if (!partial && normalized.includes(keyword)) {
        partial = { section, confidence: "medium" };
      }
    }
  }

  return partial;
}

function detectHeaders(lines: ResumeLine[]): HeaderMatch[] {
  const headers: HeaderMatch[] = [];

  lines.forEach((line, lineIndex) => {
    // The first line of a resume is virtually always the candidate's name
    // (universal convention) — never treat it as a section header.
    if (lineIndex === 0) return;

    const text = line.text.trim();
    if (!text) return;

    const wordCount = text.split(/\s+/).length;
    if (wordCount > MAX_HEADER_WORDS) return;

    const normalized = text.toLowerCase().replace(/:$/, "").trim();
    const keywordMatch = matchSectionKeyword(normalized);
    const fontInHeaderRange =
      line.relativeFontSize >= VISUAL_HEADER_FONT_RATIO_MIN &&
      line.relativeFontSize <= VISUAL_HEADER_FONT_RATIO_MAX;
    const looksLikeHeaderVisually = fontInHeaderRange || line.isBold;

    if (keywordMatch) {
      headers.push({
        lineIndex,
        section: keywordMatch.section,
        confidence: keywordMatch.confidence,
        headerText: text,
      });
    } else if (looksLikeHeaderVisually) {
      headers.push({
        lineIndex,
        section: null,
        confidence: "low",
        headerText: text,
      });
    }
  });

  return headers;
}

function groupIntoSections(
  lines: ResumeLine[],
  headers: HeaderMatch[],
): { preHeaderLines: ResumeLine[]; sections: ClassifiedSection[] } {
  const preHeaderLines = lines.slice(0, headers[0]?.lineIndex ?? lines.length);

  const sections: ClassifiedSection[] = headers.map((header, i) => {
    const nextLineIndex =
      i + 1 < headers.length ? headers[i + 1].lineIndex : lines.length;
    return {
      section: header.section ?? "unclassified",
      headerConfidence: header.confidence,
      headerText: header.headerText,
      lines: lines.slice(header.lineIndex + 1, nextLineIndex),
    };
  });

  return { preHeaderLines, sections };
}

/**
 * Classifies format-agnostic resume lines (already reconstructed into
 * reading order by the pdf/docx adapter) into the canonical sections from
 * docs/PARSING_STRATEGY.md, delegating structured extraction to the
 * per-section parsers. Anything that can't be confidently structured is
 * surfaced via unclassifiedBlocks rather than guessed.
 */
export function classifyResumeLines(
  lines: ResumeLine[],
): Omit<ResumeParseResult, "sourceFormat"> {
  const headers = detectHeaders(lines);
  const { preHeaderLines, sections } = groupIntoSections(lines, headers);

  const contactCandidateLines = [
    ...preHeaderLines,
    ...sections
      .filter((s) => s.section === "contact-info")
      .flatMap((s) => s.lines),
  ].map((l) => l.text);

  const contactResult = extractContactInfo(contactCandidateLines);
  const warnings = [...contactResult.warnings];
  const unclassifiedBlocks: UnclassifiedBlock[] = [];

  // Never silently drop content (docs/PARSING_STRATEGY.md "Core Principle").
  const remainingPreHeaderText = preHeaderLines
    .slice(1)
    .map((l) => l.text)
    .filter((t) => t.trim())
    .join("\n");

  if (headers.length === 0) {
    // No section structure detected anywhere: fall back to a single flat
    // block so the user can assign sections manually, per PARSING_STRATEGY.
    if (remainingPreHeaderText) {
      unclassifiedBlocks.push({
        rawText: remainingPreHeaderText,
        suggestedSection: null,
        confidence: "low",
      });
    }
  } else if (contactResult.section.confidence === "low" && remainingPreHeaderText) {
    // Headers exist, but nothing useful was extracted from the pre-header
    // block (name/title/contact line) — preserve it instead of dropping it.
    unclassifiedBlocks.push({
      rawText: remainingPreHeaderText,
      suggestedSection: "contact-info",
      confidence: "low",
    });
  }

  let summary = "";
  let summaryConfidence: Confidence = "low";
  const skills: ResumeParseResult["skills"] = [];
  const experience: ResumeParseResult["experience"] = [];
  const projects: ResumeParseResult["projects"] = [];
  const education: ResumeParseResult["education"] = [];
  const certifications: ResumeParseResult["certifications"] = [];

  for (const section of sections) {
    const lineTexts = section.lines.map((l) => l.text);

    switch (section.section) {
      case "professional-summary": {
        const text = lineTexts.join(" ").replace(/\s+/g, " ").trim();
        if (text) {
          summary = summary ? `${summary} ${text}` : text;
          summaryConfidence = section.headerConfidence;
        }
        break;
      }
      case "skills": {
        skills.push(...parseSkillsSection(lineTexts));
        break;
      }
      case "experience": {
        const { entries, leftoverLines } = parseExperienceSection(lineTexts);
        experience.push(...entries);
        if (leftoverLines.some((l) => l.trim())) {
          unclassifiedBlocks.push({
            rawText: leftoverLines.filter((l) => l.trim()).join("\n"),
            suggestedSection: "experience",
            confidence: "low",
          });
        }
        break;
      }
      case "projects": {
        const { entries, leftoverLines } = parseProjectsSection(lineTexts);
        projects.push(...entries);
        if (leftoverLines.some((l) => l.trim())) {
          unclassifiedBlocks.push({
            rawText: leftoverLines.filter((l) => l.trim()).join("\n"),
            suggestedSection: "projects",
            confidence: "low",
          });
        }
        break;
      }
      case "education": {
        education.push(...parseEducationSection(lineTexts));
        break;
      }
      case "certifications": {
        const result = parseCertificationsSection(lineTexts);
        if (result === null) {
          unclassifiedBlocks.push({
            rawText: lineTexts.filter((l) => l.trim()).join("\n"),
            suggestedSection: "certifications",
            confidence: "low",
          });
        } else {
          certifications.push(...result);
        }
        break;
      }
      case "contact-info": {
        // Already folded into contactCandidateLines above.
        break;
      }
      case "unclassified": {
        const combined = [section.headerText, ...lineTexts]
          .filter((l) => l.trim())
          .join("\n");
        if (combined.trim()) {
          unclassifiedBlocks.push({
            rawText: combined,
            suggestedSection: null,
            confidence: "low",
          });
        }
        break;
      }
    }
  }

  return {
    contact: contactResult.section,
    summary: { value: summary, confidence: summaryConfidence },
    skills,
    experience,
    projects,
    education,
    certifications,
    unclassifiedBlocks,
    warnings,
  };
}
