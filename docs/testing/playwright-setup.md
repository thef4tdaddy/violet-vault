# Playwright E2E Testing Setup Guide

## Overview

Violet Vault uses Playwright for end-to-end testing of critical user workflows. Tests run against a real browser with demo mode enabled for automatic test data seeding.

**Key Benefits:**
- 🚀 Tests run fast (fixtures handle data setup)
- 🎯 Tests are reliable (no UI-based test data creation)
- 🌐 Multi-browser support (Chromium, Firefox, WebKit)
- 📊 Automatic reporting (HTML + blob reporters for CI)

## Quick Start

### Prerequisites

- Node.js 18+ (already installed if you're developing)
- npm (comes with Node.js)

### Installation

Playwright is already installed. If needed:

```bash
npm install -D @playwright/test --legacy-peer-deps
```

### Run Tests Locally

```bash
# Run all E2E tests (Chromium only)
npm run test:e2e

# Run smoke tests only (fast validation)
npm run test:e2e:smoke

# Run tests with interactive UI
npm run test:e2e:ui

# Run tests in debug mode (step through tests)
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

### View Test Results

After tests complete:

```bash
# Open HTML report in browser
open playwright-report/index.html
```

## Configuration

### playwright.config.ts

Located in project root. Key configuration:

```typescript
export default defineConfig({
  testDir: './e2e',                    // Test file location
  fullyParallel: true,                 // Run tests in parallel
  forbidOnly: !!process.env.CI,        // Fail if test.only in CI
  retries: process.env.CI ? 2 : 0,    // Retry failed tests in CI
  workers: process.env.CI ? 1 : 4,    // Worker configuration
  timeout: 60 * 1000,                  // 60 second test timeout
  expect: { timeout: 5 * 1000 },      // 5 second assertion timeout
  webServer: {
    command: 'VITE_DEMO_MODE=true npx vite',  // Start dev server with demo mode
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Environment Variables

Tests use `.env.test` for configuration:

```
VITE_DEMO_MODE=true           # Enable automatic test data seeding
VITE_FIREBASE_API_KEY=...     # Firebase test project credentials
VITE_TEST_NO_AUTH=false       # Use Firebase auth (not demo-only)
```

## Test Structure

### Directory Organization

```
e2e/
├── smoke/                    # Critical path smoke tests
│   └── app-basic-flow.spec.ts
├── workflows/                # Core workflow tests
│   ├── paycheck-processing.spec.ts
│   ├── transaction-management.spec.ts
│   ├── bill-payment.spec.ts
│   └── envelope-transfers.spec.ts
├── sync/                     # Offline/sync tests
│   ├── offline-transactions.spec.ts
│   ├── cross-browser-sync.spec.ts
│   └── backend-fallback.spec.ts
├── data-integrity/           # Data integrity tests
│   ├── csv-import.spec.ts
│   ├── backup-restore.spec.ts
│   └── large-datasets.spec.ts
├── fixtures/                 # Reusable test fixtures
│   ├── auth.fixture.ts       # Demo mode authentication
│   ├── budget.fixture.ts     # Test data seeding
│   └── network.fixture.ts    # Network simulation
└── utils/                    # Test utilities
    ├── assertions.ts        # Domain-specific assertions
    └── selectors.ts         # Centralized UI selectors
```

## Using Fixtures

### Authentication Fixture

All tests automatically authenticate with demo mode:

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('example test', async ({ page }) => {
  // page is already authenticated with demo mode
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/dashboard/);
});
```

### Budget Seeding Fixture

Create test data programmatically:

```typescript
import { seedEnvelopes, seedTransactions } from '../fixtures/budget.fixture';

test('test with data', async ({ page }) => {
  const envelopes = await seedEnvelopes(page, [
    { name: 'Groceries', goal: 500 },
    { name: 'Gas', goal: 200 }
  ]);

  const transactions = await seedTransactions(page, envelopes[0].id, [
    { description: 'Store', amount: 50 },
    { description: 'Farmer Market', amount: 35 }
  ]);

  // Test with real data
});
```

### Network Fixture

Simulate offline/online scenarios:

```typescript
import { goOffline, goOnline, blockFirebase } from '../fixtures/network.fixture';

test('offline functionality', async ({ page }) => {
  await goOffline(page);
  // ... test offline behavior

  await goOnline(page);
  // ... test sync behavior
});
```

## Best Practices

### 1. Use Fixtures for Setup

✅ **Good:** Use fixtures to create test data

```typescript
const envelopes = await seedEnvelopes(page, [/* ... */]);
```

❌ **Avoid:** Creating data via UI clicks

```typescript
// Slow and unreliable
await page.click('button:has-text("Add")');
```

### 2. Use Selectors Utility

✅ **Good:** Centralized selectors

```typescript
import { SELECTORS } from '../utils/selectors';
await page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE).click();
```

❌ **Avoid:** Hardcoded selectors scattered everywhere

```typescript
await page.click('button:has-text("Add Envelope")');
```

### 3. Use Demo Mode

Tests run with `VITE_DEMO_MODE=true` which:
- Seeds initial budget data automatically
- Skips real authentication (uses anonymous demo auth)
- Enables `window.budgetDb` access for direct DB testing
- Makes tests fast and reliable

### 4. Use Appropriate Timeouts

```typescript
// Good: reasonable timeout
await page.locator('text=Envelope').waitFor({ timeout: 5000 });

// Avoid: too short (flaky)
await page.locator('text=Envelope').waitFor({ timeout: 500 });

// Avoid: too long (slow tests)
await page.locator('text=Envelope').waitFor({ timeout: 60000 });
```

### 5. Test Critical Paths Only

Focus on:
- ✅ Core user workflows (paycheck, transactions, bills)
- ✅ Offline/sync functionality
- ✅ Data integrity
- ✅ Performance with large datasets

Don't test:
- ❌ Third-party library behavior
- ❌ UI animation details
- ❌ Browser-specific quirks

## Debugging Tests

### Run Single Test File

```bash
npx playwright test e2e/smoke/app-basic-flow.spec.ts
```

### Run Tests Matching Pattern

```bash
npx playwright test -g "paycheck"
```

### Debug Mode (Step Through)

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector - step through test line by line.

### Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

Tests run with visible browser window.

### Generate Trace

```bash
npx playwright test --trace on
```

View traces in Playwright Inspector for debugging.

### Screenshots and Videos

Tests automatically capture:
- 📸 Screenshots on failure (in `test-results/`)
- 🎥 Videos on failure (in `test-results/`)

View in HTML report.

## CI/CD Integration

### GitHub Actions

E2E tests run in CI with:

```yaml
- name: Run Playwright tests
  run: npm run test:e2e
  env:
    CI: true
```

CI Configuration:
- Runs on every PR
- Runs smoke tests on every commit
- Runs full test suite on main branch
- Uses 4 shards for parallel execution
- Artifacts retained: 7 days (PR), 30 days (main)

### Local vs CI Differences

| Setting | Local | CI |
|---------|-------|-----|
| Workers | 50% of cores | 1 |
| Retries | None | 2 |
| Timeout | 60s | 60s |
| Browsers | Chromium (default) | Chromium, Firefox, WebKit |
| Demo Mode | ✅ Yes | ✅ Yes |

## Troubleshooting

### Tests timeout during dev server startup

**Issue:** `Error: Process from config.webServer was not able to start`

**Solution:** Increase timeout in `playwright.config.ts`:

```typescript
webServer: {
  timeout: 180 * 1000,  // Increase to 180 seconds
},
```

### Demo mode not working

**Issue:** `window.budgetDb is undefined`

**Solution:** Verify dev server is running with demo mode:

```bash
VITE_DEMO_MODE=true npx vite
```

### Tests fail with "Element not found"

**Issue:** Locator timeouts

**Solution:**
1. Increase timeout: `.waitFor({ timeout: 10000 })`
2. Check selector with Playwright Inspector
3. Verify element actually exists in app

### Firebase errors in tests

**Issue:** Authentication or Firestore errors

**Solution:**
- Tests should use demo mode (VITE_DEMO_MODE=true)
- If using real Firebase, verify credentials in `.env.test`
- Check Firebase test project exists and is configured correctly

## Performance Targets

- Smoke tests: < 2 minutes
- Core workflows: < 3 minutes each
- Offline/sync: < 5 minutes
- Data integrity: < 8 minutes
- Full suite: < 30 minutes

## References

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Violet Vault E2E Testing Plan](../../docs/plans/2026-02-04-feat-playwright-e2e-testing-plan.md)

## Questions?

Check the E2E README for test structure and running instructions:

```bash
cat e2e/README.md
```
