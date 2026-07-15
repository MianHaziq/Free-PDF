import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createBlankJobDescription, createJobDescriptionFromText } from "@/features/job-description/blankJobDescription";
import { draftStorage } from "@/lib/storage/keyValueStorage";
import type { JobDescription } from "@/types/job-description";

interface JobDescriptionDraft {
  id: string;
  label: string;
  createdAt: string;
  rawText: string;
  title: string;
  company: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string | null;
  keywords: string[];
}

interface JobDescriptionActions {
  loadFromText: (rawText: string, label?: string) => void;
  loadFromImport: (jobDescription: JobDescription) => void;
  resetToBlank: () => void;

  setTitle: (title: string) => void;
  setCompany: (company: string | null) => void;
  setExperienceLevel: (experienceLevel: string | null) => void;
  setRequiredSkills: (skills: string[]) => void;
  setPreferredSkills: (skills: string[]) => void;
  setKeywords: (keywords: string[]) => void;

  toJobDescription: () => JobDescription;
}

export type JobDescriptionEditorState = JobDescriptionDraft & JobDescriptionActions;

export const useJobDescriptionStore = create<JobDescriptionEditorState>()(
  persist(
    (set, get) => ({
      ...createBlankJobDescription(),

      loadFromText: (rawText, label) => {
        set(createJobDescriptionFromText(rawText, label));
      },

      loadFromImport: (jobDescription) => {
        set(jobDescription);
      },

      resetToBlank: () => {
        set(createBlankJobDescription());
      },

      setTitle: (title) => set({ title }),
      setCompany: (company) => set({ company }),
      setExperienceLevel: (experienceLevel) => set({ experienceLevel }),
      setRequiredSkills: (requiredSkills) => set({ requiredSkills }),
      setPreferredSkills: (preferredSkills) => set({ preferredSkills }),
      setKeywords: (keywords) => set({ keywords }),

      toJobDescription: () => {
        const state = get();
        return {
          id: state.id,
          label: state.label,
          createdAt: state.createdAt,
          rawText: state.rawText,
          title: state.title,
          company: state.company,
          requiredSkills: state.requiredSkills,
          preferredSkills: state.preferredSkills,
          experienceLevel: state.experienceLevel,
          keywords: state.keywords,
        };
      },
    }),
    {
      name: "resume-tailor:job-description-draft",
      storage: createJSONStorage(() => draftStorage),
    },
  ),
);
