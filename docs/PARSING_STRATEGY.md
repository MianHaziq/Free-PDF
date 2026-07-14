# PARSING_STRATEGY.md

## Purpose

This document defines how the Resume Import Module converts arbitrary
PDF, DOCX, and JSON resumes into structured Resume JSON. It is an
addendum to `TECH_STACK_AND_AI_ARCHITECTURE.md` and
`Resume_Tailoring_Platform_Development_Plan.md` (Phase 3), and must be
read before implementing that phase.

Parsing real-world resumes is the hardest problem in this project.
Resumes are not structured documents — they are visually formatted
text with no semantic markup. This strategy exists so parsing failure
is expected and handled, not treated as an edge case.

------------------------------------------------------------------------

# Core Principle

**Parsing must never silently produce wrong data.**

It is acceptable for the parser to say "I'm not sure what this
section is" and ask the user to confirm or fix it in the Resume
Editor. It is not acceptable for the parser to guess and present the
result as ground truth. Every extracted field carries a confidence
level, and low-confidence fields are flagged for manual review before
they ever feed into the Matching Engine or Tailoring Engine.

------------------------------------------------------------------------

# Input Formats & Extraction Approach

## PDF (via pdfjs-dist)

pdfjs-dist gives text runs with x/y coordinates and font metadata, not
document structure. Strategy:

1. Extract all text items with position and font size/weight.
2. Group text items into lines using y-coordinate clustering (items
   within a small y-tolerance belong to the same line).
3. Detect columns by checking for x-coordinate gaps — if two clusters
   of lines consistently start at very different x positions, treat
   the page as multi-column and reconstruct reading order
   column-by-column rather than left-to-right across the full width.
4. Detect section headers using heuristics: larger/bolder font than
   surrounding body text, all-caps or title-case short lines, and
   presence of known header keywords (Experience, Education, Skills,
   Projects, Summary, Certifications, etc. — configurable keyword
   list, not hardcoded to English-only long-term).
5. If column detection or header detection confidence is low (e.g.
   heavily templated resume with icons, sidebars, tables), fall back
   to treating the page as a single flat text block and let the user
   assign sections manually in the editor.

## DOCX (via mammoth)

mammoth converts DOCX to HTML/text with some structure (headings,
lists, bold) preserved. Strategy:

1. Convert to HTML first, not plain text — this preserves heading
   tags, bold runs, and list structure that are otherwise lost.
2. Use heading tags and bold short lines as section-header signals
   (same keyword list as PDF path).
3. Use list items (`<li>`) as a strong signal for bullet points under
   experience/projects.
4. Tables in DOCX resumes (common for two-column templates) must be
   walked cell-by-cell in document order, not read as a single blob.

## JSON

If the user re-uploads a previously exported Resume JSON, skip
extraction entirely and validate directly against the schema (see
`DATA_MODEL.md`). This is the "trusted" input path and should be the
recommended path for repeat use.

------------------------------------------------------------------------

# Section Classification

After lines are extracted and grouped, each block of text must be
classified into one of the canonical sections:

- Contact Info
- Professional Summary
- Skills
- Experience (per role)
- Projects
- Education
- Certifications
- Other / Unclassified

Classification is keyword + position based (a block appearing right
after a header matching "Experience" is classified as Experience).
Blocks that cannot be confidently classified go into "Unclassified"
and are surfaced to the user rather than dropped or guessed.

------------------------------------------------------------------------

# Confidence Scoring

Every parsed field gets a confidence score (High / Medium / Low)
based on:

- Whether it was extracted from a recognized header pattern.
- Whether the format matches expected shape (e.g. dates matching a
  date pattern, email matching an email pattern).
- Whether column/table reconstruction was needed (lower confidence by
  default, since reconstructed reading order is more error-prone).

Rules:

- **High confidence** fields are shown pre-filled in the editor.
- **Medium confidence** fields are pre-filled but visually flagged
  (e.g. a subtle border/badge) for quick user review.
- **Low confidence** fields are shown as suggestions but not
  auto-accepted — the user must confirm before they're used anywhere
  downstream.

------------------------------------------------------------------------

# Failure Modes to Handle Explicitly

- **Multi-column / sidebar templates** — most likely source of
  misordered text. Handle via column detection; fall back to manual
  section assignment.
- **Tables used for layout** (skills grids, date/role tables) — walk
  cell by cell, never read as flat text.
- **Icons instead of text labels** (e.g. a phone icon instead of the
  word "Phone") — icons are not extractable as text; contact fields
  relying on icons should be left blank rather than guessed.
- **Non-standard section names** (e.g. "What I've Built" instead of
  "Projects") — keyword list should be extendable, and unmatched
  headers should still be treated as section boundaries (unclassified
  section) rather than merged into the previous section.
- **Corrupted or password-protected PDFs** — detect and show a clear
  error; do not attempt partial extraction silently.
- **Scanned/image-only PDFs (no text layer)** — detect zero
  extractable text and inform the user this resume needs to be
  re-exported as text-based PDF or DOCX; OCR is explicitly out of
  scope for v1.
- **Very large files** — enforce a max file size (e.g. 5MB) and page
  count (e.g. 10 pages) before attempting extraction, to avoid
  freezing the browser tab.

------------------------------------------------------------------------

# Manual Correction Is Part of the Pipeline, Not a Fallback

The Resume Editor (Phase 4) is not a "nice to have" — it is the
required second stage of every import. No resume goes from
Import → Tailoring Engine without passing through a review step where
Medium/Low confidence fields are visible and editable. This is what
makes the truthfulness guarantee in `AI_RULES.md` enforceable: garbage
extraction caught here never reaches the tailoring or ATS scoring
logic.

------------------------------------------------------------------------

# Testing Requirements (extends Phase 3 testing in the Development Plan)

In addition to the existing Phase 3 tests, explicitly test against:

- A single-column plain-text-style resume (best case).
- A two-column template resume.
- A resume using tables for the skills section.
- A resume with non-standard section headers.
- A scanned image-only PDF (expect graceful rejection, not a crash).
- A resume with no clear "Experience" section at all (e.g. new grad
  resume) — should not force-fit content into the wrong section.
