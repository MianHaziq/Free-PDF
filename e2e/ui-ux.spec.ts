import { expect, test } from "@playwright/test";

/**
 * Covers Phase 14 (UI/UX): card panels expose real heading semantics,
 * the dark-mode toggle switches and persists the theme, save actions
 * surface a toast, and unknown routes render the custom 404.
 */

test("card panels render as real headings for screen readers", async ({ page }) => {
  await page.goto("/editor");
  // CardTitle now renders an <h2> rather than a <div>, so each panel is a
  // proper landmark in the document outline.
  await expect(page.getByRole("heading", { name: "Import or start a resume" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Skills" })).toBeVisible();
});

test("dark-mode toggle switches the theme and persists across a reload", async ({ page }) => {
  await page.goto("/editor");

  const html = page.locator("html");
  await expect(html).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(html).toHaveClass(/dark/);

  // next-themes persists the choice to localStorage — it must survive a reload.
  await page.reload();
  await expect(html).toHaveClass(/dark/);

  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(html).not.toHaveClass(/dark/);
});

test("saving a resume surfaces a toast", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await page.getByLabel("Full name").fill("Jane Doe");
  await page.getByLabel("Full name").blur();

  await page.getByRole("button", { name: "Save to History" }).click();
  await expect(page.getByText("Resume saved to history")).toBeVisible({ timeout: 5000 });
});

test("an unknown route renders the custom 404 page", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});
