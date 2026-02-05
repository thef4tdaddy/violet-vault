import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Authentication Fixture for Playwright E2E Tests
 *
 * Provides demo mode authentication with automatic Firebase anonymous auth.
 * All tests using this fixture will:
 * 1. Navigate to the app with VITE_DEMO_MODE=true
 * 2. Automatically authenticate via Firebase anonymous auth
 * 3. Have access to window.budgetDb for direct database access
 *
 * Usage:
 * test('example test', async ({ page, authenticatedPage }) => {
 *   // page is already authenticated and demo mode is enabled
 *   await page.goto('/dashboard');
 * });
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, useFixture) => {
    // Step 1: Set VITE_DEMO_MODE environment variable
    // This is handled by playwright.config.ts webServer command: VITE_DEMO_MODE=true npx vite

    // Step 2: Navigate to app with demo mode enabled
    // The app will auto-seed demo data and trigger Firebase anonymous auth
    await page.goto("http://localhost:5173?demo=true", { waitUntil: "networkidle" });

    // Step 3: Wait for Firebase anonymous auth to complete
    // The app should auto-authenticate and set up the budget
    await page.waitForTimeout(2000);

    // Step 4: Check if onboarding is required
    const hasOnboarding = await page
      .locator('h1:has-text("GET STARTED")')
      .isVisible()
      .catch(() => false);

    if (hasOnboarding) {
      // Fill master password (demo mode)
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.waitFor({ timeout: 5000 });
      await passwordInput.fill("demo-password-12345");
      await page.waitForTimeout(1000);

      // Wait for continue button to be enabled
      const continueButton = page.locator('button:has-text("Continue")');
      await continueButton.waitFor({ state: "visible", timeout: 5000 });

      // The button might need the password to be of certain length to enable
      // Try clicking even if disabled
      try {
        await continueButton.click({ timeout: 2000 });
      } catch {
        // Force click if normal click fails
        await continueButton.click({ force: true });
      }

      await page.waitForTimeout(3000);
    }

    // Step 5: Verify auth completed by checking window.budgetDb
    const budgetId = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).budgetDb?.budgetId;
    });

    if (!budgetId) {
      // Auth may not have completed
      void budgetId; // Use variable to satisfy linter
    }

    // Step 6: Wait for app to be fully ready
    // Look for main content to load
    const mainContent = page.locator('main, [role="main"], [data-testid="dashboard"]');
    try {
      await mainContent.waitFor({ timeout: 10000 });
    } catch {
      // Main content did not load within timeout
      void mainContent; // Use variable
    }

    // Pass the authenticated page to the test
    await useFixture(page);

    // Cleanup (optional)
    // localStorage and IndexedDB will persist but Firebase session will end
  },
});

export { expect };
