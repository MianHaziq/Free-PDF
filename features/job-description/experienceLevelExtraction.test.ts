import { describe, expect, it } from "vitest";

import { inferExperienceLevel } from "@/features/job-description/experienceLevelExtraction";

describe("inferExperienceLevel", () => {
  it("extracts an explicit 'N+ years' mention", () => {
    expect(inferExperienceLevel("Backend Engineer", "Looking for 5+ years of experience.")).toBe(
      "5+ years",
    );
  });

  it("extracts a 'N-M years' range", () => {
    expect(inferExperienceLevel("Backend Engineer", "3-5 years of relevant experience.")).toBe(
      "3-5 years",
    );
  });

  it("extracts a bare 'N years of experience' mention", () => {
    expect(inferExperienceLevel("Backend Engineer", "You have 4 years of experience.")).toBe(
      "4 years",
    );
  });

  it("falls back to a seniority keyword in the title when no years are mentioned", () => {
    expect(inferExperienceLevel("Senior Backend Engineer", "Join our team.")).toBe("Senior");
    expect(inferExperienceLevel("Junior Developer", "Join our team.")).toBe("Junior");
    expect(inferExperienceLevel("Staff Engineer", "Join our team.")).toBe("Staff");
    expect(inferExperienceLevel("Entry-Level Software Engineer", "Join our team.")).toBe(
      "Entry-level",
    );
  });

  it("prefers an explicit years mention over a title keyword", () => {
    expect(inferExperienceLevel("Senior Backend Engineer", "Requires 2+ years of experience.")).toBe(
      "2+ years",
    );
  });

  it("returns null when neither signal is present", () => {
    expect(inferExperienceLevel("Backend Engineer", "Join our growing team.")).toBeNull();
  });
});
