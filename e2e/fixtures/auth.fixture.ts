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

/**
 * Helper: Wait for budgetId to be set with polling and timeout
 */
async function waitForBudgetId(page: Page): Promise<string> {
  let budgetId: string | undefined;
  let attempts = 0;
  const maxAttempts = 20; // 20 * 500ms = 10 seconds max wait

  while (!budgetId && attempts < maxAttempts) {
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const db = (window as any).budgetDb;
      const userProfile = localStorage.getItem("userProfile");
      return {
        budgetId: db?.budgetId,
        hasUserProfile: !!userProfile,
      };
    });

    budgetId = result.budgetId;
    attempts++;

    if (attempts % 4 === 0) {
      console.log(`Attempt ${attempts}/20:`, {
        budgetIdFound: !!budgetId,
        hasUserProfile: result.hasUserProfile,
      });
    }

    if (budgetId) {
      console.log(`✓ Budget ID found on attempt ${attempts}: ${budgetId}`);
      break;
    }
  }

  if (!budgetId) {
    const dbInfo = await page.evaluate(() => {
      const db = (window as any).budgetDb;
      const userProfile = localStorage.getItem("userProfile");
      const budgetData = localStorage.getItem("envelopeBudgetData");
      return {
        dbExists: !!db,
        budgetIdSet: db?.budgetId !== undefined,
        hasUserProfile: !!userProfile,
        hasBudgetData: !!budgetData,
      };
    });
    console.error("Debug info:", dbInfo);
    throw new Error(
      `Budget ID not found after ${attempts} attempts. DB exists: ${dbInfo.dbExists}, hasUserProfile: ${dbInfo.hasUserProfile}`
    );
  }

  return budgetId;
}

/**
 * Helper: Load test data from /public/test-data/data/violet-vault-budget.json
 * Populates the database with realistic test data for E2E tests
 * Only loads tables that exist in the current v2.0 schema
 */
async function loadTestData(page: Page): Promise<void> {
  try {
    const response = await page.evaluate(async () => {
      const res = await fetch("/test-data/data/violet-vault-budget.json");
      if (!res.ok) throw new Error(`Failed to fetch test data: ${res.status}`);
      return res.json();
    });

    // Load test data into the database
    await page.evaluate(async (testData) => {
      const db = (window as any).budgetDb;
      if (!db) {
        console.error("❌ window.budgetDb not available");
        return;
      }

      // Only load tables that exist in v2.0 schema
      // Note: bills, debts, savingsGoals, paycheckHistory were dropped in v2.0
      const tables = [
        { name: "budget", key: "budget" },
        { name: "envelopes", key: "envelopes" },
        { name: "transactions", key: "transactions" },
        { name: "budgetCommits", key: "budgetCommits" },
        { name: "budgetChanges", key: "budgetChanges" },
      ];

      // Populate each table
      for (const table of tables) {
        const data = testData[table.key];
        if (!data) {
          console.log(`⚠ No data for ${table.key} in test data file`);
          continue;
        }

        if (!db[table.name]) {
          console.warn(`⚠ Table ${table.name} does not exist in database`);
          continue;
        }

        if (!Array.isArray(data)) {
          console.warn(`⚠ Expected array for ${table.key}, got ${typeof data}`);
          continue;
        }

        try {
          await db[table.name].bulkAdd(data);
          console.log(`✓ Loaded ${data.length} records into ${table.name}`);
        } catch (err) {
          console.warn(`⚠ Could not load ${table.name}:`, err);
        }
      }

      console.log("✓ All test data loaded into database");
    }, response);
  } catch (error) {
    console.warn("⚠ Failed to load test data:", error);
  }
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to /app with demo=true query parameter
    await page.goto("http://localhost:5173/app?demo=true", { waitUntil: "networkidle" });
    console.log("✓ Navigated to /app with demo mode enabled");

    // Verify initial state
    const initialState = await page.evaluate(() => {
      const db = (window as any).budgetDb;
      return {
        dbExists: !!db,
        hasEnvelopes: db?.envelopes ? "yes" : "no",
        hasTransactions: db?.transactions ? "yes" : "no",
      };
    });
    console.log("✓ Initial state after navigation:", initialState);

    // Wait for budgetId to be set by auth flow
    const budgetId = await waitForBudgetId(page);
    console.log("✓ Authentication complete. Budget ID:", budgetId);

    // Dismiss security notice modal
    await dismissSecurityNotice(page);

    // Wait for main content to load
    await waitForMainContent(page);

    // Load test data for E2E tests
    await loadTestData(page);

    // Pass the authenticated page to the test
    await use(page);
  },
});

export { expect };
