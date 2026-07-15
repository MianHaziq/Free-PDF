import { create } from "zustand";

import * as repository from "@/features/history/repository";
import type { AtsReport } from "@/types/ats-report";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";
import type { TailoredResume } from "@/types/tailored-resume";

interface HistoryState {
  isLoaded: boolean;
  sourceResumes: SourceResume[];
  jobDescriptions: JobDescription[];
  tailoredResumes: TailoredResume[];
  atsReports: AtsReport[];

  refresh: () => Promise<void>;
  saveSourceResume: (resume: SourceResume) => Promise<void>;
  saveJobDescription: (jobDescription: JobDescription) => Promise<void>;
  saveTailoredResumeWithReport: (
    input: repository.SaveTailoredResumeInput,
  ) => Promise<repository.SaveTailoredResumeResult>;
  deleteSourceResume: (id: string, cascade?: boolean) => Promise<repository.DeleteResult>;
  deleteJobDescription: (id: string, cascade?: boolean) => Promise<repository.DeleteResult>;
  deleteTailoredResume: (id: string) => Promise<void>;
}

/**
 * A live read cache over the Phase 13 IndexedDB history layer
 * (features/history/repository.ts). Unlike the resume-editor/
 * job-description stores, this isn't itself persisted via Zustand's
 * `persist` middleware — IndexedDB is already the source of truth, so
 * every mutating action simply writes through the repository and then
 * re-reads all four lists, keeping components trivially consistent
 * without hand-rolled optimistic-update bookkeeping.
 */
export const useHistoryStore = create<HistoryState>((set, get) => ({
  isLoaded: false,
  sourceResumes: [],
  jobDescriptions: [],
  tailoredResumes: [],
  atsReports: [],

  refresh: async () => {
    const [sourceResumes, jobDescriptions, tailoredResumes, atsReports] = await Promise.all([
      repository.listSourceResumes(),
      repository.listJobDescriptions(),
      repository.listTailoredResumes(),
      repository.listAtsReports(),
    ]);
    set({ sourceResumes, jobDescriptions, tailoredResumes, atsReports, isLoaded: true });
  },

  saveSourceResume: async (resume) => {
    await repository.saveSourceResume(resume);
    await get().refresh();
  },

  saveJobDescription: async (jobDescription) => {
    await repository.saveJobDescription(jobDescription);
    await get().refresh();
  },

  saveTailoredResumeWithReport: async (input) => {
    const result = await repository.saveTailoredResumeWithReport(input);
    if (result.success) await get().refresh();
    return result;
  },

  deleteSourceResume: async (id, cascade) => {
    const result = await repository.deleteSourceResume(id, { cascade });
    if (result.deleted) await get().refresh();
    return result;
  },

  deleteJobDescription: async (id, cascade) => {
    const result = await repository.deleteJobDescription(id, { cascade });
    if (result.deleted) await get().refresh();
    return result;
  },

  deleteTailoredResume: async (id) => {
    await repository.deleteTailoredResume(id);
    await get().refresh();
  },
}));
