import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    console.log("[FIXTURE START] Initializing authenticatedPage fixture");

    try {
      // Navigate to /app with demo=true
      console.log("[FIXTURE] Navigating to /app?demo=true");
      const response = await page.goto("http://localhost:5173/app?demo=true", {
        waitUntil: "load",
      });
      console.log("[FIXTURE] Navigation complete. Status:", response?.status(), "URL:", page.url());

      // Inject a log into the page to prove the fixture is running
      await page.addInitScript(() => {
        console.log("[PAGE INIT] Page script injected by fixture");
      });

      // Wait a bit for app to initialize
      await page.waitForTimeout(3000);

      // Check if window.budgetDb exists
      const state = await page.evaluate(() => {
        return {
          url: window.location.href,
          budgetDbExists: !!(window as any).budgetDb,
        };
      });
      console.log("[FIXTURE] After 3s wait - state:", state);

      // Pass the page to the test
      await use(page);
      console.log("[FIXTURE END] Fixture cleanup complete");
    } catch (error) {
      console.error("[FIXTURE ERROR]", error);
      throw error;
    }
  },
});

export { expect };
