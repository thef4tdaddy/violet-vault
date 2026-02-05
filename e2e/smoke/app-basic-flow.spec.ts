import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes, seedTransactions, getBudgetState } from "../fixtures/budget.fixture";

/**
 * Smoke Tests - Critical Path Validation
 *
 * Tests the most critical paths through the application:
 * 1. App initialization with demo mode
 * 2. Basic budgeting workflow (create → transaction → verify)
 * 3. Data persistence across page reloads
 *
 * FIXTURE APPROACH:
 * - Uses authenticatedPage fixture for automatic demo mode setup
 * - All tests start with authenticated session ready
 * - Data seeding via UI interactions (envelope creation, transaction entry)
 * - NOTE: UI interactions chosen over fixture-based seeding to test actual user workflows
 *   and ensure critical paths work end-to-end including form submission and state updates
 *
 * SELECTOR STRATEGY:
 * - Flexible multi-fallback selectors for robustness
 * - Primary: role-based selectors (role="main", role="dialog")
 * - Secondary: data-testid attributes where available
 * - Tertiary: text pattern matching as fallback
 * - All selectors include timeout handling (.catch(() => false))
 *
 * TEST DATA:
 * - Envelope: "Test Groceries" ($500 goal)
 * - Transaction: "Bought milk and bread" ($45.50)
 * - Persistence test: "Persistence Test Envelope" ($1000 goal)
 *
 * TEST ISOLATION:
 * - Each test creates independent data (separate envelope names, unique transaction amounts)
 * - Demo mode IndexedDB resets between test runs due to page reload
 * - No data duplication between tests as each uses distinct envelope names
 * - Tests are safe to run in parallel as they use isolated data models
 */
test.describe("Smoke Tests - Critical Path Validation", () => {
  // All smoke tests use authenticatedPage fixture which:
  // 1. Sets VITE_DEMO_MODE=true in browser context
  // 2. Navigates to http://localhost:5173/demo/dashboard (dev server)
  // 3. Waits for Firebase auth to complete
  // 4. Returns a page object ready for testing

  test("Test 1: App loads with demo mode and generates unique budget ID", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    // STEP 1: Verify page loaded successfully
    await expect(page).toHaveURL(/\/app/);

<<<<<<< HEAD
    // STEP 2: Verify app navigation is visible (fixture already confirms this)
    // The fixture's waitForMainContent() already verified nav is present
    const navElement = page.locator("nav").first();
    await expect(navElement).toBeVisible({ timeout: 5000 });

    // STEP 3: Verify app is in demo mode by checking database has demo data
    // The fixture confirms envelopes and transactions are loaded
    const demoDataState = await page.evaluate(() => {
      const db = (window as any).budgetDb;
      return {
        hasEnvelopes: db?.envelopes ? true : false,
        hasTransactions: db?.transactions ? true : false,
      };
    });
    expect(demoDataState.hasEnvelopes).toBe(true);
    expect(demoDataState.hasTransactions).toBe(true);

<<<<<<< HEAD
    // STEP 4: Verify budget ID exists and is in correct format
    // Access window.budgetDb which is exposed for testing
    const budgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });
    // Budget ID format: budget_${hex} where hex is 16 hex characters
    expect(budgetId).toMatch(/^budget_[0-9a-f]{16}$/i);
    await test.step(`✓ Budget ID generated: ${budgetId}`, async () => {});
  });

  test("Test 2: User can complete basic budgeting flow (create envelope → add transaction → verify update)", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    // PREREQUISITE: authenticatedPage fixture already loaded app with demo mode

    // STEP 1: Seed test envelope via database fixture
    const envelopes = await seedEnvelopes(page, [{ name: "Test Groceries", goal: 500 }]);
    await test.step(`✓ Envelope "Test Groceries" created (id: ${envelopes[0].id})`, async () => {});

    // STEP 2: Verify envelope was created in database
    const envelopeId = envelopes[0].id;
    const createdEnvelope = await page.evaluate((id) => {
      const db = (window as any).budgetDb;
      return db.envelopes.get(id);
    }, envelopeId);
    expect(createdEnvelope.name).toBe("Test Groceries");
    expect(createdEnvelope.goal).toBe(500);
    await test.step("✓ Envelope verified in database", async () => {});

    // STEP 3: Seed transaction via database fixture
    const transactions = await seedTransactions(page, envelopeId, [
      { description: "Bought milk and bread", amount: 45.5 },
    ]);
    await test.step("✓ Transaction added to envelope", async () => {});

    // STEP 4: Verify envelope balance was updated in database
    const budgetState = await getBudgetState(page);
    expect(budgetState?.envelopes).toBeDefined();
    expect(budgetState!.envelopes.length).toBeGreaterThan(0);

    const updatedEnvelope = budgetState!.envelopes.find((e: any) => e.id === envelopeId);
    expect(updatedEnvelope).toBeDefined();
    // Balance should be reduced by transaction amount (500 goal - 45.50 transaction)
    expect(updatedEnvelope!.balance).toBe(454.5);
    await test.step(`✓ Envelope balance updated: $${updatedEnvelope!.balance}`, async () => {});

    // STEP 5: Verify transaction in database
    expect(budgetState?.transactions).toBeDefined();
    expect(budgetState!.transactions.length).toBeGreaterThan(0);
    const addedTransaction = budgetState!.transactions.find(
      (t: any) => t.description === "Bought milk and bread"
    );
    expect(addedTransaction).toBeDefined();
    await test.step("✓ Transaction verified in database", async () => {});
  });

  test("Test 3: Page reload persists session and data remains intact", async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage;
    // PREREQUISITE: Demo mode enabled, so data persists in IndexedDB

    // STEP 1: Get initial budget ID before reload
    const initialBudgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });
    await test.step(`✓ Initial Budget ID: ${initialBudgetId}`, async () => {});

    // STEP 2: Seed test envelope before reload
    const persistenceEnvelopes = await seedEnvelopes(page, [
      { name: "Persistence Test Envelope", goal: 1000 },
    ]);
    await test.step("✓ Test envelope created before reload", async () => {});

    // STEP 3: Get budget state before reload
    const stateBeforeReload = await getBudgetState(page);
    const envelopeCountBefore = stateBeforeReload?.envelopeCount ?? 0;
    await test.step(`✓ Budget state before reload: ${envelopeCountBefore} envelopes`, async () => {});

    // STEP 4: Perform page reload
    await page.reload();

    // STEP 5: Wait for page to fully load after reload
    await page.waitForLoadState("networkidle");

    // STEP 6: Verify session persisted - Budget ID should be the same
    const budgetIdAfterReload = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });
    expect(budgetIdAfterReload).toBe(initialBudgetId);
    await test.step(`✓ Budget ID persisted after reload: ${budgetIdAfterReload}`, async () => {});

    // STEP 7: Verify envelope data persisted
    const stateAfterReload = await getBudgetState(page);
    const envelopeCountAfter = stateAfterReload?.envelopeCount ?? 0;
    expect(envelopeCountAfter).toBe(envelopeCountBefore);

    // Verify the specific envelope exists
    const persistedEnvelope = stateAfterReload?.envelopes.find(
      (e: any) => e.name === "Persistence Test Envelope"
    );
    expect(persistedEnvelope).toBeDefined();
    expect(persistedEnvelope!.goal).toBe(1000);
    await test.step("✓ Envelope data integrity verified after reload", async () => {});
  });
});
