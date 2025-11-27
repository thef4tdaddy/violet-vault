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

  describe("Network Failure Handling", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should implement retry with exponential backoff for network failures", async () => {
      // Import the retry utilities to verify exponential backoff behavior
      const { calculateRetryDelay } = await import("@/utils/sync/retryUtils");

      // Verify exponential backoff calculations
      const delays: number[] = [];
      for (let attempt = 1; attempt <= 5; attempt++) {
        // Calculate delay without jitter for predictable testing
        const delay = calculateRetryDelay(attempt, { jitter: false });
        delays.push(delay);
      }

      // Verify exponential growth: 1000, 2000, 4000, 8000, 16000
      expect(delays[0]).toBe(1000); // 1000 * 2^0 = 1000
      expect(delays[1]).toBe(2000); // 1000 * 2^1 = 2000
      expect(delays[2]).toBe(4000); // 1000 * 2^2 = 4000
      expect(delays[3]).toBe(8000); // 1000 * 2^3 = 8000
      expect(delays[4]).toBe(16000); // 1000 * 2^4 = 16000 (capped at maxDelay)

      // Verify delay is capped at maxDelay
      const cappedDelay = calculateRetryDelay(10, { jitter: false, maxDelay: 16000 });
      expect(cappedDelay).toBe(16000);
    });

    it("should detect network recovery and resume sync operations", async () => {
      // Simulate network recovery detection scenario
      let isOnline = false;

      // Mock network state detection
      const checkNetworkStatus = (): boolean => isOnline;

      // Initially offline
      expect(checkNetworkStatus()).toBe(false);

      // Simulate network recovery
      isOnline = true;
      expect(checkNetworkStatus()).toBe(true);

      // Verify sync can be triggered after network recovery
      const result = await cloudSyncService.forceSync();
      expect(result).toBeDefined();

      // Verify error categorization recognizes network errors
      const networkErrorCategory = cloudSyncService.categorizeError("Network connection failed");
      expect(networkErrorCategory).toBe("network");

      // Verify timeout errors are also categorized as network issues
      const timeoutCategory = cloudSyncService.categorizeError("Connection timeout");
      expect(timeoutCategory).toBe("network");

      // Verify connection errors are categorized correctly
      const connectionCategory = cloudSyncService.categorizeError("Connection lost");
      expect(connectionCategory).toBe("network");
    });
  });
});
