import { describe, expect, it } from "vitest";

import { dedupeCaseInsensitive } from "@/lib/dedupe";

describe("dedupeCaseInsensitive", () => {
  it("removes case-insensitive duplicates, keeping the first-seen casing", () => {
    expect(dedupeCaseInsensitive(["React", "react", "REACT", "Node.js"])).toEqual([
      "React",
      "Node.js",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeCaseInsensitive([])).toEqual([]);
  });

  it("leaves an already-unique list unchanged", () => {
    expect(dedupeCaseInsensitive(["A", "B", "C"])).toEqual(["A", "B", "C"]);
  });
});
