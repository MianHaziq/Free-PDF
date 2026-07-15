import { expect, test } from "@playwright/test";

/**
 * Covers Phase 11: live preview, multiple templates, print-friendly
 * layout, and (per the dev plan's "Testing: Browser compatibility")
 * runs on Chromium, Firefox, and WebKit — see playwright.config.ts.
 */
test("resume preview renders both templates and hides controls when printing", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await page.getByLabel("Full name").fill("Jane Doe");
  await page.getByLabel("Email").fill("jane@example.com");
  await page.getByLabel("Full name").blur();
  await page.getByLabel("Professional summary").fill("Backend engineer.");

  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Role", { exact: true }).fill("Backend Engineer");
  await page.getByLabel("Company", { exact: true }).fill("Acme Corp");
  await page.getByLabel("Start date (YYYY-MM)").fill("2022-01");
  await page.getByLabel("Bullets (one per line)").fill("Built REST APIs.");
  await page.getByLabel("Bullets (one per line)").blur();

  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/preview");

  // Live preview reflects the editor's data.
  await expect(page.getByText("JANE DOE")).toBeVisible();
  await expect(page.getByText("jane@example.com")).toBeVisible();
  await expect(page.getByText("Built REST APIs.")).toBeVisible();

  // Multiple templates — switching changes the rendered casing/style.
  await page.getByRole("button", { name: "Modern" }).click();
  await expect(page.getByText("Jane Doe", { exact: true })).toBeVisible();

  // Print-friendly: nav and on-screen controls disappear under print media,
  // but the resume content itself remains.
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("link", { name: "Resume Editor" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Classic" })).toBeHidden();
  await expect(page.getByText("Jane Doe", { exact: true })).toBeVisible();
  await expect(page.getByText("Built REST APIs.")).toBeVisible();
});

test("tailored version toggle is disabled until the job description has skills", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/preview");
  await expect(page.getByRole("button", { name: "Tailored for job" })).toBeDisabled();
});
