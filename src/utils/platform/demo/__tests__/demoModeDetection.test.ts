import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isDemoMode, getDemoModeConfig, useDemoMode } from "../demoModeDetection";

describe("demoModeDetection", () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset window.location before each test
    delete (window as { location?: Location }).location;
    (window as { location: Location }).location = {
      ...originalLocation,
      pathname: "/",
      search: "",
    };
  });

  afterEach(() => {
    // Restore original location
    window.location = originalLocation;
  });

  describe("isDemoMode", () => {
    it("should return true when pathname starts with /demo", () => {
      window.location.pathname = "/demo";
      expect(isDemoMode()).toBe(true);
    });

    it("should return true when pathname is /demo/dashboard", () => {
      window.location.pathname = "/demo/dashboard";
      expect(isDemoMode()).toBe(true);
    });

    it("should return true when query parameter demo=true", () => {
      window.location.pathname = "/app";
      window.location.search = "?demo=true";
      expect(isDemoMode()).toBe(true);
    });

    it("should return false for normal app routes", () => {
      window.location.pathname = "/app/dashboard";
      window.location.search = "";
      expect(isDemoMode()).toBe(false);
    });

    it("should return false for root path", () => {
      window.location.pathname = "/";
      window.location.search = "";
      expect(isDemoMode()).toBe(false);
    });

    it("should return false when demo query parameter is not true", () => {
      window.location.pathname = "/app";
      window.location.search = "?demo=false";
      expect(isDemoMode()).toBe(false);
    });
  });

  describe("getDemoModeConfig", () => {
    it("should return demo config when in demo mode", () => {
      window.location.pathname = "/demo";

      const config = getDemoModeConfig();

      expect(config.isDemoMode).toBe(true);
      expect(config.useInMemoryStorage).toBe(true);
      expect(config.skipFirebaseSync).toBe(true);
      expect(config.autoSeedData).toBe(true);
      expect(config.databaseName).toBe("VioletVaultDemo");
    });

    it("should return normal config when not in demo mode", () => {
      window.location.pathname = "/app";

      const config = getDemoModeConfig();

      expect(config.isDemoMode).toBe(false);
      expect(config.useInMemoryStorage).toBe(false);
      expect(config.skipFirebaseSync).toBe(false);
      expect(config.autoSeedData).toBe(false);
      expect(config.databaseName).toBe("VioletVault");
    });
  });

  describe("useDemoMode", () => {
    it("should return the same config as getDemoModeConfig", () => {
      window.location.pathname = "/demo";

      const hookResult = useDemoMode();
      const configResult = getDemoModeConfig();

      expect(hookResult).toEqual(configResult);
    });
  });
});
