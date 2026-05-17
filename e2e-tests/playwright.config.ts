import { defineConfig, devices } from '@playwright/test';

// Playwright Test config for the Notes App UI smoke suite.
// See https://playwright.dev/docs/test-configuration for the full options list.
export default defineConfig({
  testDir: './tests',

  // Run tests in files in parallel.
  fullyParallel: true,

  // Fail the build on CI if test.only was left in the source.
  forbidOnly: !!process.env.CI,

  // Retry on CI only, helps absorb transient flake without masking local failures.
  retries: process.env.CI ? 2 : 0,

  // Single worker on CI for predictable order, parallel locally.
  workers: process.env.CI ? 1 : undefined,

  // List reporter prints live progress, html report is saved for inspection.
  reporter: [['list'], ['html', { open: 'never' }]],

  // Shared settings for all projects below.
  use: {
    // Base URL so tests can call page.goto('/auth/login') instead of full URLs.
    baseURL: 'http://localhost:3000',

    // Capture a screenshot only when a test fails, used as failure evidence.
    screenshot: 'only-on-failure',

    // Keep a trace on failure, viewed later with `npx playwright show-trace`.
    trace: 'retain-on-failure',
  },

  // Single browser project, matches the QA Strategy scope (chromium only).
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
