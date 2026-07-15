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

test("tailored resume preview prioritizes the backend role for a Backend job description", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  const addExperience = page.getByRole("button", { name: "Add experience" });
  await addExperience.click();
  await addExperience.click();

  await page.getByLabel("Role").nth(0).fill("Frontend Engineer");
  await page.getByLabel("Company").nth(0).fill("Acme");
  await page.getByLabel("Bullets (one per line)").nth(0).fill("Built UI components with React.");
  await page.getByLabel("Bullets (one per line)").nth(0).blur();

  await page.getByLabel("Role").nth(1).fill("Backend Engineer");
  await page.getByLabel("Company").nth(1).fill("Widget Inc");
  await page.getByLabel("Bullets (one per line)").nth(1).fill("Built REST APIs with Node.js.");
  await page.getByLabel("Bullets (one per line)").nth(1).blur();

  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page
    .getByLabel("Paste job description text")
    .fill(["Backend Engineer", "", "Requirements:", "- Node.js"].join("\n"));
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByLabel("Required skills (comma-separated)")).toHaveValue("Node.js");
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/match");
  await expect(page.getByText("Tailored Resume Preview")).toBeVisible();

  // Assert ordering by text position rather than a locator (the match
  // page's recommendations list also contains an em dash, so a generic
  // "li" filter would match the wrong element).
  const mainText = await page.locator("main").innerText();
  const backendIndex = mainText.indexOf("Backend Engineer — Widget Inc");
  const frontendIndex = mainText.indexOf("Frontend Engineer — Acme");
  expect(backendIndex).toBeGreaterThan(-1);
  expect(frontendIndex).toBeGreaterThan(-1);
  expect(backendIndex).toBeLessThan(frontendIndex);
});
