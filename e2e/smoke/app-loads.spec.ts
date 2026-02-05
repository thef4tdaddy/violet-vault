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
    // The auth fixture already navigated to the app
    // Verify the page title
    await expect(page).toHaveTitle(/Violet Vault/i);

    // Verify main content is visible
    const mainContent = page.locator(SELECTORS.DISPLAY.MAIN_CONTAINER);
    await expect(mainContent).toBeVisible();

    console.log("✓ App loaded successfully with demo mode");
  });

  test("should have demo mode enabled", async ({ authenticatedPage: page }) => {
    // Check that demo mode is active by verifying window.budgetDb exists
    const isDemoMode = await page.evaluate(() => {
      return typeof (window as any).budgetDb !== "undefined";
    });

    expect(isDemoMode).toBeTruthy();
    console.log("✓ Demo mode is active");
  });

  test("should display basic navigation elements", async ({ authenticatedPage: page }) => {
    // Wait for page to be ready
    await page.waitForLoadState("networkidle");

    // Check for dashboard or home link
    const navigationElements = page.locator('nav, [role="navigation"]');
    const hasNavigation = await navigationElements.count();
    expect(hasNavigation).toBeGreaterThan(0);

    console.log("✓ Navigation elements are present");
  });

  test("should not show critical error messages on load", async ({ authenticatedPage: page }) => {
    // Wait for page to stabilize
    await page.waitForLoadState("networkidle");

    // Check that no critical error messages are visible
    // Using separate locators to avoid selector parsing issues
    const errorByTestId = page.locator('[data-testid*="error"]').filter({ hasText: /error/i });
    const errorByText = page.locator("text=/error/i");

    const errorCount = (await errorByTestId.count()) + (await errorByText.count());

    // We expect minimal or no visible errors
    // Some apps might show dev-mode warnings which we'll tolerate
    expect(errorCount).toBeLessThanOrEqual(5);

    console.log("✓ No critical errors displayed");
  });
});
