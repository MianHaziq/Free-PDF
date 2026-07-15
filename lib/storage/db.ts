import { openDB, type DBSchema, type IDBPDatabase, type StoreNames } from "idb";

import type { AtsReport } from "@/types/ats-report";
import type { JobDescription } from "@/types/job-description";
import type { SourceResume } from "@/types/resume";
import type { TailoredResume } from "@/types/tailored-resume";

export const DB_NAME = "resume-tailor";
export const DB_VERSION = 2;

export const DRAFTS_STORE = "drafts";
export const SOURCE_RESUMES_STORE = "sourceResumes";
export const JOB_DESCRIPTIONS_STORE = "jobDescriptions";
export const TAILORED_RESUMES_STORE = "tailoredResumes";
export const ATS_REPORTS_STORE = "atsReports";

interface ResumeTailorDb extends DBSchema {
  [DRAFTS_STORE]: { key: string; value: string };
  [SOURCE_RESUMES_STORE]: { key: string; value: SourceResume };
  [JOB_DESCRIPTIONS_STORE]: { key: string; value: JobDescription };
  [TAILORED_RESUMES_STORE]: {
    key: string;
    value: TailoredResume;
    indexes: { sourceResumeId: string; jobDescriptionId: string };
  };
  [ATS_REPORTS_STORE]: {
    key: string;
    value: AtsReport;
    indexes: { tailoredResumeId: string };
  };
}

type StoreName = StoreNames<ResumeTailorDb>;

let dbPromise: Promise<IDBPDatabase<ResumeTailorDb>> | null = null;

/**
 * Single shared connection for the whole app's IndexedDB database — the
 * Phase 4/5 auto-saved drafts (`drafts` store, see keyValueStorage.ts)
 * and the Phase 13 persisted entity stores below live in one database,
 * so there's exactly one place that owns its version/upgrade lifecycle.
 */
export function getDb(): Promise<IDBPDatabase<ResumeTailorDb>> {
  if (!dbPromise) {
    dbPromise = openDB<ResumeTailorDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
          db.createObjectStore(DRAFTS_STORE);
        }
        if (!db.objectStoreNames.contains(SOURCE_RESUMES_STORE)) {
          db.createObjectStore(SOURCE_RESUMES_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(JOB_DESCRIPTIONS_STORE)) {
          db.createObjectStore(JOB_DESCRIPTIONS_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(TAILORED_RESUMES_STORE)) {
          const store = db.createObjectStore(TAILORED_RESUMES_STORE, { keyPath: "id" });
          store.createIndex("sourceResumeId", "sourceResumeId");
          store.createIndex("jobDescriptionId", "jobDescriptionId");
        }
        if (!db.objectStoreNames.contains(ATS_REPORTS_STORE)) {
          const store = db.createObjectStore(ATS_REPORTS_STORE, { keyPath: "id" });
          store.createIndex("tailoredResumeId", "tailoredResumeId");
        }
      },
    });
  }
  return dbPromise;
}

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

/** Only for tests: forces the next getDb() call to open a fresh connection. */
export function resetDbConnectionForTests(): void {
  dbPromise = null;
}

export async function getAllRecords<Name extends StoreName>(
  storeName: Name,
): Promise<ResumeTailorDb[Name]["value"][]> {
  const db = await getDb();
  return db.getAll(storeName);
}

export async function getRecord<Name extends StoreName>(
  storeName: Name,
  id: string,
): Promise<ResumeTailorDb[Name]["value"] | undefined> {
  const db = await getDb();
  return db.get(storeName, id);
}

export async function putRecord<Name extends StoreName>(
  storeName: Name,
  record: ResumeTailorDb[Name]["value"],
): Promise<void> {
  const db = await getDb();
  await db.put(storeName, record);
}

export async function deleteRecord<Name extends StoreName>(
  storeName: Name,
  id: string,
): Promise<void> {
  const db = await getDb();
  await db.delete(storeName, id);
}

export async function getRecordsByIndex<Name extends StoreName>(
  storeName: Name,
  indexName: string,
  value: string,
): Promise<ResumeTailorDb[Name]["value"][]> {
  const db = await getDb();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- idb's index typing needs a literal IndexNames<> union per store; a shared helper across 3 differently-indexed stores can't express that without duplicating this function per store.
  return (db as any).getAllFromIndex(storeName, indexName, value);
}
