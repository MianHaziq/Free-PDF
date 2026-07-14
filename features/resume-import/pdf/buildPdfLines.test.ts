import { describe, expect, it } from "vitest";

import { buildLinesFromPdfPages } from "@/features/resume-import/pdf/buildPdfLines";
import type { PdfPageInput, PdfTextItemInput } from "@/features/resume-import/pdf/buildPdfLines";

function item(
  str: string,
  x: number,
  width: number,
  overrides: Partial<PdfTextItemInput> = {},
): PdfTextItemInput {
  return { str, x, width, y: 100, fontSize: 9, ...overrides };
}

describe("buildLinesFromPdfPages", () => {
  it("joins adjacent word items with a real gap, real values from a sample resume", () => {
    // "Acme Corp, Associate Software Engineer" — real x/width from probing
    // a sample resume PDF.
    const items: PdfTextItemInput[] = [
      item("Acme Corp", 28.34, 37.25, { y: 660 }),
      item(",", 65.74, 2.7, { y: 660 }),
      item("Associate", 70.25, 34.5, { y: 660 }),
      item("Software", 106.56, 33.13, { y: 660 }),
      item("Engineer", 141.49, 32.63, { y: 660 }),
    ];
    const pages: PdfPageInput[] = [{ items, pageWidth: 612 }];

    const lines = buildLinesFromPdfPages(pages);
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe("Acme Corp, Associate Software Engineer");
  });

  it("does not insert a space for tightly-kerned adjacent glyphs (no real gap)", () => {
    const items: PdfTextItemInput[] = [
      item("Acme Corp", 28.34, 37.25, { y: 660 }),
      item(",", 65.59, 2.7, { y: 660 }), // effectively zero gap before comma
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);
    expect(lines[0].text).toBe("Acme Corp,");
  });

  it("clusters items into separate lines by y and orders top-to-bottom", () => {
    const items: PdfTextItemInput[] = [
      item("SUMMARY", 28, 50, { y: 729, fontSize: 10 }),
      item("First line of summary text here.", 28, 200, {
        y: 714,
        fontSize: 9,
      }),
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);
    expect(lines.map((l) => l.text)).toEqual([
      "SUMMARY",
      "First line of summary text here.",
    ]);
  });

  it("computes relativeFontSize against the body-text mode", () => {
    const items: PdfTextItemInput[] = [
      item("Name", 28, 50, { y: 100, fontSize: 23 }),
      item("Body text one", 28, 100, { y: 90, fontSize: 9 }),
      item("Body text two", 28, 100, { y: 80, fontSize: 9 }),
      item("HEADER", 28, 50, { y: 70, fontSize: 10 }),
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);
    const nameLine = lines.find((l) => l.text === "Name");
    const headerLine = lines.find((l) => l.text === "HEADER");
    expect(nameLine?.relativeFontSize).toBeCloseTo(23 / 9, 2);
    expect(headerLine?.relativeFontSize).toBeCloseTo(10 / 9, 2);
  });

  it("reconstructs a two-column sidebar layout column-by-column", () => {
    // Sidebar (left, x~20) and main content (right, x~300) flow
    // independently down the page, as in a real two-column template —
    // their y-positions don't align row-by-row.
    const items: PdfTextItemInput[] = [
      item("CONTACT", 20, 60, { y: 750 }),
      item("jane at example dot com", 20, 100, { y: 735 }),
      item("SKILLS", 20, 60, { y: 700 }),
      item("React, Node.js, PostgreSQL", 20, 150, { y: 685 }),
      item("EDUCATION", 20, 60, { y: 640 }),
      item("State University 2020", 20, 150, { y: 625 }),
      item("EXPERIENCE", 300, 70, { y: 745 }),
      item("Acme Corp, Senior Engineer, built distributed systems", 300, 260, {
        y: 730,
      }),
      item("Built a payments platform handling millions of transactions", 300, 260, {
        y: 710,
      }),
      item("Led a team of four engineers across two product lines", 300, 260, {
        y: 690,
      }),
      item("Widget Inc, Software Engineer, shipped the mobile app", 300, 260, {
        y: 670,
      }),
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);

    expect(lines.map((l) => l.text)).toEqual([
      "CONTACT",
      "jane at example dot com",
      "SKILLS",
      "React, Node.js, PostgreSQL",
      "EDUCATION",
      "State University 2020",
      "EXPERIENCE",
      "Acme Corp, Senior Engineer, built distributed systems",
      "Built a payments platform handling millions of transactions",
      "Led a team of four engineers across two product lines",
      "Widget Inc, Software Engineer, shipped the mobile app",
    ]);
    expect(lines.every((l) => l.isReconstructed)).toBe(true);
  });

  it("does not misdetect right-aligned dates on single-column lines as a second column", () => {
    // Regression test: dates right-aligned at the end of heading lines
    // (a common resume pattern) must stay attached to their line, not get
    // split into a spurious "column" that breaks date-anchor extraction.
    const items: PdfTextItemInput[] = [
      item("Acme Corp, Associate Software Engineer", 28, 150, { y: 660 }),
      item("12/2025 – Present", 500, 66, { y: 660 }),
      item("Built things.", 36, 80, { y: 640 }),
      item("Acme Corp, Engineer", 28, 120, { y: 600 }),
      item("01/2020 – 02/2021", 480, 66, { y: 600 }),
      item("Built other things.", 36, 90, { y: 580 }),
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);

    expect(lines.every((l) => !l.isReconstructed)).toBe(true);
    expect(lines[0].text).toContain("12/2025 – Present");
    expect(lines[2].text).toContain("01/2020 – 02/2021");
  });

  it("treats a normal single-column page as not reconstructed", () => {
    const items: PdfTextItemInput[] = [
      item("Line one", 28, 60, { y: 700 }),
      item("Line two", 28, 60, { y: 690 }),
      item("Line three", 30, 60, { y: 680 }),
      item("Line four", 28, 60, { y: 670 }),
    ];
    const lines = buildLinesFromPdfPages([{ items, pageWidth: 612 }]);
    expect(lines.every((l) => !l.isReconstructed)).toBe(true);
    expect(lines.map((l) => l.text)).toEqual([
      "Line one",
      "Line two",
      "Line three",
      "Line four",
    ]);
  });
});
