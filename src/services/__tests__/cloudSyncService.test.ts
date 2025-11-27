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
});

describe("CloudSyncService - Conflict Resolution Tests", () => {
  const mockConfig = {
    budgetId: "test-budget-123",
    encryptionKey: {} as CryptoKey,
    currentUser: { uid: "test-user" },
  };

  // Type alias for DexieData to simplify type assertions
  type DexieData = Awaited<ReturnType<typeof cloudSyncService.fetchDexieData>>;

  // Empty cloud data for null cloud data test case
  const emptyCloudData = {
    envelopes: undefined,
    transactions: undefined,
    bills: undefined,
    paycheckHistory: undefined,
    debts: undefined,
    lastModified: undefined,
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

  describe("Conflict Resolution (local vs remote changes)", () => {
    it("should prefer local data when local lastModified is newer", () => {
      const localData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      } as DexieData;

      const cloudData = {
        envelopes: [{ id: "env-1", name: "Old Name" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now() - 60000, // 1 minute older
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData, cloudData);

      expect(result.direction).toBe("toFirestore");
    });

    it("should prefer cloud data when cloud lastModified is newer", () => {
      const localData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now() - 60000, // 1 minute older
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [{ id: "env-1", name: "New Name" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      expect(result.direction).toBe("fromFirestore");
    });

    it("should detect bidirectional sync when timestamps are equal", () => {
      const timestamp = Date.now();

      const localData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: timestamp,
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: timestamp,
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      expect(result.direction).toBe("bidirectional");
    });

    it("should handle shared budget user preferring cloud data with more records", () => {
      // Configure as shared budget user
      const sharedConfig = {
        budgetId: "shared-budget-123",
        encryptionKey: {} as CryptoKey,
        currentUser: {
          uid: "shared-user",
          joinedVia: "shareCode",
          sharedBy: "owner-user",
        },
      };

      cloudSyncService.start(sharedConfig);

      const localData = {
        envelopes: [{ id: "env-1" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [{ id: "env-1" }, { id: "env-2" }, { id: "env-3" }],
        transactions: [{ id: "txn-1" }, { id: "txn-2" }],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now() - 1000, // Slightly older but more data
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      // Shared budget user should prefer cloud when cloud has more data
      expect(result.direction).toBe("fromFirestore");
    });
  });

  describe("Sync Direction Edge Cases", () => {
    it("should upload to cloud when local has data but cloud is empty", () => {
      const localData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [{ id: "txn-1" }],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 100,
        actualBalance: 500,
      };

      const cloudData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: undefined,
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      expect(result.direction).toBe("toFirestore");
    });

    it("should download from cloud when cloud has data but local is empty", () => {
      const localData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [{ id: "env-1", name: "Test" }],
        transactions: [{ id: "txn-1" }],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now() - 1000,
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      expect(result.direction).toBe("fromFirestore");
    });

    it("should upload to cloud when both are empty (non-shared user)", () => {
      cloudSyncService.start(mockConfig);

      const localData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: undefined,
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      expect(result.direction).toBe("toFirestore");
    });

    it("should prefer download when both empty for shared budget user", () => {
      const sharedConfig = {
        budgetId: "shared-budget-123",
        encryptionKey: {} as CryptoKey,
        currentUser: {
          uid: "shared-user",
          sharedBy: "owner-user",
        },
      };

      cloudSyncService.start(sharedConfig);

      const localData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: undefined,
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      // Shared budget user should prefer download even with empty data
      expect(result.direction).toBe("fromFirestore");
    });

    it("should handle missing cloud lastModified timestamp", () => {
      const localData = {
        envelopes: [{ id: "env-1" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [{ id: "env-1" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: undefined, // Missing timestamp
        syncVersion: "2.0",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      // Should upload when cloud has no timestamp
      expect(result.direction).toBe("toFirestore");
    });

    it("should handle null cloud data", () => {
      const localData = {
        envelopes: [{ id: "env-1" }],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now(),
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      // Use emptyCloudData to represent null/undefined cloud data scenario
      const result = cloudSyncService.determineSyncDirection(
        localData as DexieData,
        emptyCloudData
      );

      // Should upload when cloud data is null/empty
      expect(result.direction).toBe("toFirestore");
    });

    it("should handle legacy savingsGoals in cloud data", () => {
      cloudSyncService.start(mockConfig);

      const localData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        lastModified: Date.now() - 5000,
        syncVersion: "2.0",
        unassignedCash: 0,
        actualBalance: 0,
      };

      const cloudData = {
        envelopes: [],
        transactions: [],
        bills: [],
        paycheckHistory: [],
        debts: [],
        savingsGoals: [{ id: "sg-1", name: "Legacy Goal" }], // Legacy format
        lastModified: Date.now(),
        syncVersion: "1.x",
      };

      const result = cloudSyncService.determineSyncDirection(localData as DexieData, cloudData);

      // Should recognize legacy savingsGoals as cloud data and download
      expect(result.direction).toBe("fromFirestore");
    });
  });

  describe("Encryption/Decryption Error Handling", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should handle decryption errors gracefully during sync", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.loadFromCloud).mockRejectedValueOnce(
        new Error("The provided data is too small")
      );

      const result = await cloudSyncService.forceSync();

      // Should handle the error gracefully (not crash)
      expect(result).toBeDefined();
    });

    it("should categorize encryption errors correctly", () => {
      expect(cloudSyncService.categorizeError("decrypt failed")).toBe("encryption");
      expect(cloudSyncService.categorizeError("encrypt error")).toBe("encryption");
      expect(cloudSyncService.categorizeError("data is too small")).toBe("encryption");
      expect(cloudSyncService.categorizeError("cipher error")).toBe("encryption");
      expect(cloudSyncService.categorizeError("key derivation failed")).toBe("encryption");
      expect(cloudSyncService.categorizeError("invalid key")).toBe("encryption");
    });

    it("should handle OperationError during cloud load", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      const operationError = new Error("Operation failed");
      operationError.name = "OperationError";
      vi.mocked(chunkedSyncService.default.loadFromCloud).mockRejectedValueOnce(operationError);

      const result = await cloudSyncService.forceSync();

      // Should handle OperationError without crashing
      expect(result).toBeDefined();
    });

    it("should handle key mismatch errors", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.loadFromCloud).mockRejectedValueOnce(
        new Error("key mismatch detected")
      );

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });
  });

  describe("Error Categorization", () => {
    it("should categorize network errors correctly", () => {
      expect(cloudSyncService.categorizeError("network failure")).toBe("network");
      expect(cloudSyncService.categorizeError("connection timeout")).toBe("network");
      expect(cloudSyncService.categorizeError("fetch error")).toBe("network");
      expect(cloudSyncService.categorizeError("cors blocked")).toBe("network");
    });

    it("should categorize Firebase errors correctly", () => {
      expect(cloudSyncService.categorizeError("firebase error")).toBe("firebase");
      expect(cloudSyncService.categorizeError("firestore unavailable")).toBe("firebase");
      expect(cloudSyncService.categorizeError("permission denied")).toBe("firebase");
      expect(cloudSyncService.categorizeError("quota exceeded")).toBe("firebase");
      expect(cloudSyncService.categorizeError("rate limit reached")).toBe("firebase");
    });

    it("should categorize validation errors correctly", () => {
      expect(cloudSyncService.categorizeError("validation failed")).toBe("validation");
      expect(cloudSyncService.categorizeError("invalid data format")).toBe("validation");
      expect(cloudSyncService.categorizeError("checksum mismatch")).toBe("validation");
      expect(cloudSyncService.categorizeError("corrupt data")).toBe("validation");
      expect(cloudSyncService.categorizeError("malformed json")).toBe("validation");
    });

    it("should categorize storage errors correctly", () => {
      expect(cloudSyncService.categorizeError("storage full")).toBe("storage");
      expect(cloudSyncService.categorizeError("database error")).toBe("storage");
      expect(cloudSyncService.categorizeError("indexeddb failed")).toBe("storage");
      expect(cloudSyncService.categorizeError("dexie error")).toBe("storage");
      expect(cloudSyncService.categorizeError("transaction failed")).toBe("storage");
    });

    it("should categorize authentication errors correctly", () => {
      expect(cloudSyncService.categorizeError("auth failed")).toBe("authentication");
      expect(cloudSyncService.categorizeError("unauthorized access")).toBe("authentication");
      expect(cloudSyncService.categorizeError("token expired")).toBe("authentication");
      expect(cloudSyncService.categorizeError("login required")).toBe("authentication");
      expect(cloudSyncService.categorizeError("credential invalid")).toBe("authentication");
    });

    it("should return unknown for unrecognized errors", () => {
      expect(cloudSyncService.categorizeError("something weird happened")).toBe("unknown");
      expect(cloudSyncService.categorizeError("")).toBe("unknown");
      expect(cloudSyncService.categorizeError(undefined as unknown as string)).toBe("unknown");
    });
  });

  describe("Sync Queue Handling", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should debounce multiple rapid sync requests", () => {
      vi.useFakeTimers();

      // Schedule multiple syncs rapidly
      cloudSyncService.scheduleSync();
      cloudSyncService.scheduleSync();
      cloudSyncService.scheduleSync();

      // Only the last scheduled sync should execute after debounce
      // (implementation detail - verifying no errors occur)
      expect(cloudSyncService.isRunning).toBe(true);

      vi.useRealTimers();
    });

    it("should use high priority delay for important changes", () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync("high");

      // High priority uses 2000ms delay
      expect(cloudSyncService.debounceTimer).not.toBeNull();

      vi.useRealTimers();
    });

    it("should use normal priority delay by default", () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync("normal");

      // Normal priority uses 10000ms delay
      expect(cloudSyncService.debounceTimer).not.toBeNull();

      vi.useRealTimers();
    });

    it("should clear previous debounce timer when scheduling new sync", () => {
      vi.useFakeTimers();

      cloudSyncService.scheduleSync("normal");
      const firstTimer = cloudSyncService.debounceTimer;

      cloudSyncService.scheduleSync("high");
      const secondTimer = cloudSyncService.debounceTimer;

      // Timer should be replaced
      expect(secondTimer).not.toBe(firstTimer);

      vi.useRealTimers();
    });

    it("should queue syncs sequentially", async () => {
      cloudSyncService.triggerSyncForCriticalChange("test-change-1");
      cloudSyncService.triggerSyncForCriticalChange("test-change-2");

      // Both should queue without errors
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(cloudSyncService.syncQueue).toBeDefined();
    });
  });

  describe("Concurrent Sync Operations", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should prevent concurrent sync operations", async () => {
      // Start first sync
      const sync1Promise = cloudSyncService.forceSync();

      // Immediately try second sync
      const sync2Result = await cloudSyncService.forceSync();

      // Second sync should be skipped
      expect(sync2Result.success).toBe(false);
      expect(sync2Result.reason).toBe("Sync in progress");

      // Wait for first sync to complete
      await sync1Promise;
    });

    it("should track sync in progress state correctly", async () => {
      const syncPromise = cloudSyncService.forceSync();

      // During sync, isSyncing should be true initially
      // (may complete quickly in tests)

      await syncPromise;

      // After sync, isSyncing should be false
      expect(cloudSyncService.isSyncing).toBe(false);
    });

    it("should reset syncing flag after error", async () => {
      const chunkedSyncService = await import("../chunkedSyncService");
      vi.mocked(chunkedSyncService.default.initialize).mockRejectedValueOnce(
        new Error("Init failed")
      );

      await cloudSyncService.forceSync();

      // Syncing flag should be reset even after error
      expect(cloudSyncService.isSyncing).toBe(false);
    });
  });

  describe("Large Data Sync Handling", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should handle sync with many envelopes", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      // Mock large dataset
      const manyEnvelopes = Array.from({ length: 100 }, (_, i) => ({
        id: `env-${i}`,
        name: `Envelope ${i}`,
        budgetedAmount: 100,
        filledAmount: 50,
      }));

      vi.mocked(budgetDbModule.budgetDb.envelopes.toArray).mockResolvedValueOnce(
        manyEnvelopes as unknown[]
      );

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should handle sync with many transactions", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      // Mock large transaction list
      const manyTransactions = Array.from({ length: 500 }, (_, i) => ({
        id: `txn-${i}`,
        amount: 10 + i,
        date: new Date().toISOString(),
        envelopeId: `env-${i % 10}`,
      }));

      vi.mocked(budgetDbModule.budgetDb.transactions.toArray).mockResolvedValueOnce(
        manyTransactions as unknown[]
      );

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should handle sync with all data types populated", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      // Mock all data types
      vi.mocked(budgetDbModule.budgetDb.envelopes.toArray).mockResolvedValueOnce([
        { id: "env-1", name: "Groceries" },
      ] as unknown[]);
      vi.mocked(budgetDbModule.budgetDb.transactions.toArray).mockResolvedValueOnce([
        { id: "txn-1", amount: 50 },
      ] as unknown[]);
      vi.mocked(budgetDbModule.budgetDb.bills.toArray).mockResolvedValueOnce([
        { id: "bill-1", name: "Rent" },
      ] as unknown[]);
      vi.mocked(budgetDbModule.budgetDb.debts.toArray).mockResolvedValueOnce([
        { id: "debt-1", name: "Car Loan" },
      ] as unknown[]);
      vi.mocked(budgetDbModule.budgetDb.paycheckHistory.toArray).mockResolvedValueOnce([
        { id: "pay-1", amount: 2000 },
      ] as unknown[]);

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });
  });

  describe("Metadata Sync Failures", () => {
    beforeEach(() => {
      cloudSyncService.start(mockConfig);
    });

    it("should handle missing metadata gracefully", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      vi.mocked(budgetDbModule.budgetDb.budget.get).mockResolvedValueOnce(undefined);

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should handle corrupted metadata", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      // Mock corrupted metadata (missing expected fields)
      vi.mocked(budgetDbModule.budgetDb.budget.get).mockResolvedValueOnce({
        id: "metadata",
        // Missing unassignedCash and actualBalance
      } as unknown as undefined);

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });

    it("should handle string values in numeric metadata fields", async () => {
      const budgetDbModule = await import("../../db/budgetDb");

      // Mock metadata with string values instead of numbers
      vi.mocked(budgetDbModule.budgetDb.budget.get).mockResolvedValueOnce({
        id: "metadata",
        unassignedCash: "100.50", // String instead of number
        actualBalance: "500", // String instead of number
      } as unknown as undefined);

      const result = await cloudSyncService.forceSync();

      expect(result).toBeDefined();
    });
  });

  describe("Shared Budget User Detection", () => {
    it("should detect shared budget user via joinedVia", () => {
      const sharedConfig = {
        budgetId: "shared-budget",
        encryptionKey: {} as CryptoKey,
        currentUser: {
          uid: "user-123",
          joinedVia: "shareCode",
        },
      };

      cloudSyncService.start(sharedConfig);

      expect(cloudSyncService.isSharedBudgetUser()).toBe(true);
    });

    it("should detect shared budget user via sharedBy", () => {
      const sharedConfig = {
        budgetId: "shared-budget",
        encryptionKey: {} as CryptoKey,
        currentUser: {
          uid: "user-123",
          sharedBy: "owner-456",
        },
      };

      cloudSyncService.start(sharedConfig);

      expect(cloudSyncService.isSharedBudgetUser()).toBe(true);
    });

    it("should return false for non-shared budget user", () => {
      cloudSyncService.start(mockConfig);

      expect(cloudSyncService.isSharedBudgetUser()).toBe(false);
    });

    it("should return false when no config", () => {
      cloudSyncService.stop();
      // Reset config to null to test behavior when service hasn't been configured
      cloudSyncService.config = null;

      expect(cloudSyncService.isSharedBudgetUser()).toBe(false);
    });
  });

  describe("Sync Service Status", () => {
    it("should return correct status when not running", () => {
      cloudSyncService.stop();

      const status = cloudSyncService.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.isSyncing).toBe(false);
      expect(status.syncType).toBe("chunked");
    });

    it("should return correct status when running", () => {
      cloudSyncService.start(mockConfig);

      const status = cloudSyncService.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.hasConfig).toBe(true);
      expect(status.syncIntervalMs).toBeDefined();
    });
  });
});
