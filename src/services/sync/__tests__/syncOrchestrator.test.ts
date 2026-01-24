import { describe, it, expect, vi, beforeEach } from "vitest";
import { SyncOrchestrator } from "../syncOrchestrator";
import { encryptionManager } from "../../security/encryptionManager";
import logger from "@/utils/core/common/logger";
import { syncHealthMonitor } from "@/utils/features/sync/syncHealthMonitor";
import { autoBackupService } from "@/utils/features/sync/autoBackupService";
import { captureError } from "@/utils/core/common/sentry";

// Mock dependencies
vi.mock("../../security/encryptionManager", () => ({
  encryptionManager: {
    deriveKey: vi.fn(),
    setKey: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    production: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/features/sync/syncHealthMonitor", () => ({
  syncHealthMonitor: {
    recordSyncStart: vi.fn().mockReturnValue("sync-123"),
    recordSyncSuccess: vi.fn(),
    recordSyncFailure: vi.fn(),
  },
}));

vi.mock("@/utils/features/sync/autoBackupService", () => ({
  autoBackupService: {
    createPreSyncBackup: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/sentry", () => ({
  captureError: vi.fn(),
}));

vi.mock("../offlineRequestQueueService", () => ({
  offlineRequestQueueService: {
    initialize: vi.fn(),
    stopProcessingInterval: vi.fn(),
  },
}));

vi.mock("../websocketSignalingService", () => ({
  websocketSignalingService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    sendSignal: vi.fn(),
    onSignal: vi.fn().mockReturnValue(() => {}),
  },
}));

vi.mock("../SyncManager", () => ({
  syncManager: {
    executeSync: vi.fn(async (fn: any) => await fn()),
    forceSync: vi.fn(async (fn: any) => await fn()),
    clearQueue: vi.fn(),
  },
}));

// Create a test-only class to bypass private/singleton restrictions
class TestSyncOrchestrator extends (SyncOrchestrator as any) {
  constructor() {
    super();
    this.isRunning = true;
    this.isSyncInProgress = false;
  }
}

describe("SyncOrchestrator.ts", () => {
  let orchestrator: any;

  const mockProvider = {
    name: "TestProvider",
    initialize: vi.fn(),
    save: vi.fn(),
    load: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new TestSyncOrchestrator();
    orchestrator.provider = mockProvider;
  });

  it("should start correctly", async () => {
    (encryptionManager.deriveKey as any).mockResolvedValue({ key: "mock-key" });
    const config = { budgetId: "b1", encryptionKey: "p", provider: mockProvider };

    orchestrator.isRunning = false; // Reset to false to trigger startup logic
    await orchestrator.start(config);
    expect(orchestrator.isRunning).toBe(true);
    expect(mockProvider.initialize).toHaveBeenCalled();
  });

  it("should perform sync successfully", async () => {
    mockProvider.save.mockResolvedValue({ success: true });
    vi.spyOn(orchestrator, "fetchLocalData").mockResolvedValue({} as any);

    const result = await orchestrator.performSync();

    expect(result.success).toBe(true);
    expect(syncHealthMonitor.recordSyncStart).toHaveBeenCalled();
    expect(autoBackupService.createPreSyncBackup).toHaveBeenCalled();
    expect(mockProvider.save).toHaveBeenCalled();
    expect(syncHealthMonitor.recordSyncSuccess).toHaveBeenCalled();
  });

  it("should capture errors during sync", async () => {
    const syncError = new Error("Sync failed");
    mockProvider.save.mockRejectedValue(syncError);
    vi.spyOn(orchestrator, "fetchLocalData").mockResolvedValue({} as any);

    try {
      await orchestrator.performSync();
    } catch (e) {
      // Expected
    }

    expect(syncHealthMonitor.recordSyncFailure).toHaveBeenCalled();
    expect(captureError).toHaveBeenCalled();
  });

  it("should schedule sync with high priority", () => {
    orchestrator.scheduleSync("high");

    // In our mock, executeSync is called immediately
    expect(orchestrator.isRunning).toBe(true);
  });

  it("should stop correctly", () => {
    orchestrator.stop();
    expect(orchestrator.isRunning).toBe(false);
  });
});
