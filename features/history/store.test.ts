import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import * as repository from "@/features/history/repository";
import { useHistoryStore } from "@/features/history/store";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";

function buildSourceResume(overrides: Partial<SourceResume> = {}): SourceResume {
  return {
    id: "resume-1",
    label: "Main Resume",
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

function buildJobDescription(overrides: Partial<JobDescription> = {}): JobDescription {
  return {
    id: "jd-1",
    label: "Backend Engineer",
    createdAt: "2026-01-01T00:00:00.000Z",
    rawText: "Backend role.",
    title: "Backend Engineer",
    company: null,
    requiredSkills: [],
    preferredSkills: [],
    experienceLevel: null,
    keywords: [],
    ...overrides,
  };
}

describe("useHistoryStore", () => {
  beforeEach(async () => {
    for (const resume of await repository.listSourceResumes()) {
      await repository.deleteSourceResume(resume.id, { cascade: true });
    }
    for (const jobDescription of await repository.listJobDescriptions()) {
      await repository.deleteJobDescription(jobDescription.id, { cascade: true });
    }
    useHistoryStore.setState({
      isLoaded: false,
      sourceResumes: [],
      jobDescriptions: [],
      tailoredResumes: [],
      atsReports: [],
    });
  });

  it("starts empty and not loaded until refresh() is called", () => {
    const state = useHistoryStore.getState();
    expect(state.isLoaded).toBe(false);
    expect(state.sourceResumes).toEqual([]);
  });

  it("refresh() populates all four lists from IndexedDB", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await useHistoryStore.getState().refresh();

    const state = useHistoryStore.getState();
    expect(state.isLoaded).toBe(true);
    expect(state.sourceResumes).toHaveLength(1);
  });

  it("saveSourceResume writes through and refreshes the cache", async () => {
    await useHistoryStore.getState().saveSourceResume(buildSourceResume());
    expect(useHistoryStore.getState().sourceResumes).toHaveLength(1);
  });

  it("saveTailoredResumeWithReport links a resume + job description and refreshes the cache", async () => {
    await useHistoryStore.getState().saveSourceResume(buildSourceResume());
    await useHistoryStore.getState().saveJobDescription(buildJobDescription());

    const result = await useHistoryStore.getState().saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: {
        contact: buildSourceResume().contact,
        summary: "",
        originalSummary: "",
        skills: [],
        experience: [],
        projects: [],
      },
      report: {
        score: 50,
        matchedKeywords: [],
        missingKeywords: [],
        strengths: [],
        weaknesses: [],
        suggestions: [],
      },
    });

    expect(result.success).toBe(true);
    expect(useHistoryStore.getState().tailoredResumes).toHaveLength(1);
    expect(useHistoryStore.getState().atsReports).toHaveLength(1);
  });

  it("deleteSourceResume reports blocked dependents without mutating the cache, then cascades on request", async () => {
    await useHistoryStore.getState().saveSourceResume(buildSourceResume());
    await useHistoryStore.getState().saveJobDescription(buildJobDescription());
    await useHistoryStore.getState().saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: {
        contact: buildSourceResume().contact,
        summary: "",
        originalSummary: "",
        skills: [],
        experience: [],
        projects: [],
      },
      report: {
        score: 50,
        matchedKeywords: [],
        missingKeywords: [],
        strengths: [],
        weaknesses: [],
        suggestions: [],
      },
    });

    const blocked = await useHistoryStore.getState().deleteSourceResume("resume-1");
    expect(blocked).toEqual({ deleted: false, dependentCount: 1 });
    expect(useHistoryStore.getState().sourceResumes).toHaveLength(1);

    const cascaded = await useHistoryStore.getState().deleteSourceResume("resume-1", true);
    expect(cascaded).toEqual({ deleted: true });
    expect(useHistoryStore.getState().sourceResumes).toHaveLength(0);
    expect(useHistoryStore.getState().tailoredResumes).toHaveLength(0);
  });
});
