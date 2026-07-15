import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Phase 11's dev-plan testing requirement is specifically "browser
    // compatibility" for the resume preview/print layout — scoped to just
    // that spec rather than tripling the runtime of the whole suite, since
    // the rest of the app has no meaningful per-engine CSS risk.
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /resume-preview\.spec\.ts/,
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      testMatch: /resume-preview\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
