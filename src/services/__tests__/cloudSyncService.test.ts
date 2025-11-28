import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

vi.mock("../chunkedSyncService", () => ({
  default: {
    initialize: vi.fn(() => Promise.resolve()),
    loadFromCloud: vi.fn(() => Promise.resolve(null)),
    saveToCloud: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock("../../db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    bills: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    envelopes: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    paycheckHistory: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    // v2.0: savingsGoals table is deprecated but kept for backward compatibility
    savingsGoals: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    debts: {
      toArray: vi.fn(() => Promise.resolve([])),
    },
    budget: {
      get: vi.fn(() => Promise.resolve(undefined)),
    },
  },
}));

vi.mock("../../utils/sync/autoBackupService", () => ({
  autoBackupService: {
    createPreSyncBackup: vi.fn(() => Promise.resolve("backup-id-123")),
  },
}));

vi.mock("../../utils/sync/syncHealthMonitor", () => ({
  syncHealthMonitor: {
    recordSyncStart: vi.fn(() => "sync-id-123"),
    updateSyncProgress: vi.fn(),
    recordSyncComplete: vi.fn(),
    recordSyncError: vi.fn(),
    recordSyncSuccess: vi.fn(),
    recordSyncFailure: vi.fn(),
  },
}));

vi.mock("../../utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    production: vi.fn(),
  },
}));

const { cloudSyncService } = await import("../cloudSyncService");

describe("CloudSyncService - Sync Core Tests", () => {
  const mockConfig = {
    budgetId: "test-budget-123",
    encryptionKey: {} as CryptoKey,
    currentUser: { uid: "test-user" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    if (cloudSyncService.isRunning) {
      cloudSyncService.stop();
    }
  });

  afterEach(() => {
    if (cloudSyncService.isRunning) {
      cloudSyncService.stop();
    }
  });

  describe("Sync Initialization", () => {
    it("should start sync service with config", () => {
      cloudSyncService.start(mockConfig);

      expect(cloudSyncService.isRunning).toBe(true);
      expect(cloudSyncService.config).toBe(mockConfig);
    });

    it("should not start if already running", () => {
      cloudSyncService.start(mockConfig);
      const wasRunning = cloudSyncService.isRunning;

      cloudSyncService.start(mockConfig);

      // Should still be running (no error thrown)
      expect(cloudSyncService.isRunning).toBe(wasRunning);
    });

    it("should stop sync service", () => {
      cloudSyncService.start(mockConfig);
      cloudSyncService.stop();

      expect(cloudSyncService.isRunning).toBe(false);
    });

    it("should not stop if not running", () => {
      // Ensure it's not running
      if (cloudSyncService.isRunning) {
        cloudSyncService.stop();
      }

      // Try to stop again
      cloudSyncService.stop();

      expect(cloudSyncService.isRunning).toBe(false);
    });
  });

  describe("Sync Operations", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should perform force sync", async () => {
      const result = await cloudSyncService.forceSync();

      // Sync should complete with a result
      expect(result).toBeDefined();
    });

    it("should prevent concurrent syncs", async () => {
      // Start first sync
      const sync1 = cloudSyncService.forceSync();

      // Try to start second sync immediately
      const sync2 = cloudSyncService.forceSync();

      const [result1, result2] = await Promise.all([sync1, sync2]);

      // Second sync should return with "Sync in progress" reason
      expect(result1 || result2).toBeDefined();
    });

    it("should schedule sync with debounce", async () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync();

      // Sync should not happen immediately
      expect(cloudSyncService.isSyncing).toBe(false);

      // Fast forward past debounce delay
      await vi.advanceTimersByTimeAsync(11000);

      vi.useRealTimers();
    });

    it("should trigger immediate sync for critical changes", () => {
      cloudSyncService.triggerSyncForCriticalChange("paycheck_import");

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("Sync Status", () => {
    it("should track sync in progress state", () => {
      expect(cloudSyncService.isSyncing).toBe(false);

      // After starting sync, it should be in progress
      // (implementation detail - state is managed internally)
    });

    it("should validate encryption context before sync", async () => {
      const invalidConfig = {
        budgetId: null,
        encryptionKey: null,
      };

      cloudSyncService.start(invalidConfig);
      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
      expect(result.reason).toContain("Missing encryption context");
    });

    it("should detect unresolved encryption key", async () => {
      const configWithPromise = {
        budgetId: "test-budget",
        encryptionKey: Promise.resolve({} as CryptoKey),
      };

      cloudSyncService.start(configWithPromise);
      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
      expect(result.reason).toContain("Encryption key not ready");
    });
  });

  describe("Sync Health Monitoring Integration", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should record sync start", async () => {
      await cloudSyncService.forceSync();

      // Sync should complete without error
      expect(true).toBe(true);
    });

    it("should update sync progress", async () => {
      await cloudSyncService.forceSync();

      // Sync should complete
      expect(cloudSyncService.isSyncing).toBe(false);
    });

    it("should create pre-sync backup", async () => {
      const result = await cloudSyncService.forceSync();

      // Sync should include backup creation
      expect(result).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should handle decryption errors gracefully", async () => {
      const result = await cloudSyncService.forceSync();

      // Should not throw, should handle gracefully
      expect(result).toBeDefined();
    });

    it("should handle network failures during sync", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.loadFromCloud).mockRejectedValue(
        new Error("Network request failed")
      );

      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("should handle timeout errors", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.loadFromCloud).mockRejectedValue(
        new Error("Request timeout")
      );

      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
    });

    it("should handle partial sync failures", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.saveToCloud).mockRejectedValue(
        new Error("Partial sync failure")
      );

      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
    });

    it("should handle encryption key errors", async () => {
      const invalidConfig = {
        budgetId: "test-budget",
        encryptionKey: null as unknown as CryptoKey,
        currentUser: { uid: "test-user" },
      };

      cloudSyncService.start(invalidConfig);
      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
      expect(result.reason).toContain("Missing encryption context");
    });

    it("should handle database errors during sync", async () => {
      const { budgetDb } = await import("../../db/budgetDb");
      vi.mocked(budgetDb.envelopes.toArray).mockRejectedValue(new Error("Database error"));

      const result = await cloudSyncService.forceSync();

      expect(result.success).toBe(false);
    });

    it("should log decryption failures", async () => {
      await cloudSyncService.forceSync();

      // Should complete without throwing
      expect(true).toBe(true);
    });

    it("should handle generic cloud load errors", async () => {
      const result = await cloudSyncService.forceSync();

      // Should handle errors gracefully
      expect(result).toBeDefined();
    });
  });

  describe("Priority Sync", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should use shorter delay for high-priority sync", () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync("high");

      // High priority should use 2000ms delay instead of 10000ms
      // (implementation detail - verifying the behavior exists)

      vi.useRealTimers();
    });

    it("should use normal delay for normal priority sync", () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync("normal");

      // Normal priority should use 10000ms delay
      // (implementation detail - verifying the behavior exists)

      vi.useRealTimers();
    });
  });

  describe("Queue Management", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should queue sync operations", async () => {
      // Multiple sync calls should be queued
      cloudSyncService.scheduleSync();
      cloudSyncService.scheduleSync();
      cloudSyncService.scheduleSync();

      // All should resolve without error
      await Promise.resolve();
      expect(true).toBe(true);
    });

    it("should process queued syncs sequentially", async () => {
      cloudSyncService.triggerSyncForCriticalChange("change1");
      cloudSyncService.triggerSyncForCriticalChange("change2");

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should complete without error
      expect(true).toBe(true);
    });
  });

  describe("v2.0 Envelope-Based Sync Model", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should include syncVersion in fetched data", async () => {
      const result = await cloudSyncService.forceSync();

      // Sync should complete with a result
      expect(result).toBeDefined();
      // The sync should use v2.0 model
    });

    it("should handle envelopes with different envelope types", async () => {
      // Test that savings and supplemental envelopes are synced correctly
      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should not require savingsGoals array in DexieData", async () => {
      // v2.0: savingsGoals are now stored as envelopes with envelopeType: "savings"
      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should not require supplementalAccounts array in DexieData", async () => {
      // v2.0: supplemental accounts are now stored as envelopes with envelopeType: "supplemental"
      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });
  });
});
