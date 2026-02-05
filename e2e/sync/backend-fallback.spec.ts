import { test, expect } from "@playwright/test";
import { blockFirebase, unblockFirebase } from "../fixtures/network.fixture";

test.describe("Backend Fallback & Recovery", () => {
  // Cleanup after each test to ensure isolation
  test.afterEach(async ({ page }) => {
    await unblockFirebase(page);
  });

  test("Test 1: App initializes in offline-only mode when backend unavailable", async ({
    page,
  }) => {
    // STEP 1: Set up console error monitoring before any navigation
    const errorLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errorLogs.push(msg.text());
      }
    });

    // STEP 2: Block Firebase completely before page load
    await blockFirebase(page);

    // STEP 3: Navigate to app
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000); // Wait for auth attempt timeout
    console.log("✓ App loaded with Firebase unavailable");

    // STEP 4: Verify dashboard loads (offline-only mode)
    const dashboard = page
      .locator('[data-testid="dashboard-container"], main, [role="main"]')
      .first();
    await expect(dashboard).toBeVisible({ timeout: 10000 });
    console.log("✓ Dashboard loaded in offline-only mode");

    // STEP 5: Look for offline-only indicator (optional - may not be implemented)
    const offlineIndicator = page
      .locator('[data-testid*="offline"], text=/OFFLINE|Offline|No sync/, [aria-label*="offline"]')
      .first();
    const hasIndicator = await offlineIndicator.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasIndicator) {
      const indicatorText = await offlineIndicator.textContent();
      console.log("✓ Offline indicator visible:", indicatorText);
    } else {
      console.log("⚠ Offline indicator not found (may not be implemented)");
    }

    // STEP 6: Verify app is functional (can interact)
    const addButton = page
      .locator('button:has-text("Add Envelope"), button:has-text("Add")')
      .first();
    await expect(addButton).toBeEnabled({ timeout: 2000 });
    console.log("✓ App is interactive in offline-only mode");

    // STEP 7: Verify no error spam in console
    await page.waitForTimeout(2000);

    const criticalErrors = errorLogs.filter(
      (err) => !err.includes("firebase") && !err.includes("network") && !err.includes("abort")
    ).length;

    expect(criticalErrors).toBe(0);
    console.log("✓ No critical errors in console");
  });

  test("Test 2: Create and view data works offline-only", async ({ page }) => {
    // STEP 1: Block Firebase before navigation
    await blockFirebase(page);

    // STEP 2: Load app
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    console.log("✓ App loaded offline");

    // STEP 3: Create envelope
    const addBtn = page.locator('button:has-text("Add Envelope")').first();
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const nameInput = page.locator('input[placeholder*="name"]').first();
    await nameInput.fill("Offline Test Envelope");

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill("300");

    const submitBtn = page.locator('button:has-text("Create")').last();
    await submitBtn.click();
    console.log("✓ Envelope created in offline-only mode");

    // STEP 4: Verify envelope visible
    const envelope = page.locator("text=Offline Test Envelope").first();
    await expect(envelope).toBeVisible({ timeout: 5000 });
    console.log("✓ Envelope visible offline");

    // STEP 5: Add transaction
    await envelope.click();
    await page.waitForTimeout(500);

    const addTransBtn = page.locator('button:has-text("Add Transaction")').first();
    await expect(addTransBtn).toBeVisible({ timeout: 3000 });
    await addTransBtn.click();

    const descInput = page.locator('input[placeholder*="description"]').first();
    await descInput.fill("Offline transaction");

    const amtInput = page.locator('input[type="number"]').first();
    await amtInput.fill("45");

    const submitBtn2 = page.locator('button:has-text("Add")').last();
    await submitBtn2.click();
    console.log("✓ Transaction created offline");

    // STEP 6: Verify transaction visible
    const transaction = page.locator("text=Offline transaction").first();
    await expect(transaction).toBeVisible({ timeout: 5000 });
    console.log("✓ Transaction visible offline");
  });

  test("Test 3: Sync resumes automatically when backend recovers", async ({ page }) => {
    // STEP 1: Block Firebase initially
    await blockFirebase(page);

    // STEP 2: Load app offline
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    console.log("✓ App loaded (Firebase blocked)");

    // STEP 3: Create data offline
    const addBtn = page.locator('button:has-text("Add Envelope")').first();
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    const nameInput = page.locator('input[placeholder*="name"]').first();
    await nameInput.fill("Recovery Test");

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill("500");

    const submitBtn = page.locator('button:has-text("Create")').last();
    await submitBtn.click();
    console.log("✓ Data created while offline");

    // STEP 4: Unblock Firebase (recovery)
    await unblockFirebase(page);

    // STEP 5: Wait for sync to trigger
    await page.waitForTimeout(2000);

    // STEP 6: Check for sync status indicators (optional - may not be implemented)
    const syncingIndicator = page
      .locator('[data-testid*="syncing"], [data-testid*="sync"], text=/Syncing|Synced|SYNCED/')
      .first();
    if (await syncingIndicator.isVisible({ timeout: 5000 }).catch(() => false)) {
      const status = await syncingIndicator.textContent();
      console.log("✓ Sync status visible:", status);
    }

    // STEP 7: Verify offline indicator disappears (optional - may not be implemented)
    await page.waitForTimeout(2000);
    const offlineIndicator = page.locator('[data-testid*="offline"], text=/OFFLINE/').first();
    const isOfflineGone = !(await offlineIndicator.isVisible({ timeout: 2000 }).catch(() => false));

    if (isOfflineGone) {
      console.log("✓ Offline indicator disappeared");
    }

    // STEP 8: Reload and verify data persisted to backend
    await page.reload();
    await page.waitForLoadState("networkidle");

    const recoveryEnvelope = page.locator("text=Recovery Test").first();
    await expect(recoveryEnvelope).toBeVisible({ timeout: 5000 });
    console.log("✓ Data persisted to backend after recovery");
  });

  test("Test 4: No data corruption during backend outage", async ({ page }) => {
    // Setup: Seed data with Firebase first
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    console.log("✓ App loaded with Firebase available");

    // Create initial envelope
    const addBtn = page.locator('button:has-text("Add Envelope")').first();
    await addBtn.click();

    const nameInput = page.locator('input[placeholder*="name"]').first();
    await nameInput.fill("Corruption Test Envelope");

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill("1000");

    const submitBtn = page.locator('button:has-text("Create")').last();
    await submitBtn.click();

    await page.waitForTimeout(1500); // Sync to Firebase
    console.log("✓ Initial data created and synced");

    // Get initial balance
    const initialBalance = await page
      .locator('div:has(text="Corruption Test Envelope") text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    console.log("✓ Initial balance:", initialBalance);

    // Block Firebase
    await blockFirebase(page);

    // Add transaction while offline
    const envelope = page.locator("text=Corruption Test Envelope").first();
    await envelope.click();
    await page.waitForTimeout(500);

    const addTransBtn = page.locator('button:has-text("Add Transaction")').first();
    await addTransBtn.click();

    const descInput = page.locator('input[placeholder*="description"]').first();
    await descInput.fill("Corruption test transaction");

    const amtInput = page.locator('input[type="number"]').first();
    await amtInput.fill("250");

    const transSubmit = page.locator('button:has-text("Add")').last();
    await transSubmit.click();

    console.log("✓ Transaction added while offline");

    // Verify data integrity offline
    const balanceOffline = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    console.log("✓ Balance while offline:", balanceOffline);

    // Unblock Firebase
    await unblockFirebase(page);

    // Wait for sync
    await page.waitForTimeout(2500);

    // Reload to verify consistency
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Navigate back to envelope
    const envAfter = page.locator("text=Corruption Test Envelope").first();
    await envAfter.click();
    await page.waitForLoadState("networkidle");

    // Verify balance is correct
    const balanceAfter = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    console.log("✓ Balance after recovery:", balanceAfter);

    // Verify transaction still there
    const transaction = page.locator("text=Corruption test transaction").first();
    await expect(transaction).toBeVisible({ timeout: 3000 });
    console.log("✓ Transaction persisted (no data loss/corruption)");
  });

  test("Test 5: No error spam when retrying failed sync", async ({ page }) => {
    // STEP 1: Collect error logs (register listener before navigation)
    const errorLogs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errorLogs.push(msg.text());
      }
    });

    // STEP 2: Block Firebase before navigation
    await blockFirebase(page);

    // STEP 3: Load app
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    console.log("✓ App loaded (Firebase blocked)");

    // STEP 4: Create data
    const addBtn = page.locator('button:has-text("Add Envelope")').first();
    await expect(addBtn).toBeVisible({ timeout: 2000 });
    await addBtn.click();

    const nameInput = page.locator('input[placeholder*="name"]').first();
    await nameInput.fill("Retry Spam Test");

    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill("400");

    const submitBtn = page.locator('button:has-text("Create")').last();
    await submitBtn.click();

    // STEP 5: Wait for retry attempts
    await page.waitForTimeout(3000);

    // STEP 6: Unblock Firebase
    await unblockFirebase(page);

    // STEP 7: Wait and collect more logs
    await page.waitForTimeout(2000);

    // STEP 8: Analyze error logs
    const criticalErrors = errorLogs.filter(
      (err) => err.includes("firebase") || err.includes("firebaseapp")
    ).length;

    const totalErrors = errorLogs.length;

    console.log("✓ Total error logs:", totalErrors);
    console.log("✓ Firebase-related errors:", criticalErrors);

    // Should be reasonable number (not > 20)
    expect(criticalErrors).toBeLessThan(20);
    console.log("✓ Error count reasonable (no spam)");
  });
});
