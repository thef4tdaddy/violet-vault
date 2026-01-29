import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runMasterSyncValidation, getQuickSyncStatus } from "../masterSyncValidator";
import { runImmediateSyncHealthCheck } from "../syncHealthChecker";
import { validateAllSyncFlows } from "../syncFlowValidator";
import { runSyncEdgeCaseTests } from "../syncEdgeCaseTester";
import logger from "../../../../utils/core/common/logger";

// Mock dependencies
vi.mock("../syncHealthChecker", () => ({
  runImmediateSyncHealthCheck: vi.fn(),
  default: vi.fn(),
}));

vi.mock("../syncFlowValidator", () => ({
  validateAllSyncFlows: vi.fn(),
}));

vi.mock("../syncEdgeCaseTester", () => ({
  runSyncEdgeCaseTests: vi.fn(),
}));

vi.mock("../../../../utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../../db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn().mockResolvedValue([]),
    },
    getDatabaseStats: vi.fn().mockResolvedValue({ envelopes: 10 }),
  },
}));

vi.mock("../../../../services/sync/syncOrchestrator", () => ({
  syncOrchestrator: {
    isRunning: true,
  },
}));

// Helper to set development mode mocks
const setDevMode = (isDev: boolean) => {
  if (isDev) {
    vi.stubGlobal("location", { hostname: "localhost" });
  } else {
    vi.stubGlobal("location", { hostname: "app.violetvault.com" });
  }
};

describe("Master Sync Validator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).forceCloudDataReset;
    setDevMode(true);

    // Default pass mocks
    (runImmediateSyncHealthCheck as any).mockResolvedValue({ passed: 1, failed: 0, tests: [] });
    (validateAllSyncFlows as any).mockResolvedValue([{ name: "Flow 1", status: "✅" }]);
    (runSyncEdgeCaseTests as any).mockResolvedValue([{ name: "Edge 1", status: "passed" }]);

    // Recovery function mock
    (window as any).forceCloudDataReset = vi
      .fn()
      .mockResolvedValue({ success: true, message: "OK" });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
    vi.unstubAllEnvs();
  });

  describe("runMasterSyncValidation", () => {
    it("should run all validation phases in development mode", async () => {
      const result = await runMasterSyncValidation();
      // Verify corruption results - fixed property name and type
      expect(result.corruptionCheck).toBeDefined();
      expect(result.corruptionCheck?.some((r: any) => r.status === "passed")).toBe(true);

      expect(result.summary.overallStatus).toBe("ALL_SYSTEMS_GO");
    });

    it("should perform automatic recovery when corruption is detected", async () => {
      vi.useFakeTimers();

      let callCount = 0;
      (runImmediateSyncHealthCheck as any).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return { passed: 0, failed: 1, tests: [] }; // Initial detection fails
        }
        return { passed: 1, failed: 0, tests: [] }; // Recovery verification passes
      });

      const mockReset = vi.fn().mockResolvedValue({ success: true, message: "Recovered" });
      (window as any).forceCloudDataReset = mockReset;

      const promise = runMasterSyncValidation();

      // Advance through any potential wait
      await vi.advanceTimersByTimeAsync(3000);

      const result = await promise;

      expect(mockReset).toHaveBeenCalled();
      expect(result.summary.overallStatus).toBe("ISSUES_DETECTED");

      const verification = result.corruptionCheck?.find(
        (r: any) => r.name === "Recovery Verification"
      );
      expect(verification).toBeDefined();
      expect(verification?.status).toBe("passed");
    }, 60000);

    it("should detect LocalStorage corruption indicators", async () => {
      localStorage.setItem("corrupted_nan", "NaN");
      await runMasterSyncValidation();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Corruption check complete")
      );
    });
  });

  describe("getQuickSyncStatus", () => {
    it("should return healthy status when services are up", async () => {
      const status = await getQuickSyncStatus();
      expect(status.isHealthy).toBe(true);
    });

    it("should catch service failures and return status ISSUES_DETECTED", async () => {
      const { budgetDb } = await import("../../../../db/budgetDb");
      (budgetDb.envelopes.toArray as any).mockRejectedValue(new Error("Generic Failure"));

      const status = await getQuickSyncStatus();
      expect(status.isHealthy).toBe(false);
      expect(status.status).toBe("ISSUES_DETECTED");
    });
  });
});
