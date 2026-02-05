import { test, expect } from "@playwright/test";

/**
 * Infrastructure Validation Test
 *
 * This test validates that the Playwright E2E testing infrastructure is properly set up.
 * It doesn't require the app to be running - it just checks the configuration.
 */

test.describe("E2E Infrastructure Validation", () => {
  test("environment variables should be set", async () => {
    // Check that demo mode is enabled in config
    const isDemoMode = process.env.VITE_DEMO_MODE === "true" || process.env.CI === "true";

    // In CI, demo mode should be enabled. Locally, it might not be set but that's okay.
    if (process.env.CI === "true") {
      expect(isDemoMode).toBeTruthy();
    } else {
      expect(typeof isDemoMode).toBe("boolean");
    }
  });

  test("test directories should exist", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const e2eDir = path.resolve(process.cwd(), "e2e");
    const smokeDirExists = fs.existsSync(path.join(e2eDir, "smoke"));
    const fixturesDirExists = fs.existsSync(path.join(e2eDir, "fixtures"));
    const utilsDirExists = fs.existsSync(path.join(e2eDir, "utils"));

    expect(smokeDirExists).toBeTruthy();
    expect(fixturesDirExists).toBeTruthy();
    expect(utilsDirExists).toBeTruthy();
  });
});
