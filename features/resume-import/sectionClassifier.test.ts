import { describe, expect, it } from "vitest";

import { classifyResumeLines } from "@/features/resume-import/sectionClassifier";
import type { ResumeLine } from "@/features/resume-import/types";

function line(
  text: string,
  overrides: Partial<Omit<ResumeLine, "text">> = {},
): ResumeLine {
  return {
    text,
    relativeFontSize: 1,
    isBold: false,
    isReconstructed: false,
    ...overrides,
  };
}

function header(text: string): ResumeLine {
  return line(text, { relativeFontSize: 1.2 });
}

describe("classifyResumeLines", () => {
  it("classifies a realistic single-column resume into all sections", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2.56 }),
      line("Software Engineer | Full Stack Developer", {
        relativeFontSize: 1.72,
      }),
      line(
        "jane@example.com|+1 (555) 123-4567|Springfield, IL",
      ),
      header("SUMMARY"),
      line("Full Stack Software Engineer with 3 years of experience."),
      header("EXPERIENCE"),
      line("Acme Corp, Associate Software Engineer 12/2025 – Present"),
      line("•Developed an AI telehealth platform."),
      header("EDUCATION"),
      line(
        "Bachelor in Software Development, Springfield State University 11/2021 – 07/2025",
      ),
      header("SKILLS"),
      line("Languages: JavaScript, TypeScript, Python"),
      header("CERTIFICATIONS"),
      line("MERN Stack Development"),
      line("Certification, Example Training Institute"),
    ];

    const result = classifyResumeLines(lines);

    expect(result.contact.value.fullName).toBe("Jane Doe");
    expect(result.contact.value.email).toBe("jane@example.com");
    expect(result.summary.value).toContain("Full Stack Software Engineer");
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0].company).toBe("Acme Corp");
    expect(result.education).toHaveLength(1);
    expect(result.education[0].institution).toBe(
      "Springfield State University",
    );
    expect(result.skills.map((s) => s.name)).toContain("JavaScript");
    expect(result.certifications).toEqual([
      { name: "MERN Stack Development", issuer: "Example Training Institute", date: null },
    ]);
    expect(result.unclassifiedBlocks).toEqual([]);
  });

  it("routes an unmatched header-like line to unclassifiedBlocks", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2 }),
      header("VOLUNTEER WORK"),
      line("Helped organize a local hackathon."),
    ];

    const result = classifyResumeLines(lines);
    expect(result.unclassifiedBlocks).toHaveLength(1);
    expect(result.unclassifiedBlocks[0].suggestedSection).toBeNull();
    expect(result.unclassifiedBlocks[0].rawText).toContain("VOLUNTEER WORK");
  });

  it("routes experience leftover lines before the first date anchor to unclassifiedBlocks", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2 }),
      header("EXPERIENCE"),
      line("An intro line with no date anchor"),
      line("Acme Corp, Engineer 01/2020 – 02/2021"),
      line("•Did some work."),
    ];

    const result = classifyResumeLines(lines);
    expect(result.experience).toHaveLength(1);
    const block = result.unclassifiedBlocks.find(
      (b) => b.suggestedSection === "experience",
    );
    expect(block?.rawText).toContain("An intro line with no date anchor");
  });

  it("routes overly complex certifications sections to unclassifiedBlocks", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2 }),
      header("CERTIFICATIONS"),
      line("Cert One"),
      line("Issuer One"),
      line("Cert Two"),
      line("Issuer Two"),
    ];

    const result = classifyResumeLines(lines);
    expect(result.certifications).toEqual([]);
    const block = result.unclassifiedBlocks.find(
      (b) => b.suggestedSection === "certifications",
    );
    expect(block).toBeDefined();
  });

  it("falls back to one flat unclassified block when no headers are found at all", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2 }),
      line("Just some free text with no structure."),
    ];

    const result = classifyResumeLines(lines);
    expect(result.summary.value).toBe("");
    expect(result.experience).toEqual([]);
    expect(result.unclassifiedBlocks).toHaveLength(1);
    expect(result.unclassifiedBlocks[0].suggestedSection).toBeNull();
    expect(result.unclassifiedBlocks[0].rawText).toContain(
      "Just some free text with no structure.",
    );
  });

  it("preserves the pre-header block as unclassified when contact extraction finds nothing", () => {
    const lines: ResumeLine[] = [
      line("Jane Doe", { relativeFontSize: 2 }),
      line("Some unrecognized header line with no contact details"),
      header("EXPERIENCE"),
      line("Acme Corp, Engineer 01/2020 – 02/2021"),
      line("•Did some work."),
    ];

    const result = classifyResumeLines(lines);
    const block = result.unclassifiedBlocks.find(
      (b) => b.suggestedSection === "contact-info",
    );
    expect(block?.rawText).toContain(
      "Some unrecognized header line with no contact details",
    );
  });
});
