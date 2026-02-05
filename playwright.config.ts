import { defineConfig, devices } from '@playwright/test';
import { cpus } from 'os';

/**
 * Playwright E2E Testing Configuration for Violet Vault
 *
 * Key Features:
 * - Multi-browser testing (Chromium, Firefox, WebKit)
 * - Demo mode enabled for automatic test data seeding
 * - Blob reporter for CI sharding and parallel execution
 * - Optimized worker configuration for local and CI environments
 * - 60-second test timeout with 5-second assertion timeout
 */

export default defineConfig({
  testDir: './e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : Math.floor(cpus().length / 2),

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['blob', { outputFile: 'blob-report.zip' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against branded browsers */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'VITE_DEMO_MODE=true npx vite',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* Global test timeout: 60 seconds */
  timeout: 60 * 1000,

  /* Assertion timeout: 5 seconds */
  expect: {
    timeout: 5 * 1000,
  },

  /* Global setup/teardown */
  // globalSetup: './e2e/global-setup.ts',
  // globalTeardown: './e2e/global-teardown.ts',
});
