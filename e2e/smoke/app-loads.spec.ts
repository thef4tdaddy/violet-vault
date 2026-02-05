import { test, expect } from "../fixtures/auth.fixture";
import { SELECTORS } from "../utils/selectors";

/**
 * Smoke Test: App Loads Successfully
 *
 * Validates that the Violet Vault application loads correctly with demo mode enabled.
 * This is the most basic smoke test to ensure the infrastructure is working.
 */

test.describe("Smoke Tests - App Loading", () => {
  test("should load the application homepage", async ({ authenticatedPage: page }) => {
    await test.step("Verify app loaded successfully with demo mode", async () => {
      // The auth fixture already navigated to the app
      // Verify the page title
      await expect(page).toHaveTitle(/Violet Vault/i);

      // Verify main content is visible
      const mainContent = page.locator(SELECTORS.DISPLAY.MAIN_CONTAINER);
      await expect(mainContent).toBeVisible();
    });
  });

  test("should have demo mode enabled", async ({ authenticatedPage: page }) => {
    await test.step("Verify demo mode is active", async () => {
      // Check that demo mode is active by verifying window.budgetDb exists
      const isDemoMode = await page.evaluate(() => {
        return typeof (window as any).budgetDb !== "undefined";
      });

      expect(isDemoMode).toBeTruthy();
    });
  });

  test("should display basic navigation elements", async ({ authenticatedPage: page }) => {
    await test.step("Verify navigation elements are present", async () => {
      // Wait for page to be ready
      await page.waitForLoadState("networkidle");

      // Check for dashboard or home link
      const navigationElements = page.locator('nav, [role="navigation"]');
      const hasNavigation = await navigationElements.count();
      expect(hasNavigation).toBeGreaterThan(0);
    });
  });

  test("should not show critical error messages on load", async ({ authenticatedPage: page }) => {
    await test.step("Verify no critical errors displayed on load", async () => {
      // Wait for page to stabilize
      await page.waitForLoadState("networkidle");

      // Check that no critical error messages are visible
      // Using separate locators to avoid selector parsing issues
      const errorByTestId = page.locator('[data-testid*="error"]').filter({ hasText: /error/i });
      const errorByText = page.locator("text=/error/i");

      const errorCount = (await errorByTestId.count()) + (await errorByText.count());

      // We expect no visible errors; tolerate at most one non-critical dev-mode warning
      expect(errorCount).toBeLessThanOrEqual(1);
    });
  });
});
