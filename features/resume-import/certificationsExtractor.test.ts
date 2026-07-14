import { describe, expect, it } from "vitest";

import { parseCertificationsSection } from "@/features/resume-import/certificationsExtractor";

describe("parseCertificationsSection", () => {
  it("parses the common 'Name' + 'Certification, Issuer' two-line pattern", () => {
    const result = parseCertificationsSection([
      "MERN Stack Development",
      "Certification, Example Training Institute",
    ]);
    expect(result).toEqual([
      { name: "MERN Stack Development", issuer: "Example Training Institute", date: null },
    ]);
  });

  it("extracts a date from the issuer line when present", () => {
    const result = parseCertificationsSection([
      "AWS Certified Developer",
      "Amazon Web Services, 06/2024 – Present",
    ]);
    expect(result?.[0].issuer).toBe("Amazon Web Services");
    expect(result?.[0].date).toBe("2024-06");
  });

  it("returns an empty array for an empty section", () => {
    expect(parseCertificationsSection([])).toEqual([]);
  });

  it("returns null (defer to unclassified) when the section is too complex", () => {
    const result = parseCertificationsSection([
      "Cert One",
      "Issuer One",
      "Cert Two",
      "Issuer Two",
    ]);
    expect(result).toBeNull();
  });

  it("handles a single line with no issuer", () => {
    const result = parseCertificationsSection(["Just a certification name"]);
    expect(result).toEqual([
      { name: "Just a certification name", issuer: null, date: null },
    ]);
  });
});
