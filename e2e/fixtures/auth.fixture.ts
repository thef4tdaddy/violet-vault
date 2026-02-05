import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Authentication Fixture for Playwright E2E Tests
 *
 * Provides demo mode authentication with automatic Firebase anonymous auth.
 * All tests using this fixture will:
 * 1. Navigate to the app with VITE_DEMO_MODE=true
 * 2. Click "LAUNCH VAULT" to enter the app
 * 3. Complete password setup if needed
 * 4. Have access to window.budgetDb for direct database access
 *
 * Usage:
 * test('example test', async ({ authenticatedPage: page }) => {
 *   // page is already authenticated and demo mode is enabled
 *   await page.goto('/vault/dashboard');
 * });
 */

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * Complete the password setup flow
 */
async function completePasswordSetup(page: Page): Promise<void> {
  const passwordInput = page
    .locator('input[placeholder*="MASTER PASSWORD"], input[type="password"]')
    .first();
  const passwordInputVisible = await passwordInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (passwordInputVisible) {
    // eslint-disable-next-line no-console
    console.log("✓ Password setup screen detected - completing setup");
    await passwordInput.fill("test-password-123");

    const continueButton = page
      .locator('button:has-text("CONTINUE"), button:has-text("Continue")')
      .first();
    await continueButton.click();

    // Wait for setup to complete
    await page.waitForTimeout(3000);
    // eslint-disable-next-line no-console
    console.log("✓ Password setup completed");
  }
}

/**
 * Navigate to the app and click LAUNCH VAULT
 */
async function navigateToApp(page: Page): Promise<void> {
  // Try to find and click the button first
  const launchButton = page.locator('text="LAUNCH VAULT"');
  const launchButtonVisible = await launchButton.isVisible({ timeout: 3000 }).catch(() => false);

  if (launchButtonVisible) {
    await launchButton.click();
    // eslint-disable-next-line no-console
    console.log("✓ Clicked LAUNCH VAULT button");
    await page.waitForURL("**/vault/**", { timeout: 10000 });
  } else {
    // If button not found, navigate directly
    await page.goto("http://localhost:5173/vault/dashboard", { waitUntil: "networkidle" });
    // eslint-disable-next-line no-console
    console.log("✓ Navigated directly to /vault/dashboard");
  }
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Step 1: Navigate to app (VITE_DEMO_MODE set by playwright.config.ts)
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    // eslint-disable-next-line no-console
    console.log("✓ Navigated to app with demo mode enabled");

    // Step 2: Click "LAUNCH VAULT" to enter the app
    await navigateToApp(page);

    // Step 3: Complete master password setup if needed
    await completePasswordSetup(page);

    // Step 4: Wait for Firebase anonymous auth to complete
    await page.waitForTimeout(3000);

    // Step 5: Verify auth completed by checking window.budgetDb
    const budgetId = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (window as any).budgetDb?.budgetId;
    });

    if (!budgetId) {
      // eslint-disable-next-line no-console
      console.warn("⚠ Budget ID not found - auth may not have completed");
    } else {
      // eslint-disable-next-line no-console
      console.log("✓ Authentication complete. Budget ID:", budgetId);
    }

    // Step 6: Wait for app to be fully ready
    const mainContent = page.locator('main, [role="main"], [data-testid="dashboard"]');
    try {
      await mainContent.waitFor({ timeout: 10000 });
      // eslint-disable-next-line no-console
      console.log("✓ App main content loaded");
    } catch {
      // eslint-disable-next-line no-console
      console.warn("⚠ Main content did not load within timeout");
    }

    // Pass the authenticated page to the test
    await use(page);

    // Cleanup (optional)
    // localStorage and IndexedDB will persist but Firebase session will end
  },
});

export { expect };
