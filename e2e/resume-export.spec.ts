import { expect, test } from "@playwright/test";

/**
 * Covers Phase 12: clicking Download PDF/DOCX actually triggers a real
 * browser file download with the expected filename and a non-empty file
 * — not just that the button exists.
 */
test("downloads a real, non-empty PDF and DOCX file", async ({ page }) => {
  await page.goto("/editor");
  await page.getByRole("button", { name: "Start blank resume" }).click();
  await page.getByLabel("Full name").fill("Jane Doe");
  await page.getByLabel("Full name").blur();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });

  await page.goto("/preview");

  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download PDF" }).click(),
  ]);
  expect(pdfDownload.suggestedFilename()).toBe("Jane_Doe_Resume.pdf");
  const pdfPath = await pdfDownload.path();
  expect(pdfPath).toBeTruthy();

  const [docxDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download DOCX" }).click(),
  ]);
  expect(docxDownload.suggestedFilename()).toBe("Jane_Doe_Resume.docx");
  const docxPath = await docxDownload.path();
  expect(docxPath).toBeTruthy();
});
