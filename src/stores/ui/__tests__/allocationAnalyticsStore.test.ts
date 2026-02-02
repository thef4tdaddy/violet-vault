import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAllocationAnalyticsStore, ANALYTICS_TIERS } from "../allocationAnalyticsStore";

describe("useAllocationAnalyticsStore", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store to initial state
    useAllocationAnalyticsStore.setState({
      analyticsTier: "offline",
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("initial state", () => {
    it("should initialize with 'offline' tier as default", () => {
      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("offline");
    });

    it("should have setAnalyticsTier action", () => {
      const state = useAllocationAnalyticsStore.getState();
      expect(typeof state.setAnalyticsTier).toBe("function");
    });
  });

  describe("setAnalyticsTier", () => {
    it("should update tier to 'private-backend'", () => {
      const { setAnalyticsTier } = useAllocationAnalyticsStore.getState();

      setAnalyticsTier("private-backend");

      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("private-backend");
    });

    it("should update tier to 'cloud-sync'", () => {
      const { setAnalyticsTier } = useAllocationAnalyticsStore.getState();

      setAnalyticsTier("cloud-sync");

      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("cloud-sync");
    });

    it("should persist tier selection to localStorage", () => {
      const { setAnalyticsTier } = useAllocationAnalyticsStore.getState();

      setAnalyticsTier("private-backend");

      // Check localStorage
      const stored = localStorage.getItem("allocation-analytics-storage");
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.analyticsTier).toBe("private-backend");
      }
    });

    it("should allow switching between tiers", () => {
      const { setAnalyticsTier } = useAllocationAnalyticsStore.getState();

      // Switch to private-backend
      setAnalyticsTier("private-backend");
      expect(useAllocationAnalyticsStore.getState().analyticsTier).toBe("private-backend");

      // Switch back to offline
      setAnalyticsTier("offline");
      expect(useAllocationAnalyticsStore.getState().analyticsTier).toBe("offline");

      // Switch to cloud-sync
      setAnalyticsTier("cloud-sync");
      expect(useAllocationAnalyticsStore.getState().analyticsTier).toBe("cloud-sync");
    });
  });

  describe("persistence", () => {
    it("should restore state from localStorage on initialization", () => {
      // Set initial state
      const { setAnalyticsTier } = useAllocationAnalyticsStore.getState();
      setAnalyticsTier("private-backend");

      // Simulate page reload by getting state directly from localStorage
      const stored = localStorage.getItem("allocation-analytics-storage");
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.analyticsTier).toBe("private-backend");
        expect(parsed.version).toBe(1);
      }
    });
  });
});

describe("ANALYTICS_TIERS", () => {
  it("should have 3 tier configurations", () => {
    expect(ANALYTICS_TIERS).toHaveLength(3);
  });

  it("should have offline tier with correct properties", () => {
    const offlineTier = ANALYTICS_TIERS.find((t) => t.id === "offline");

    expect(offlineTier).toBeDefined();
    expect(offlineTier?.title).toBe("100% Offline");
    expect(offlineTier?.privacyLevel).toBe("Maximum");
    expect(offlineTier?.disabled).toBe(false);
    expect(offlineTier?.features).toHaveLength(4);
  });

  it("should have private-backend tier with correct properties", () => {
    const backendTier = ANALYTICS_TIERS.find((t) => t.id === "private-backend");

    expect(backendTier).toBeDefined();
    expect(backendTier?.title).toBe("Private Backend");
    expect(backendTier?.privacyLevel).toBe("High");
    expect(backendTier?.disabled).toBe(false);
    expect(backendTier?.features).toHaveLength(4);
  });

  it("should have cloud-sync tier with correct properties", () => {
    const cloudTier = ANALYTICS_TIERS.find((t) => t.id === "cloud-sync");

    expect(cloudTier).toBeDefined();
    expect(cloudTier?.title).toBe("Cloud Sync");
    expect(cloudTier?.privacyLevel).toBe("Standard");
    expect(cloudTier?.disabled).toBe(true);
    expect(cloudTier?.comingSoon).toBe(true);
    expect(cloudTier?.features).toHaveLength(4);
  });

  it("should have all required properties for each tier", () => {
    ANALYTICS_TIERS.forEach((tier) => {
      expect(tier).toHaveProperty("id");
      expect(tier).toHaveProperty("title");
      expect(tier).toHaveProperty("description");
      expect(tier).toHaveProperty("privacyLevel");
      expect(tier).toHaveProperty("bundleSize");
      expect(tier).toHaveProperty("features");
      expect(tier).toHaveProperty("icon");
      expect(tier).toHaveProperty("disabled");
    });
  });

  it("should have increasing bundle sizes", () => {
    const sizes = ANALYTICS_TIERS.map((t) => {
      const match = t.bundleSize.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });

    expect(sizes[0]).toBeLessThan(sizes[1]);
    expect(sizes[1]).toBeLessThan(sizes[2]);
  });
});
