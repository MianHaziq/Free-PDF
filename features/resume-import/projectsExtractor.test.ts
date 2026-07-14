import { describe, expect, it } from "vitest";

import { parseProjectsSection } from "@/features/resume-import/projectsExtractor";

describe("parseProjectsSection", () => {
  it("extracts a project name, dates, and bullets", () => {
    const { entries, leftoverLines } = parseProjectsSection([
      "Amoonis Boutique — Multi-Region E-Commerce Platform 04/2026 – 06/2026",
      "•Built a full-stack multi-region e-commerce platform.",
      "•Integrated MyFatoorah payments with Apple Pay.",
    ]);

    expect(leftoverLines).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe(
      "Amoonis Boutique — Multi-Region E-Commerce Platform",
    );
    expect(entries[0].description).toBe("");
    expect(entries[0].technologies).toEqual([]);
    expect(entries[0].bullets).toEqual([
      "Built a full-stack multi-region e-commerce platform.",
      "Integrated MyFatoorah payments with Apple Pay.",
    ]);
  });

  it("splits multiple projects at each date anchor", () => {
    const { entries } = parseProjectsSection([
      "Project One 01/2024 – 02/2024",
      "•Bullet one.",
      "Project Two 03/2024 – 04/2024",
      "•Bullet two.",
    ]);
    expect(entries).toHaveLength(2);
    expect(entries[0].name).toBe("Project One");
    expect(entries[1].name).toBe("Project Two");
  });

  it("returns no entries when no date anchor is found", () => {
    const result = parseProjectsSection(["A project with no dates listed"]);
    expect(result.entries).toEqual([]);
    expect(result.leftoverLines).toEqual(["A project with no dates listed"]);
  });
});
