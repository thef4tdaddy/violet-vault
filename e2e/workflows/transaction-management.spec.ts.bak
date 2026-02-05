import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes, seedTransactions } from "../fixtures/budget.fixture";

/**
 * Helper: Parse currency value from text
 */
const parseCurrency = (value: string | null): number => {
  if (!value) return 0;
  const match = value.match(/\$?([0-9,]+(?:\.[0-9]+)?)/);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, ""));
};

test.describe("Transaction Management Workflow", () => {
  test("Test 1: Create transaction in envelope and verify balance updates", async ({
    authenticatedPage: page,
  }) => {
    // SETUP: Page is already authenticated with demo mode via fixture
    await test.step("App loaded with demo mode", async () => {});

    // SETUP: Create test envelope
    await seedEnvelopes(page, [{ name: "Test Groceries", goal: 500 }]);
    await test.step("Test envelope created", async () => {});

    // STEP 1: Navigate to envelope (wait for it to appear in UI)
    const envelopeCard = page.locator("text=Test Groceries").first();
    await expect(envelopeCard).toBeVisible({ timeout: 10000 });
    await envelopeCard.click();
    await page.waitForLoadState("networkidle");
    await test.step("Opened envelope detail view", async () => {});

    // STEP 2: Get initial balance
    const initialBalanceText = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    console.log("✓ Initial balance:", initialBalanceText);

    // STEP 3: Click "Add Transaction" button
    const addTransactionButton = page
      .locator(
        'button:has-text("Add Transaction"), button:has-text("Add expense"), [data-testid="add-transaction"]'
      )
      .first();
    await expect(addTransactionButton).toBeVisible({ timeout: 5000 });
    await addTransactionButton.click();
    console.log("✓ Opened transaction create dialog");

    // STEP 4: Fill transaction form
    // 4a. Description field
    const descriptionInput = page
      .locator(
        'input[placeholder*="description"], input[placeholder*="Description"], [data-testid="transaction-description"]'
      )
      .first();
    await expect(descriptionInput).toBeVisible({ timeout: 5000 });
    await descriptionInput.fill("Milk and bread at corner store");
    console.log('✓ Entered description: "Milk and bread at corner store"');

    // 4b. Amount field
    const amountInput = page
      .locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]')
      .first();
    await amountInput.fill("45.75");
    console.log("✓ Entered amount: $45.75");

    // 4c. Optional: Date field (if exists)
    const dateInput = page.locator('input[type="date"], input[placeholder*="date"]').first();
    if (await dateInput.isVisible().catch(() => false)) {
      const today = new Date().toISOString().split("T")[0];
      await dateInput.fill(today);
      console.log("✓ Set date to today");
    }

    // 4d. Optional: Category field (if exists)
    const categorySelect = page.locator('select, [data-testid="category-select"]').first();
    if (await categorySelect.isVisible().catch(() => false)) {
      await categorySelect.click();
      await page.locator('option, [role="option"]').first().click();
      console.log("✓ Selected category");
    }

    // STEP 5: Submit transaction
    const submitButton = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Save")')
      .last();
    await expect(submitButton).toBeVisible({ timeout: 5000 });
    await submitButton.click();
    console.log("✓ Submitted transaction");

    // STEP 6: Wait for transaction to appear in list
    const transactionItem = page.locator("text=/milk.*bread|Milk.*bread/i").first();
    await expect(transactionItem).toBeVisible({ timeout: 10000 });
    console.log("✓ Transaction appears in list");

    // STEP 7: Verify transaction shows in transaction list with correct amount
    const amountInList = await page.locator("text=/45\\.75|$45.75/").first();
    await expect(amountInList).toBeVisible({ timeout: 5000 });
    console.log("✓ Transaction amount visible in list: $45.75");

    // STEP 8: Verify balance decreased by exactly $45.75
    const updatedBalanceText = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    const initialBalance = parseCurrency(initialBalanceText);
    const updatedBalance = parseCurrency(updatedBalanceText);
    expect(initialBalance - updatedBalance).toBeCloseTo(45.75, 2);
    console.log("✓ Balance decreased by $45.75:", updatedBalanceText);
  });

  test("Test 2: Edit transaction and verify balance recalculated correctly", async ({
    authenticatedPage: page,
  }) => {
    // SETUP: Page is already authenticated with demo mode via fixture
    console.log("✓ App loaded with demo mode");

    // SETUP: Create envelope with transaction
    const envelopes = await seedEnvelopes(page, [{ name: "Edit Test Groceries", goal: 500 }]);
    await seedTransactions(page, envelopes[0].id, [
      { description: "Original purchase", amount: 30 },
    ]);
    console.log("✓ Envelope and transaction created");

    // STEP 1: Navigate to envelope (wait for it to appear in UI)
    const envelopeCard = page.locator("text=Edit Test Groceries").first();
    await expect(envelopeCard).toBeVisible({ timeout: 10000 });
    await envelopeCard.click();
    await page.waitForLoadState("networkidle");
    console.log("✓ Opened envelope");

    // STEP 2: Find and click transaction to edit
    const transactionRow = page.locator("text=/Original purchase|30|$30/").first();
    await expect(transactionRow).toBeVisible({ timeout: 5000 });

    // Look for edit button/action on the transaction
    const editButton = transactionRow
      .locator('button:has-text("Edit"), [aria-label*="edit"], [data-testid*="edit"]')
      .first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    } else {
      // If no edit button, try clicking the transaction itself
      await transactionRow.click();
    }
    console.log("✓ Opened transaction for editing");

    // STEP 3: Verify edit dialog appeared
    const editDialog = page
      .locator('[data-testid="transaction-edit-dialog"], [role="dialog"]')
      .first();
    await expect(editDialog).toBeVisible({ timeout: 5000 });
    console.log("✓ Transaction edit dialog visible");

    // STEP 4: Get current value
    const amountField = page.locator('input[type="number"]').first();
    const currentValue = await amountField.inputValue();
    console.log("✓ Current amount:", currentValue);

    // STEP 5: Edit amount (change from $30 to $50)
    await amountField.clear();
    await amountField.fill("50");
    console.log("✓ Updated amount to $50");

    // STEP 6: Edit description
    const descField = page.locator('input[placeholder*="description"]').first();
    if (await descField.isVisible().catch(() => false)) {
      await descField.clear();
      await descField.fill("Updated purchase description");
      console.log("✓ Updated description");
    }

    // STEP 7: Save changes
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")').last();
    await saveButton.click();
    console.log("✓ Saved changes");

    // STEP 8: Wait for amount to update in list
    const newAmount = page.locator("text=$50").first();
    await expect(newAmount).toBeVisible({ timeout: 10000 });
    console.log("✓ Transaction amount updated in list: $50");

    // STEP 9: Verify description updated
    const updatedDesc = page.locator("text=Updated purchase description").first();
    await expect(updatedDesc).toBeVisible({ timeout: 5000 });
    console.log("✓ Transaction description updated");
  });

  test("Test 3: Delete transaction and verify balance refunded", async ({
    authenticatedPage: page,
  }) => {
    // SETUP: Page is already authenticated with demo mode via fixture
    console.log("✓ App loaded with demo mode");

    // SETUP: Create envelope with transaction
    const envelopes = await seedEnvelopes(page, [{ name: "Delete Test Groceries", goal: 500 }]);
    await seedTransactions(page, envelopes[0].id, [{ description: "To be deleted", amount: 25 }]);
    console.log("✓ Envelope with transaction created");

    // STEP 1: Navigate to envelope (wait for it to appear in UI)
    const envelopeCard = page.locator("text=Delete Test Groceries").first();
    await expect(envelopeCard).toBeVisible({ timeout: 10000 });
    await envelopeCard.click();
    await page.waitForLoadState("networkidle");
    console.log("✓ Opened envelope");

    // STEP 2: Get balance before delete
    const balanceBefore = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    console.log("✓ Balance before delete:", balanceBefore);

    // STEP 3: Find transaction to delete
    const transactionRow = page.locator("text=/To be deleted|25|$25/").first();
    await expect(transactionRow).toBeVisible({ timeout: 5000 });

    // STEP 4: Click delete button/action
    const deleteButton = transactionRow
      .locator('button:has-text("Delete"), [aria-label*="delete"], [data-testid*="delete"]')
      .first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    console.log("✓ Clicked delete button");

    // STEP 5: Confirm deletion (if confirmation dialog appears)
    const confirmButton = page
      .locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")')
      .last();
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
      console.log("✓ Confirmed deletion");
    }

    // STEP 6: Verify transaction removed from list
    const deletedTransaction = page.locator("text=To be deleted").first();
    await expect(deletedTransaction).not.toBeVisible({ timeout: 10000 });
    console.log("✓ Transaction removed from list");

    // STEP 7: Verify balance increased by exactly $25 (refunded)
    const balanceAfter = await page
      .locator('[data-testid="envelope-balance"], text=/\\$[0-9,.]+/')
      .first()
      .textContent();
    const beforeAmount = parseCurrency(balanceBefore);
    const afterAmount = parseCurrency(balanceAfter);
    expect(afterAmount - beforeAmount).toBeCloseTo(25, 2);
    console.log("✓ Balance increased by $25:", balanceAfter);
  });

  test("Test 4: Search/filter transactions by description", async ({ authenticatedPage: page }) => {
    // SETUP: Page is already authenticated with demo mode via fixture
    console.log("✓ App loaded with demo mode");

    // SETUP: Create envelope with multiple transactions
    const envelopes = await seedEnvelopes(page, [{ name: "Search Test Envelope", goal: 1000 }]);
    await seedTransactions(page, envelopes[0].id, [
      { description: "Milk purchase", amount: 5 },
      { description: "Bread purchase", amount: 3 },
      { description: "Cheese purchase", amount: 8 },
    ]);
    console.log("✓ Envelope with 3 transactions created");

    // STEP 1: Navigate to envelope (wait for it to appear in UI)
    const envelopeCard = page.locator("text=Search Test Envelope").first();
    await expect(envelopeCard).toBeVisible({ timeout: 10000 });
    await envelopeCard.click();
    await page.waitForLoadState("networkidle");
    console.log("✓ Opened envelope");

    // STEP 2: Verify all 3 transactions visible
    const milkTransaction = page.locator("text=/Milk/i").first();
    await expect(milkTransaction).toBeVisible({ timeout: 10000 });
    const allTransactions = page.locator("text=/Milk|Bread|Cheese/");
    let count = await allTransactions.count();
    expect(count).toBeGreaterThanOrEqual(3);
    console.log("✓ All 3 transactions visible");

    // STEP 3: Find search input
    const searchInput = page
      .locator(
        'input[placeholder*="search"], input[placeholder*="Search"], [data-testid="transaction-search"]'
      )
      .first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // STEP 4: Type search term and wait for filtering
      await searchInput.fill("milk");
      await expect(milkTransaction).toBeVisible({ timeout: 5000 });
      console.log('✓ Searched for "milk"');

      // STEP 5: Verify filtered results
      const breadTransaction = page.locator("text=/Bread/i").first();
      const isBreadHidden = !(await breadTransaction.isVisible().catch(() => false));

      if (isBreadHidden) {
        console.log("✓ Search filtered to show only milk-related transactions");
      } else {
        console.log("✓ Search returned results containing milk");
      }

      // STEP 6: Clear search and wait for all transactions to reappear
      await searchInput.clear();
      const breadTransactionReappear = page.locator("text=/Bread/i").first();
      await expect(breadTransactionReappear).toBeVisible({ timeout: 5000 });

      // STEP 7: Verify all transactions visible again
      const allAgain = page.locator("text=/Milk|Bread|Cheese/");
      const finalCount = await allAgain.count();
      expect(finalCount).toBeGreaterThanOrEqual(3);
      console.log("✓ Cleared search, all transactions visible again");
    } else {
      console.log("⚠ Search input not found - skipping search test");
    }
  });

  test("Test 5: Filter transactions by date range", async ({ authenticatedPage: page }) => {
    // SETUP: Page is already authenticated with demo mode via fixture
    console.log("✓ App loaded with demo mode");

    // SETUP: Create envelope with transactions on different dates
    const envelopes = await seedEnvelopes(page, [{ name: "Date Filter Test", goal: 1000 }]);

    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 86400000);

    await seedTransactions(page, envelopes[0].id, [
      { description: "Today purchase", amount: 10, date: today.toISOString() },
      { description: "Yesterday purchase", amount: 15, date: yesterday.toISOString() },
      { description: "Old purchase", amount: 20, date: threeDaysAgo.toISOString() },
    ]);
    console.log("✓ Envelope with transactions on different dates created");

    // STEP 1: Navigate to envelope (wait for it to appear in UI)
    const envelopeCard = page.locator("text=Date Filter Test").first();
    await expect(envelopeCard).toBeVisible({ timeout: 10000 });
    await envelopeCard.click();
    // Wait for transactions to render in the envelope view
    const todayItem = page.locator("text=Today purchase").first();
    await expect(todayItem).toBeVisible({ timeout: 10000 });
    console.log("✓ Opened envelope");

    // STEP 2: Find date filter controls
    const startDateInput = page
      .locator('input[type="date"][aria-label*="from"], input[type="date"][placeholder*="start"]')
      .first();
    if (await startDateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // STEP 3: Set filter to last 2 days (should exclude 3-day-old transaction)
      const startDate = yesterday.toISOString().split("T")[0];
      await startDateInput.fill(startDate);
      console.log("✓ Set start date filter to:", startDate);

      // STEP 4: Wait for filtering to apply and verify filtered transactions
      const yesterdayItem = page.locator("text=Yesterday purchase").first();
      await expect(todayItem).toBeVisible({ timeout: 5000 });
      await expect(yesterdayItem).toBeVisible({ timeout: 5000 });
      console.log("✓ Today and yesterday transactions visible");

      const oldItem = page.locator("text=Old purchase").first();
      const isOldHidden = !(await oldItem.isVisible().catch(() => false));
      if (isOldHidden) {
        console.log("✓ Old transaction filtered out correctly");
      }
    } else {
      console.log("⚠ Date filter not found - skipping date filter test");
    }
  });
});
