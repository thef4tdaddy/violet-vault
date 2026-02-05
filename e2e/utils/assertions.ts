import { expect, Page } from "@playwright/test";

/**
 * Custom Assertions for Violet Vault E2E Tests
 *
 * Provides domain-specific assertions for budgeting operations.
 * These helpers make tests more readable and maintainable.
 */

/**
 * Assert that an envelope balance has decreased by expected amount
 *
 * @param envelopeName - Name of the envelope to check
 * @param previousBalance - Previous balance value
 * @param expectedDecrease - Expected decrease amount
 * @param page - Playwright page object
 */
export async function assertEnvelopeBalanceDecreased(
  page: Page,
  envelopeName: string,
  previousBalance: number,
  expectedDecrease: number
) {
  const envelopeLocator = page.locator(`text=${envelopeName}`).first();
  await expect(envelopeLocator).toBeVisible();

  const balanceText = await page
    .locator(
      `div:has(text="${envelopeName}") [data-testid="balance"], div:has(text="${envelopeName}") text=/\$[0-9,.]+/`
    )
    .first()
    .textContent();

  const newBalance = parseFloat(balanceText?.replace(/[^0-9.]/g, "") || "0");
  const expectedNewBalance = previousBalance - expectedDecrease;

  expect(newBalance).toBeCloseTo(expectedNewBalance, 2);
}

/**
 * Assert that an envelope balance has increased by expected amount
 *
 * @param page - Playwright page object
 * @param envelopeName - Name of the envelope
 * @param previousBalance - Previous balance
 * @param expectedIncrease - Expected increase amount
 */
export async function assertEnvelopeBalanceIncreased(
  page: Page,
  envelopeName: string,
  previousBalance: number,
  expectedIncrease: number
) {
  const balanceText = await page
    .locator(
      `div:has(text="${envelopeName}") [data-testid="balance"], div:has(text="${envelopeName}") text=/\$[0-9,.]+/`
    )
    .first()
    .textContent();

  const newBalance = parseFloat(balanceText?.replace(/[^0-9.]/g, "") || "0");
  const expectedNewBalance = previousBalance + expectedIncrease;

  expect(newBalance).toBeCloseTo(expectedNewBalance, 2);
}

/**
 * Assert that a transaction appears in the list with correct amount
 *
 * @param page - Playwright page object
 * @param description - Transaction description
 * @param amount - Transaction amount
 */
export async function assertTransactionVisible(page: Page, description: string, amount: number) {
  const transactionRow = page.locator(`text=${description}`).first();
  await expect(transactionRow).toBeVisible();

  const amountText = await page.locator(`text=${amount}`).first().textContent();
  expect(amountText).toContain(amount.toString());
}

/**
 * Assert that offline/pending status is visible
 *
 * @param page - Playwright page object
 */
export async function assertOfflineStatusVisible(page: Page) {
  const offlineIndicator = page
    .locator('[data-testid*="offline"], text=/OFFLINE|Offline|pending/i')
    .first();
  await expect(offlineIndicator).toBeVisible();
}

/**
 * Assert that offline/pending status is NOT visible (synced)
 *
 * @param page - Playwright page object
 */
export async function assertSyncedStatusVisible(page: Page) {
  const offlineIndicator = page.locator('[data-testid*="offline"], text=/OFFLINE/i').first();
  const isGone = !(await offlineIndicator.isVisible({ timeout: 2000 }).catch(() => false));
  expect(isGone).toBe(true);
}

/**
 * Assert transaction not visible (deleted)
 *
 * @param page - Playwright page object
 * @param description - Transaction description
 */
export async function assertTransactionNotVisible(page: Page, description: string) {
  const transactionRow = page.locator(`text=${description}`).first();
  const isVisible = await transactionRow.isVisible({ timeout: 2000 }).catch(() => false);
  expect(isVisible).toBe(false);
}

/**
 * Parse currency value from text
 * Handles formats like "$100.50", "100.50", "$100,50"
 *
 * @param text - Text containing currency value
 * @returns Parsed number value
 */
export function parseCurrencyValue(text: string): number {
  const match = text.match(/[\d,]+\.?\d*/);
  if (!match) return 0;
  return parseFloat(match[0].replace(/,/g, ""));
}

/**
 * Assert that value is within expected range
 *
 * @param actual - Actual value
 * @param expected - Expected value
 * @param tolerance - Tolerance for comparison (default 0.01 for $0.01)
 */
export function assertValueWithinTolerance(
  actual: number,
  expected: number,
  tolerance: number = 0.01
) {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance);
  expect(actual).toBeLessThanOrEqual(expected + tolerance);
}
