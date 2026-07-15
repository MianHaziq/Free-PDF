import { beforeEach, describe, expect, it } from "vitest";

import { useJobDescriptionStore } from "@/features/job-description/store";

beforeEach(() => {
  useJobDescriptionStore.getState().resetToBlank();
});

describe("job description store", () => {
  it("starts from a blank job description", () => {
    const state = useJobDescriptionStore.getState();
    expect(state.title).toBe("");
    expect(state.requiredSkills).toEqual([]);
  });

  it("loads from pasted text via the extraction heuristics", () => {
    useJobDescriptionStore
      .getState()
      .loadFromText("Backend Engineer\nAcme Corp · Remote\n\nUses React and Docker.", "Pasted JD");

    const state = useJobDescriptionStore.getState();
    expect(state.title).toBe("Backend Engineer");
    expect(state.company).toBe("Acme Corp");
    expect(state.keywords).toEqual(["React", "Docker"]);
    expect(state.label).toBe("Pasted JD");
  });

  it("loads a fully-formed JobDescription from an import result", () => {
    useJobDescriptionStore.getState().loadFromImport({
      id: "11111111-1111-4111-8111-111111111111",
      label: "job.pdf",
      createdAt: "2026-01-01T00:00:00.000Z",
      rawText: "raw text",
      title: "Full Stack Engineer",
      company: "Widget Inc",
      requiredSkills: ["React"],
      preferredSkills: ["GraphQL"],
      experienceLevel: "Mid",
      keywords: ["React", "GraphQL"],
    });

    const state = useJobDescriptionStore.getState();
    expect(state.title).toBe("Full Stack Engineer");
    expect(state.requiredSkills).toEqual(["React"]);
  });

  it("setters update individual fields", () => {
    const store = useJobDescriptionStore.getState();
    store.setTitle("Engineer");
    store.setCompany("Acme");
    store.setExperienceLevel("Senior");
    store.setRequiredSkills(["React", "Node.js"]);
    store.setPreferredSkills(["GraphQL"]);
    store.setKeywords(["React", "Node.js", "GraphQL"]);

    const state = useJobDescriptionStore.getState();
    expect(state.title).toBe("Engineer");
    expect(state.company).toBe("Acme");
    expect(state.experienceLevel).toBe("Senior");
    expect(state.requiredSkills).toEqual(["React", "Node.js"]);
    expect(state.preferredSkills).toEqual(["GraphQL"]);
    expect(state.keywords).toEqual(["React", "Node.js", "GraphQL"]);
  });

  it("toJobDescription returns a plain JobDescription matching the schema shape", () => {
    const store = useJobDescriptionStore.getState();
    store.setTitle("Engineer");
    const jd = store.toJobDescription();
    expect(jd.title).toBe("Engineer");
    expect(jd).not.toHaveProperty("loadFromText");
  });
});
