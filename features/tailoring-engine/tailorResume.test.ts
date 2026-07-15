import { describe, expect, it } from "vitest";

import { tailorResume } from "@/features/tailoring-engine/tailorResume";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";

function makeJobDescription(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "jd-1",
    label: "Test JD",
    createdAt: "2026-01-01T00:00:00.000Z",
    rawText: "",
    title: "Software Engineer",
    company: null,
    requiredSkills: [],
    preferredSkills: [],
    experienceLevel: null,
    keywords: [],
    ...overrides,
  };
}

/** A full-stack resume: frontend skills/experience, backend skills/experience, mixed projects. */
function makeFullStackResume(): SourceResume {
  return {
    id: "resume-1",
    label: "Test Resume",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sourceFormat: "json",
    contact: {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "A software engineer.",
    skills: [
      { name: "React", category: "Frontend", confidence: "high" },
      { name: "PostgreSQL", category: "Backend", confidence: "high" },
      { name: "Node.js", category: "Backend", confidence: "high" },
      { name: "CSS", category: "Frontend", confidence: "high" },
    ],
    experience: [
      {
        id: "exp-frontend",
        company: "Acme",
        role: "Frontend Engineer",
        startDate: "2020-01",
        endDate: "2021-01",
        bullets: ["Built UI components with React.", "Improved CSS styling."],
        relevanceTags: [],
      },
      {
        id: "exp-backend",
        company: "Widget Inc",
        role: "Backend Engineer",
        startDate: "2021-02",
        endDate: "2022-02",
        bullets: ["Built REST APIs with Node.js.", "Managed PostgreSQL databases."],
        relevanceTags: [],
      },
    ],
    projects: [
      {
        id: "proj-frontend",
        name: "Dashboard UI",
        description: "A React-based dashboard.",
        technologies: ["React", "CSS"],
        bullets: ["Built with React and CSS."],
        relevanceTags: [],
      },
      {
        id: "proj-backend",
        name: "API Service",
        description: "A Node.js REST API.",
        technologies: ["Node.js", "PostgreSQL"],
        bullets: ["Built REST endpoints with Node.js and PostgreSQL."],
        relevanceTags: [],
      },
    ],
    education: [],
    certifications: [{ name: "AWS Certified", issuer: null, date: null }],
    unclassifiedBlocks: [],
  };
}

describe("tailorResume — never invents anything", () => {
  it("never adds or removes skills — same set, only reordered", () => {
    const resume = makeFullStackResume();
    const jd = makeJobDescription({ requiredSkills: ["Node.js", "PostgreSQL"] });
    const tailored = tailorResume(resume, jd);

    const originalNames = new Set(resume.skills.map((s) => s.name));
    const tailoredNames = new Set(tailored.skills.map((s) => s.name));
    expect(tailoredNames).toEqual(originalNames);
    expect(tailored.skills).toHaveLength(resume.skills.length);
  });

  it("never adds, removes, or renames experience entries — only reorders them and their bullets", () => {
    const resume = makeFullStackResume();
    const jd = makeJobDescription({ requiredSkills: ["Node.js"] });
    const tailored = tailorResume(resume, jd);

    expect(tailored.experience).toHaveLength(resume.experience.length);
    for (const original of resume.experience) {
      const tailoredEntry = tailored.experience.find((e) => e.id === original.id);
      expect(tailoredEntry).toBeDefined();
      expect(tailoredEntry?.company).toBe(original.company);
      expect(tailoredEntry?.role).toBe(original.role);
      expect(tailoredEntry?.startDate).toBe(original.startDate);
      expect(tailoredEntry?.endDate).toBe(original.endDate);
      expect(new Set(tailoredEntry?.bullets)).toEqual(new Set(original.bullets));
    }
  });

  it("never adds, removes, or renames projects — only reorders them and their bullets", () => {
    const resume = makeFullStackResume();
    const jd = makeJobDescription({ requiredSkills: ["React"] });
    const tailored = tailorResume(resume, jd);

    expect(tailored.projects).toHaveLength(resume.projects.length);
    for (const original of resume.projects) {
      const tailoredEntry = tailored.projects.find((p) => p.id === original.id);
      expect(tailoredEntry?.name).toBe(original.name);
      expect(tailoredEntry?.description).toBe(original.description);
      expect(new Set(tailoredEntry?.technologies)).toEqual(new Set(original.technologies));
    }
  });

  it("always preserves the original summary verbatim alongside the generated one", () => {
    const resume = makeFullStackResume();
    const tailored = tailorResume(resume, makeJobDescription());
    expect(tailored.originalSummary).toBe(resume.summary);
  });

  it("preserves contact info unchanged", () => {
    const resume = makeFullStackResume();
    const tailored = tailorResume(resume, makeJobDescription());
    expect(tailored.contact).toEqual(resume.contact);
  });
});

describe("tailorResume — prioritization per job type", () => {
  it("prioritizes backend skills/experience/projects for a Backend job description", () => {
    const resume = makeFullStackResume();
    const backendJd = makeJobDescription({
      title: "Backend Engineer",
      requiredSkills: ["Node.js", "PostgreSQL"],
    });
    const tailored = tailorResume(resume, backendJd);

    expect(tailored.skills[0].name).toMatch(/Node\.js|PostgreSQL/);
    expect(tailored.experience[0].id).toBe("exp-backend");
    expect(tailored.projects[0].id).toBe("proj-backend");
  });

  it("prioritizes frontend skills/experience/projects for a Frontend job description", () => {
    const resume = makeFullStackResume();
    const frontendJd = makeJobDescription({
      title: "Frontend Engineer",
      requiredSkills: ["React", "CSS"],
    });
    const tailored = tailorResume(resume, frontendJd);

    expect(tailored.skills[0].name).toMatch(/React|CSS/);
    expect(tailored.experience[0].id).toBe("exp-frontend");
    expect(tailored.projects[0].id).toBe("proj-frontend");
  });

  it("leaves order unchanged for a Full Stack job description matching both equally", () => {
    const resume = makeFullStackResume();
    const fullStackJd = makeJobDescription({
      title: "Full Stack Engineer",
      requiredSkills: ["React", "Node.js"],
    });
    const tailored = tailorResume(resume, fullStackJd);

    // Both experience entries mention exactly one required skill each — tied score, stable order preserved.
    expect(tailored.experience.map((e) => e.id)).toEqual(["exp-frontend", "exp-backend"]);
  });

  it("reorders bullets within an entry toward the mentioned skill", () => {
    const resume = makeFullStackResume();
    const jd = makeJobDescription({ requiredSkills: ["PostgreSQL"] });
    const tailored = tailorResume(resume, jd);

    const backendEntry = tailored.experience.find((e) => e.id === "exp-backend");
    expect(backendEntry?.bullets[0]).toBe("Managed PostgreSQL databases.");
  });

  it("generates a summary grounded only in the resume's own matched skills", () => {
    const resume = makeFullStackResume();
    const jd = makeJobDescription({
      title: "Backend Engineer",
      requiredSkills: ["Node.js", "Kubernetes"],
    });
    const tailored = tailorResume(resume, jd);

    expect(tailored.summary).toContain("Node.js");
    expect(tailored.summary).not.toContain("Kubernetes");
  });
});
