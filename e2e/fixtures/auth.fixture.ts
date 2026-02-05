import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Authentication Fixture for Playwright E2E Tests
 *
 * Provides demo mode authentication with automatic Firebase anonymous auth.
 * All tests using this fixture will:
 * 1. Navigate to the app with VITE_DEMO_MODE=true
 * 2. Automatically authenticate via Firebase anonymous auth
 * 3. Have access to window.budgetDb for direct database access
 *
 * Usage:
 * test('example test', async ({ page, authenticatedPage }) => {
 *   // page is already authenticated and demo mode is enabled
 *   await page.goto('/dashboard');
 * });
 */

// Override the base page fixture to auto-navigate and authenticate
export const test = base.extend({
  page: async ({ page }, use) => {
    // Step 1: Set VITE_DEMO_MODE environment variable
    // This is handled by playwright.config.ts webServer command: VITE_DEMO_MODE=true npx vite

    // Step 2: Mock the demo-factory API since backend isn't running in test environment
    await page.route('**/api/demo-factory*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          envelopes: [],
          transactions: [],
          bills: [],
          generatedAt: new Date().toISOString(),
          recordCount: 0,
          generationTimeMs: 1,
          message: 'Mock data for E2E tests'
        })
      });
    });

    // Listen to console messages for debugging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ Browser Error: ${text}`);
      } else if (type === 'warn' && (text.includes('❌') || text.includes('Setup failed'))) {
        console.log(`⚠️  Browser Warning: ${text}`);
      }
    });

    // Listen to page errors
    page.on('pageerror', error => {
      console.log(`❌❌ Page Error: ${error.message}`);
    });

    // Step 3: Navigate to demo dashboard (/demo/dashboard requires auth but runs in demo mode)
    await page.goto('http://localhost:5173/demo/dashboard', { waitUntil: 'domcontentloaded' });
    console.log('✓ Navigated to /demo/dashboard');
    
    // Step 4: Wait for page to settle and check for setup screen
    await page.waitForTimeout(3000); // Longer wait for initial load
    
    // Step 5: Complete the authentication flow
    // Check if we're on the auth/setup screen
    const setupHeading = page.locator('h1:has-text("GET STARTED")');
    const isSetupScreen = await setupHeading.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);

    if (isSetupScreen) {
      console.log('⚠ Setup screen detected - completing authentication');
      
      // STEP 1: Fill in master password and go to Step 2
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
      await passwordInput.fill('TestPassword123!');
      console.log('✓ Password filled');
      
      // Submit Step 1
      await page.locator('button:has-text("Continue")').click();
      console.log('✓ Continue clicked');
      
      // Wait for Step 2 to appear
      await page.locator('h1:has-text("SET UP PROFILE")').waitFor({ state: 'visible', timeout: 10000 });
      console.log('✓ Step 2 loaded');
      
      // STEP 2: Fill in username
      const usernameInput = page.locator('input[type="text"]').first();
      await usernameInput.waitFor({ state: 'visible', timeout: 5000 });
      await usernameInput.fill('E2ETestUser');
      console.log('✓ Username filled');
      
      // Submit Step 2 - but DON'T wait for navigation since it might reload
      const startTrackingButton = page.locator('button:has-text("Start Tracking")');
      await startTrackingButton.waitFor({ state: 'visible', timeout: 5000 });
      
      // Set up a wait for navigation OR Step 3 to appear (whichever comes first)
      const navigationPromise = page.waitForNavigation({ timeout: 5000 }).catch(() => null);
      const step3Promise = page.locator('text=/SAVE YOUR SHARE CODE|Your Budget Share Code/i').waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      
      await startTrackingButton.click();
      console.log('✓ Start Tracking clicked');
      
      // Wait for EITHER navigation or Step 3
      await Promise.race([navigationPromise, step3Promise, page.waitForTimeout(3000)]);
      
      // Check if we're on Step 3
      const isStep3 = await page.locator('text=/SAVE YOUR SHARE CODE|Your Budget Share Code/i').isVisible().catch(() => false);
      
      if (isStep3) {
        console.log('✓ Step 3 loaded - share code screen visible');
        
        // STEP 3: Complete setup
        const createButton = page.locator('button:has-text("Create My Budget")');
        await createButton.waitFor({ state: 'visible', timeout: 5000 });
        await createButton.click();
        console.log('✓ Create My Budget clicked');
        
        // Wait for dashboard to load
        await page.waitForTimeout(5000);
        console.log('✓ Setup completed - waiting for dashboard');
      } else {
        console.log('⚠️  Step 3 did not appear - may have navigated or encountered error');
      }
    } else {
      console.log('✓ Setup screen not detected - may already be authenticated');
    }
    
    // Step 6: Verify budget DB is available
    const budgetId = await page.evaluate(() => {
      return (window as any).budgetDb?.budgetId;
    });
    
    if (budgetId) {
      console.log(`✓ Budget initialized with ID: ${budgetId}`);
    } else {
      console.warn('⚠ Budget ID not found - waiting longer');
      await page.waitForTimeout(3000);
    }

    // Pass the authenticated page to the test
    await use(page);

    // Cleanup (optional)
    // localStorage and IndexedDB will persist but Firebase session will end
  },
});

export { expect };
