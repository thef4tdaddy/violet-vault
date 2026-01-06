import { describe, it, expect, beforeEach, vi } from "vitest";
import { syncOrchestrator } from "../../sync/syncOrchestrator";
import { FirebaseSyncProvider } from "../../sync/providers/firebaseSyncProvider";
import { encryptionManager } from "../../security/encryptionManager";

// Mock dependencies
vi.mock("@/utils/sync/syncHealthMonitor", () => ({
  syncHealthMonitor: {
    recordSyncStart: vi.fn(() => "test-sync-id"),
    recordSyncSuccess: vi.fn(),
    recordSyncFailure: vi.fn(),
  },
}));

vi.mock("@/utils/sync/autoBackupService", () => ({
  autoBackupService: {
    createPreSyncBackup: vi.fn(() => Promise.resolve()),
  },
}));

describe("SyncOrchestrator Integration Tests", () => {
  const testBudgetId = "budget_integration_test_123";
  let testKey: CryptoKey;

  beforeEach(async () => {
    const { key } = await encryptionManager.deriveKey("test-password");
    testKey = key;
    vi.clearAllMocks();
  });

  it("should start and stop correctly", async () => {
    const provider = new FirebaseSyncProvider();
    // Partially mock provider to avoid real Firebase calls in integration test
    // In a full integration test we would use a real provider with a mock backend
    vi.spyOn(provider, "initialize").mockImplementation(() => Promise.resolve());
    vi.spyOn(provider, "save").mockImplementation(() =>
      Promise.resolve({ success: true, timestamp: Date.now() })
    );

    await syncOrchestrator.start({
      budgetId: testBudgetId,
      encryptionKey: testKey,
      provider,
    });

    expect(syncOrchestrator["isRunning"]).toBe(true);
    expect(syncOrchestrator["budgetId"]).toBe(testBudgetId);

    syncOrchestrator.stop();
    expect(syncOrchestrator["isRunning"]).toBe(false);
  });

  it("should orchestrate a sync flow", async () => {
    const provider = new FirebaseSyncProvider();
    vi.spyOn(provider, "initialize").mockImplementation(() => Promise.resolve());
    const saveSpy = vi
      .spyOn(provider, "save")
      .mockImplementation(() =>
        Promise.resolve({ success: true, timestamp: Date.now(), data: true })
      );

    // Mock internal fetchLocalData to avoid Dexie dependency in this layer
    vi.spyOn(syncOrchestrator as any, "fetchLocalData").mockImplementation(() =>
      Promise.resolve({ envelopes: [], lastModified: Date.now() })
    );

    await syncOrchestrator.start({
      budgetId: testBudgetId,
      encryptionKey: testKey,
      provider,
    });

    const result = await syncOrchestrator.forceSync();
    expect(result.success).toBe(true);
    expect(saveSpy).toHaveBeenCalled();

    syncOrchestrator.stop();
  });

  it("should handle sync failures and record them", async () => {
    const provider = new FirebaseSyncProvider();
    vi.spyOn(provider, "initialize").mockImplementation(() => Promise.resolve());
    vi.spyOn(provider, "save").mockImplementation(() =>
      Promise.resolve({
        success: false,
        timestamp: Date.now(),
        error: {
          code: "FAIL",
          message: "Mocked Failure",
          category: "network",
          timestamp: Date.now(),
        },
      })
    );

    vi.spyOn(syncOrchestrator as any, "fetchLocalData").mockImplementation(() =>
      Promise.resolve({})
    );

    await syncOrchestrator.start({
      budgetId: testBudgetId,
      encryptionKey: testKey,
      provider,
    });

    const result = await syncOrchestrator.forceSync();
    expect(result.success).toBe(false);

    const { syncHealthMonitor } = await import("@/utils/sync/syncHealthMonitor");
    expect(syncHealthMonitor.recordSyncFailure).toHaveBeenCalled();

    syncOrchestrator.stop();
  });
});
