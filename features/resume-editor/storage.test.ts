import "fake-indexeddb/auto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resumeDraftStorage } from "@/features/resume-editor/storage";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEBOUNCE_FLUSH_MS = 500;

describe("resumeDraftStorage (IndexedDB path)", () => {
  it("returns null for a key that was never written", async () => {
    const value = await resumeDraftStorage.getItem("missing-key");
    expect(value).toBeNull();
  });

  it("debounces setItem and persists the value to IndexedDB", async () => {
    resumeDraftStorage.setItem("draft", JSON.stringify({ hello: "world" }));

    // Not yet written — debounce hasn't elapsed.
    expect(await resumeDraftStorage.getItem("draft")).toBeNull();

    await wait(DEBOUNCE_FLUSH_MS);

    expect(await resumeDraftStorage.getItem("draft")).toBe(
      JSON.stringify({ hello: "world" }),
    );
  });

  it("only writes the latest value when called rapidly for the same key", async () => {
    resumeDraftStorage.setItem("draft-2", "first");
    resumeDraftStorage.setItem("draft-2", "second");
    resumeDraftStorage.setItem("draft-2", "third");

    await wait(DEBOUNCE_FLUSH_MS);

    expect(await resumeDraftStorage.getItem("draft-2")).toBe("third");
  });

  it("removeItem deletes the stored value", async () => {
    resumeDraftStorage.setItem("draft-3", "value");
    await wait(DEBOUNCE_FLUSH_MS);
    expect(await resumeDraftStorage.getItem("draft-3")).toBe("value");

    await resumeDraftStorage.removeItem("draft-3");
    expect(await resumeDraftStorage.getItem("draft-3")).toBeNull();
  });
});

describe("resumeDraftStorage (localStorage fallback)", () => {
  beforeEach(() => {
    vi.stubGlobal("indexedDB", undefined);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("falls back to localStorage when IndexedDB is unavailable", async () => {
    resumeDraftStorage.setItem("draft", "fallback-value");
    await wait(DEBOUNCE_FLUSH_MS);

    expect(localStorage.getItem("draft")).toBe("fallback-value");
    expect(await resumeDraftStorage.getItem("draft")).toBe("fallback-value");
  });

  it("removeItem clears the localStorage fallback entry", async () => {
    localStorage.setItem("draft", "value");
    await resumeDraftStorage.removeItem("draft");
    expect(localStorage.getItem("draft")).toBeNull();
  });
});
