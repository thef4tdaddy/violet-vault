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

/**
 * Helper: Dismiss security notice modal if visible
 */
async function dismissSecurityNotice(page: Page): Promise<void> {
  try {
    const securityNoticeButton = page.locator('button:has-text("I UNDERSTAND")');
    await securityNoticeButton.waitFor({ timeout: 5000 });
    await securityNoticeButton.click();
    console.log("✓ Dismissed security notice modal");
    await page.waitForTimeout(500); // Wait for modal to close
  } catch {
    console.warn("⚠ Security notice modal did not appear (might already be dismissed)");
  }
}

/**
 * Helper: Wait for main content to load
 */
async function waitForMainContent(page: Page): Promise<void> {
  const mainContentSelectors = [
    "main",
    '[role="main"]',
    '[data-testid="dashboard"]',
    ".dashboard",
    '[data-testid="main-content"]',
    'div[class*="dashboard"]',
    "nav", // Navigation tabs indicate app is ready
  ];

  for (const selector of mainContentSelectors) {
    try {
      const element = page.locator(selector).first();
      await element.waitFor({ timeout: 3000 });
      console.log(`✓ App main content loaded (selector: ${selector})`);
      return;
    } catch {
      // Try next selector
    }
  }

  console.warn("⚠ Main content did not load within timeout");
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to /app with demo=true query parameter
    await page.goto("http://localhost:5173/app?demo=true", { waitUntil: "networkidle" });
    console.log("✓ Navigated to /app with demo mode enabled");

    // Wait for demo auth bypass to complete and app to initialize
    await page.waitForTimeout(3000);

    // Verify auth completed by checking window.budgetDb
    const budgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });

    if (!budgetId) {
      throw new Error(
        "Budget ID not found after authentication - demo mode setup may have failed. Check if VITE_DEMO_MODE=true is set in web server."
      );
    }
    console.log("✓ Authentication complete. Budget ID:", budgetId);

    // Dismiss security notice modal
    await dismissSecurityNotice(page);

    // Wait for main content to load
    await waitForMainContent(page);

    // Pass the authenticated page to the test
    await use(page);

    // Cleanup (optional) - localStorage and IndexedDB will persist
  },
});

export { expect };
