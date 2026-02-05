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
  authenticatedPage: async ({ page }, use) => {
    // Step 1: VITE_DEMO_MODE is set in playwright.config.ts webServer
    // Step 1.5: Demo mode is detected via ?demo=true query parameter in navigation

    // Step 2: Navigate to /app with demo=true query parameter
    // This triggers isDemoMode() check and enables demo mode across the app
    await page.goto("http://localhost:5173/app?demo=true", { waitUntil: "networkidle" });
    console.log("✓ Navigated to /app with demo mode enabled");

    // Step 3: Wait for demo auth bypass to complete and app to initialize
    await page.waitForTimeout(3000);

    // Step 4: Verify auth completed by checking window.budgetDb
    const budgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });

    if (!budgetId) {
      throw new Error(
        "Budget ID not found after authentication - demo mode setup may have failed. Check if VITE_DEMO_MODE=true is set in web server."
      );
    } else {
      console.log("✓ Authentication complete. Budget ID:", budgetId);
    }

    // Step 5: Dismiss the LOCAL DATA SECURITY NOTICE modal if it appears
    try {
      const securityNoticeButton = page.locator('button:has-text("I UNDERSTAND")');
      await securityNoticeButton.click({ timeout: 5000 });
      console.log("✓ Dismissed security notice modal");
    } catch {
      console.warn("⚠ Security notice modal did not appear (might already be dismissed)");
    }

    // Step 6: Wait for app to be fully ready
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
