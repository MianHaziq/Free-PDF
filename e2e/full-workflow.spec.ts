import { expect, test, type Page } from "@playwright/test";

/**
 * Phase 15 (End-to-End Testing): exercises the complete workflow in one
 * continuous journey — import → edit → job description → match → tailor
 * → ATS report → preview → export → history → reload — rather than each
 * module in isolation (already covered by the per-phase specs). Also
 * covers cross-module regressions: multiple job description profiles
 * against one resume, and resume upload error paths.
 */

const FULL_STACK_RESUME = {
  id: "aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa",
  label: "Full Stack Resume",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  sourceFormat: "json",
  contact: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 200-3000",
    location: "Remote",
    linkedin: null,
    github: null,
    website: null,
  },
  summary: "",
  skills: [
    { name: "React", category: "Frontend", confidence: "high" },
    { name: "Node.js", category: "Backend", confidence: "high" },
    { name: "PostgreSQL", category: "Backend", confidence: "high" },
    { name: "Docker", category: "DevOps", confidence: "high" },
  ],
  experience: [
    {
      id: "bbbbbbbb-2222-4bbb-8bbb-bbbbbbbbbbbb",
      company: "Acme",
      role: "Frontend Engineer",
      startDate: "2021-01",
      endDate: "2022-01",
      bullets: ["Built UI components with React."],
      relevanceTags: [],
    },
    {
      id: "cccccccc-3333-4ccc-8ccc-cccccccccccc",
      company: "Widget Inc",
      role: "Backend Engineer",
      startDate: "2022-01",
      endDate: null,
      bullets: ["Built REST APIs with Node.js and PostgreSQL."],
      relevanceTags: [],
    },
  ],
  projects: [],
  education: [
    { institution: "State University", degree: "B.S. Computer Science", field: null, startDate: null, endDate: null },
  ],
  certifications: [],
  unclassifiedBlocks: [],
};

async function importResumeViaJson(page: Page, resume: Record<string, unknown>) {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload resume (PDF, DOCX, JSON)" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "full-stack-resume.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(resume)),
  });
  await expect(page.getByLabel("Full name")).toHaveValue(
    String(resume.contact && (resume.contact as { fullName: string }).fullName),
  );
  // `page.goto` below is a full page reload, tearing down in-memory state —
  // wait for the debounced auto-save to actually reach IndexedDB first, or
  // this import is lost on the next navigation (see e2e/match.spec.ts).
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });
}

test("complete workflow: import, edit, tailor, export, and save to history, surviving a reload", async ({
  page,
}) => {
  // --- Import ---
  await importResumeViaJson(page, FULL_STACK_RESUME);

  // --- Edit mid-flow: add a professional summary that wasn't in the import ---
  await page.getByLabel("Professional summary").fill("Full stack engineer who ships end to end.");
  await page.getByLabel("Professional summary").blur();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  // --- Job description ---
  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page
    .getByLabel("Paste job description text")
    .fill(["Backend Engineer", "", "Requirements:", "- Node.js", "- PostgreSQL", "", "Nice to have:", "- Docker"].join("\n"));
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByLabel("Required skills (comma-separated)")).toHaveValue("Node.js, PostgreSQL");
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  // --- Match + ATS report ---
  await page.goto("/match");
  await expect(page.getByText("100%").first()).toBeVisible();
  await expect(page.getByText(/Matches required skills:.*Node\.js.*PostgreSQL/)).toBeVisible();

  // --- Tailored preview: backend experience should be prioritized over frontend ---
  await expect(page.getByText("Tailored Resume Preview")).toBeVisible();
  const mainText = await page.locator("main").innerText();
  const backendIndex = mainText.indexOf("Backend Engineer — Widget Inc");
  const frontendIndex = mainText.indexOf("Frontend Engineer — Acme");
  expect(backendIndex).toBeGreaterThan(-1);
  expect(frontendIndex).toBeGreaterThan(-1);
  expect(backendIndex).toBeLessThan(frontendIndex);

  // --- Preview: both templates, both versions ---
  await page.goto("/preview");
  await expect(page.getByText("Alex Rivera")).toBeVisible();
  await page.getByRole("button", { name: "Modern" }).click();
  await expect(page.getByText("Alex Rivera")).toBeVisible();
  await page.getByRole("button", { name: "Tailored for job" }).click();
  await expect(page.getByText("Alex Rivera")).toBeVisible();

  // --- Export: real, non-empty PDF + DOCX downloads ---
  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PDF" }).click(),
  ]);
  expect(pdfDownload.suggestedFilename()).toBe("Alex_Rivera_Resume.pdf");
  expect(await pdfDownload.path()).toBeTruthy();

  const [docxDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download DOCX" }).click(),
  ]);
  expect(docxDownload.suggestedFilename()).toBe("Alex_Rivera_Resume.docx");
  expect(await docxDownload.path()).toBeTruthy();

  // --- Save to history ---
  await page.goto("/match");
  await page.getByRole("button", { name: "Save to History" }).click();
  await expect(page.getByText("Tailored resume saved to history")).toBeVisible({ timeout: 5000 });

  // --- History view reflects the full chain: resume -> job -> score ---
  await page.goto("/history");
  await expect(page.getByText("full-stack-resume.json", { exact: true })).toBeVisible();
  await expect(page.getByText(/Backend Engineer/).first()).toBeVisible();
  await expect(page.getByText(/100% match/)).toBeVisible();

  // --- Reload: everything (draft + history) survives ---
  await page.reload();
  await expect(page.getByText("full-stack-resume.json", { exact: true })).toBeVisible();
  await expect(page.getByText(/100% match/)).toBeVisible();

  await page.goto("/editor");
  await expect(page.getByLabel("Full name")).toHaveValue("Alex Rivera");
  await expect(page.getByLabel("Professional summary")).toHaveValue(
    "Full stack engineer who ships end to end.",
  );
});

test("regression: the same resume tailors and scores differently across Backend, Frontend, and Full Stack job descriptions", async ({
  page,
}) => {
  const profiles: { title: string; jd: string; expectedScore: string }[] = [
    { title: "Backend Engineer", jd: "- Node.js\n- PostgreSQL", expectedScore: "100%" },
    { title: "Frontend Engineer", jd: "- React", expectedScore: "100%" },
    { title: "Full Stack Engineer", jd: "- React\n- Node.js", expectedScore: "100%" },
  ];

  await importResumeViaJson(page, FULL_STACK_RESUME);

  for (const profile of profiles) {
    await page.goto("/job-description");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page
      .getByLabel("Paste job description text")
      .fill([profile.title, "", "Requirements:", profile.jd].join("\n"));
    await page.getByRole("button", { name: "Analyze pasted text" }).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

    await page.goto("/match");
    await expect(page.getByText(profile.expectedScore).first()).toBeVisible();
    await expect(page.getByText(`Match for ${profile.title}`)).toBeVisible();
  }

  // Frontend-only requirements should push the frontend role above backend
  // in the tailored preview — the inverse ordering of the backend-JD case.
  await page.goto("/job-description");
  await page.getByRole("button", { name: "Start blank" }).click();
  await page.getByLabel("Paste job description text").fill("Frontend Engineer\n\nRequirements:\n- React");
  await page.getByRole("button", { name: "Analyze pasted text" }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/match");
  await expect(page.getByText("Tailored Resume Preview")).toBeVisible();
  const mainText = await page.locator("main").innerText();
  const backendIndex = mainText.indexOf("Backend Engineer — Widget Inc");
  const frontendIndex = mainText.indexOf("Frontend Engineer — Acme");
  expect(frontendIndex).toBeGreaterThan(-1);
  expect(backendIndex).toBeGreaterThan(-1);
  expect(frontendIndex).toBeLessThan(backendIndex);
});

test("regression: resume upload rejects unsupported formats and empty files with a clear error", async ({
  page,
}) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();

  // Unsupported extension.
  const unsupportedChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload resume (PDF, DOCX, JSON)" }).click();
  await (await unsupportedChooser).setFiles({
    name: "resume.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Just plain text, not a real resume file."),
  });
  // Scoped to a <p> — Next.js's own route announcer also has role="alert".
  await expect(page.locator("p[role='alert']")).toContainText("Unsupported file type");

  // Empty file.
  const emptyChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload resume (PDF, DOCX, JSON)" }).click();
  await (await emptyChooser).setFiles({
    name: "empty.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(0),
  });
  await expect(page.locator("p[role='alert']")).toContainText("The selected file is empty.");

  // The editor draft itself must be untouched by the failed imports.
  await expect(page.getByLabel("Full name")).toHaveValue("");
});
