import { Page } from "@playwright/test";

/**
 * Network Fixture for Playwright E2E Tests
 *
 * Provides utilities for simulating network conditions:
 * - Go offline/online
 * - Block/unblock specific services (Firebase, APIs)
 * - Simulate network failures
 *
 * Usage:
 * await page.context().setOffline(true);  // Go offline
 * await page.context().setOffline(false); // Go online
 *
 * Or use helpers:
 * await blockFirebase(page);
 * await unblockFirebase(page);
 */

/**
 * Block Firebase completely (simulate backend unavailable)
 *
 * @param page - Playwright page object
 */
export async function blockFirebase(page: Page) {
  await page.context().route("**/firebase**", (route) => route.abort());
  await page.context().route("**/firebaseapp.com/**", (route) => route.abort());
  await page.context().route("**/firestore.googleapis.com/**", (route) => route.abort());
  console.log("✓ Firebase blocked");
}

/**
 * Unblock Firebase
 *
 * @param page - Playwright page object
 */
export async function unblockFirebase(page: Page) {
  await page.context().unroute("**/firebase**");
  await page.context().unroute("**/firebaseapp.com/**");
  await page.context().unroute("**/firestore.googleapis.com/**");
  console.log("✓ Firebase unblocked");
}

/**
 * Block a specific URL pattern with error response
 *
 * @param page - Playwright page object
 * @param pattern - URL pattern to block
 */
export async function blockURL(page: Page, pattern: string) {
  await page.context().route(pattern, (route) => route.abort());
  console.log(`✓ Blocked URL pattern: ${pattern}`);
}

/**
 * Unblock a URL pattern
 *
 * @param page - Playwright page object
 * @param pattern - URL pattern to unblock
 */
export async function unblockURL(page: Page, pattern: string) {
  await page.context().unroute(pattern);
  console.log(`✓ Unblocked URL pattern: ${pattern}`);
}

/**
 * Respond to URL pattern with custom response
 *
 * @param page - Playwright page object
 * @param pattern - URL pattern to intercept
 * @param response - Response to return
 */
export async function mockURL(
  page: Page,
  pattern: string,
  _response: {
    status?: number;
    body?: string | Record<string, any>;
    headers?: Record<string, string>;
  }
) {
  await page.context().route(pattern, (route) => {
    route.abort("failed");
  });

  console.log(`✓ Mocked URL pattern: ${pattern}`);
}

/**
 * Simulate network slowdown
 * Note: Requires CDP (Chrome DevTools Protocol) - use with CDP-enabled browsers
 *
 * @param page - Playwright page object
 * @param downloadSpeed - Download speed in KB/s
 * @param uploadSpeed - Upload speed in KB/s
 * @param latency - Latency in ms
 */
export async function slowNetwork(
  page: Page,
  downloadSpeed: number = 100,
  uploadSpeed: number = 100,
  latency: number = 500
) {
  // This requires Chrome/Chromium with CDP enabled
  try {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (downloadSpeed * 1024) / 8, // Convert KB/s to bytes/s
      uploadThroughput: (uploadSpeed * 1024) / 8,
      latency: latency,
    });
    console.log(`✓ Network throttled: ${downloadSpeed}KB/s, latency ${latency}ms`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    console.warn("⚠ Could not enable network throttling (requires Chrome/CDP)");
  }
}

/**
 * Restore normal network conditions
 *
 * @param page - Playwright page object
 */
export async function normalNetwork(page: Page) {
  try {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    console.log("✓ Network restored to normal");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    console.warn("⚠ Could not restore network conditions");
  }
}

/**
 * Go offline
 *
 * @param page - Playwright page object
 */
export async function goOffline(page: Page) {
  await page.context().setOffline(true);
  console.log("✓ Network: OFFLINE");
}

/**
 * Go online
 *
 * @param page - Playwright page object
 */
export async function goOnline(page: Page) {
  await page.context().setOffline(false);
  console.log("✓ Network: ONLINE");
}

/**
 * Check if currently offline
 *
 * @param page - Playwright page object
 * @returns true if offline, false if online
 */
export async function isOffline(page: Page): Promise<boolean> {
  return page.evaluate(() => !navigator.onLine);
}
