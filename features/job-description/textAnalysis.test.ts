import { describe, expect, it } from "vitest";

import { extractKeywords, extractTitleAndCompany } from "@/features/job-description/textAnalysis";

describe("extractTitleAndCompany", () => {
  it("extracts title and company from a LinkedIn-style '·' separated header", () => {
    const result = extractTitleAndCompany(
      "Senior Backend Engineer\nAcme Corp · Remote\n\nWe are looking for an experienced engineer...",
    );
    expect(result.title).toBe("Senior Backend Engineer");
    expect(result.company).toBe("Acme Corp");
  });

  it("extracts company from an explicit 'Company:' label", () => {
    const result = extractTitleAndCompany(
      "Software Engineer\n\nCompany: Widget Inc\n\nAbout the role: ...",
    );
    expect(result.title).toBe("Software Engineer");
    expect(result.company).toBe("Widget Inc");
  });

  it("extracts company from a pipe-separated header (Indeed-style)", () => {
    const result = extractTitleAndCompany(
      "Full Stack Developer\nWidget Inc | New York, NY\n\nJob description...",
    );
    expect(result.title).toBe("Full Stack Developer");
    expect(result.company).toBe("Widget Inc");
  });

  it("leaves company null when the second line looks like body prose, not a header", () => {
    const result = extractTitleAndCompany(
      "Backend Engineer\nWe are a fast-growing company looking for talented engineers - come build with us and help scale our platform to millions of users worldwide.\n\nResponsibilities:",
    );
    expect(result.title).toBe("Backend Engineer");
    expect(result.company).toBeNull();
  });

  it("uses the first non-empty line as the title even with no company info", () => {
    const result = extractTitleAndCompany("Just a plain job description with no structure at all.");
    expect(result.title).toBe("Just a plain job description with no structure at all.");
    expect(result.company).toBeNull();
  });

  it("returns an empty title for empty input rather than throwing", () => {
    const result = extractTitleAndCompany("");
    expect(result.title).toBe("");
    expect(result.company).toBeNull();
  });
});

describe("extractKeywords", () => {
  it("finds known tech skills mentioned in the text", () => {
    const keywords = extractKeywords(
      "We use React, Node.js, and PostgreSQL. Experience with Docker and AWS is a plus.",
    );
    expect(keywords).toEqual(["React", "Node.js", "PostgreSQL", "Docker", "AWS"]);
  });

  it("matches case-insensitively but returns the canonical casing", () => {
    const keywords = extractKeywords("Must know javascript and TYPESCRIPT.");
    expect(keywords).toEqual(["JavaScript", "TypeScript"]);
  });

  it("does not match a skill as a substring of an unrelated word", () => {
    const keywords = extractKeywords("We are hiring a Gopher enthusiast.");
    expect(keywords).not.toContain("Go");
  });

  it("correctly matches skills with special regex characters like C++ and C#", () => {
    const keywords = extractKeywords("Looking for a developer skilled in C++ or C#.");
    expect(keywords).toEqual(["C++", "C#"]);
  });

  it("deduplicates repeated mentions", () => {
    const keywords = extractKeywords("React React React");
    expect(keywords).toEqual(["React"]);
  });

  it("returns an empty array when nothing recognizable is found", () => {
    expect(extractKeywords("A generic job posting with no specific tools mentioned.")).toEqual([]);
  });
});
