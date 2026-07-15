import { expect, test } from "@playwright/test";

/**
 * Covers Phase 13: saving the current resume/job description/tailored
 * resume into real, persisted docs/DATA_MODEL.md history records (not
 * just the auto-saved single drafts), verifying the history view groups
 * a tailored resume under its source resume + job description + score,
 * that it survives a refresh, and that deleting a resume with dependent
 * tailored resumes requires an explicit cascade confirmation.
 */
test("saves resume, job description, and a tailored resume to history, and they survive a refresh", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await page.getByRole("button", { name: "Add skill" }).click();
  await page.getByLabel("Skill name").fill("React");
  await page.getByLabel("Skill name").blur();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page
    .getByLabel("Paste job description text")
    .fill(["Frontend Engineer", "", "Requirements:", "- React"].join("\n"));
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByLabel("Required skills (comma-separated)")).toHaveValue("React");
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/match");
  await expect(page.getByText("100%").first()).toBeVisible();
  await page.getByRole("button", { name: "Save to History" }).click();
  // The save button now reports success via a toast rather than inline text.
  await expect(page.getByText("Tailored resume saved to history")).toBeVisible({ timeout: 5000 });

  await page.goto("/history");
  await expect(page.getByText("Untitled Resume", { exact: true })).toBeVisible();
  await expect(page.getByText(/Frontend Engineer/).first()).toBeVisible();
  await expect(page.getByText(/100% match/)).toBeVisible();

  // Refresh recovery — the dev plan's explicit Phase 13 testing requirement.
  await page.reload();
  await expect(page.getByText("Untitled Resume", { exact: true })).toBeVisible();
  await expect(page.getByText(/100% match/)).toBeVisible();
});

test("deleting a saved resume with a dependent tailored resume requires cascade confirmation", async ({
  page,
}) => {
  // A single persistent dialog handler (rather than page.once/waitForEvent
  // per click) — the confirm() call happens after an async IndexedDB read
  // inside the click handler, and registering a fresh listener per click
  // raced with that delay often enough to leave a dialog unhandled and
  // block the page. This pattern was verified reliable across repeated runs.
  let shouldAcceptDelete = false;
  page.on("dialog", (dialog) => {
    void (shouldAcceptDelete ? dialog.accept() : dialog.dismiss());
  });

  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page
    .getByLabel("Paste job description text")
    .fill(["Frontend Engineer", "", "Requirements:", "- React"].join("\n"));
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/match");
  await page.getByRole("button", { name: "Save to History" }).click();
  // The save button now reports success via a toast rather than inline text.
  await expect(page.getByText("Tailored resume saved to history")).toBeVisible({ timeout: 5000 });

  await page.goto("/history");

  // Dismiss first: deletion should be blocked, the record stays.
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText("Untitled Resume", { exact: true })).toBeVisible();

  // Accept: cascades, removing both the resume and its tailored resume.
  shouldAcceptDelete = true;
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByText("Untitled Resume", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/100% match/)).toHaveCount(0);
});
