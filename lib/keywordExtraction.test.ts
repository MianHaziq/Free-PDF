import { describe, expect, it } from "vitest";

import { extractKnownTermMentions } from "@/lib/keywordExtraction";

const DICTIONARY = ["React", "Node.js", "C++", "C#", "Go"] as const;

describe("extractKnownTermMentions", () => {
  it("finds dictionary terms mentioned in text, in first-appearance order", () => {
    expect(extractKnownTermMentions("We use Node.js and React daily.", DICTIONARY)).toEqual([
      "Node.js",
      "React",
    ]);
  });

  it("matches case-insensitively but returns canonical casing", () => {
    expect(extractKnownTermMentions("react and REACT", DICTIONARY)).toEqual(["React"]);
  });

  it("does not match a term as a substring of an unrelated word", () => {
    expect(extractKnownTermMentions("a Gopher enthusiast", DICTIONARY)).not.toContain("Go");
  });

  it("handles special regex characters in dictionary terms", () => {
    expect(extractKnownTermMentions("Skilled in C++ and C#.", DICTIONARY)).toEqual(["C++", "C#"]);
  });

  it("deduplicates repeated mentions", () => {
    expect(extractKnownTermMentions("React React React", DICTIONARY)).toEqual(["React"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(extractKnownTermMentions("nothing relevant here", DICTIONARY)).toEqual([]);
  });
});
