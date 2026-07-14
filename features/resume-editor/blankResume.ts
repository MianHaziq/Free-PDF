import { v4 as uuidv4 } from "uuid";

import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillEntry,
  SourceResume,
} from "@/types/resume";

export function createBlankSkill(): SkillEntry {
  return { name: "", category: null, confidence: "high" };
}

export function createBlankExperience(): ExperienceEntry {
  return {
    id: uuidv4(),
    company: "",
    role: "",
    startDate: "",
    endDate: null,
    bullets: [],
    relevanceTags: [],
  };
}

export function createBlankProject(): ProjectEntry {
  return {
    id: uuidv4(),
    name: "",
    description: "",
    technologies: [],
    bullets: [],
    relevanceTags: [],
  };
}

export function createBlankEducation(): EducationEntry {
  return { institution: "", degree: "", field: null, startDate: null, endDate: null };
}

export function createBlankCertification(): CertificationEntry {
  return { name: "", issuer: null, date: null };
}

/** A fresh, empty resume draft for the "start blank" editor entry point. */
export function createBlankSourceResume(): SourceResume {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    label: "Untitled Resume",
    createdAt: now,
    updatedAt: now,
    sourceFormat: "json",
    contact: {
      fullName: "",
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
  };
}
