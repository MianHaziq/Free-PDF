import { beforeEach, describe, expect, it } from "vitest";

import { useResumeEditorStore } from "@/features/resume-editor/store";
import type { ResumeParseResult } from "@/features/resume-import/types";

beforeEach(() => {
  useResumeEditorStore.getState().resetToBlank();
});

describe("resume editor store", () => {
  it("starts from a blank resume", () => {
    const state = useResumeEditorStore.getState();
    expect(state.contact.fullName).toBe("");
    expect(state.skills).toEqual([]);
    expect(state.experience).toEqual([]);
  });

  it("loads a ResumeParseResult, wrapping id-less entries with a stable entryId", () => {
    const result: ResumeParseResult = {
      sourceFormat: "pdf",
      contact: {
        value: {
          fullName: "Jane Doe",
          email: "jane@example.com",
          phone: null,
          location: null,
          linkedin: null,
          github: null,
          website: null,
        },
        confidence: "high",
      },
      summary: { value: "Backend engineer.", confidence: "high" },
      skills: [{ name: "React", category: null, confidence: "high" }],
      experience: [],
      projects: [],
      education: [
        { institution: "State U", degree: "B.S.", field: null, startDate: null, endDate: null },
      ],
      certifications: [],
      unclassifiedBlocks: [],
      warnings: [],
    };

    useResumeEditorStore.getState().loadFromParseResult(result, "My Resume");
    const state = useResumeEditorStore.getState();

    expect(state.label).toBe("My Resume");
    expect(state.contact.fullName).toBe("Jane Doe");
    expect(state.skills).toHaveLength(1);
    expect(state.skills[0].data.name).toBe("React");
    expect(state.skills[0].entryId).toBeTruthy();
    expect(state.education[0].data.institution).toBe("State U");
  });

  it("loadFromSourceResume replaces the draft with a saved history record", () => {
    const resume = {
      id: "resume-1",
      label: "Saved Resume",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      sourceFormat: "json" as const,
      contact: {
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        location: null,
        linkedin: null,
        github: null,
        website: null,
      },
      summary: "Backend engineer.",
      skills: [{ name: "React", category: null, confidence: "high" as const }],
      experience: [],
      projects: [],
      education: [],
      certifications: [],
      unclassifiedBlocks: [],
    };

    useResumeEditorStore.getState().loadFromSourceResume(resume);
    const state = useResumeEditorStore.getState();

    expect(state.id).toBe("resume-1");
    expect(state.label).toBe("Saved Resume");
    expect(state.contact.fullName).toBe("Jane Doe");
    expect(state.skills[0].data.name).toBe("React");
    expect(state.toSourceResume()).toEqual(resume);
  });

  it("setContact and setSummary update the draft", () => {
    const contact = {
      fullName: "Jane Doe",
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    };
    useResumeEditorStore.getState().setContact(contact);
    useResumeEditorStore.getState().setSummary("A summary.");

    expect(useResumeEditorStore.getState().contact).toEqual(contact);
    expect(useResumeEditorStore.getState().summary).toBe("A summary.");
  });

  it("adds, updates, removes, and reorders skills by entryId", () => {
    const store = useResumeEditorStore.getState();
    store.addSkill();
    store.addSkill();
    expect(useResumeEditorStore.getState().skills).toHaveLength(2);

    const [first, second] = useResumeEditorStore.getState().skills;
    store.updateSkill(first.entryId, { name: "React", category: null, confidence: "high" });
    expect(useResumeEditorStore.getState().skills[0].data.name).toBe("React");

    store.reorderSkills(0, 1);
    const reordered = useResumeEditorStore.getState().skills;
    expect(reordered[0].entryId).toBe(second.entryId);
    expect(reordered[1].entryId).toBe(first.entryId);

    store.removeSkill(second.entryId);
    expect(useResumeEditorStore.getState().skills).toHaveLength(1);
    expect(useResumeEditorStore.getState().skills[0].entryId).toBe(first.entryId);
  });

  it("adds, updates, removes, and reorders experience entries by id", () => {
    const store = useResumeEditorStore.getState();
    store.addExperience();
    store.addExperience();
    const [first, second] = useResumeEditorStore.getState().experience;

    store.updateExperience(first.id, { ...first, company: "Acme" });
    expect(useResumeEditorStore.getState().experience[0].company).toBe("Acme");

    store.reorderExperience(0, 1);
    expect(useResumeEditorStore.getState().experience[0].id).toBe(second.id);

    store.removeExperience(second.id);
    expect(useResumeEditorStore.getState().experience).toHaveLength(1);
    expect(useResumeEditorStore.getState().experience[0].id).toBe(first.id);
  });

  it("adds, updates, removes, and reorders project entries by id", () => {
    const store = useResumeEditorStore.getState();
    store.addProject();
    store.addProject();
    const [first, second] = useResumeEditorStore.getState().projects;

    store.updateProject(first.id, { ...first, name: "My Project" });
    expect(useResumeEditorStore.getState().projects[0].name).toBe("My Project");

    store.reorderProjects(0, 1);
    expect(useResumeEditorStore.getState().projects[0].id).toBe(second.id);

    store.removeProject(second.id);
    expect(useResumeEditorStore.getState().projects).toHaveLength(1);
  });

  it("adds, updates, removes, and reorders education entries by entryId", () => {
    const store = useResumeEditorStore.getState();
    store.addEducation();
    store.addEducation();
    const [first, second] = useResumeEditorStore.getState().education;

    store.updateEducation(first.entryId, {
      institution: "MIT",
      degree: "B.S.",
      field: null,
      startDate: null,
      endDate: null,
    });
    expect(useResumeEditorStore.getState().education[0].data.institution).toBe("MIT");

    store.reorderEducation(0, 1);
    expect(useResumeEditorStore.getState().education[0].entryId).toBe(second.entryId);

    store.removeEducation(second.entryId);
    expect(useResumeEditorStore.getState().education).toHaveLength(1);
  });

  it("adds, updates, removes, and reorders certification entries by entryId", () => {
    const store = useResumeEditorStore.getState();
    store.addCertification();
    store.addCertification();
    const [first, second] = useResumeEditorStore.getState().certifications;

    store.updateCertification(first.entryId, { name: "AWS", issuer: null, date: null });
    expect(useResumeEditorStore.getState().certifications[0].data.name).toBe("AWS");

    store.reorderCertifications(0, 1);
    expect(useResumeEditorStore.getState().certifications[0].entryId).toBe(second.entryId);

    store.removeCertification(second.entryId);
    expect(useResumeEditorStore.getState().certifications).toHaveLength(1);
  });

  it("dismisses an unclassified block by index", () => {
    useResumeEditorStore.setState({
      unclassifiedBlocks: [
        { rawText: "block one", suggestedSection: null, confidence: "low" },
        { rawText: "block two", suggestedSection: null, confidence: "low" },
      ],
    });

    useResumeEditorStore.getState().dismissUnclassifiedBlock(0);
    const remaining = useResumeEditorStore.getState().unclassifiedBlocks;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].rawText).toBe("block two");
  });

  it("toSourceResume strips synthetic entryIds back out to a plain SourceResume", () => {
    const store = useResumeEditorStore.getState();
    store.addSkill();
    store.addEducation();
    store.addCertification();

    const resume = store.toSourceResume();
    expect(resume.skills[0]).toEqual({ name: "", category: null, confidence: "high" });
    expect(resume.education[0]).not.toHaveProperty("entryId");
    expect(resume.certifications[0]).not.toHaveProperty("entryId");
  });
});
