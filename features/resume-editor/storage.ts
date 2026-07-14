import { openDB, type IDBPDatabase } from "idb";
import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";

export type SaveStatus = "idle" | "pending" | "saved";

/** Tiny status store SaveStatusIndicator subscribes to; storage.ts is the only writer. */
export const useSaveStatusStore = create<{ status: SaveStatus }>(() => ({
  status: "idle",
}));

const DB_NAME = "resume-tailor";
const DB_VERSION = 1;
const STORE_NAME = "editor-draft";
const WRITE_DEBOUNCE_MS = 400;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function getLocalStorage(): Storage | null {
  return typeof localStorage !== "undefined" ? localStorage : null;
}

async function readItem(name: string): Promise<string | null> {
  if (isIndexedDbAvailable()) {
    try {
      const db = await getDb();
      const value = await db.get(STORE_NAME, name);
      return value ?? null;
    } catch {
      // fall through to localStorage
    }
  }
  return getLocalStorage()?.getItem(name) ?? null;
}

async function writeItem(name: string, value: string): Promise<void> {
  if (isIndexedDbAvailable()) {
    try {
      const db = await getDb();
      await db.put(STORE_NAME, value, name);
      return;
    } catch {
      // fall through to localStorage
    }
  }
  getLocalStorage()?.setItem(name, value);
}

async function deleteItem(name: string): Promise<void> {
  if (isIndexedDbAvailable()) {
    try {
      const db = await getDb();
      await db.delete(STORE_NAME, name);
      return;
    } catch {
      // fall through to localStorage
    }
  }
  getLocalStorage()?.removeItem(name);
}

const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

/** Debounces writes so rapid edits (e.g. per-keystroke) don't hammer storage. */
function scheduleWrite(name: string, value: string): void {
  const existing = pendingWrites.get(name);
  if (existing) clearTimeout(existing);

  useSaveStatusStore.setState({ status: "pending" });

  const timeout = setTimeout(() => {
    pendingWrites.delete(name);
    void writeItem(name, value).then(() => {
      if (pendingWrites.size === 0) {
        useSaveStatusStore.setState({ status: "saved" });
      }
    });
  }, WRITE_DEBOUNCE_MS);

  pendingWrites.set(name, timeout);
}

/**
 * IndexedDB-backed storage for Zustand's `persist` middleware, with an
 * automatic localStorage fallback (private-browsing / IndexedDB errors).
 * See docs/TECH_STACK_AND_AI_ARCHITECTURE.md: "IndexedDB (preferred),
 * localStorage (fallback)".
 */
export const resumeDraftStorage: StateStorage = {
  getItem: (name) => readItem(name),
  setItem: (name, value) => {
    scheduleWrite(name, value);
  },
  removeItem: (name) => deleteItem(name),
};
