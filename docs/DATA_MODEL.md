# DATA_MODEL.md

## Purpose

This document defines the internal data schema for resumes, tailored
resume versions, job descriptions, and ATS reports, including how they
relate to each other. It is an addendum to
`Resume_Tailoring_Platform_Development_Plan.md` (Phase 2 and Phase 13)
and must be read before implementing Resume JSON validation or Local
Storage/History.

Without a defined relationship model, "store tailored resumes and job
descriptions" (Phase 13) has no way to answer "which tailored resume
came from which source resume, for which job?" — this document fixes
that before any storage code is written.

------------------------------------------------------------------------

# Core Entities

## 1. SourceResume

The user's original, untouched resume. There should typically be one
"active" SourceResume at a time, but the schema allows multiple (e.g.
the user maintains a separate resume for AI roles vs. backend roles).

```ts
type SourceResume = {
  id: string;               // uuid
  label: string;             // user-facing name, e.g. "Main Resume 2026"
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
  sourceFormat: "pdf" | "docx" | "json";
  contact: ContactInfo;
  summary: string;
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  unclassifiedBlocks: UnclassifiedBlock[]; // from parsing, see PARSING_STRATEGY.md
};
```

## 2. JobDescription

```ts
type JobDescription = {
  id: string;
  label: string;              // e.g. "Backend Engineer - Acme Corp"
  createdAt: string;
  rawText: string;             // original pasted/extracted text, kept for reference
  title: string;
  company: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string | null;
  keywords: string[];
};
```

## 3. TailoredResume

A TailoredResume is never a standalone object — it always references
the SourceResume and JobDescription it was generated from. This is the
relationship that was missing from the original plan.

```ts
type TailoredResume = {
  id: string;
  sourceResumeId: string;      // FK -> SourceResume.id
  jobDescriptionId: string;    // FK -> JobDescription.id
  createdAt: string;
  generationMethod: "rule-based" | "ai-assisted";
  content: {
    contact: ContactInfo;       // copied from source, editable independently
    summary: string;            // may be rewritten, original preserved separately
    originalSummary: string;    // always kept for comparison/audit
    skills: SkillEntry[];       // reordered/filtered, never new skills added
    experience: ExperienceEntry[]; // reordered, bullets may be reworded not invented
    projects: ProjectEntry[];
  };
  atsReportId: string;          // FK -> AtsReport.id
};
```

## 4. AtsReport

```ts
type AtsReport = {
  id: string;
  tailoredResumeId: string;    // FK -> TailoredResume.id
  createdAt: string;
  score: number;                // 0-100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};
```

------------------------------------------------------------------------

# Relationship Diagram

```text
SourceResume (1) ────────< TailoredResume (many)
                                   │
JobDescription (1) ───────────────┘
                                   │
                                   ▼
                             AtsReport (1:1)
```

- One SourceResume can produce many TailoredResumes (one per job
  applied to).
- One JobDescription can also be reused across multiple
  TailoredResumes if the user tailors from more than one source
  resume against it (uncommon but valid).
- Each TailoredResume has exactly one AtsReport.

This is what makes "history" (Phase 13) meaningful: the user should be
able to open their history and see, for each tailored resume, which
source resume and which job it came from, plus its score — not just a
flat list of disconnected JSON blobs.

------------------------------------------------------------------------

# Shared Sub-Types

```ts
type ContactInfo = {
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
};

type SkillEntry = {
  name: string;
  category: string | null;     // e.g. "Backend", "Frontend", "DevOps"
  confidence: "high" | "medium" | "low"; // from parsing stage
};

type ExperienceEntry = {
  id: string;
  company: string;
  role: string;
  startDate: string;           // "YYYY-MM"
  endDate: string | null;      // null = current
  bullets: string[];
  relevanceTags: string[];     // e.g. ["backend", "leadership"] used for reordering
};

type ProjectEntry = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
  relevanceTags: string[];
};

type EducationEntry = {
  institution: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
};

type CertificationEntry = {
  name: string;
  issuer: string | null;
  date: string | null;
};

type UnclassifiedBlock = {
  rawText: string;
  suggestedSection: string | null;
  confidence: "low";
};
```

------------------------------------------------------------------------

# Validation Rules (Zod, per AI_RULES.md)

- All entity IDs are non-empty strings (uuid v4 recommended).
- `TailoredResume.sourceResumeId` and `.jobDescriptionId` must
  reference existing records at creation time — reject orphaned
  TailoredResumes.
- Dates follow `YYYY-MM` or `YYYY-MM-DD`; `endDate: null` is valid and
  means "current," never an empty string.
- `SkillEntry.confidence`, when `"low"`, must be surfaced in the UI
  before the skill is used in matching or tailoring (ties into
  `PARSING_STRATEGY.md`).
- No field required by the schema may silently default to an invented
  value (e.g. a missing company name must be `null`/flagged, never
  auto-filled with a placeholder that looks real).

------------------------------------------------------------------------

# Storage Mapping (IndexedDB)

Suggested object stores, one per top-level entity:

- `sourceResumes`
- `jobDescriptions`
- `tailoredResumes`
- `atsReports`

Each keyed by `id`, with a secondary index on foreign keys
(`sourceResumeId`, `jobDescriptionId`, `tailoredResumeId`) to support
the history view's "show me everything derived from this resume"
queries without full table scans.

------------------------------------------------------------------------

# Testing Requirements (extends Phase 2 and Phase 13 testing)

- Creating a TailoredResume with a non-existent sourceResumeId is
  rejected.
- Deleting a SourceResume that has dependent TailoredResumes either
  blocks deletion or explicitly cascades — this must be a conscious
  decision, not undefined behavior (recommendation: block deletion,
  prompt user to confirm cascade).
- Round-tripping a SourceResume through export-to-JSON and
  re-import produces an identical object (validates the "JSON as
  trusted input" path from `PARSING_STRATEGY.md`).
- History view correctly groups TailoredResumes under their source
  resume and job description after 20+ entries (basic scale check).
