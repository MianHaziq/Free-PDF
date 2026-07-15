import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { draftStorage } from "@/lib/storage/keyValueStorage";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEBOUNCE_FLUSH_MS = 500;

describe("draftStorage (IndexedDB path)", () => {
  it("returns null for a key that was never written", async () => {
    const value = await draftStorage.getItem("missing-key");
    expect(value).toBeNull();
  });

  it("debounces setItem and persists the value to IndexedDB", async () => {
    draftStorage.setItem("draft", JSON.stringify({ hello: "world" }));

    // Not yet written — debounce hasn't elapsed.
    expect(await draftStorage.getItem("draft")).toBeNull();

    await wait(DEBOUNCE_FLUSH_MS);

    expect(await draftStorage.getItem("draft")).toBe(JSON.stringify({ hello: "world" }));
  });

  it("only writes the latest value when called rapidly for the same key", async () => {
    draftStorage.setItem("draft-2", "first");
    draftStorage.setItem("draft-2", "second");
    draftStorage.setItem("draft-2", "third");

    await wait(DEBOUNCE_FLUSH_MS);

    expect(await draftStorage.getItem("draft-2")).toBe("third");
  });

  it("removeItem deletes the stored value", async () => {
    draftStorage.setItem("draft-3", "value");
    await wait(DEBOUNCE_FLUSH_MS);
    expect(await draftStorage.getItem("draft-3")).toBe("value");

    await draftStorage.removeItem("draft-3");
    expect(await draftStorage.getItem("draft-3")).toBeNull();
  });

  it("keeps different keys independent (e.g. resume draft vs job description draft)", async () => {
    draftStorage.setItem("resume-draft", "resume-value");
    draftStorage.setItem("jd-draft", "jd-value");
    await wait(DEBOUNCE_FLUSH_MS);

    expect(await draftStorage.getItem("resume-draft")).toBe("resume-value");
    expect(await draftStorage.getItem("jd-draft")).toBe("jd-value");
  });
});

describe("draftStorage (localStorage fallback)", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", undefined);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("falls back to localStorage when IndexedDB is unavailable", async () => {
    draftStorage.setItem("draft", "fallback-value");
    await wait(DEBOUNCE_FLUSH_MS);

    expect(localStorage.getItem("draft")).toBe("fallback-value");
    expect(await draftStorage.getItem("draft")).toBe("fallback-value");
  });

  it("removeItem clears the localStorage fallback entry", async () => {
    localStorage.setItem("draft", "value");
    await draftStorage.removeItem("draft");
    expect(localStorage.getItem("draft")).toBeNull();
  });
});
