import { expect, test } from "@playwright/test";

/**
 * Covers Phase 8: build a resume with one matched and one missing skill
 * against a job description's required skills, then verify the match
 * page's score, matched/missing lists, and recommendations in a real
 * browser. Resume and job description are independently auto-saved, so
 * this exercises both stores together for the first time.
 */
test("resume/job description match score, matched and missing skills", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await page.getByRole("button", { name: "Add skill" }).click();
  await page.getByLabel("Skill name").fill("React");
  await page.getByLabel("Skill name").blur();
  // Each page navigation below is a full reload, tearing down the in-memory
  // store — wait for the debounced auto-save to actually reach IndexedDB
  // first, or the edit is lost on navigation.
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page.getByLabel("Paste job description text").fill(
    ["Frontend Engineer", "", "Requirements:", "- React", "- Kubernetes"].join("\n"),
  );
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByLabel("Required skills (comma-separated)")).toHaveValue(
    "React, Kubernetes",
  );
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/match");

  await expect(page.getByText(/Matched required:.*React/)).toBeVisible();
  await expect(page.getByText(/Missing required:.*Kubernetes/)).toBeVisible();
  // No preferred skills listed, so the score is required-only: 1 of 2 matched = 50%.
  await expect(page.getByText("50%")).toBeVisible();
});

test("match page prompts to add job description skills when none are set", async ({ page }) => {
  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();

  await page.goto("/match");
  await expect(
    page.getByText("Add required or preferred skills on the Job Description page"),
  ).toBeVisible();
});
