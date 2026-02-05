# Playwright E2E Tests for Violet Vault

Quick reference for running and writing E2E tests.

## 📋 Quick Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run smoke tests (fast)
npm run test:e2e:smoke

# Run with interactive UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run with visible browser
npm run test:e2e:headed

# Run single test file
npx playwright test e2e/smoke/app-basic-flow.spec.ts

# Run tests matching pattern
npx playwright test -g "paycheck"

# View last report
open playwright-report/index.html
```

## 📁 Directory Structure

```
e2e/
├── README.md                          # This file
├── fixtures/
│   ├── auth.fixture.ts               # Demo mode auto-authentication
│   ├── budget.fixture.ts             # Test data seeding functions
│   └── network.fixture.ts            # Network simulation helpers
├── utils/
│   ├── assertions.ts                 # Domain-specific assertions
│   ├── selectors.ts                  # Centralized UI selectors
│   └── file-helpers.ts               # CSV and file handling
├── smoke/
│   └── app-basic-flow.spec.ts        # Critical path smoke tests
├── workflows/
│   ├── paycheck-processing.spec.ts   # Paycheck workflow tests
│   ├── transaction-management.spec.ts # Transaction CRUD tests
│   ├── bill-payment.spec.ts          # Bill payment tests
│   └── envelope-transfers.spec.ts    # Envelope transfer tests
├── sync/
│   ├── offline-transactions.spec.ts  # Offline queue tests
│   ├── cross-browser-sync.spec.ts    # Multi-device sync tests
│   └── backend-fallback.spec.ts      # Backend unavailable tests
└── data-integrity/
    ├── csv-import.spec.ts            # CSV import/export tests
    ├── backup-restore.spec.ts        # Backup/restore tests
    └── large-datasets.spec.ts        # Performance tests
```

## 🚀 Writing Tests

### Basic Test Template

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('example test', async ({ page }) => {
  // page is already authenticated with demo mode enabled

  // Navigate to app
  await page.goto('/dashboard');

  // Find element
  const button = page.locator('button:has-text("Add")');

  // Interact
  await button.click();

  // Assert
  await expect(page.locator('text=Created')).toBeVisible();
});
```

### Using Test Data Fixtures

```typescript
import { test } from '../fixtures/auth.fixture';
import { seedEnvelopes, seedTransactions } from '../fixtures/budget.fixture';

test('with test data', async ({ page }) => {
  // Create envelopes programmatically
  const envelopes = await seedEnvelopes(page, [
    { name: 'Groceries', goal: 500 }
  ]);

  // Create transactions
  const transactions = await seedTransactions(page, envelopes[0].id, [
    { description: 'Store', amount: 50 }
  ]);

  // Test using the created data
  await page.goto('/dashboard');
  await expect(page.locator('text=Groceries')).toBeVisible();
});
```

### Using Network Simulation

```typescript
import { test } from '../fixtures/auth.fixture';
import { goOffline, goOnline } from '../fixtures/network.fixture';

test('offline functionality', async ({ page }) => {
  // Go offline
  await goOffline(page);

  // ... test offline behavior

  // Go online
  await goOnline(page);

  // ... test sync behavior
});
```

### Using Selectors Utility

```typescript
import { SELECTORS } from '../utils/selectors';

test('using centralized selectors', async ({ page }) => {
  // Use centralized selectors for consistency
  await page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE).click();

  const envelopeInput = page.locator(SELECTORS.INPUTS.ENVELOPE_NAME);
  await envelopeInput.fill('My Envelope');
});
```

## 🎯 Test Categories

### Smoke Tests (`e2e/smoke/`)
- ✅ App loads
- ✅ Authentication works
- ✅ Basic CRUD operations
- ✅ Page reload persists data

**Run:** `npm run test:e2e:smoke`

### Workflow Tests (`e2e/workflows/`)
- ✅ Paycheck processing (auto/manual allocation)
- ✅ Transaction CRUD (create, edit, delete, search, filter)
- ✅ Bill payment (creation, payment, recurring, overdue)
- ✅ Envelope transfers (validation, bulk allocation)

**Run:** `npx playwright test e2e/workflows`

### Sync Tests (`e2e/sync/`)
- ✅ Offline transaction queuing
- ✅ Cross-browser synchronization
- ✅ Backend fallback/recovery
- ✅ Conflict resolution

**Run:** `npx playwright test e2e/sync`

### Data Integrity Tests (`e2e/data-integrity/`)
- ✅ CSV import/export
- ✅ Backup/restore
- ✅ Large dataset handling (1000+ transactions)

**Run:** `npx playwright test e2e/data-integrity`

## 📊 Demo Mode

All tests run with `VITE_DEMO_MODE=true` which provides:

- ✅ Automatic authentication (no login needed)
- ✅ Seeded demo data on app start
- ✅ `window.budgetDb` access for programmatic data setup
- ✅ No Firebase auth delays

## 🔍 Debugging

### Interactive UI Mode
```bash
npm run test:e2e:ui
```
Visual test browser - select tests to run, see live updates.

### Debug Mode (Step Through)
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector - pause, step, inspect variables.

### View Failures
```bash
open playwright-report/index.html
```
View screenshots, videos, and traces of failed tests.

### Single Test File
```bash
npx playwright test e2e/smoke/app-basic-flow.spec.ts
```

### Matching Pattern
```bash
npx playwright test -g "paycheck"
```

## ✅ Best Practices

1. **Use Fixtures for Setup** - Don't create data via UI clicks
   ```typescript
   const envelopes = await seedEnvelopes(page, [...]);
   ```

2. **Use Selectors Utility** - Centralize element selection
   ```typescript
   page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE)
   ```

3. **Name Tests Clearly** - Describe what is being tested
   ```typescript
   test('processes paycheck and allocates to envelopes', ...)
   ```

4. **One Assertion Per Concept** - But multiple related assertions OK
   ```typescript
   await expect(envelopeBalance).toBe(450);
   await expect(envelopeElement).toBeVisible();
   ```

5. **Use Demo Mode** - All tests should use demo mode
   ```typescript
   // Built-in to auth.fixture
   import { test } from '../fixtures/auth.fixture';
   ```

6. **Test Workflows, Not UI** - Test user journeys, not implementation
   ```typescript
   // Good: Test that paycheck allocates correctly
   // Bad: Test that form has 3 fields
   ```

## 📈 Performance

- **Smoke tests:** < 2 min (3 tests)
- **Workflow tests:** < 3 min each
- **Sync tests:** < 5 min each
- **Data integrity:** < 8 min each
- **Full suite:** < 30 min

## 🆘 Common Issues

### Element not found
```typescript
// Add timeout or check selector
await page.locator(selector).waitFor({ timeout: 10000 });
```

### Timeout during dev server startup
Increase timeout in `playwright.config.ts`:
```typescript
webServer: { timeout: 180 * 1000 }
```

### Demo mode not loading
```bash
# Make sure dev server has demo mode enabled
VITE_DEMO_MODE=true npx vite
```

### Tests fail in CI but pass locally
- Increase timeout for CI (network slower)
- Use retries in CI configuration
- Check for race conditions (wait for element explicitly)

## 📚 Full Documentation

See `docs/testing/playwright-setup.md` for comprehensive guide:
- Setup and configuration
- All fixture usage
- Debugging techniques
- CI/CD integration
- Troubleshooting

## 🔗 Resources

- [Playwright Docs](https://playwright.dev)
- [Violet Vault E2E Plan](../docs/plans/2026-02-04-feat-playwright-e2e-testing-plan.md)
- [Auth Fixture](./fixtures/auth.fixture.ts)
- [Budget Fixture](./fixtures/budget.fixture.ts)
- [Network Fixture](./fixtures/network.fixture.ts)
- [Selectors](./utils/selectors.ts)
- [Assertions](./utils/assertions.ts)
