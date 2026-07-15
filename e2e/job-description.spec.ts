import { expect, test } from "@playwright/test";

/**
 * Covers the dev plan's Phase 5 job description flow: paste text ->
 * extraction populates the form -> manual edits -> refresh recovery.
 */
test("pasting a job description extracts fields, allows editing, and survives a refresh", async ({
  page,
}) => {
  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();

  await page
    .getByLabel("Paste job description text")
    .fill("Senior Backend Engineer\nAcme Corp · Remote\n\nWe use Node.js and PostgreSQL daily.");
  await page.getByRole("button", { name: "Analyze pasted text" }).click();

  await expect(page.getByLabel("Title")).toHaveValue("Senior Backend Engineer");
  await expect(page.getByLabel("Company")).toHaveValue("Acme Corp");
  await expect(page.getByLabel("Keywords (comma-separated)")).toHaveValue("Node.js, PostgreSQL");

  // Manually edit required skills and experience level.
  await page.getByLabel("Required skills (comma-separated)").fill("Node.js, PostgreSQL, Docker");
  await page.getByLabel("Required skills (comma-separated)").blur();
  await page.getByLabel("Experience level").fill("Senior");

  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.reload();

  await expect(page.getByLabel("Title")).toHaveValue("Senior Backend Engineer");
  await expect(page.getByLabel("Company")).toHaveValue("Acme Corp");
  await expect(page.getByLabel("Experience level")).toHaveValue("Senior");
  await expect(page.getByLabel("Required skills (comma-separated)")).toHaveValue(
    "Node.js, PostgreSQL, Docker",
  );
});

test("nav links reach the editor and job description pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Resume Editor" }).click();
  await expect(page).toHaveURL(/\/editor$/);
  await page.getByRole("link", { name: "Job Description" }).click();
  await expect(page).toHaveURL(/\/job-description$/);
});
