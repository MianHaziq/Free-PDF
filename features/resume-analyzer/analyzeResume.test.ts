import { describe, expect, it } from "vitest";

import { analyzeResume } from "@/features/resume-analyzer/analyzeResume";
import type { SourceResume } from "@/types/resume";

function makeResume(overrides: Partial<SourceResume> = {}): SourceResume {
  return {
    id: "1",
    label: "Test Resume",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sourceFormat: "json",
    contact: {
      fullName: "Jane Doe",
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    unclassifiedBlocks: [],
    ...overrides,
  };
}

describe("analyzeResume", () => {
  it("returns explicit skills as-authored", () => {
    const resume = makeResume({
      skills: [
        { name: "React", category: "Frontend", confidence: "high" },
        { name: "Node.js", category: "Backend", confidence: "high" },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.skills).toEqual(["React", "Node.js"]);
    expect(analysis.skillCount).toBe(2);
  });

  it("finds technologies mentioned in bullets that aren't in the skills list", () => {
    const resume = makeResume({
      skills: [{ name: "React", category: null, confidence: "high" }],
      experience: [
        {
          id: "e1",
          company: "Acme",
          role: "Engineer",
          startDate: "2022-01",
          endDate: "2022-12",
          bullets: ["Built a service using Docker and PostgreSQL."],
          relevanceTags: [],
        },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.technologies).toEqual(["Docker", "PostgreSQL"]);
  });

  it("scans project descriptions, names, and technologies too", () => {
    const resume = makeResume({
      projects: [
        {
          id: "p1",
          name: "Kubernetes Dashboard",
          description: "A dashboard built with GraphQL.",
          technologies: ["Redis"],
          bullets: [],
          relevanceTags: [],
        },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.technologies).toEqual(expect.arrayContaining(["Kubernetes", "GraphQL", "Redis"]));
  });

  it("keywords is the deduplicated union of skills and technologies", () => {
    const resume = makeResume({
      skills: [{ name: "React", category: null, confidence: "high" }],
      experience: [
        {
          id: "e1",
          company: "Acme",
          role: "Engineer",
          startDate: "2022-01",
          endDate: "2022-12",
          bullets: ["Used React and Docker."],
          relevanceTags: [],
        },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.keywords).toEqual(["React", "Docker"]);
  });

  it("returns certification names and counts", () => {
    const resume = makeResume({
      certifications: [{ name: "AWS Certified Developer", issuer: null, date: null }],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.certifications).toEqual(["AWS Certified Developer"]);
    expect(analysis.certificationCount).toBe(1);
  });

  it("computes total years of experience across roles", () => {
    const resume = makeResume({
      experience: [
        {
          id: "e1",
          company: "Acme",
          role: "Engineer",
          startDate: "2020-01",
          endDate: "2021-12",
          bullets: [],
          relevanceTags: [],
        },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.totalYearsOfExperience).toBe(2);
  });

  it("counts roles and projects", () => {
    const resume = makeResume({
      experience: [
        {
          id: "e1",
          company: "Acme",
          role: "Engineer",
          startDate: "2020-01",
          endDate: "2021-12",
          bullets: [],
          relevanceTags: [],
        },
      ],
      projects: [
        {
          id: "p1",
          name: "Project A",
          description: "",
          technologies: [],
          bullets: [],
          relevanceTags: [],
        },
      ],
    });
    const analysis = analyzeResume(resume);
    expect(analysis.roleCount).toBe(1);
    expect(analysis.projectCount).toBe(1);
  });

  it("handles a completely blank resume without throwing", () => {
    const analysis = analyzeResume(makeResume());
    expect(analysis).toEqual({
      skills: [],
      technologies: [],
      keywords: [],
      certifications: [],
      totalYearsOfExperience: 0,
      roleCount: 0,
      projectCount: 0,
      skillCount: 0,
      certificationCount: 0,
    });
  });
});
