import { describe, expect, it } from "vitest";

import { buildLinesFromHtml } from "@/features/resume-import/docx/buildDocxLines";

describe("buildLinesFromHtml", () => {
  it("extracts paragraphs and headings in document order", () => {
    const html = `
      <p>Jane Doe</p>
      <h2>Experience</h2>
      <p>Acme Corp, Engineer 01/2020 – 02/2021</p>
    `;
    const lines = buildLinesFromHtml(html);
    expect(lines.map((l) => l.text)).toEqual([
      "Jane Doe",
      "Experience",
      "Acme Corp, Engineer 01/2020 – 02/2021",
    ]);
  });

  it("assigns an elevated relativeFontSize to heading tags", () => {
    const lines = buildLinesFromHtml("<h2>Experience</h2><p>Body text</p>");
    expect(lines[0].relativeFontSize).toBeGreaterThan(1.05);
    expect(lines[1].relativeFontSize).toBe(1);
  });

  it("treats a fully-bold paragraph as a header signal", () => {
    const lines = buildLinesFromHtml("<p><strong>SKILLS</strong></p>");
    expect(lines[0].isBold).toBe(true);
  });

  it("does not flag a partially-bold paragraph as a header", () => {
    const lines = buildLinesFromHtml(
      "<p><strong>Acme Corp</strong>, Engineer 01/2020 – 02/2021</p>",
    );
    expect(lines[0].isBold).toBe(false);
  });

  it("extracts list items as separate lines", () => {
    const lines = buildLinesFromHtml(
      "<ul><li>Built the API.</li><li>Wrote tests.</li></ul>",
    );
    expect(lines.map((l) => l.text)).toEqual([
      "Built the API.",
      "Wrote tests.",
    ]);
  });

  it("does not double-count a paragraph nested inside a list item", () => {
    const lines = buildLinesFromHtml("<ul><li><p>Built the API.</p></li></ul>");
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe("Built the API.");
  });

  it("walks table cells in document order and flags them as reconstructed", () => {
    const html = `
      <table>
        <tr><td>Skill A</td><td>Skill B</td></tr>
        <tr><td>Skill C</td><td>Skill D</td></tr>
      </table>
    `;
    const lines = buildLinesFromHtml(html);
    expect(lines.map((l) => l.text)).toEqual([
      "Skill A",
      "Skill B",
      "Skill C",
      "Skill D",
    ]);
    expect(lines.every((l) => l.isReconstructed)).toBe(true);
  });

  it("skips empty elements", () => {
    const lines = buildLinesFromHtml("<p></p><p>   </p><p>Real content</p>");
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe("Real content");
  });
});
