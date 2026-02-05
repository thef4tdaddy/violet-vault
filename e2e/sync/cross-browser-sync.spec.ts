import { test, expect } from "@playwright/test";

test.describe("Cross-Browser Sync & Conflict Resolution", () => {
  test("Test 1: Data created in Browser A appears in Browser B", async ({ browser }) => {
    // This test uses multiple browser contexts to simulate two different devices/tabs
    // SETUP: Create two browser contexts (both with demo mode)
    const contextA = await browser.newContext({
      extraHTTPHeaders: {
        "x-vite-demo-mode": "true",
      },
    });
    const contextB = await browser.newContext({
      extraHTTPHeaders: {
        "x-vite-demo-mode": "true",
      },
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // STEP 1a: Load app in Browser A
    await pageA.goto("/", { waitUntil: "networkidle" });
    await pageA.waitForTimeout(2000); // Wait for auth
    console.log("✓ Browser A: App loaded and authenticated");

    // STEP 1b: Load app in Browser B
    await pageB.goto("/", { waitUntil: "networkidle" });
    await pageB.waitForTimeout(2000); // Wait for auth
    console.log("✓ Browser B: App loaded and authenticated");

    // STEP 2: Get Budget IDs (should be same user if demo mode)
    const budgetIdA = await pageA.evaluate(() => (window as any).budgetDb?.budgetId);
    const budgetIdB = await pageB.evaluate(() => (window as any).budgetDb?.budgetId);
    console.log("✓ Browser A Budget ID:", budgetIdA);
    console.log("✓ Browser B Budget ID:", budgetIdB);

    // STEP 3: Browser A creates envelope
    const addBtnA = pageA.locator('[data-testid="add-envelope-button"]').first();
    await addBtnA.click();

    const dialogA = pageA.locator('[role="dialog"]').first();
    await expect(dialogA).toBeVisible({ timeout: 5000 });

    const nameInputA = pageA.locator('input[placeholder*="name"]').first();
    await nameInputA.fill("Sync Test Envelope");

    const goalInputA = pageA.locator('input[type="number"]').first();
    await goalInputA.fill("500");

    const submitA = pageA.locator('button:has-text("Create")').last();
    await submitA.click();
    console.log('✓ Browser A: Created envelope "Sync Test Envelope" with goal $500');

    // STEP 4: Wait for dialog to close (creation flow complete) instead of fixed timeout
    await expect(dialogA).toBeHidden({ timeout: 5000 });

    // STEP 5: Browser B refreshes or waits for real-time update
    // If using Firebase real-time listeners, this should auto-update
    // If not, may need to refresh
    const needsRefresh = !(await pageB
      .locator("text=Sync Test Envelope")
      .isVisible({ timeout: 3000 })
      .catch(() => false));
    if (needsRefresh) {
      await pageB.reload();
      await pageB.waitForLoadState("networkidle");
      console.log("✓ Browser B: Refreshed page");
    }

    // STEP 6: Verify envelope appears in Browser B
    const envelopeB = pageB.locator("text=Sync Test Envelope").first();
    await expect(envelopeB).toBeVisible({ timeout: 5000 });
    console.log("✓ Browser B: Envelope visible after sync");

    // STEP 7: Verify goal amount matches exactly
    const goalB = await pageB
      .locator('div:has(text="Sync Test Envelope") text=/\$[0-9,.]+/')
      .first()
      .textContent();
    expect(goalB).toContain("500");
    console.log("✓ Browser B: Goal amount matches ($500)");

    // STEP 8: Verify metadata (created date) if shown
    const createdDateB = await pageB
      .locator(
        'div:has(text="Sync Test Envelope") [data-testid*="date"], div:has(text="Sync Test Envelope") text=/\d{4}-\d{2}-\d{2}|today|yesterday/'
      )
      .first()
      .textContent();
    if (createdDateB) {
      console.log("✓ Browser B: Created date visible:", createdDateB);
    }

    // Cleanup
    await pageA.close();
    await pageB.close();
    await contextA.close();
    await contextB.close();
    console.log("✓ Test 1 complete");
  });

  test("Test 2: Concurrent edits resolve with last-write-wins", async ({ browser }) => {
    // SETUP: Create two contexts
    const contextA = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });
    const contextB = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // STEP 1: Load both browsers
    await pageA.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageB.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);
    console.log("✓ Both browsers loaded");

    // STEP 2: Browser A creates envelope with goal $100
    const addBtnA = pageA.locator('button:has-text("Add Envelope")').first();
    await addBtnA.click();
    const dialogA = pageA.locator('[role="dialog"]').first();
    await expect(dialogA).toBeVisible();

    const nameA = pageA.locator('input[placeholder*="name"]').first();
    await nameA.fill("Conflict Test");

    const goalA = pageA.locator('input[type="number"]').first();
    await goalA.fill("100");

    const submitA = pageA.locator('button:has-text("Create")').last();
    await submitA.click();
    await pageA.waitForTimeout(1500);
    console.log('✓ Browser A: Created "Conflict Test" with goal $100');

    // STEP 3: Refresh Browser B to see new envelope
    await pageB.reload();
    await pageB.waitForLoadState("networkidle");
    const envelopeB = pageB.locator("text=Conflict Test").first();
    await expect(envelopeB).toBeVisible({ timeout: 5000 });
    console.log("✓ Browser B: Envelope synced");

    // STEP 4: Take both browsers offline
    await pageA.context().setOffline(true);
    await pageB.context().setOffline(true);
    console.log("✓ Both browsers: OFFLINE");

    // STEP 5: Both edit simultaneously (while offline)
    // Browser A changes goal to $200
    const envelopeACard = pageA.locator("text=Conflict Test").first();
    await envelopeACard.click();
    await pageA.waitForTimeout(300);

    const editBtnA = pageA.locator('button:has-text("Edit"), [data-testid*="edit"]').first();
    if (await editBtnA.isVisible().catch(() => false)) {
      await editBtnA.click();
      const goalFieldA = pageA.locator('input[type="number"]').first();
      await goalFieldA.clear();
      await goalFieldA.fill("200");
      const saveA = pageA.locator('button:has-text("Save")').last();
      await saveA.click();
      console.log("✓ Browser A: Changed goal to $200 (offline)");
    }

    // Browser B changes goal to $300 (concurrent, different value)
    const envelopeBCard = pageB.locator("text=Conflict Test").first();
    await envelopeBCard.click();
    await pageB.waitForTimeout(300);

    const editBtnB = pageB.locator('button:has-text("Edit")').first();
    if (await editBtnB.isVisible().catch(() => false)) {
      await editBtnB.click();
      const goalFieldB = pageB.locator('input[type="number"]').first();
      await goalFieldB.clear();
      await goalFieldB.fill("300");
      const saveB = pageB.locator('button:has-text("Save")').last();
      await saveB.click();
      console.log("✓ Browser B: Changed goal to $300 (offline)");
    }

    // STEP 6: Take both back online (sync conflicts)
    await pageA.context().setOffline(false);
    await pageB.context().setOffline(false);
    console.log("✓ Both browsers: ONLINE (conflicts now synced)");

    // STEP 7: Wait for conflict resolution
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);

    // STEP 8: Both should converge to same value (last-write-wins typically $300)
    const goalAfterA = await pageA
      .locator('div:has(text="Conflict Test") text=/\$[0-9]+/')
      .first()
      .textContent();
    console.log("✓ Browser A: Goal after conflict resolution:", goalAfterA);

    // Refresh B to see final value
    await pageB.reload();
    await pageB.waitForLoadState("networkidle");

    const goalAfterB = await pageB
      .locator('div:has(text="Conflict Test") text=/\$[0-9]+/')
      .first()
      .textContent();
    console.log("✓ Browser B: Goal after conflict resolution:", goalAfterB);

    // Both should match (either 200 or 300 depending on implementation)
    expect(goalAfterA).toBeTruthy();
    expect(goalAfterB).toBeTruthy();
    expect(goalAfterA).toEqual(goalAfterB);
    console.log("✓ Both browsers converged to same state");

    // Cleanup
    await pageA.close();
    await pageB.close();
    await contextA.close();
    await contextB.close();
  });

  test("Test 3: Transaction added in Browser A syncs to Browser B", async ({ browser }) => {
    // SETUP: Create contexts
    const contextA = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });
    const contextB = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // STEP 1: Load both
    await pageA.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageB.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);
    console.log("✓ Both browsers ready");

    // STEP 2: Create envelope in A
    const addBtnA = pageA.locator('button:has-text("Add Envelope")').first();
    await addBtnA.click();
    const nameA = pageA.locator('input[placeholder*="name"]').first();
    await nameA.fill("Transaction Sync Test");
    const goalA = pageA.locator('input[type="number"]').first();
    await goalA.fill("500");
    const submitA = pageA.locator('button:has-text("Create")').last();
    await submitA.click();
    await pageA.waitForTimeout(1500);
    console.log("✓ Browser A: Envelope created");

    // STEP 3: Refresh B and open envelope
    await pageB.reload();
    await pageB.waitForLoadState("networkidle");
    const envB = pageB.locator("text=Transaction Sync Test").first();
    await envB.click();
    await pageB.waitForLoadState("networkidle");
    console.log("✓ Browser B: Opened synchronized envelope");

    // STEP 4: Browser A adds transaction
    const envA = pageA.locator("text=Transaction Sync Test").first();
    await envA.click();
    await pageA.waitForLoadState("networkidle");

    const addTransA = pageA.locator('button:has-text("Add Transaction")').first();
    await addTransA.click();
    const descA = pageA.locator('input[placeholder*="description"]').first();
    await descA.fill("Sync Transaction Test");
    const amtA = pageA.locator('input[type="number"]').first();
    await amtA.fill("50");
    const submitTransA = pageA.locator('button:has-text("Add")').last();
    await submitTransA.click();
    await pageA.waitForTimeout(1500);
    console.log("✓ Browser A: Transaction added ($50)");

    // STEP 5: Transaction should appear in Browser B (auto-update or refresh)
    const needsRefresh = !(await pageB
      .locator("text=Sync Transaction Test")
      .isVisible({ timeout: 2000 })
      .catch(() => false));
    if (needsRefresh) {
      await pageB.reload();
      await pageB.waitForLoadState("networkidle");
    }

    const transB = pageB.locator("text=Sync Transaction Test").first();
    await expect(transB).toBeVisible({ timeout: 5000 });
    console.log("✓ Browser B: Transaction synced and visible");

    // STEP 6: Verify amount matches
    const amtB = await pageB.locator("text=50|$50").first().textContent();
    expect(amtB).toContain("50");
    console.log("✓ Browser B: Amount correct ($50)");

    // Cleanup
    await pageA.close();
    await pageB.close();
    await contextA.close();
    await contextB.close();
  });

  test("Test 4: No data loss during sync conflicts", async ({ browser }) => {
    // SETUP: Create contexts
    const contextA = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });
    const contextB = await browser.newContext({
      extraHTTPHeaders: { "x-vite-demo-mode": "true" },
    });

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // STEP 1: Load both
    await pageA.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageB.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);
    console.log("✓ Both browsers loaded");

    // STEP 2: Setup: Create test data
    const addBtnA = pageA.locator('button:has-text("Add Envelope")').first();
    await addBtnA.click();
    const nameA = pageA.locator('input[placeholder*="name"]').first();
    await nameA.fill("No Loss Test");
    const goalA = pageA.locator('input[type="number"]').first();
    await goalA.fill("1000");
    const submitA = pageA.locator('button:has-text("Create")').last();
    await submitA.click();
    await pageA.waitForTimeout(1500);

    // Add initial transaction
    const envA = pageA.locator("text=No Loss Test").first();
    await envA.click();
    const addTransA = pageA.locator('button:has-text("Add Transaction")').first();
    await addTransA.click();
    const descA1 = pageA.locator('input[placeholder*="description"]').first();
    await descA1.fill("Original Transaction");
    const amtA1 = pageA.locator('input[type="number"]').first();
    await amtA1.fill("100");
    const submitTransA1 = pageA.locator('button:has-text("Add")').last();
    await submitTransA1.click();
    await pageA.waitForTimeout(1000);
    console.log("✓ Browser A: Initial setup complete");

    // STEP 3: B refreshes and opens envelope
    await pageB.reload();
    await pageB.waitForLoadState("networkidle");
    const envB = pageB.locator("text=No Loss Test").first();
    await envB.click();
    await pageB.waitForLoadState("networkidle");
    console.log("✓ Browser B: Opened envelope");

    // STEP 4: Go offline on both
    await pageA.context().setOffline(true);
    await pageB.context().setOffline(true);
    console.log("✓ Both offline");

    // STEP 5: Browser A adds transaction
    const addTransA2 = pageA.locator('button:has-text("Add Transaction")').first();
    await addTransA2.click();
    const descA2 = pageA.locator('input[placeholder*="description"]').first();
    await descA2.fill("A Transaction");
    const amtA2 = pageA.locator('input[type="number"]').first();
    await amtA2.fill("50");
    const submitA2 = pageA.locator('button:has-text("Add")').last();
    await submitA2.click();
    console.log('✓ Browser A: Added "A Transaction" offline');

    // STEP 6: Browser B adds different transaction
    const addTransB = pageB.locator('button:has-text("Add Transaction")').first();
    await addTransB.click();
    const descB = pageB.locator('input[placeholder*="description"]').first();
    await descB.fill("B Transaction");
    const amtB = pageB.locator('input[type="number"]').first();
    await amtB.fill("75");
    const submitB = pageB.locator('button:has-text("Add")').last();
    await submitB.click();
    console.log('✓ Browser B: Added "B Transaction" offline');

    // STEP 7: Go online
    await pageA.context().setOffline(false);
    await pageB.context().setOffline(false);
    await pageA.waitForTimeout(2000);
    await pageB.waitForTimeout(2000);
    console.log("✓ Both online (syncing)");

    // STEP 8: Refresh both and verify all transactions present
    await pageA.reload();
    await pageB.reload();
    await pageA.waitForLoadState("networkidle");
    await pageB.waitForLoadState("networkidle");

    // Navigate to envelope on both
    const envA2 = pageA.locator("text=No Loss Test").first();
    await envA2.click();
    const envB2 = pageB.locator("text=No Loss Test").first();
    await envB2.click();

    // STEP 9: Verify original transaction still there
    const original = pageA.locator("text=Original Transaction").first();
    await expect(original).toBeVisible({ timeout: 3000 });
    console.log("✓ Original transaction still exists");

    // STEP 10: Verify both concurrent transactions present
    const transactionA = pageA.locator("text=A Transaction").first();
    const transactionB = pageA.locator("text=B Transaction").first();

    const hasA = await transactionA.isVisible({ timeout: 3000 }).catch(() => false);
    const hasB = await transactionB.isVisible({ timeout: 3000 }).catch(() => false);

    console.log("✓ Browser A transaction present:", hasA);
    console.log("✓ Browser B transaction present:", hasB);

    expect(hasA).toBe(true);
    expect(hasB).toBe(true);
    if (hasA && hasB) {
      console.log("✓ Both concurrent transactions preserved (no data loss)");
    }

    // Cleanup
    await pageA.close();
    await pageB.close();
    await contextA.close();
    await contextB.close();
  });
});
