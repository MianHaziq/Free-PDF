import { describe, expect, it } from "vitest";

import { parseExperienceSection } from "@/features/resume-import/experienceExtractor";

describe("parseExperienceSection", () => {
  it("extracts company, role, dates, and bullets from a real-world layout", () => {
    const { entries, leftoverLines } = parseExperienceSection([
      "Acme Corp, Associate Software Engineer 12/2025 – Present",
      "HealthConnect — AI Telehealth Platform",
      "•Developed an AI telehealth platform supporting 50+ virtual specialists.",
      "•Engineered real-time AI chat with WebSocket token streaming and speech-to-text/text-",
      "to-speech and WebRTC.",
      "Acme Corp, Software Engineer Intern 09/2025 – 12/2025",
      "•Implemented secure authentication flows.",
    ]);

    expect(leftoverLines).toEqual([]);
    expect(entries).toHaveLength(2);

    expect(entries[0].company).toBe("Acme Corp");
    expect(entries[0].role).toBe("Associate Software Engineer");
    expect(entries[0].startDate).toBe("2025-12");
    expect(entries[0].endDate).toBeNull();
    expect(entries[0].bullets).toEqual([
      "HealthConnect — AI Telehealth Platform",
      "Developed an AI telehealth platform supporting 50+ virtual specialists.",
      "Engineered real-time AI chat with WebSocket token streaming and speech-to-text/text- to-speech and WebRTC.",
    ]);
    expect(entries[0].id).toBeTruthy();

    expect(entries[1].company).toBe("Acme Corp");
    expect(entries[1].role).toBe("Software Engineer Intern");
    expect(entries[1].startDate).toBe("2025-09");
    expect(entries[1].endDate).toBe("2025-12");
  });

  it("does not guess a company/role split when no separator is found", () => {
    const { entries } = parseExperienceSection([
      "Backend Engineer at Startup Inc 01/2020 – 02/2021",
    ]);
    expect(entries[0].company).toBe("Backend Engineer");
    expect(entries[0].role).toBe("Startup Inc");
  });

  it("falls back to a single company field when no separator exists at all", () => {
    const { entries } = parseExperienceSection([
      "SoloHeading 01/2020 – 02/2021",
    ]);
    expect(entries[0].company).toBe("SoloHeading");
    expect(entries[0].role).toBe("");
  });

  it("returns no entries and preserves lines when no date anchor exists", () => {
    const result = parseExperienceSection(["Some text with no dates"]);
    expect(result.entries).toEqual([]);
    expect(result.leftoverLines).toEqual(["Some text with no dates"]);
  });
});
