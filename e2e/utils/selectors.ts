/**
 * Selectors Utility for Violet Vault E2E Tests
 *
 * Centralized selectors for consistent element targeting across all tests.
 * Reduces maintenance burden when UI changes - update selectors here once.
 *
 * Usage:
 * const addBtn = page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE);
 * await addBtn.click();
 */

export const SELECTORS = {
  // Buttons
  BUTTONS: {
    ADD_ENVELOPE: 'button:has-text("Add Envelope"), button:has-text("Create Envelope")',
    ADD_TRANSACTION: 'button:has-text("Add Transaction"), button:has-text("Add expense")',
    ADD_INCOME: 'button:has-text("Add Income"), button:has-text("Process Paycheck")',
    ADD_BILL: 'button:has-text("Add Bill"), button:has-text("Create Bill")',
    TRANSFER: 'button:has-text("Transfer"), button:has-text("Move")',
    EXPORT: 'button:has-text("Export"), button:has-text("Download CSV")',
    IMPORT: 'button:has-text("Import"), button:has-text("Upload CSV")',
    BACKUP: 'button:has-text("Create Backup"), button:has-text("Backup Now")',
    RESTORE: 'button:has-text("Restore"), [data-testid*="restore"]',
    SETTINGS: 'a:has-text("Settings"), button:has-text("Settings")',
    DASHBOARD: 'a:has-text("Dashboard"), a:has-text("Home")',
    BACK: 'button:has-text("Back"), a:has-text("Back"), [aria-label*="back"]',
    DELETE: 'button:has-text("Delete"), [data-testid*="delete"]',
    EDIT: 'button:has-text("Edit"), [data-testid*="edit"]',
    SAVE: 'button:has-text("Save"), button:has-text("Submit")',
    CONFIRM: 'button:has-text("Confirm"), button:has-text("OK"), button:has-text("Yes")',
    CANCEL: 'button:has-text("Cancel"), button:has-text("Close")',
    PAY_BILL: 'button:has-text("Pay"), button:has-text("Mark Paid")',
  },

  // Inputs
  INPUTS: {
    ENVELOPE_NAME: 'input[placeholder*="name"], input[placeholder*="Envelope"]',
    ENVELOPE_GOAL: 'input[type="number"], input[placeholder*="goal"]',
    TRANSACTION_DESCRIPTION: 'input[placeholder*="description"], input[placeholder*="Description"]',
    TRANSACTION_AMOUNT: 'input[type="number"], input[placeholder*="amount"]',
    TRANSACTION_DATE: 'input[type="date"], input[placeholder*="date"]',
    PAYCHECK_AMOUNT: 'input[type="number"], input[placeholder*="amount"]',
    BILL_NAME: 'input[placeholder*="name"], input[placeholder*="bill"]',
    BILL_AMOUNT: 'input[type="number"]',
    BILL_DUE_DATE: 'input[type="date"]',
    SEARCH: 'input[placeholder*="search"], [data-testid*="search"]',
    FILE: 'input[type="file"]',
  },

  // Dialogs/Modals
  DIALOGS: {
    ENVELOPE_CREATE: '[data-testid="envelope-create-dialog"], [role="dialog"]:has-text("Envelope")',
    TRANSACTION_CREATE: '[data-testid="transaction-create-dialog"], [role="dialog"]:has-text("transaction")',
    TRANSACTION_EDIT: '[data-testid="transaction-edit-dialog"], [role="dialog"]',
    BILL_CREATE: '[data-testid="bill-create-dialog"], [role="dialog"]',
    TRANSFER: '[data-testid="transfer-dialog"], [role="dialog"]',
    IMPORT: '[data-testid="import-dialog"], [role="dialog"]',
    EXPORT: '[data-testid="export-dialog"], [role="dialog"]',
    CONFIRMATION: '[data-testid="confirmation-dialog"], [role="dialog"]:has-text("Confirm")',
  },

  // Display Elements
  DISPLAY: {
    MAIN_CONTAINER: '[data-testid="dashboard-container"], main, [role="main"]',
    ENVELOPE_CARD: '[data-testid="envelope-card"]',
    ENVELOPE_BALANCE: '[data-testid="envelope-balance"], text=/\$[0-9,.]+/',
    TRANSACTION_LIST: '[data-testid="transaction-list"], tbody, [role="list"]',
    TRANSACTION_ROW: '[data-testid*="transaction"], tr, li',
    BILL_LIST: '[data-testid="bill-list"], [role="list"]',
    BILL_ROW: '[data-testid*="bill"], tr, li',
    UNALLOCATED_AMOUNT: '[data-testid="unallocated-amount"], text=/\$[0-9,.]+.*unallocated/',
    OFFLINE_INDICATOR: '[data-testid*="offline"], text=/OFFLINE|Offline/',
    PENDING_INDICATOR: '[data-testid*="pending"], text=/Pending|pending/',
    SYNC_STATUS: '[data-testid*="sync"], text=/Syncing|Synced/',
    ERROR_MESSAGE: '[data-testid*="error"], text=/error|Error/',
    SUCCESS_MESSAGE: '[data-testid*="success"], text=/success|Success/',
  },

  // Navigations
  NAVIGATION: {
    BILLS_LINK: 'a:has-text("Bills"), button:has-text("Bills")',
    ENVELOPES_LINK: 'a:has-text("Envelopes")',
    INCOME_LINK: 'a:has-text("Income")',
    ALLOCATE_LINK: 'a:has-text("Allocate"), button:has-text("Allocate Income")',
  },

  // Test Data IDs (preferred when available)
  DATA_IDS: {
    DASHBOARD: '[data-testid="dashboard"]',
    ENVELOPE_DETAIL: '[data-testid="envelope-detail"]',
    TRANSACTION_DETAIL: '[data-testid="transaction-detail"]',
    PAYMENT_HISTORY: '[data-testid="payment-history"]',
    IMPORT_PREVIEW: '[data-testid="import-preview"]',
    ALLOCATION_PREVIEW: '[data-testid="allocation-preview"]',
    BACKUP_LIST: '[data-testid="backup-list"]',
    SYNC_QUEUE_COUNT: '[data-testid="sync-queue-count"]',
  },

  // ARIA Roles (most semantic)
  ROLES: {
    BUTTON: '[role="button"]',
    DIALOG: '[role="dialog"]',
    LIST: '[role="list"]',
    LISTITEM: '[role="listitem"]',
    MAIN: '[role="main"]',
    HEADING: '[role="heading"]',
    NAVIGATION: '[role="navigation"]',
    TAB: '[role="tab"]',
    TABPANEL: '[role="tabpanel"]',
    ALERTDIALOG: '[role="alertdialog"]',
  },
};

/**
 * Helper function to construct selectors with dynamic values
 *
 * @param template - Selector template with {value} placeholder
 * @param value - Value to insert
 * @returns Complete selector string
 */
export function createSelector(template: string, value: string): string {
  return template.replace('{value}', value);
}

/**
 * Common selector combinations for better readability
 */
export const COMMON_SELECTORS = {
  // "Next" button in pagination or dialogs
  NEXT_BUTTON: 'button:has-text("Next"), [aria-label*="next"]',

  // "Previous" button
  PREV_BUTTON: 'button:has-text("Previous"), [aria-label*="previous"]',

  // Menu button
  MENU_BUTTON: 'button[aria-label*="menu"], [data-testid="actions"]',

  // More actions button
  MORE_ACTIONS: 'button:has-text("More"), [aria-label*="more"]',

  // Loading indicator
  LOADING: '[data-testid*="loading"], text=/Loading|loading/',

  // Empty state
  EMPTY_STATE: 'text=/No items|empty|Create/',

  // Help/Info text
  HELP_TEXT: '[role="tooltip"], [data-testid*="help"]',
};

/**
 * Wait for element using selector and optional timeout
 *
 * @param page - Playwright page
 * @param selector - Element selector
 * @param timeout - Optional timeout in ms (default 5000)
 */
export async function waitForSelector(page: any, selector: string, timeout = 5000) {
  await page.locator(selector).waitFor({ timeout });
}

/**
 * Check if element exists without failing
 *
 * @param page - Playwright page
 * @param selector - Element selector
 * @returns true if element visible, false otherwise
 */
export async function selectorExists(page: any, selector: string): Promise<boolean> {
  try {
    return await page.locator(selector).isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}
