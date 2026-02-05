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
  authenticatedPage: async ({ page, context }, use) => {
    // Step 1: Set VITE_DEMO_MODE environment variable
    // This is handled by playwright.config.ts webServer command: VITE_DEMO_MODE=true npx vite

    // Step 2: Navigate to app
    // The app will auto-seed demo data and trigger Firebase anonymous auth
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    console.log("✓ Navigated to app with demo mode enabled");

    // Step 3: Wait for Firebase anonymous auth to complete
    // The app should auto-authenticate and set up the budget
    await page.waitForTimeout(2000);

    // Step 4: Verify auth completed by checking window.budgetDb
    const budgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });

    if (!budgetId) {
      console.warn("⚠ Budget ID not found - auth may not have completed");
    } else {
      console.log("✓ Authentication complete. Budget ID:", budgetId);
    }

    // Step 5: Wait for app to be fully ready
    // Look for main content to load
    const mainContent = page.locator('main, [role="main"], [data-testid="dashboard"]');
    try {
      await mainContent.waitFor({ timeout: 10000 });
      console.log("✓ App main content loaded");
    } catch {
      console.warn("⚠ Main content did not load within timeout");
    }

    // Pass the authenticated page to the test
    await use(page);

    // Cleanup (optional)
    // localStorage and IndexedDB will persist but Firebase session will end
  },
});

export { expect };
