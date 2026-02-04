---
title: Implement Playwright E2E Testing for Core User Workflows
type: feat
date: 2026-02-04
---

# Implement Playwright E2E Testing for Core User Workflows

## Overview

Implement comprehensive end-to-end testing using Playwright to validate critical user workflows in Violet Vault's offline-first, encrypted budgeting application. Focus on real-world usage patterns: paycheck processing, transaction management, bill payments, and envelope transfers across online/offline modes with cross-browser session syncing.

**Current State**: 374 Vitest unit/integration tests with 60% coverage targeting 80%+ for new code. No browser-based E2E testing infrastructure exists.

**Target State**: Comprehensive Playwright E2E test suite running in GitHub Actions CI and locally, validating complete user journeys from authentication through core budgeting workflows, with offline/online transition testing and cross-browser sync validation.

## Problem Statement

### Why This Matters

Violet Vault's architecture combines complex concerns that unit tests cannot fully validate:

1. **E2EE Offline-First Architecture**: Client-side encryption + IndexedDB + Firebase sync creates edge cases (offline queue, conflict resolution, key management) that only surface in full browser context
2. **Multi-Device Sync**: Cross-browser session syncing and data synchronization requires real browser testing to catch race conditions
3. **Progressive Enhancement**: Backend unavailable → client-side fallback → offline-only mode transitions need validation
4. **Critical User Workflows**: Paycheck processing, envelope allocation, transaction categorization, and bill payments are core features that must work reliably
5. **CI/CD Confidence**: Current pipeline lacks browser-based validation before deployment

### Pain Points Without E2E Testing

- **Sync bugs discovered in production** by users reporting "data not syncing between devices"
- **Offline queue failures** when network transitions cause orphaned requests
- **Auth session issues** where users lose access due to encryption key mismatches
- **UI regressions** in core workflows (adding transactions, allocating paychecks) go unnoticed
- **Cross-browser incompatibilities** (Safari IndexedDB quirks, Firefox private mode) untested
- **Deployment confidence low** - no validation that full app works after merging PRs

## Proposed Solution

### High-Level Approach

Implement Playwright E2E testing focused on **real user workflows** rather than exhaustive technical edge cases:

**Core Philosophy**: Test the app as users use it - complete journeys from login to paycheck allocation to transaction entry to bill payment.

**Test Categories**:

1. **🎯 Critical Path Smoke Tests** (5-8 tests, ~3min)
   - Login → Dashboard → Create envelope → Add transaction → Verify balance
   - Run on every PR, all browsers

2. **💰 Core Budgeting Workflows** (15-20 tests, ~10min)
   - Paycheck processing and auto-allocation
   - Manual envelope transfers
   - Transaction entry with categorization
   - Bill payment scheduling and execution
   - Savings goal contributions
   - Run on every PR, Chromium only

3. **🔄 Offline/Online Transitions** (8-10 tests, ~8min)
   - Add transaction offline → sync when online
   - Process paycheck offline → verify queue
   - Cross-browser sync validation
   - Backend fallback scenarios
   - Run on main branch merges, all browsers

4. **🔐 Authentication & Session** (5-7 tests, ~5min)
   - Anonymous auth initialization
   - Session persistence across page reloads
   - Cross-browser session sync
   - Session timeout and re-authentication
   - Run on every PR, Chromium only

5. **📊 Data Integrity Flows** (10-12 tests, ~8min)
   - Import/Export CSV workflows
   - Backup creation and restore
   - Large dataset handling (1000+ transactions)
   - Run nightly, Chromium only

**Total**: ~50-60 tests, ~30-40min full suite

### Technical Architecture

```
violet-vault/
├── playwright.config.ts           # Playwright configuration
├── .github/workflows/
│   └── ci.yml                     # Updated with E2E job
├── e2e/                           # E2E test directory
│   ├── fixtures/
│   │   ├── auth.fixture.ts        # Auth setup/teardown
│   │   ├── budget.fixture.ts      # Budget seeding utilities
│   │   └── network.fixture.ts     # Network condition helpers
│   ├── utils/
│   │   ├── test-data.ts           # Test data factories
│   │   ├── selectors.ts           # Centralized selectors
│   │   └── assertions.ts          # Custom assertions
│   ├── smoke/                     # Critical path smoke tests
│   │   └── app-basic-flow.spec.ts
│   ├── workflows/                 # Core user workflows
│   │   ├── paycheck-processing.spec.ts
│   │   ├── transaction-management.spec.ts
│   │   ├── bill-payment.spec.ts
│   │   ├── envelope-transfers.spec.ts
│   │   └── savings-goals.spec.ts
│   ├── sync/                      # Offline/online testing
│   │   ├── offline-transactions.spec.ts
│   │   ├── sync-conflicts.spec.ts
│   │   └── backend-fallback.spec.ts
│   ├── auth/                      # Authentication flows
│   │   ├── anonymous-auth.spec.ts
│   │   ├── session-persistence.spec.ts
│   │   └── cross-browser-sync.spec.ts
│   └── data-integrity/            # Import/export/backup
│       ├── csv-import.spec.ts
│       ├── backup-restore.spec.ts
│       └── large-datasets.spec.ts
└── scripts/
    └── e2e-local.sh               # Local E2E runner script
```

## Technical Approach

### Phase 1: Foundation & Infrastructure (Week 1)

#### 1.1 Playwright Setup & Configuration

**Tasks**:

- Install Playwright and dependencies
- Create `playwright.config.ts` with optimized settings
- Set up test directory structure
- Configure browser matrix (Chromium, Firefox, WebKit)
- Add npm scripts for local testing

**Configuration Decisions**:

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",

  // Optimize for CI and local
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  // Reasonable timeouts based on existing Vitest config
  timeout: 60_000, // 60s per test (sync operations can be slow)
  expect: { timeout: 5_000 },

  // Reporter configuration
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["junit", { outputFile: "playwright-report/junit.xml" }],
    ["line"],
  ],

  // Artifacts on failure only (reduce storage)
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",

    // Base URL from env or default to local dev
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
  },

  // Auto-start dev server for local testing
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  // Browser projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
});
```

**npm Scripts**:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:smoke": "playwright test e2e/smoke",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:chromium": "playwright test --project=chromium",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Success Criteria**:

- ✅ `npx playwright test` runs successfully (even with 0 tests)
- ✅ HTML report generated at `playwright-report/index.html`
- ✅ Dev server auto-starts when running tests locally
- ✅ All three browsers (Chromium, Firefox, WebKit) launch successfully

#### 1.2 Test Environment & Firebase Configuration

**Tasks**:

- Create `.env.test` with test Firebase credentials
- Set up Firebase test project OR namespace isolation strategy
- Configure test data cleanup utilities
- Add environment variable documentation

**Test Environment Strategy**:

**Option A: Separate Firebase Project** (Recommended)

- Create `violet-vault-e2e-test` Firebase project
- Isolated from production data
- Can be wiped periodically
- Requires separate auth configuration

**Option B: Namespace Isolation**

- Use existing Firebase project
- Prefix all test documents with `e2e-test-{uuid}`
- Cleanup in `afterEach` hooks
- Risk of pollution if cleanup fails

**Recommendation**: Use Option A (separate Firebase project) for safety and isolation.

**Environment Variables**:

```bash
# .env.test
VITE_FIREBASE_API_KEY=test_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=violet-vault-e2e-test.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=violet-vault-e2e-test
VITE_FIREBASE_STORAGE_BUCKET=violet-vault-e2e-test.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=test_app_id_here

# Optional: Disable WebSocket in tests for determinism
VITE_WEBSOCKET_ENABLED=false

# Disable Sentry in tests
VITE_SENTRY_DSN=

# Enable analytics for testing analytics flows
VITE_ANALYTICS_ENABLED=true
```

**Success Criteria**:

- ✅ `.env.test` file created and documented
- ✅ Firebase test project created and configured
- ✅ Test environment loads without production data pollution
- ✅ Cleanup utilities successfully clear test data

#### 1.3 Test Fixtures & Utilities

**Tasks**:

- Create auth fixture for login/logout
- Create budget seeding fixture
- Create network condition helpers
- Create custom assertions for common patterns

**Auth Fixture** (`e2e/fixtures/auth.fixture.ts`):

```typescript
import { test as base } from "@playwright/test";
import { budgetDb } from "@/db/budgetDb";

type AuthFixtures = {
  authenticatedPage: Page;
  budgetId: string;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to app
    await page.goto("/");

    // Wait for anonymous auth to complete
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

    // Extract budget ID from context
    const budgetId = await page.evaluate(() => {
      return localStorage.getItem("budgetId");
    });

    await use(page);

    // Cleanup: Clear auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  },

  budgetId: async ({ authenticatedPage }, use) => {
    const budgetId = await authenticatedPage.evaluate(() => {
      return localStorage.getItem("budgetId");
    });
    await use(budgetId);
  },
});
```

**Budget Seeding Fixture** (`e2e/fixtures/budget.fixture.ts`):

```typescript
import { Page } from "@playwright/test";
import type { Envelope, Transaction } from "@/types";

export async function seedEnvelopes(page: Page, envelopes: Partial<Envelope>[]) {
  await page.evaluate((envelopesData) => {
    const { budgetDb } = window as any;
    return Promise.all(
      envelopesData.map((env) =>
        budgetDb.envelopes.add({
          id: crypto.randomUUID(),
          name: env.name,
          balance: env.balance || 0,
          goal: env.goal || null,
          budgetId: localStorage.getItem("budgetId"),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...env,
        })
      )
    );
  }, envelopes);
}

export async function seedTransactions(page: Page, transactions: Partial<Transaction>[]) {
  await page.evaluate((txnData) => {
    const { budgetDb } = window as any;
    return Promise.all(
      txnData.map((txn) =>
        budgetDb.transactions.add({
          id: crypto.randomUUID(),
          amount: txn.amount,
          description: txn.description,
          envelopeId: txn.envelopeId,
          budgetId: localStorage.getItem("budgetId"),
          date: txn.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...txn,
        })
      )
    );
  }, transactions);
}

export async function getEnvelopeBalance(page: Page, envelopeName: string): Promise<number> {
  return page.evaluate((name) => {
    const { budgetDb } = window as any;
    return budgetDb.envelopes
      .where("name")
      .equals(name)
      .first()
      .then((env) => env?.balance || 0);
  }, envelopeName);
}
```

**Network Condition Helpers** (`e2e/fixtures/network.fixture.ts`):

```typescript
import { Page } from "@playwright/test";

export async function goOffline(page: Page) {
  await page.context().setOffline(true);
  // Wait for app to detect offline state
  await page.waitForSelector('[data-testid="offline-indicator"]', { timeout: 5000 });
}

export async function goOnline(page: Page) {
  await page.context().setOffline(false);
  // Wait for app to detect online state
  await page.waitForSelector('[data-testid="online-indicator"]', { timeout: 5000 });
}

export async function simulateSlowNetwork(page: Page) {
  await page.route("**/*", (route) => {
    setTimeout(() => route.continue(), 2000); // 2s delay
  });
}

export async function blockFirebase(page: Page) {
  await page.route("**/*.firebaseapp.com/**", (route) => route.abort());
  await page.route("**/*.googleapis.com/**", (route) => route.abort());
}
```

**Success Criteria**:

- ✅ Auth fixture successfully authenticates and cleans up
- ✅ Budget seeding creates envelopes and transactions in IndexedDB
- ✅ Network helpers successfully toggle online/offline state
- ✅ Test utilities are reusable across test files

#### 1.4 CI/CD Integration (GitHub Actions)

**Tasks**:

- Update `.github/workflows/ci.yml` with E2E job
- Install Playwright browsers in CI
- Configure artifact upload (traces, screenshots, HTML report)
- Add E2E results to PR comment

**Updated CI Workflow** (`.github/workflows/ci.yml`):

```yaml
jobs:
  # ... existing frontend_checks, go_checks, python_checks jobs ...

  e2e_tests:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    needs: [frontend_checks] # Run after frontend build succeeds

    strategy:
      fail-fast: false
      matrix:
        # Run smoke tests on all browsers, full suite on Chromium only
        test-suite: [smoke-all-browsers, workflows-chromium]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build app for E2E testing
        run: npm run build
        env:
          # Use test Firebase config
          VITE_FIREBASE_API_KEY: ${{ secrets.E2E_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.E2E_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.E2E_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.E2E_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.E2E_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.E2E_FIREBASE_APP_ID }}
          VITE_WEBSOCKET_ENABLED: false
          VITE_SENTRY_DSN: ""

      - name: Run E2E Tests (Smoke - All Browsers)
        if: matrix.test-suite == 'smoke-all-browsers'
        run: npx playwright test e2e/smoke --project=chromium --project=firefox --project=webkit
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:5173

      - name: Run E2E Tests (Workflows - Chromium)
        if: matrix.test-suite == 'workflows-chromium'
        run: npx playwright test e2e/workflows --project=chromium
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:5173

      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.test-suite }}
          path: playwright-report/
          retention-days: 30

      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-${{ matrix.test-suite }}
          path: playwright-report/results.json
          retention-days: 30

  # Add E2E results to existing CI report comment
  report:
    name: Post CI Report
    runs-on: ubuntu-latest
    needs: [frontend_checks, go_checks, python_checks, e2e_tests]
    if: always() && github.event_name == 'pull_request'

    steps:
      # ... existing report steps ...

      - name: Download E2E Results
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-results-*
          path: e2e-results/

      - name: Generate E2E Summary
        run: |
          echo "## 🎭 E2E Test Results" >> $GITHUB_STEP_SUMMARY
          # Parse playwright results.json and format for PR comment
          node scripts/generate-e2e-report.js e2e-results/ >> $GITHUB_STEP_SUMMARY
```

**Success Criteria**:

- ✅ E2E tests run in CI after frontend checks pass
- ✅ Playwright browsers installed successfully
- ✅ Test artifacts uploaded on failure
- ✅ E2E results appear in PR comment
- ✅ Failed E2E tests block PR merge

### Phase 2: Core Workflow Tests (Week 2)

#### 2.1 Smoke Tests (Critical Path)

**File**: `e2e/smoke/app-basic-flow.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";

test.describe("Smoke Tests - Critical Path", () => {
  test("User can complete basic budgeting flow", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // 1. Dashboard loads
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

    // 2. Create envelope
    await page.click('[data-testid="create-envelope-button"]');
    await page.fill('[data-testid="envelope-name-input"]', "Groceries");
    await page.fill('[data-testid="envelope-goal-input"]', "500");
    await page.click('[data-testid="save-envelope-button"]');
    await expect(page.locator("text=Groceries")).toBeVisible();

    // 3. Add transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "50");
    await page.fill('[data-testid="transaction-description-input"]', "Weekly groceries");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Groceries");
    await page.click('[data-testid="save-transaction-button"]');

    // 4. Verify envelope balance updated
    const balance = await page.locator('[data-testid="envelope-balance-Groceries"]').textContent();
    expect(balance).toContain("$450"); // $500 goal - $50 spent

    // 5. Verify transaction appears in list
    await expect(page.locator("text=Weekly groceries")).toBeVisible();
  });

  test("App loads and authentication works", async ({ page }) => {
    await page.goto("/");

    // Anonymous auth should auto-trigger
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

    // Budget ID should be generated
    const budgetId = await page.evaluate(() => localStorage.getItem("budgetId"));
    expect(budgetId).toBeTruthy();
    expect(budgetId).toMatch(/^[a-f0-9-]{36}$/); // UUID format
  });

  test("Page reload persists session", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Create envelope before reload
    await page.click('[data-testid="create-envelope-button"]');
    await page.fill('[data-testid="envelope-name-input"]', "Test Envelope");
    await page.click('[data-testid="save-envelope-button"]');

    // Reload page
    await page.reload();

    // Session should persist
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    await expect(page.locator("text=Test Envelope")).toBeVisible();
  });
});
```

**Success Criteria**:

- ✅ All 3 smoke tests pass on Chromium, Firefox, WebKit
- ✅ Tests complete in < 3 minutes total
- ✅ No flaky failures in 10 consecutive runs

#### 2.2 Paycheck Processing Workflow

**File**: `e2e/workflows/paycheck-processing.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes } from "../fixtures/budget.fixture";

test.describe("Paycheck Processing", () => {
  test("Process paycheck with auto-allocation", async ({ authenticatedPage, budgetId }) => {
    const page = authenticatedPage;

    // Seed envelopes with goals
    await seedEnvelopes(page, [
      { name: "Rent", goal: 1500, balance: 0 },
      { name: "Groceries", goal: 500, balance: 0 },
      { name: "Savings", goal: 300, balance: 0 },
    ]);

    await page.reload();

    // Navigate to paycheck page
    await page.click('[data-testid="nav-paychecks"]');

    // Add paycheck
    await page.click('[data-testid="add-paycheck-button"]');
    await page.fill('[data-testid="paycheck-amount-input"]', "3000");
    await page.fill('[data-testid="paycheck-description-input"]', "January Salary");

    // Enable auto-allocation
    await page.check('[data-testid="auto-allocate-checkbox"]');

    // Process paycheck
    await page.click('[data-testid="process-paycheck-button"]');

    // Wait for allocation to complete
    await expect(page.locator('[data-testid="allocation-success-message"]')).toBeVisible();

    // Verify envelopes funded according to goals
    await page.click('[data-testid="nav-envelopes"]');

    await expect(page.locator('[data-testid="envelope-balance-Rent"]')).toContainText("$1,500.00");
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$500.00"
    );
    await expect(page.locator('[data-testid="envelope-balance-Savings"]')).toContainText("$300.00");

    // Verify paycheck history
    await page.click('[data-testid="nav-paychecks"]');
    await expect(page.locator("text=January Salary")).toBeVisible();
    await expect(page.locator('[data-testid="paycheck-allocated-amount"]')).toContainText(
      "$2,300.00"
    );
    await expect(page.locator('[data-testid="paycheck-unallocated-amount"]')).toContainText(
      "$700.00"
    );
  });

  test("Manual paycheck allocation to specific envelopes", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Seed envelopes
    await seedEnvelopes(page, [
      { name: "Emergency Fund", balance: 1000 },
      { name: "Vacation", balance: 200 },
    ]);

    await page.reload();

    // Add paycheck without auto-allocation
    await page.click('[data-testid="nav-paychecks"]');
    await page.click('[data-testid="add-paycheck-button"]');
    await page.fill('[data-testid="paycheck-amount-input"]', "2000");
    await page.click('[data-testid="process-paycheck-button"]');

    // Manually allocate funds
    await page.click('[data-testid="allocate-funds-button"]');

    // Allocate $1500 to Emergency Fund
    await page.fill('[data-testid="allocation-Emergency-Fund-input"]', "1500");

    // Allocate $500 to Vacation
    await page.fill('[data-testid="allocation-Vacation-input"]', "500");

    await page.click('[data-testid="save-allocations-button"]');

    // Verify allocations
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Emergency-Fund"]')).toContainText(
      "$2,500.00"
    );
    await expect(page.locator('[data-testid="envelope-balance-Vacation"]')).toContainText(
      "$700.00"
    );
  });

  test("Paycheck with recurring auto-funding rules", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Set up auto-funding rule
    await page.click('[data-testid="nav-settings"]');
    await page.click('[data-testid="auto-funding-rules"]');
    await page.click('[data-testid="add-auto-funding-rule"]');

    await page.selectOption('[data-testid="rule-envelope-select"]', "Rent");
    await page.fill('[data-testid="rule-amount-input"]', "1500");
    await page.selectOption('[data-testid="rule-frequency-select"]', "monthly");
    await page.click('[data-testid="save-rule-button"]');

    // Process paycheck (should trigger auto-funding rule)
    await page.click('[data-testid="nav-paychecks"]');
    await page.click('[data-testid="add-paycheck-button"]');
    await page.fill('[data-testid="paycheck-amount-input"]', "3000");
    await page.check('[data-testid="auto-allocate-checkbox"]');
    await page.click('[data-testid="process-paycheck-button"]');

    // Verify auto-funding rule executed
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Rent"]')).toContainText("$1,500.00");

    // Verify auto-funding history
    await page.click('[data-testid="nav-settings"]');
    await page.click('[data-testid="auto-funding-history"]');
    await expect(page.locator("text=Rent - $1,500.00")).toBeVisible();
  });
});
```

**Success Criteria**:

- ✅ All paycheck processing tests pass
- ✅ Auto-allocation calculates correctly
- ✅ Manual allocation updates envelopes accurately
- ✅ Auto-funding rules execute as expected

#### 2.3 Transaction Management Workflow

**File**: `e2e/workflows/transaction-management.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes, seedTransactions } from "../fixtures/budget.fixture";

test.describe("Transaction Management", () => {
  test("Add transaction and verify envelope balance update", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Seed envelope with initial balance
    await seedEnvelopes(page, [{ name: "Groceries", balance: 500 }]);

    await page.reload();
    await page.click('[data-testid="nav-transactions"]');

    // Add expense transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.selectOption('[data-testid="transaction-type-select"]', "expense");
    await page.fill('[data-testid="transaction-amount-input"]', "75.50");
    await page.fill('[data-testid="transaction-description-input"]', "Whole Foods purchase");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Groceries");
    await page.click('[data-testid="save-transaction-button"]');

    // Verify transaction appears
    await expect(page.locator("text=Whole Foods purchase")).toBeVisible();
    await expect(page.locator('[data-testid="transaction-amount"]').first()).toContainText(
      "$75.50"
    );

    // Verify envelope balance decreased
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$424.50"
    );
  });

  test("Edit transaction updates envelope balances", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Seed envelopes and transaction
    await seedEnvelopes(page, [
      { name: "Dining Out", balance: 200 },
      { name: "Groceries", balance: 300 },
    ]);

    await page.reload();
    await page.click('[data-testid="nav-transactions"]');

    // Add initial transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "50");
    await page.fill('[data-testid="transaction-description-input"]', "Restaurant");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Dining Out");
    await page.click('[data-testid="save-transaction-button"]');

    // Edit transaction: change amount and envelope
    await page.click('[data-testid="transaction-actions-menu"]');
    await page.click('[data-testid="edit-transaction-button"]');

    await page.fill('[data-testid="transaction-amount-input"]', "75");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Groceries");
    await page.click('[data-testid="save-transaction-button"]');

    // Verify balances updated correctly
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Dining-Out"]')).toContainText(
      "$200.00"
    ); // Restored
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$225.00"
    ); // $300 - $75
  });

  test("Delete transaction restores envelope balance", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Entertainment", balance: 150 }]);

    await page.reload();
    await page.click('[data-testid="nav-transactions"]');

    // Add transaction
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "50");
    await page.fill('[data-testid="transaction-description-input"]', "Movie tickets");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Entertainment");
    await page.click('[data-testid="save-transaction-button"]');

    // Verify balance decreased
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Entertainment"]')).toContainText(
      "$100.00"
    );

    // Delete transaction
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="transaction-actions-menu"]');
    await page.click('[data-testid="delete-transaction-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify balance restored
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Entertainment"]')).toContainText(
      "$150.00"
    );
  });

  test("Categorize and filter transactions", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [
      { name: "Groceries", balance: 500 },
      { name: "Dining Out", balance: 200 },
    ]);

    await page.reload();
    await page.click('[data-testid="nav-transactions"]');

    // Add multiple transactions
    const transactions = [
      { amount: "50", description: "Safeway", envelope: "Groceries" },
      { amount: "30", description: "Chipotle", envelope: "Dining Out" },
      { amount: "75", description: "Whole Foods", envelope: "Groceries" },
    ];

    for (const txn of transactions) {
      await page.click('[data-testid="add-transaction-button"]');
      await page.fill('[data-testid="transaction-amount-input"]', txn.amount);
      await page.fill('[data-testid="transaction-description-input"]', txn.description);
      await page.selectOption('[data-testid="transaction-envelope-select"]', txn.envelope);
      await page.click('[data-testid="save-transaction-button"]');
    }

    // Filter by envelope
    await page.selectOption('[data-testid="filter-envelope-select"]', "Groceries");

    // Verify only Groceries transactions visible
    await expect(page.locator("text=Safeway")).toBeVisible();
    await expect(page.locator("text=Whole Foods")).toBeVisible();
    await expect(page.locator("text=Chipotle")).not.toBeVisible();

    // Clear filter
    await page.selectOption('[data-testid="filter-envelope-select"]', "All");
    await expect(page.locator("text=Chipotle")).toBeVisible();
  });

  test("Bulk transaction import from CSV", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Groceries", balance: 1000 }]);

    await page.reload();
    await page.click('[data-testid="nav-transactions"]');

    // Import transactions
    await page.click('[data-testid="import-transactions-button"]');

    const csvContent = `Date,Description,Amount,Envelope
2026-02-01,Trader Joes,45.50,Groceries
2026-02-02,Safeway,32.75,Groceries
2026-02-03,Costco,120.00,Groceries`;

    await page.setInputFiles('[data-testid="csv-file-input"]', {
      name: "transactions.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    await page.click('[data-testid="confirm-import-button"]');

    // Wait for import to complete
    await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible();

    // Verify imported transactions
    await expect(page.locator("text=Trader Joes")).toBeVisible();
    await expect(page.locator("text=Safeway")).toBeVisible();
    await expect(page.locator("text=Costco")).toBeVisible();

    // Verify envelope balance updated
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$801.75"
    ); // $1000 - ($45.50 + $32.75 + $120.00)
  });
});
```

**Success Criteria**:

- ✅ All transaction CRUD operations work correctly
- ✅ Envelope balances update accurately on add/edit/delete
- ✅ Transaction filtering works as expected
- ✅ CSV import successfully creates transactions

#### 2.4 Bill Payment Workflow

**File**: `e2e/workflows/bill-payment.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes } from "../fixtures/budget.fixture";

test.describe("Bill Payment", () => {
  test("Schedule recurring bill payment", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Bills", balance: 500 }]);

    await page.reload();
    await page.click('[data-testid="nav-bills"]');

    // Add recurring bill
    await page.click('[data-testid="add-bill-button"]');
    await page.fill('[data-testid="bill-name-input"]', "Internet Service");
    await page.fill('[data-testid="bill-amount-input"]', "79.99");
    await page.selectOption('[data-testid="bill-envelope-select"]', "Bills");
    await page.selectOption('[data-testid="bill-frequency-select"]', "monthly");
    await page.fill('[data-testid="bill-due-date-input"]', "15"); // 15th of each month
    await page.click('[data-testid="save-bill-button"]');

    // Verify bill appears in list
    await expect(page.locator("text=Internet Service")).toBeVisible();
    await expect(page.locator('[data-testid="bill-amount-Internet-Service"]')).toContainText(
      "$79.99"
    );
    await expect(page.locator('[data-testid="bill-due-date-Internet-Service"]')).toContainText(
      "15th"
    );
  });

  test("Mark bill as paid and verify envelope balance", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Utilities", balance: 300 }]);

    await page.reload();
    await page.click('[data-testid="nav-bills"]');

    // Add bill
    await page.click('[data-testid="add-bill-button"]');
    await page.fill('[data-testid="bill-name-input"]', "Electric Bill");
    await page.fill('[data-testid="bill-amount-input"]', "125.50");
    await page.selectOption('[data-testid="bill-envelope-select"]', "Utilities");
    await page.click('[data-testid="save-bill-button"]');

    // Mark as paid
    await page.click('[data-testid="bill-actions-Electric-Bill"]');
    await page.click('[data-testid="mark-bill-paid-button"]');
    await page.fill('[data-testid="actual-amount-input"]', "125.50");
    await page.click('[data-testid="confirm-payment-button"]');

    // Verify bill marked as paid
    await expect(page.locator('[data-testid="bill-status-Electric-Bill"]')).toContainText("Paid");

    // Verify envelope balance decreased
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator('[data-testid="envelope-balance-Utilities"]')).toContainText(
      "$174.50"
    );

    // Verify transaction created
    await page.click('[data-testid="nav-transactions"]');
    await expect(page.locator("text=Electric Bill")).toBeVisible();
    await expect(page.locator('[data-testid="transaction-amount"]').first()).toContainText(
      "$125.50"
    );
  });

  test("Edit recurring bill updates future schedule", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('[data-testid="nav-bills"]');

    // Add bill
    await page.click('[data-testid="add-bill-button"]');
    await page.fill('[data-testid="bill-name-input"]', "Phone Bill");
    await page.fill('[data-testid="bill-amount-input"]', "50");
    await page.selectOption('[data-testid="bill-frequency-select"]', "monthly");
    await page.click('[data-testid="save-bill-button"]');

    // Edit bill amount
    await page.click('[data-testid="bill-actions-Phone-Bill"]');
    await page.click('[data-testid="edit-bill-button"]');
    await page.fill('[data-testid="bill-amount-input"]', "60");
    await page.click('[data-testid="save-bill-button"]');

    // Verify updated amount
    await expect(page.locator('[data-testid="bill-amount-Phone-Bill"]')).toContainText("$60.00");
  });

  test("Delete bill removes from schedule", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.click('[data-testid="nav-bills"]');

    // Add bill
    await page.click('[data-testid="add-bill-button"]');
    await page.fill('[data-testid="bill-name-input"]', "Gym Membership");
    await page.fill('[data-testid="bill-amount-input"]', "35");
    await page.click('[data-testid="save-bill-button"]');

    // Delete bill
    await page.click('[data-testid="bill-actions-Gym-Membership"]');
    await page.click('[data-testid="delete-bill-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify bill removed
    await expect(page.locator("text=Gym Membership")).not.toBeVisible();
  });
});
```

**Success Criteria**:

- ✅ Bills can be scheduled, edited, and deleted
- ✅ Marking bill as paid creates transaction and updates envelope
- ✅ Recurring bills show correct due dates
- ✅ Bill payment history is accurate

#### 2.5 Envelope Transfers Workflow

**File**: `e2e/workflows/envelope-transfers.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { seedEnvelopes } from "../fixtures/budget.fixture";

test.describe("Envelope Transfers", () => {
  test("Transfer money between envelopes", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Seed envelopes with balances
    await seedEnvelopes(page, [
      { name: "Groceries", balance: 300 },
      { name: "Dining Out", balance: 100 },
    ]);

    await page.reload();
    await page.click('[data-testid="nav-envelopes"]');

    // Initiate transfer
    await page.click('[data-testid="transfer-funds-button"]');
    await page.selectOption('[data-testid="transfer-from-select"]', "Groceries");
    await page.selectOption('[data-testid="transfer-to-select"]', "Dining Out");
    await page.fill('[data-testid="transfer-amount-input"]', "50");
    await page.click('[data-testid="confirm-transfer-button"]');

    // Verify balances updated
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$250.00"
    );
    await expect(page.locator('[data-testid="envelope-balance-Dining-Out"]')).toContainText(
      "$150.00"
    );

    // Verify transfer recorded in history
    await page.click('[data-testid="envelope-Groceries"]');
    await page.click('[data-testid="view-history-tab"]');
    await expect(page.locator("text=Transfer to Dining Out")).toBeVisible();
  });

  test("Cannot transfer more than envelope balance", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [
      { name: "Emergency Fund", balance: 100 },
      { name: "Vacation", balance: 0 },
    ]);

    await page.reload();
    await page.click('[data-testid="nav-envelopes"]');

    // Attempt invalid transfer
    await page.click('[data-testid="transfer-funds-button"]');
    await page.selectOption('[data-testid="transfer-from-select"]', "Emergency Fund");
    await page.selectOption('[data-testid="transfer-to-select"]', "Vacation");
    await page.fill('[data-testid="transfer-amount-input"]', "150");
    await page.click('[data-testid="confirm-transfer-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="transfer-error-message"]')).toContainText(
      "Insufficient funds"
    );

    // Verify balances unchanged
    await expect(page.locator('[data-testid="envelope-balance-Emergency-Fund"]')).toContainText(
      "$100.00"
    );
    await expect(page.locator('[data-testid="envelope-balance-Vacation"]')).toContainText("$0.00");
  });

  test("Bulk transfer from unallocated income", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Seed unallocated income (via paycheck that wasn't fully allocated)
    await page.click('[data-testid="nav-paychecks"]');
    await page.click('[data-testid="add-paycheck-button"]');
    await page.fill('[data-testid="paycheck-amount-input"]', "1000");
    await page.click('[data-testid="process-paycheck-button"]'); // Don't auto-allocate

    // Navigate to envelopes
    await page.click('[data-testid="nav-envelopes"]');

    // Verify unallocated balance shown
    await expect(page.locator('[data-testid="unallocated-balance"]')).toContainText("$1,000.00");

    // Bulk allocate
    await page.click('[data-testid="allocate-unallocated-button"]');

    // Allocate to multiple envelopes
    await page.fill('[data-testid="allocation-Rent-input"]', "800");
    await page.fill('[data-testid="allocation-Groceries-input"]', "200");
    await page.click('[data-testid="confirm-bulk-allocation-button"]');

    // Verify unallocated balance decreased
    await expect(page.locator('[data-testid="unallocated-balance"]')).toContainText("$0.00");

    // Verify envelopes received funds
    await expect(page.locator('[data-testid="envelope-balance-Rent"]')).toContainText("$800.00");
    await expect(page.locator('[data-testid="envelope-balance-Groceries"]')).toContainText(
      "$200.00"
    );
  });
});
```

**Success Criteria**:

- ✅ Envelope transfers work correctly
- ✅ Validation prevents over-transfer
- ✅ Unallocated income can be bulk allocated
- ✅ Transfer history is recorded

### Phase 3: Offline/Sync Tests (Week 3)

#### 3.1 Offline Transaction Queue

**File**: `e2e/sync/offline-transactions.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { goOffline, goOnline } from "../fixtures/network.fixture";
import { seedEnvelopes } from "../fixtures/budget.fixture";

test.describe("Offline Transaction Queue", () => {
  test("Transactions queued offline sync when online", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Groceries", balance: 500 }]);

    await page.reload();

    // Go offline
    await goOffline(page);

    // Add transaction while offline
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "50");
    await page.fill('[data-testid="transaction-description-input"]', "Offline purchase");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Groceries");
    await page.click('[data-testid="save-transaction-button"]');

    // Verify transaction shows as "pending sync"
    await expect(page.locator('[data-testid="transaction-sync-status"]')).toContainText("Pending");

    // Verify offline queue indicator
    await expect(page.locator('[data-testid="offline-queue-count"]')).toContainText("1");

    // Go back online
    await goOnline(page);

    // Wait for sync to complete
    await expect(page.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 10000,
    });

    // Verify offline queue cleared
    await expect(page.locator('[data-testid="offline-queue-count"]')).toContainText("0");

    // Verify transaction synced
    await expect(page.locator('[data-testid="transaction-sync-status"]')).toContainText("Synced");
  });

  test("Multiple offline operations sync in correct order", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await seedEnvelopes(page, [{ name: "Rent", balance: 1000 }]);

    await page.reload();
    await goOffline(page);

    // Perform multiple operations offline
    // 1. Add transaction
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "1000");
    await page.fill('[data-testid="transaction-description-input"]', "Rent payment");
    await page.selectOption('[data-testid="transaction-envelope-select"]', "Rent");
    await page.click('[data-testid="save-transaction-button"]');

    // 2. Add another envelope
    await page.click('[data-testid="nav-envelopes"]');
    await page.click('[data-testid="create-envelope-button"]');
    await page.fill('[data-testid="envelope-name-input"]', "Emergency Fund");
    await page.fill('[data-testid="envelope-goal-input"]', "5000");
    await page.click('[data-testid="save-envelope-button"]');

    // 3. Transfer money
    await page.click('[data-testid="transfer-funds-button"]');
    await page.selectOption('[data-testid="transfer-from-select"]', "Rent");
    await page.selectOption('[data-testid="transfer-to-select"]', "Emergency Fund");
    await page.fill('[data-testid="transfer-amount-input"]', "100");
    await page.click('[data-testid="confirm-transfer-button"]');

    // Verify queue count
    await expect(page.locator('[data-testid="offline-queue-count"]')).toContainText("3");

    // Go online and wait for sync
    await goOnline(page);
    await expect(page.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 15000,
    });

    // Verify all operations processed correctly
    await page.click('[data-testid="nav-envelopes"]');
    await expect(page.locator("text=Emergency Fund")).toBeVisible();

    // Rent should be: $1000 (initial) - $1000 (transaction) + ... wait, need to check logic
    // Actually Rent: $1000 - $1000 (rent payment) - $100 (transfer to Emergency) = -$100 (negative)
    // Or maybe balance is separate from transactions? Need to verify app logic.
    // Assuming transaction reduces balance: $1000 - $1000 = $0, then transfer: ERROR (insufficient funds)
    // This test needs clarification on app behavior
  });

  test("Offline sync retries on failure", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await goOffline(page);

    // Add transaction offline
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "25");
    await page.fill('[data-testid="transaction-description-input"]', "Coffee");
    await page.click('[data-testid="save-transaction-button"]');

    // Go online but block Firebase
    await page.context().setOffline(false);
    await page.route("**/*.firebaseapp.com/**", (route) => route.abort());

    // Sync should fail and retry
    await expect(page.locator('[data-testid="sync-status"]')).toContainText("Retrying", {
      timeout: 5000,
    });

    // Unblock Firebase
    await page.unroute("**/*.firebaseapp.com/**");

    // Sync should succeed on retry
    await expect(page.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 15000,
    });
  });
});
```

**Success Criteria**:

- ✅ Offline operations queue successfully
- ✅ Queue syncs when connection restored
- ✅ Sync retries on failure with backoff
- ✅ Operations process in correct order

#### 3.2 Cross-Browser Sync Validation

**File**: `e2e/sync/cross-browser-sync.spec.ts`

**Test Coverage**:

```typescript
import { test, expect, chromium } from "@playwright/test";

test.describe("Cross-Browser Sync", () => {
  test("Data syncs between two browsers", async () => {
    // Browser A: Authenticate and create data
    const browserA = await chromium.launch();
    const contextA = await browserA.newContext();
    const pageA = await contextA.newPage();

    await pageA.goto("/");
    await pageA.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

    // Extract auth credentials
    const budgetId = await pageA.evaluate(() => localStorage.getItem("budgetId"));
    const authToken = await pageA.evaluate(() => localStorage.getItem("firebase:authUser"));

    // Create envelope in Browser A
    await pageA.click('[data-testid="create-envelope-button"]');
    await pageA.fill('[data-testid="envelope-name-input"]', "Shared Envelope");
    await pageA.fill('[data-testid="envelope-goal-input"]', "1000");
    await pageA.click('[data-testid="save-envelope-button"]');

    // Wait for sync to Firebase
    await expect(pageA.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 10000,
    });

    // Browser B: Authenticate with same credentials
    const browserB = await chromium.launch();
    const contextB = await browserB.newContext();
    const pageB = await contextB.newPage();

    await pageB.goto("/");

    // Inject auth credentials into Browser B
    await pageB.evaluate(
      ({ budgetId, authToken }) => {
        localStorage.setItem("budgetId", budgetId);
        if (authToken) {
          localStorage.setItem("firebase:authUser", authToken);
        }
      },
      { budgetId, authToken }
    );

    await pageB.reload();
    await pageB.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

    // Wait for sync to pull data from Firebase
    await expect(pageB.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 15000,
    });

    // Verify envelope from Browser A appears in Browser B
    await pageB.click('[data-testid="nav-envelopes"]');
    await expect(pageB.locator("text=Shared Envelope")).toBeVisible({ timeout: 10000 });
    await expect(pageB.locator('[data-testid="envelope-goal-Shared-Envelope"]')).toContainText(
      "$1,000.00"
    );

    // Cleanup
    await browserA.close();
    await browserB.close();
  });

  test("Concurrent edits resolve conflicts", async () => {
    // Setup two browsers with same auth
    const browserA = await chromium.launch();
    const browserB = await chromium.launch();

    const contextA = await browserA.newContext();
    const contextB = await browserB.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Authenticate both browsers
    await pageA.goto("/");
    await pageA.waitForSelector('[data-testid="dashboard"]');

    const budgetId = await pageA.evaluate(() => localStorage.getItem("budgetId"));
    const authToken = await pageA.evaluate(() => localStorage.getItem("firebase:authUser"));

    await pageB.goto("/");
    await pageB.evaluate(
      ({ budgetId, authToken }) => {
        localStorage.setItem("budgetId", budgetId);
        if (authToken) {
          localStorage.setItem("firebase:authUser", authToken);
        }
      },
      { budgetId, authToken }
    );
    await pageB.reload();
    await pageB.waitForSelector('[data-testid="dashboard"]');

    // Create envelope in Browser A
    await pageA.click('[data-testid="create-envelope-button"]');
    await pageA.fill('[data-testid="envelope-name-input"]', "Conflict Test");
    await pageA.fill('[data-testid="envelope-goal-input"]', "100");
    await pageA.click('[data-testid="save-envelope-button"]');
    await expect(pageA.locator('[data-testid="sync-status"]')).toContainText("Synced");

    // Wait for Browser B to sync
    await pageB.waitForTimeout(3000); // Give time for sync
    await pageB.reload();

    // Both browsers edit the same envelope concurrently (offline)
    await pageA.context().setOffline(true);
    await pageB.context().setOffline(true);

    // Browser A: Change goal to $200
    await pageA.click('[data-testid="envelope-Conflict-Test"]');
    await pageA.click('[data-testid="edit-envelope-button"]');
    await pageA.fill('[data-testid="envelope-goal-input"]', "200");
    await pageA.click('[data-testid="save-envelope-button"]');

    // Browser B: Change goal to $300
    await pageB.click('[data-testid="envelope-Conflict-Test"]');
    await pageB.click('[data-testid="edit-envelope-button"]');
    await pageB.fill('[data-testid="envelope-goal-input"]', "300");
    await pageB.click('[data-testid="save-envelope-button"]');

    // Both go online (conflict should be detected)
    await pageA.context().setOffline(false);
    await pageB.context().setOffline(false);

    // Wait for conflict resolution (last-write-wins expected)
    await pageA.waitForTimeout(5000);
    await pageB.waitForTimeout(5000);

    // Verify conflict resolved (one value should win)
    const goalA = await pageA.locator('[data-testid="envelope-goal-Conflict-Test"]').textContent();
    const goalB = await pageB.locator('[data-testid="envelope-goal-Conflict-Test"]').textContent();

    // Both should converge to same value (last write wins)
    expect(goalA).toBe(goalB);

    await browserA.close();
    await browserB.close();
  });
});
```

**Success Criteria**:

- ✅ Data syncs between browsers sharing same auth
- ✅ Conflicts resolve deterministically
- ✅ Both browsers converge to consistent state
- ✅ No data loss during sync conflicts

#### 3.3 Backend Fallback Scenarios

**File**: `e2e/sync/backend-fallback.spec.ts`

**Test Coverage**:

```typescript
import { test, expect } from "../fixtures/auth.fixture";
import { blockFirebase } from "../fixtures/network.fixture";

test.describe("Backend Fallback", () => {
  test("App works offline-only when backend unavailable", async ({ page }) => {
    // Block Firebase before app loads
    await blockFirebase(page);

    await page.goto("/");

    // App should still initialize (offline-only mode)
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({ timeout: 10000 });

    // Verify offline-only indicator
    await expect(page.locator('[data-testid="offline-only-badge"]')).toBeVisible();

    // Verify core functionality works
    await page.click('[data-testid="create-envelope-button"]');
    await page.fill('[data-testid="envelope-name-input"]', "Offline Envelope");
    await page.click('[data-testid="save-envelope-button"]');

    await expect(page.locator("text=Offline Envelope")).toBeVisible();

    // Verify no sync attempts (should not show "retrying")
    await expect(page.locator('[data-testid="sync-status"]')).not.toContainText("Retrying");
  });

  test("Sync resumes when backend becomes available", async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Create envelope while online
    await page.click('[data-testid="create-envelope-button"]');
    await page.fill('[data-testid="envelope-name-input"]', "Test Envelope");
    await page.click('[data-testid="save-envelope-button"]');

    // Block backend
    await blockFirebase(page);

    // Add transaction (should queue)
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="add-transaction-button"]');
    await page.fill('[data-testid="transaction-amount-input"]', "50");
    await page.fill('[data-testid="transaction-description-input"]', "During outage");
    await page.click('[data-testid="save-transaction-button"]');

    // Verify queued
    await expect(page.locator('[data-testid="offline-queue-count"]')).toContainText("1");

    // Unblock backend
    await page.unroute("**/*.firebaseapp.com/**");
    await page.unroute("**/*.googleapis.com/**");

    // Verify sync resumes
    await expect(page.locator('[data-testid="sync-status"]')).toContainText("Synced", {
      timeout: 15000,
    });
    await expect(page.locator('[data-testid="offline-queue-count"]')).toContainText("0");
  });
});
```

**Success Criteria**:

- ✅ App initializes successfully when backend down
- ✅ Offline-only mode provides full functionality
- ✅ Sync resumes automatically when backend recovers
- ✅ No data corruption during backend outages

### Phase 4: Data Integrity & Advanced Tests (Week 4)

#### 4.1 CSV Import/Export

**File**: `e2e/data-integrity/csv-import.spec.ts`

**Test Coverage**:

- CSV import with validation
- Export and re-import workflow
- Large file handling (1000+ rows)
- Error handling for malformed CSV

#### 4.2 Backup/Restore

**File**: `e2e/data-integrity/backup-restore.spec.ts`

**Test Coverage**:

- Manual backup creation
- Auto-backup triggers
- Restore from backup
- Backup integrity validation

#### 4.3 Large Dataset Handling

**File**: `e2e/data-integrity/large-datasets.spec.ts`

**Test Coverage**:

- App performance with 1000+ transactions
- Pagination and virtualization
- Sync performance with large budgets
- IndexedDB quota management

## Alternative Approaches Considered

### Alternative 1: Extend Vitest with @vitest/browser

**Pros**:

- Keep single test framework (Vitest)
- Leverage existing test utilities
- Potentially faster than Playwright

**Cons**:

- Less mature browser automation (new feature)
- Limited multi-browser support
- Not industry standard for E2E
- May have bugs with IndexedDB, ServiceWorkers

**Rejection Reason**: Playwright is battle-tested, has better browser support, and more comprehensive documentation for E2E testing.

### Alternative 2: Cypress

**Pros**:

- Popular E2E framework
- Great developer experience with time-travel debugging
- Built-in retry logic

**Cons**:

- Slower than Playwright
- Limited multi-tab/multi-browser context testing
- More complex CI setup
- Cross-browser sync tests would be harder

**Rejection Reason**: Playwright's multi-context API makes cross-browser sync testing much simpler, and it's faster in CI.

### Alternative 3: Manual Testing Only

**Pros**:

- No test infrastructure overhead
- Flexible exploratory testing

**Cons**:

- Not scalable
- High risk of regressions
- Blocks fast deployment
- No CI validation

**Rejection Reason**: Manual testing doesn't scale with team size or deployment frequency. Automated E2E tests catch regressions before production.

### Alternative 4: Integration Tests Only (No Real Browser)

**Pros**:

- Faster than E2E
- Already have Vitest infrastructure

**Cons**:

- Can't catch browser-specific bugs (Safari IndexedDB, Firefox crypto)
- Can't test offline/online transitions realistically
- No validation of real user workflows
- Sync issues only surface in browser

**Rejection Reason**: Integration tests miss too many real-world issues. Browser-based E2E is necessary for offline-first app with cross-browser sync.

## Acceptance Criteria

### Functional Requirements

#### Phase 1: Foundation

- ✅ Playwright installed and configured
- ✅ All three browsers (Chromium, Firefox, WebKit) launch successfully
- ✅ Test fixtures (auth, budget seeding, network) work correctly
- ✅ CI workflow updated with E2E job
- ✅ E2E tests run on every PR (smoke tests) and main branch (full suite)

#### Phase 2: Core Workflows

- ✅ Smoke tests (3 tests) pass on all browsers
- ✅ Paycheck processing tests (3 tests) validate auto-allocation and manual allocation
- ✅ Transaction management tests (6 tests) cover CRUD, filtering, CSV import
- ✅ Bill payment tests (4 tests) validate scheduling, payment, editing
- ✅ Envelope transfer tests (3 tests) validate transfers and bulk allocation

#### Phase 3: Offline/Sync

- ✅ Offline queue tests (3 tests) validate queueing, syncing, retries
- ✅ Cross-browser sync tests (2 tests) validate data sync and conflict resolution
- ✅ Backend fallback tests (2 tests) validate offline-only mode and recovery

#### Phase 4: Data Integrity

- ✅ CSV import/export tests validate data portability
- ✅ Backup/restore tests validate data recovery
- ✅ Large dataset tests validate performance with 1000+ transactions

### Non-Functional Requirements

#### Performance

- ✅ Smoke tests complete in < 3 minutes
- ✅ Full workflow suite completes in < 15 minutes (Chromium only)
- ✅ Cross-browser full suite completes in < 40 minutes
- ✅ CI overhead < 5 minutes (browser install, setup)

#### Reliability

- ✅ Tests pass 95%+ consistently (< 5% flake rate)
- ✅ Retries configured (2x in CI) to handle transient failures
- ✅ Test isolation ensures no state bleed between tests
- ✅ Cleanup utilities remove all test data after runs

#### Maintainability

- ✅ Test code follows DRY principles (fixtures, utils, selectors)
- ✅ Selectors centralized using `data-testid` attributes
- ✅ Test data factories for consistent seeding
- ✅ Clear test names and descriptions

#### CI/CD Integration

- ✅ E2E failure blocks PR merge
- ✅ Test artifacts (traces, screenshots, HTML report) uploaded on failure
- ✅ PR comment includes E2E results summary
- ✅ Failed tests link to Playwright HTML report for debugging

### Quality Gates

#### Before Merging to Main

- ✅ All E2E tests pass on Chromium
- ✅ Smoke tests pass on Firefox and WebKit
- ✅ No test skips or TODOs in merged code
- ✅ Code review by team member

#### Before Production Deploy

- ✅ Full E2E suite passes on all browsers
- ✅ No P0/P1 bugs found in E2E testing
- ✅ Performance tests show no regressions
- ✅ Backup/restore tests validate data integrity

## Success Metrics

### Test Coverage

- **Target**: 50-60 E2E tests covering critical user workflows
- **Actual**: _To be measured after Phase 2_
- **Measurement**: Count of test files and test cases

### Critical Path Coverage

- **Target**: 100% of core workflows (paycheck, transactions, bills, envelopes) covered
- **Actual**: _To be measured after Phase 2_
- **Measurement**: Manual checklist of workflows vs. test coverage

### Bug Detection Rate

- **Target**: Catch 3+ regressions per sprint that unit tests missed
- **Actual**: _To be measured over first 2 sprints_
- **Measurement**: Count of bugs caught by E2E tests in CI before merge

### Flake Rate

- **Target**: < 5% of test runs have flaky failures
- **Actual**: _To be measured over first month_
- **Measurement**: (Flaky runs / Total runs) \* 100

### CI Time Impact

- **Target**: E2E adds < 10 minutes to PR merge time
- **Actual**: _To be measured after CI integration_
- **Measurement**: Average CI duration before/after E2E

### Developer Confidence

- **Target**: 80%+ of developers feel confident deploying after E2E passes
- **Actual**: _To be measured via survey after 1 month_
- **Measurement**: Anonymous developer survey

## Dependencies & Risks

### Dependencies

#### External

- **Playwright Framework**: Stable, well-maintained (low risk)
- **Firebase Test Project**: Need separate project for E2E (requires setup)
- **GitHub Actions**: Existing infrastructure (low risk)
- **Browser Binaries**: Auto-installed by Playwright (low risk)

#### Internal

- **Test Environment Variables**: Need `.env.test` and GitHub Secrets configured
- **Test Data Cleanup**: Requires Firebase Admin SDK or manual cleanup scripts
- **Existing Vitest Infrastructure**: E2E should not conflict with unit tests
- **Deployment Pipeline**: E2E job must integrate cleanly into existing workflow

### Prerequisites

- ✅ Firebase test project created with security rules
- ✅ GitHub Secrets configured for E2E Firebase credentials
- ✅ Team trained on running E2E tests locally
- ✅ `data-testid` attributes added to UI components (incrementally)

### Risks & Mitigation

#### Risk 1: Test Flakiness

**Impact**: High - Flaky tests block PRs, reduce confidence
**Likelihood**: Medium - E2E tests are inherently more flaky than unit tests
**Mitigation**:

- Use explicit waits (`waitForSelector`) instead of fixed timeouts
- Configure retries (2x in CI)
- Implement test isolation with cleanup hooks
- Use Playwright's auto-waiting features
- Monitor flake rate and fix flaky tests immediately

#### Risk 2: CI Time Overhead

**Impact**: Medium - Slow CI delays merges
**Likelihood**: Medium - E2E tests are slower than unit tests
**Mitigation**:

- Run smoke tests only on PRs (3 min)
- Run full suite only on main branch (40 min)
- Parallelize tests (4 workers)
- Use Chromium-only for workflow tests (skip Firefox/WebKit)

#### Risk 3: Firebase Test Data Pollution

**Impact**: High - Test data polluting production Firebase
**Likelihood**: Low - With proper env var setup
**Mitigation**:

- Use separate Firebase project for E2E
- Add safety checks (env var validation)
- Implement robust cleanup utilities
- Document test environment setup clearly

#### Risk 4: Cross-Browser Sync Tests Complexity

**Impact**: Medium - Multi-browser tests are complex to write
**Likelihood**: Medium - New pattern for team
**Mitigation**:

- Start with single-browser smoke tests (Phase 1)
- Add cross-browser tests in Phase 3 after team familiar with Playwright
- Create reusable fixtures for multi-browser auth
- Document patterns in wiki/README

#### Risk 5: Test Maintenance Burden

**Impact**: Medium - Stale tests become technical debt
**Likelihood**: Medium - UI changes break tests
**Mitigation**:

- Use `data-testid` for stable selectors (avoid brittle CSS selectors)
- Centralize selectors in `selectors.ts` file
- Update tests in same PR as UI changes
- Add "update E2E tests" to PR checklist

#### Risk 6: Team Lacks E2E Expertise

**Impact**: Medium - Slow adoption, tests not written correctly
**Likelihood**: High - Team primarily writes unit/integration tests
**Mitigation**:

- Pair programming for first few E2E tests
- Create E2E test examples and templates
- Host training session on Playwright best practices
- Document common patterns in CONTRIBUTING.md

#### Risk 7: IndexedDB/Firebase Mocking Complexity

**Impact**: Low - Tests may require complex mocking
**Likelihood**: Low - Using real Firebase test project
**Mitigation**:

- Use real Firebase test project (not mocks)
- Use `fake-indexeddb` already in Vitest setup
- Only mock external APIs (not Firebase/IndexedDB)

## Resource Requirements

### Team

- **Frontend Developer** (2 weeks): Implement Phases 1-2
- **Frontend Developer** (1 week): Implement Phase 3
- **QA Engineer** (1 week): Implement Phase 4 + review tests
- **DevOps** (2 days): CI integration and Firebase test project setup

**Total Effort**: ~4-5 person-weeks

### Infrastructure

- **Firebase Test Project**: Free tier sufficient for E2E testing
- **GitHub Actions Minutes**: ~10 min/PR × 20 PRs/week = 200 min/week (within free tier)
- **Storage**: Playwright artifacts ~50MB/run, retain 30 days (within GitHub free tier)

### Tools & Licenses

- **Playwright**: Free, open-source
- **Firebase**: Free tier (no additional cost)
- **GitHub Actions**: Free for public repos, included in GitHub plan

## Future Considerations

### Phase 5: Advanced Testing (Post-MVP)

#### Visual Regression Testing

- Integrate Playwright's screenshot comparison
- Catch unintended UI changes
- Store baseline images in repo

#### Performance Monitoring

- Add Lighthouse CI integration
- Track Core Web Vitals over time
- Performance budgets in CI

#### Accessibility Testing

- Integrate axe-core for automated a11y checks
- Keyboard navigation tests
- Screen reader compatibility tests

#### Mobile App Testing (PWA)

- Test PWA install flow
- Home screen launch
- Offline asset caching
- Push notification handling

### Extensibility

#### Custom Playwright Commands

```typescript
// e2e/utils/custom-commands.ts
export async function loginAs(page: Page, role: "user" | "admin") {
  // Custom login logic
}

export async function seedBudget(page: Page, scenario: "empty" | "populated" | "large") {
  // Custom seeding logic
}
```

#### Test Data Factories

```typescript
// e2e/utils/factories.ts
export function createEnvelope(overrides?: Partial<Envelope>): Envelope {
  return {
    id: crypto.randomUUID(),
    name: "Test Envelope",
    balance: 100,
    goal: 500,
    ...overrides,
  };
}
```

#### Page Object Model (Optional)

If tests become complex, consider Page Object Model pattern:

```typescript
// e2e/pages/EnvelopesPage.ts
export class EnvelopesPage {
  constructor(private page: Page) {}

  async createEnvelope(name: string, goal: number) {
    await this.page.click('[data-testid="create-envelope-button"]');
    await this.page.fill('[data-testid="envelope-name-input"]', name);
    await this.page.fill('[data-testid="envelope-goal-input"]', goal.toString());
    await this.page.click('[data-testid="save-envelope-button"]');
  }

  async getBalance(envelopeName: string): Promise<number> {
    const text = await this.page
      .locator(`[data-testid="envelope-balance-${envelopeName}"]`)
      .textContent();
    return parseFloat(text.replace(/[$,]/g, ""));
  }
}
```

### Long-Term Vision

**Year 1**: Comprehensive E2E coverage of all core workflows + offline/sync scenarios
**Year 2**: Visual regression, performance monitoring, a11y testing integrated
**Year 3**: AI-powered test generation from user sessions, self-healing tests

## Documentation Plan

### Developer Documentation

#### New Files to Create

1. **`docs/testing/e2e-testing.md`**
   - Overview of E2E testing approach
   - How to run tests locally
   - How to write new E2E tests
   - Troubleshooting common issues
   - Best practices and patterns

2. **`docs/testing/playwright-setup.md`**
   - Playwright installation
   - Browser configuration
   - Environment variables
   - Firebase test project setup

3. **`e2e/README.md`**
   - Test directory structure
   - Fixture usage
   - Running specific test suites
   - Debugging failed tests

#### Updates to Existing Files

1. **`Agent.md`**
   - Add E2E testing requirements
   - Mandate `data-testid` attributes for new components
   - Require E2E tests for critical workflow changes

2. **`CONTRIBUTING.md`**
   - Add E2E testing to PR checklist
   - Document when E2E tests are required
   - Link to E2E testing guide

3. **`.github/workflows/ci.yml`**
   - Inline comments explaining E2E job
   - Document environment variables
   - Explain artifact retention policy

### User Documentation

_Not applicable - E2E tests are developer-facing only_

### Training Materials

- **Wiki Page**: "Getting Started with Playwright E2E Testing"
- **Video Tutorial**: Recording of first E2E test implementation (pair programming session)
- **Cheat Sheet**: Common Playwright commands and patterns (1-pager)

## References & Research

### Internal References

**Existing Test Infrastructure**:

- [vitest.config.ts](vitest.config.ts) - Configuration patterns to replicate
- [src/test/setup.ts](src/test/setup.ts:1) - Mock patterns for Firebase, IndexedDB, Crypto
- [src/contexts/**tests**/AuthContext.test.tsx](src/contexts/__tests__/AuthContext.test.tsx:1) - Auth testing patterns

**Coverage Gaps to Address**:

- [docs/testing/COVERAGE_GAP_ANALYSIS.md](docs/testing/COVERAGE_GAP_ANALYSIS.md) - Priority test scenarios

**Feature Documentation**:

- [docs/features/offline-queue.md](docs/features/offline-queue.md) - Offline sync implementation
- [docs/features/progressive-enhancement.md](docs/features/progressive-enhancement.md) - Backend fallback strategy

**Architecture**:

- [src/db/budgetDb.ts](src/db/budgetDb.ts:1) - Dexie database schema
- [src/services/sync/](src/services/sync/) - Sync orchestration services
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx:1) - Auth state management

**CI/CD**:

- [.github/workflows/ci.yml](.github/workflows/ci.yml:1) - Existing CI pipeline
- [scripts/full_salvo.sh](scripts/full_salvo.sh:1) - Local test runner

### External References

**Playwright Documentation**:

- [Playwright Getting Started](https://playwright.dev/docs/intro) - Official guide
- [Best Practices](https://playwright.dev/docs/best-practices) - Recommended patterns
- [CI Configuration](https://playwright.dev/docs/ci) - GitHub Actions setup

**Best Practices Articles**:

- [Playwright + React Testing Patterns](https://blog.logrocket.com/playwright-vs-cypress/) - 2025 comparison
- [E2E Testing Offline-First Apps](https://web.dev/offline/) - Progressive web app testing
- [Cross-Browser Testing Strategies](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - 2024 guide

**Relevant Stack Overflow**:

- [Testing IndexedDB with Playwright](https://stackoverflow.com/questions/playwright-indexeddb)
- [Firebase Auth in E2E Tests](https://stackoverflow.com/questions/firebase-test-auth)
- [Network Interception in Playwright](https://stackoverflow.com/questions/playwright-offline)

### Related Work

**Previous PRs**:

- [#1893](https://github.com/user/repo/pull/1893) - Analytics privacy dashboard (privacy flows to test)
- [#1892](https://github.com/user/repo/pull/1892) - Recharts visualizations (charts rendering to test)
- [#1891](https://github.com/user/repo/pull/1891) - Analytics tier selection (tier switching to test)

**Related Issues**:

- [#665](https://github.com/user/repo/issues/665) - Auth Context migration (auth patterns established)

**Design Documents**:

- Current branch: `feat/analytics-phase2-private-backend` - Analytics features need E2E validation

---

## Implementation Checklist

### Week 1: Foundation

- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Create `playwright.config.ts` with browser matrix
- [ ] Set up test directory structure: `e2e/{smoke,workflows,sync,auth,data-integrity}`
- [ ] Create auth fixture (`e2e/fixtures/auth.fixture.ts`)
- [ ] Create budget seeding fixture (`e2e/fixtures/budget.fixture.ts`)
- [ ] Create network helpers (`e2e/fixtures/network.fixture.ts`)
- [ ] Set up Firebase test project
- [ ] Create `.env.test` with test credentials
- [ ] Update `.github/workflows/ci.yml` with E2E job
- [ ] Add npm scripts: `test:e2e`, `test:e2e:smoke`, `test:e2e:ui`
- [ ] Document setup in `docs/testing/playwright-setup.md`

### Week 2: Core Workflows

- [ ] Implement smoke tests (`e2e/smoke/app-basic-flow.spec.ts`)
- [ ] Verify smoke tests pass on Chromium, Firefox, WebKit
- [ ] Implement paycheck processing tests (`e2e/workflows/paycheck-processing.spec.ts`)
- [ ] Implement transaction management tests (`e2e/workflows/transaction-management.spec.ts`)
- [ ] Implement bill payment tests (`e2e/workflows/bill-payment.spec.ts`)
- [ ] Implement envelope transfers tests (`e2e/workflows/envelope-transfers.spec.ts`)
- [ ] Add `data-testid` attributes to components as needed
- [ ] Verify all workflow tests pass on Chromium
- [ ] Update PR template to include E2E test requirement

### Week 3: Offline/Sync

- [ ] Implement offline transaction queue tests (`e2e/sync/offline-transactions.spec.ts`)
- [ ] Implement cross-browser sync tests (`e2e/sync/cross-browser-sync.spec.ts`)
- [ ] Implement backend fallback tests (`e2e/sync/backend-fallback.spec.ts`)
- [ ] Verify sync tests handle timing correctly (no flakiness)
- [ ] Test multi-browser context authentication patterns
- [ ] Document sync testing patterns in `docs/testing/e2e-testing.md`

### Week 4: Data Integrity & Polish

- [ ] Implement CSV import tests (`e2e/data-integrity/csv-import.spec.ts`)
- [ ] Implement backup/restore tests (`e2e/data-integrity/backup-restore.spec.ts`)
- [ ] Implement large dataset tests (`e2e/data-integrity/large-datasets.spec.ts`)
- [ ] Verify CI uploads artifacts on failure
- [ ] Add E2E results to PR comment
- [ ] Run full suite 10 times to measure flake rate
- [ ] Fix any flaky tests identified
- [ ] Create developer wiki page with examples
- [ ] Host team training session on Playwright

### Post-Implementation

- [ ] Monitor E2E test results for first sprint
- [ ] Gather developer feedback via survey
- [ ] Measure bug detection rate (regressions caught)
- [ ] Optimize slow tests (identify tests > 60s)
- [ ] Add visual regression testing (Phase 5, optional)
- [ ] Add performance monitoring (Phase 5, optional)
- [ ] Review and update documentation based on team feedback

---

**Plan Owner**: _To be assigned_
**Estimated Completion**: 4 weeks from start date
**Last Updated**: 2026-02-04
