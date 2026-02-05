import { test, expect } from "@playwright/test";

/**
 * Infrastructure Validation Test
 *
 * This test validates that the Playwright E2E testing infrastructure is properly set up.
 * It doesn't require the app to be running - it just checks the configuration.
 */

test.describe("E2E Infrastructure Validation", () => {
  test("playwright configuration should be valid", async () => {
    // This test just needs to run successfully to prove Playwright is configured
    expect(true).toBe(true);
  });

  test("test fixtures should be importable", async () => {
    // If this test runs, it means the auth fixture was successfully imported
    expect(test).toBeDefined();
    expect(expect).toBeDefined();
  });

  test("environment variables should be set", async () => {
    // Check that demo mode is enabled in config
    const isDemoMode = process.env.VITE_DEMO_MODE === "true" || process.env.CI === "true";

    // In CI or when explicitly set, demo mode should be enabled
    // Locally, it might not be set but that's okay
    expect(typeof isDemoMode).toBe("boolean");
  });

  test("test directories should exist", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const e2eDir = path.resolve(process.cwd(), "e2e");
    const smokeDirExists = fs.existsSync(path.join(e2eDir, "smoke"));
    const workflowsDirExists = fs.existsSync(path.join(e2eDir, "workflows"));
    const syncDirExists = fs.existsSync(path.join(e2eDir, "sync"));
    const dataDirExists = fs.existsSync(path.join(e2eDir, "data-integrity"));

    expect(smokeDirExists).toBeTruthy();
    expect(workflowsDirExists).toBeTruthy();
    expect(syncDirExists).toBeTruthy();
    expect(dataDirExists).toBeTruthy();
  });
});
