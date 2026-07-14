import { v4 as uuidv4 } from "uuid";

/**
 * Wraps entry types that have no natural id in the DATA_MODEL schema
 * (SkillEntry, EducationEntry, CertificationEntry) with a client-only
 * stable id, needed for correct @dnd-kit drag-and-drop identity. Never
 * persisted to SourceResume — stripped back out at the store boundary.
 */
export interface EditableEntry<T> {
  entryId: string;
  data: T;
}

export function toEditableEntry<T>(data: T): EditableEntry<T> {
  return { entryId: uuidv4(), data };
}
