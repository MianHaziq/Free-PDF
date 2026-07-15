import { arrayMove } from "@dnd-kit/sortable";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createBlankCertification,
  createBlankEducation,
  createBlankExperience,
  createBlankProject,
  createBlankSkill,
  createBlankSourceResume,
} from "@/features/resume-editor/blankResume";
import { toEditableEntry, type EditableEntry } from "@/features/resume-editor/types";
import type { ResumeParseResult } from "@/features/resume-import/types";
import { draftStorage } from "@/lib/storage/keyValueStorage";
import type {
  CertificationEntry,
  ContactInfo,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillEntry,
  SourceResume,
} from "@/types/resume";

interface ResumeEditorDraft {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
  sourceFormat: SourceResume["sourceFormat"];
  contact: ContactInfo;
  summary: string;
  skills: EditableEntry<SkillEntry>[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EditableEntry<EducationEntry>[];
  certifications: EditableEntry<CertificationEntry>[];
  unclassifiedBlocks: SourceResume["unclassifiedBlocks"];
}

function draftFromSourceResume(resume: SourceResume): ResumeEditorDraft {
  return {
    id: resume.id,
    label: resume.label,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    sourceFormat: resume.sourceFormat,
    contact: resume.contact,
    summary: resume.summary,
    skills: resume.skills.map(toEditableEntry),
    experience: resume.experience,
    projects: resume.projects,
    education: resume.education.map(toEditableEntry),
    certifications: resume.certifications.map(toEditableEntry),
    unclassifiedBlocks: resume.unclassifiedBlocks,
  };
}

interface ResumeEditorActions {
  loadFromParseResult: (result: ResumeParseResult, label?: string) => void;
  loadFromSourceResume: (resume: SourceResume) => void;
  resetToBlank: () => void;

  setContact: (contact: ContactInfo) => void;
  setSummary: (summary: string) => void;

  addSkill: () => void;
  updateSkill: (entryId: string, data: SkillEntry) => void;
  removeSkill: (entryId: string) => void;
  reorderSkills: (fromIndex: number, toIndex: number) => void;

  addExperience: () => void;
  updateExperience: (id: string, data: Omit<ExperienceEntry, "id">) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (fromIndex: number, toIndex: number) => void;

  addProject: () => void;
  updateProject: (id: string, data: Omit<ProjectEntry, "id">) => void;
  removeProject: (id: string) => void;
  reorderProjects: (fromIndex: number, toIndex: number) => void;

  addEducation: () => void;
  updateEducation: (entryId: string, data: EducationEntry) => void;
  removeEducation: (entryId: string) => void;
  reorderEducation: (fromIndex: number, toIndex: number) => void;

  addCertification: () => void;
  updateCertification: (entryId: string, data: CertificationEntry) => void;
  removeCertification: (entryId: string) => void;
  reorderCertifications: (fromIndex: number, toIndex: number) => void;

  dismissUnclassifiedBlock: (index: number) => void;

  toSourceResume: () => SourceResume;
}

export type ResumeEditorState = ResumeEditorDraft & ResumeEditorActions;

export const useResumeEditorStore = create<ResumeEditorState>()(
  persist(
    (set, get) => ({
      ...draftFromSourceResume(createBlankSourceResume()),

      loadFromParseResult: (result, label = "Untitled Resume") => {
        const now = new Date().toISOString();
        set({
          ...draftFromSourceResume({
            id: uuidv4(),
            label,
            createdAt: now,
            updatedAt: now,
            sourceFormat: result.sourceFormat,
            contact: result.contact.value,
            summary: result.summary.value,
            skills: result.skills,
            experience: result.experience,
            projects: result.projects,
            education: result.education,
            certifications: result.certifications,
            unclassifiedBlocks: result.unclassifiedBlocks,
          }),
        });
      },

      loadFromSourceResume: (resume) => {
        set(draftFromSourceResume(resume));
      },

      resetToBlank: () => {
        set(draftFromSourceResume(createBlankSourceResume()));
      },

      setContact: (contact) => set({ contact, updatedAt: new Date().toISOString() }),
      setSummary: (summary) => set({ summary, updatedAt: new Date().toISOString() }),

      addSkill: () =>
        set((state) => ({
          skills: [...state.skills, toEditableEntry(createBlankSkill())],
        })),
      updateSkill: (entryId, data) =>
        set((state) => ({
          skills: state.skills.map((entry) =>
            entry.entryId === entryId ? { ...entry, data } : entry,
          ),
        })),
      removeSkill: (entryId) =>
        set((state) => ({
          skills: state.skills.filter((entry) => entry.entryId !== entryId),
        })),
      reorderSkills: (fromIndex, toIndex) =>
        set((state) => ({ skills: arrayMove(state.skills, fromIndex, toIndex) })),

      addExperience: () =>
        set((state) => ({ experience: [...state.experience, createBlankExperience()] })),
      updateExperience: (id, data) =>
        set((state) => ({
          experience: state.experience.map((entry) =>
            entry.id === id ? { ...data, id } : entry,
          ),
        })),
      removeExperience: (id) =>
        set((state) => ({
          experience: state.experience.filter((entry) => entry.id !== id),
        })),
      reorderExperience: (fromIndex, toIndex) =>
        set((state) => ({ experience: arrayMove(state.experience, fromIndex, toIndex) })),

      addProject: () => set((state) => ({ projects: [...state.projects, createBlankProject()] })),
      updateProject: (id, data) =>
        set((state) => ({
          projects: state.projects.map((entry) => (entry.id === id ? { ...data, id } : entry)),
        })),
      removeProject: (id) =>
        set((state) => ({ projects: state.projects.filter((entry) => entry.id !== id) })),
      reorderProjects: (fromIndex, toIndex) =>
        set((state) => ({ projects: arrayMove(state.projects, fromIndex, toIndex) })),

      addEducation: () =>
        set((state) => ({
          education: [...state.education, toEditableEntry(createBlankEducation())],
        })),
      updateEducation: (entryId, data) =>
        set((state) => ({
          education: state.education.map((entry) =>
            entry.entryId === entryId ? { ...entry, data } : entry,
          ),
        })),
      removeEducation: (entryId) =>
        set((state) => ({
          education: state.education.filter((entry) => entry.entryId !== entryId),
        })),
      reorderEducation: (fromIndex, toIndex) =>
        set((state) => ({ education: arrayMove(state.education, fromIndex, toIndex) })),

      addCertification: () =>
        set((state) => ({
          certifications: [
            ...state.certifications,
            toEditableEntry(createBlankCertification()),
          ],
        })),
      updateCertification: (entryId, data) =>
        set((state) => ({
          certifications: state.certifications.map((entry) =>
            entry.entryId === entryId ? { ...entry, data } : entry,
          ),
        })),
      removeCertification: (entryId) =>
        set((state) => ({
          certifications: state.certifications.filter((entry) => entry.entryId !== entryId),
        })),
      reorderCertifications: (fromIndex, toIndex) =>
        set((state) => ({
          certifications: arrayMove(state.certifications, fromIndex, toIndex),
        })),

      dismissUnclassifiedBlock: (index) =>
        set((state) => ({
          unclassifiedBlocks: state.unclassifiedBlocks.filter((_, i) => i !== index),
        })),

      toSourceResume: () => {
        const state = get();
        return {
          id: state.id,
          label: state.label,
          createdAt: state.createdAt,
          updatedAt: state.updatedAt,
          sourceFormat: state.sourceFormat,
          contact: state.contact,
          summary: state.summary,
          skills: state.skills.map((entry) => entry.data),
          experience: state.experience,
          projects: state.projects,
          education: state.education.map((entry) => entry.data),
          certifications: state.certifications.map((entry) => entry.data),
          unclassifiedBlocks: state.unclassifiedBlocks,
        };
      },
    }),
    {
      name: "resume-tailor:editor-draft",
      storage: createJSONStorage(() => draftStorage),
    },
  ),
);
