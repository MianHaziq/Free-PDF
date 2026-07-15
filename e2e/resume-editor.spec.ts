import { expect, test } from "@playwright/test";

/**
 * Covers the dev plan's Phase 4 testing checklist (editing, deleting,
 * reordering, refresh recovery) starting from a blank resume — no fixture
 * file needed, avoiding any dependency on the gitignored test-resumes/.
 */
test("editing, deleting, reordering, and refresh recovery", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  // --- Edit contact + summary ---
  await page.getByLabel("Full name").fill("Jane Doe");
  await page.getByLabel("Full name").blur();
  await page.getByLabel("Professional summary").fill("A great engineer.");
  await expect(page.getByLabel("Full name")).toHaveValue("Jane Doe");
  await expect(page.getByLabel("Professional summary")).toHaveValue("A great engineer.");

  // --- Add two experience entries, delete one ---
  const addExperience = page.getByRole("button", { name: "Add experience" });
  await addExperience.click();
  await addExperience.click();
  await expect(page.getByLabel("Company")).toHaveCount(2);

  await page.getByLabel("Company").nth(0).fill("Acme");
  await page.getByLabel("Role").nth(0).fill("Engineer");

  await page.getByRole("button", { name: "Remove experience at this role" }).click();
  await expect(page.getByLabel("Company")).toHaveCount(1);
  await expect(page.getByLabel("Company").nth(0)).toHaveValue("Acme");

  // --- Add two skills, drag-reorder them ---
  const addSkill = page.getByRole("button", { name: "Add skill" });
  await addSkill.click();
  await addSkill.click();
  await page.getByLabel("Skill name").nth(0).fill("Skill A");
  await page.getByLabel("Skill name").nth(1).fill("Skill B");
  await page.getByLabel("Skill name").nth(1).blur();

  const dragHandles = page.getByRole("button", { name: "Drag to reorder" });
  const skillAHandleBox = await dragHandles.nth(0).boundingBox();
  const skillBHandleBox = await dragHandles.nth(1).boundingBox();
  if (!skillAHandleBox || !skillBHandleBox) {
    throw new Error("Expected drag handle bounding boxes to be available");
  }

  await page.mouse.move(
    skillBHandleBox.x + skillBHandleBox.width / 2,
    skillBHandleBox.y + skillBHandleBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    skillAHandleBox.x + skillAHandleBox.width / 2,
    skillAHandleBox.y + skillAHandleBox.height / 2 - 5,
    { steps: 10 },
  );
  await page.mouse.move(
    skillAHandleBox.x + skillAHandleBox.width / 2,
    skillAHandleBox.y + skillAHandleBox.height / 2 - 10,
    { steps: 5 },
  );
  await page.mouse.up();

  await expect(page.getByLabel("Skill name").nth(0)).toHaveValue("Skill B");
  await expect(page.getByLabel("Skill name").nth(1)).toHaveValue("Skill A");

  // --- Refresh recovery ---
  // Wait for the debounced auto-save to actually flush to IndexedDB before reloading.
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.reload();

  await expect(page.getByLabel("Full name")).toHaveValue("Jane Doe");
  await expect(page.getByLabel("Professional summary")).toHaveValue("A great engineer.");
  await expect(page.getByLabel("Company")).toHaveCount(1);
  await expect(page.getByLabel("Company").nth(0)).toHaveValue("Acme");
  await expect(page.getByLabel("Skill name").nth(0)).toHaveValue("Skill B");
  await expect(page.getByLabel("Skill name").nth(1)).toHaveValue("Skill A");
});

test("importing a JSON resume populates the editor end to end", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  const resumeJson = {
    id: "11111111-1111-4111-8111-111111111111",
    label: "Imported Resume",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sourceFormat: "json",
    contact: {
      fullName: "Imported Person",
      email: "imported@example.com",
      phone: null,
      location: null,
      linkedin: null,
      github: null,
      website: null,
    },
    summary: "Imported summary.",
    skills: [{ name: "Go", category: null, confidence: "high" }],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    unclassifiedBlocks: [],
  };

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload resume (PDF, DOCX, JSON)" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(resumeJson)),
  });

  await expect(page.getByLabel("Full name")).toHaveValue("Imported Person");
  await expect(page.getByLabel("Professional summary")).toHaveValue("Imported summary.");
  await expect(page.getByLabel("Skill name").nth(0)).toHaveValue("Go");
});

test("resume insights update live and flag undeclared technologies", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  await page.getByRole("button", { name: "Add skill" }).click();
  await page.getByLabel("Skill name").fill("React");
  await page.getByLabel("Skill name").blur();

  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Company").fill("Acme");
  await page.getByLabel("Start date (YYYY-MM)").fill("2022-01");
  await page.getByLabel("End date (YYYY-MM, blank = current)").fill("2022-12");
  await page.getByLabel("Bullets (one per line)").fill("Built a service using Docker.");
  await page.getByLabel("Bullets (one per line)").blur();

  // Numeric correctness is covered by analyzeResume's unit tests; this just
  // confirms the panel renders live and reacts to real UI edits.
  await expect(page.getByText("Years of experience")).toBeVisible();
  await expect(page.getByText(/Mentioned in your bullets but not listed as skills/)).toBeVisible();
  await expect(page.getByText("Docker", { exact: true })).toBeVisible();
});
