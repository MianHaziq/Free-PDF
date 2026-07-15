import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import * as repository from "@/features/history/repository";
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
      email: "jane@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "Backend engineer.",
    skills: [{ name: "React", category: null, confidence: "high" }],
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
    label: "Backend Engineer - Acme",
    createdAt: "2026-01-01T00:00:00.000Z",
    rawText: "We need a backend engineer with React experience.",
    title: "Backend Engineer",
    company: "Acme",
    requiredSkills: ["React"],
    preferredSkills: [],
    experienceLevel: null,
    keywords: ["React"],
    ...overrides,
  };
}

const REPORT = {
  score: 80,
  matchedKeywords: ["React"],
  missingKeywords: [],
  strengths: ["Matches required skills: React."],
  weaknesses: [],
  suggestions: [],
};

const CONTENT = {
  contact: buildSourceResume().contact,
  summary: "Tailored summary.",
  originalSummary: "Backend engineer.",
  skills: buildSourceResume().skills,
  experience: [],
  projects: [],
};

describe("history repository", () => {
  beforeEach(async () => {
    for (const resume of await repository.listSourceResumes()) {
      await repository.deleteSourceResume(resume.id, { cascade: true });
    }
    for (const jobDescription of await repository.listJobDescriptions()) {
      await repository.deleteJobDescription(jobDescription.id, { cascade: true });
    }
  });

  it("saves and lists a source resume", async () => {
    await repository.saveSourceResume(buildSourceResume());
    const resumes = await repository.listSourceResumes();
    expect(resumes).toHaveLength(1);
    expect(resumes[0]).toEqual(buildSourceResume());
  });

  it("upserts a source resume when saved again with the same id", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await repository.saveSourceResume(buildSourceResume({ label: "Updated Resume" }));
    const resumes = await repository.listSourceResumes();
    expect(resumes).toHaveLength(1);
    expect(resumes[0].label).toBe("Updated Resume");
  });

  it("saves and lists a job description", async () => {
    await repository.saveJobDescription(buildJobDescription());
    const jobDescriptions = await repository.listJobDescriptions();
    expect(jobDescriptions).toHaveLength(1);
    expect(jobDescriptions[0]).toEqual(buildJobDescription());
  });

  it("rejects a tailored resume that references a non-existent source resume or job description", async () => {
    const result = await repository.saveTailoredResumeWithReport({
      sourceResumeId: "missing-resume",
      jobDescriptionId: "missing-jd",
      content: CONTENT,
      report: REPORT,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toEqual(
        expect.arrayContaining(["orphaned-source-resume", "orphaned-job-description"]),
      );
    }
  });

  it("saves a linked tailored resume + ATS report when references exist", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await repository.saveJobDescription(buildJobDescription());

    const result = await repository.saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: CONTENT,
      report: REPORT,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.tailoredResume.sourceResumeId).toBe("resume-1");
    expect(result.tailoredResume.jobDescriptionId).toBe("jd-1");
    expect(result.tailoredResume.atsReportId).toBe(result.atsReport.id);
    expect(result.atsReport.tailoredResumeId).toBe(result.tailoredResume.id);
    expect(result.atsReport.score).toBe(80);

    const tailoredResumes = await repository.listTailoredResumes();
    const atsReports = await repository.listAtsReports();
    expect(tailoredResumes).toHaveLength(1);
    expect(atsReports).toHaveLength(1);
  });

  it("blocks deleting a source resume with dependent tailored resumes unless cascade is requested", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await repository.saveJobDescription(buildJobDescription());
    await repository.saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: CONTENT,
      report: REPORT,
    });

    const blocked = await repository.deleteSourceResume("resume-1");
    expect(blocked).toEqual({ deleted: false, dependentCount: 1 });
    expect(await repository.listSourceResumes()).toHaveLength(1);

    const cascaded = await repository.deleteSourceResume("resume-1", { cascade: true });
    expect(cascaded).toEqual({ deleted: true });
    expect(await repository.listSourceResumes()).toHaveLength(0);
    expect(await repository.listTailoredResumes()).toHaveLength(0);
    expect(await repository.listAtsReports()).toHaveLength(0);
  });

  it("blocks deleting a job description with dependent tailored resumes unless cascade is requested", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await repository.saveJobDescription(buildJobDescription());
    await repository.saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: CONTENT,
      report: REPORT,
    });

    const blocked = await repository.deleteJobDescription("jd-1");
    expect(blocked).toEqual({ deleted: false, dependentCount: 1 });

    const cascaded = await repository.deleteJobDescription("jd-1", { cascade: true });
    expect(cascaded).toEqual({ deleted: true });
    expect(await repository.listTailoredResumes()).toHaveLength(0);
  });

  it("deleting a tailored resume cascades to its ATS report but leaves the source resume and job description intact", async () => {
    await repository.saveSourceResume(buildSourceResume());
    await repository.saveJobDescription(buildJobDescription());
    const result = await repository.saveTailoredResumeWithReport({
      sourceResumeId: "resume-1",
      jobDescriptionId: "jd-1",
      content: CONTENT,
      report: REPORT,
    });
    if (!result.success) throw new Error("expected save to succeed");

    await repository.deleteTailoredResume(result.tailoredResume.id);

    expect(await repository.listTailoredResumes()).toHaveLength(0);
    expect(await repository.listAtsReports()).toHaveLength(0);
    expect(await repository.listSourceResumes()).toHaveLength(1);
    expect(await repository.listJobDescriptions()).toHaveLength(1);
  });
});
