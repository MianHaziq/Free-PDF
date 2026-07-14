import { describe, expect, it } from "vitest";

import {
  collectBullets,
  segmentLinesByDateAnchor,
} from "@/features/resume-import/entrySegmentation";

describe("collectBullets", () => {
  it("keeps separately marked bullets separate", () => {
    expect(
      collectBullets(["•First point.", "•Second point."]),
    ).toEqual(["First point.", "Second point."]);
  });

  it("merges a wrapped continuation line into the previous bullet", () => {
    expect(
      collectBullets([
        "•Engineered real-time chat with speech-to-text/text-",
        "to-speech and WebRTC.",
      ]),
    ).toEqual(["Engineered real-time chat with speech-to-text/text- to-speech and WebRTC."]);
  });

  it("starts a new bullet after terminal punctuation even without a marker", () => {
    expect(
      collectBullets([
        "•Built the admin console.",
        "LinguaPath - AI-Powered Language Learning Platform",
      ]),
    ).toEqual(["Built the admin console.", "LinguaPath - AI-Powered Language Learning Platform"]);
  });

  it("treats an unmarked first line as its own bullet", () => {
    expect(collectBullets(["HealthConnect — AI Telehealth Platform"])).toEqual([
      "HealthConnect — AI Telehealth Platform",
    ]);
  });
});

describe("segmentLinesByDateAnchor", () => {
  it("splits lines into entries at each date-range anchor", () => {
    const result = segmentLinesByDateAnchor([
      "Acme Corp, Associate Software Engineer 12/2025 – Present",
      "HealthConnect — AI Telehealth Platform",
      "•Built the AI chat.",
      "Acme Corp, Software Engineer Intern 09/2025 – 12/2025",
      "•Implemented authentication.",
    ]);

    expect(result.leftoverLines).toEqual([]);
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]).toMatchObject({
      heading: "Acme Corp, Associate Software Engineer",
      startDate: "2025-12",
      endDate: null,
      bodyLines: ["HealthConnect — AI Telehealth Platform", "•Built the AI chat."],
    });
    expect(result.segments[1]).toMatchObject({
      heading: "Acme Corp, Software Engineer Intern",
      startDate: "2025-09",
      endDate: "2025-12",
    });
  });

  it("puts everything into leftoverLines when no anchor is found", () => {
    const result = segmentLinesByDateAnchor(["No dates here", "Still none"]);
    expect(result.segments).toEqual([]);
    expect(result.leftoverLines).toEqual(["No dates here", "Still none"]);
  });

  it("captures lines before the first anchor as leftover", () => {
    const result = segmentLinesByDateAnchor([
      "Unattributable intro line",
      "Role Jan 2022 - Mar 2023",
      "•A bullet.",
    ]);
    expect(result.leftoverLines).toEqual(["Unattributable intro line"]);
    expect(result.segments).toHaveLength(1);
  });
});
