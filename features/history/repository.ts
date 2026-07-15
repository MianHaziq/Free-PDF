import { v4 as uuidv4 } from "uuid";

import {
  ATS_REPORTS_STORE,
  JOB_DESCRIPTIONS_STORE,
  SOURCE_RESUMES_STORE,
  TAILORED_RESUMES_STORE,
  deleteRecord,
  getAllRecords,
  getRecordsByIndex,
  putRecord,
} from "@/lib/storage/db";
import {
  validateTailoredResumeReferences,
  type TailoredResumeReferenceError,
} from "@/lib/validation/tailoredResume.schema";
import type { AtsReport } from "@/types/ats-report";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";
import type { TailoredResume, TailoredResumeContent } from "@/types/tailored-resume";

export type DeleteResult = { deleted: true } | { deleted: false; dependentCount: number };

/**
 * The docs/DATA_MODEL.md-persisted history layer (Phase 13): real
 * SourceResume/JobDescription/TailoredResume/AtsReport records in
 * IndexedDB, with the foreign-key relationships that make "which
 * tailored resume came from which source resume, for which job?"
 * answerable. Unlike the auto-saved single-draft stores (resume-editor,
 * job-description), records here are only created when the user
 * explicitly chooses to save to history — this is the multi-entity
 * archive, not the live working draft.
 */

export async function listSourceResumes(): Promise<SourceResume[]> {
  return getAllRecords(SOURCE_RESUMES_STORE);
}

export async function saveSourceResume(resume: SourceResume): Promise<void> {
  await putRecord(SOURCE_RESUMES_STORE, resume);
}

export async function deleteTailoredResume(id: string): Promise<void> {
  const reports = await getRecordsByIndex(ATS_REPORTS_STORE, "tailoredResumeId", id);
  for (const report of reports) {
    await deleteRecord(ATS_REPORTS_STORE, report.id);
  }
  await deleteRecord(TAILORED_RESUMES_STORE, id);
}

export async function deleteSourceResume(
  id: string,
  options: { cascade?: boolean } = {},
): Promise<DeleteResult> {
  const dependents = await getRecordsByIndex(TAILORED_RESUMES_STORE, "sourceResumeId", id);
  if (dependents.length > 0 && !options.cascade) {
    return { deleted: false, dependentCount: dependents.length };
  }
  for (const dependent of dependents) {
    await deleteTailoredResume(dependent.id);
  }
  await deleteRecord(SOURCE_RESUMES_STORE, id);
  return { deleted: true };
}

export async function listJobDescriptions(): Promise<JobDescription[]> {
  return getAllRecords(JOB_DESCRIPTIONS_STORE);
}

export async function saveJobDescription(jobDescription: JobDescription): Promise<void> {
  await putRecord(JOB_DESCRIPTIONS_STORE, jobDescription);
}

export async function deleteJobDescription(
  id: string,
  options: { cascade?: boolean } = {},
): Promise<DeleteResult> {
  const dependents = await getRecordsByIndex(TAILORED_RESUMES_STORE, "jobDescriptionId", id);
  if (dependents.length > 0 && !options.cascade) {
    return { deleted: false, dependentCount: dependents.length };
  }
  for (const dependent of dependents) {
    await deleteTailoredResume(dependent.id);
  }
  await deleteRecord(JOB_DESCRIPTIONS_STORE, id);
  return { deleted: true };
}

export async function listTailoredResumes(): Promise<TailoredResume[]> {
  return getAllRecords(TAILORED_RESUMES_STORE);
}

export async function listAtsReports(): Promise<AtsReport[]> {
  return getAllRecords(ATS_REPORTS_STORE);
}

export interface AtsReportContentInput {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface SaveTailoredResumeInput {
  sourceResumeId: string;
  jobDescriptionId: string;
  content: TailoredResumeContent;
  report: AtsReportContentInput;
}

export type SaveTailoredResumeResult =
  | { success: true; tailoredResume: TailoredResume; atsReport: AtsReport }
  | { success: false; errors: TailoredResumeReferenceError[] };

/**
 * Creates a linked TailoredResume + AtsReport pair. Rejects orphaned
 * references (docs/DATA_MODEL.md: "reject orphaned TailoredResumes") by
 * checking against records actually persisted in history, not just the
 * live editor drafts — the caller is expected to have already saved the
 * source resume and job description it's tailoring from.
 */
export async function saveTailoredResumeWithReport(
  input: SaveTailoredResumeInput,
): Promise<SaveTailoredResumeResult> {
  const [sourceResumes, jobDescriptions] = await Promise.all([
    listSourceResumes(),
    listJobDescriptions(),
  ]);

  const referenceResult = validateTailoredResumeReferences(
    { sourceResumeId: input.sourceResumeId, jobDescriptionId: input.jobDescriptionId },
    sourceResumes.map((resume) => resume.id),
    jobDescriptions.map((jobDescription) => jobDescription.id),
  );

  if (!referenceResult.valid) {
    return { success: false, errors: referenceResult.errors };
  }

  const now = new Date().toISOString();
  const tailoredResumeId = uuidv4();
  const atsReportId = uuidv4();

  const tailoredResume: TailoredResume = {
    id: tailoredResumeId,
    sourceResumeId: input.sourceResumeId,
    jobDescriptionId: input.jobDescriptionId,
    createdAt: now,
    generationMethod: "rule-based",
    content: input.content,
    atsReportId,
  };
  const atsReport: AtsReport = {
    id: atsReportId,
    tailoredResumeId,
    createdAt: now,
    score: input.report.score,
    matchedKeywords: input.report.matchedKeywords,
    missingKeywords: input.report.missingKeywords,
    strengths: input.report.strengths,
    weaknesses: input.report.weaknesses,
    suggestions: input.report.suggestions,
  };

  await putRecord(TAILORED_RESUMES_STORE, tailoredResume);
  await putRecord(ATS_REPORTS_STORE, atsReport);

  return { success: true, tailoredResume, atsReport };
}
