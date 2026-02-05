# E2E Testing Quick Start Guide

Welcome to Violet Vault E2E testing! This guide gets you up and running with Playwright tests locally.

## 📦 Prerequisites

- Node.js 22+ installed
- Dependencies installed: `npm ci`
- Playwright browsers installed: `npx playwright install`

## 🚀 Running Tests Locally

### One-Time Setup

```bash
# Install Playwright browsers (includes system dependencies)
npx playwright install --with-deps
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test Categories

```bash
# Smoke tests (fast, <2 min) - critical path only
npm run test:e2e:smoke

# Workflow tests - full user journeys
npx playwright test e2e/workflows

# Sync tests - offline behavior
npx playwright test e2e/sync

# Data integrity tests - CSV, backups, large datasets
npx playwright test e2e/data-integrity
```

### Run Single Test File

```bash
npx playwright test e2e/smoke/app-basic-flow.spec.ts
```

### Run Tests Matching Pattern

```bash
# Runs all tests with "paycheck" in their name
npx playwright test -g "paycheck"
```

## 🎬 Interactive Development

### Visual Test UI

```bash
npm run test:e2e:ui
```

Launch interactive test browser:
- Select tests to run
- See live test execution
- Inspect DOM elements
- Time travel through test steps

### Debug Mode (Step Through)

```bash
npm run test:e2e:debug
```

Opens Playwright Inspector:
- Pause test execution
- Step through test code
- Inspect variables and DOM
- Evaluate expressions in console

### Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

Tests run with visible browser window - great for visual debugging.

## 📊 Viewing Test Reports

### View Last Test Report

```bash
open playwright-report/index.html
```

Reports show:
- ✅ Passed/failed tests
- 📸 Screenshots of failures
- 🎥 Videos of failed test runs
- 📍 Traces for detailed inspection

## 🔍 Common Development Workflows

### Writing a New Test

1. Create test file in appropriate directory:
   ```bash
   # e2e/workflows/my-new-feature.spec.ts
   # e2e/smoke/my-smoke-test.spec.ts
   # e2e/sync/my-sync-test.spec.ts
   # e2e/data-integrity/my-integrity-test.spec.ts
   ```

2. Use the test template:
   ```typescript
   import { test, expect } from '../fixtures/auth.fixture';
   import { seedEnvelopes } from '../fixtures/budget.fixture';
   import { SELECTORS } from '../utils/selectors';

   test('should do something', async ({ page }) => {
     // Setup test data programmatically
     const envelopes = await seedEnvelopes(page, [
       { name: 'Groceries', goal: 500 }
     ]);

     // Navigate
     await page.goto('/dashboard');

     // Interact
     await page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE).click();

     // Assert
     await expect(page.locator('text=Groceries')).toBeVisible();
   });
   ```

3. Run your test:
   ```bash
   npx playwright test e2e/workflows/my-new-feature.spec.ts
   ```

4. Debug in UI mode:
   ```bash
   npm run test:e2e:ui
   ```

### Testing Offline Functionality

```typescript
import { test } from '../fixtures/auth.fixture';
import { goOffline, goOnline } from '../fixtures/network.fixture';

test('should sync when coming back online', async ({ page }) => {
  await page.goto('/dashboard');

  // Go offline and do something
  await goOffline(page);
  await page.locator(SELECTORS.BUTTONS.ADD_ENVELOPE).click();

  // Verify pending state
  await expect(page.locator('[data-testid*="pending"]')).toBeVisible();

  // Come back online
  await goOnline(page);

  // Verify sync happened
  await expect(page.locator('[data-testid*="pending"]')).not.toBeVisible();
});
```

### Testing with Seeded Data

```typescript
import { test } from '../fixtures/auth.fixture';
import { seedEnvelopes, seedTransactions } from '../fixtures/budget.fixture';

test('should show transactions', async ({ page }) => {
  // Create test data directly in IndexedDB
  const envelopes = await seedEnvelopes(page, [
    { name: 'Groceries', goal: 500 },
    { name: 'Gas', goal: 200 }
  ]);

  // Add transactions
  const transactions = await seedTransactions(page, envelopes[0].id, [
    { description: 'Whole Foods', amount: 85.50 },
    { description: 'Target', amount: 42.99 }
  ]);

  // Navigate and verify
  await page.goto('/dashboard');
  await expect(page.locator('text=Whole Foods')).toBeVisible();
  await expect(page.locator('text=Target')).toBeVisible();
});
```

## 🐛 Troubleshooting

### Tests are Slow

**Possible causes:**
- Vite dev server not cached
- Browser not cached
- Network issues

**Solutions:**
```bash
# Ensure browser cache is warm
npx playwright install

# Run specific test to avoid full suite startup
npx playwright test e2e/smoke/app-basic-flow.spec.ts

# Headed mode might be slower - use regular mode
npm run test:e2e
```

### Tests Timeout

**Possible causes:**
- Dev server not starting
- Demo mode not enabled
- Network connectivity

**Solutions:**
```bash
# Check demo mode is enabled
echo $VITE_DEMO_MODE  # Should be "true"

# Manually verify dev server runs
VITE_DEMO_MODE=true npx vite

# Check http://localhost:5173 loads
# If app doesn't load, check browser console for errors
```

### Element Not Found

**Common issues:**
- Selector is stale/outdated
- Element hasn't rendered yet
- Demo mode not enabling authentication

**Solutions:**
```typescript
// Add explicit wait
await page.locator(selector).waitFor({ timeout: 10000 });

// Use more specific selector
const button = page.locator('button[aria-label="Add"]');

// Check DOM in debug mode
npm run test:e2e:debug
# Then use Inspector to find correct selector
```

### Demo Mode Not Working

**Check:**
```bash
# Verify .env.test exists
ls -la .env.test

# Verify VITE_DEMO_MODE=true
grep VITE_DEMO_MODE .env.test

# Check window.budgetDb is available
npm run test:e2e:debug
# In Inspector console: window.budgetDb
```

### Test Fails in CI but Passes Locally

**Common causes:**
- Network timing differences
- Concurrency/race conditions
- Missing demo mode setup

**Solutions:**
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Increase timeout for CI: Edit `playwright.config.ts` timeout
- Check CI logs: GitHub Actions → your workflow → E2E Tests job

## 📚 Documentation Links

- [Comprehensive Setup Guide](./playwright-setup.md) - Full configuration details
- [E2E README](../../e2e/README.md) - Test structure and best practices
- [Playwright Docs](https://playwright.dev) - Official documentation
- [Test Data Fixtures](../../e2e/fixtures/) - Seeding functions
- [Selectors](../../e2e/utils/selectors.ts) - Centralized element selectors
- [Assertions](../../e2e/utils/assertions.ts) - Domain-specific assertions

## 🔄 CI/CD Integration

When you push to GitHub:

1. **CI workflow runs automatically** (.github/workflows/ci.yml)
2. **E2E tests run in 4 parallel shards** (same as main CI job)
3. **Reports are merged and commented on PR** with link to view results
4. **Browser cache is preserved** between runs for speed

### View CI Test Results

- Go to your PR
- Scroll to CI workflow run
- Click "Details" on E2E Tests job
- Download "playwright-report" artifact to view locally
- Or click "Artifacts" tab to access reports directly

## 🎯 Next Steps

After mastering E2E testing:

1. **Write tests for your feature** - Follow Phase 2-4 test specifications
2. **Monitor test results** - Check PR reports to catch regressions
3. **Debug flaky tests** - Use traces and videos in reports
4. **Contribute to test suite** - Phase 2-4 has 20+ test specifications ready to implement

## 💡 Pro Tips

- **Use `--ui` mode for development** - Visual mode is faster than edit/run cycles
- **Seed data, don't click** - Use fixtures instead of UI for test setup
- **Centralized selectors** - Edit `e2e/utils/selectors.ts` once, fixes everywhere
- **One assertion per concept** - Makes failures easier to debug
- **Run smoke tests first** - Fast feedback loop for basic functionality

## ❓ Questions?

- Check [Troubleshooting Guide](./playwright-setup.md#troubleshooting)
- Review test examples in `e2e/workflows/`
- Check Playwright documentation at https://playwright.dev
- Open an issue on GitHub if something is broken

---

Happy testing! 🎭
