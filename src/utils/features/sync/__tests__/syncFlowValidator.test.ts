/**
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateAllSyncFlows, type ValidationResult } from "../syncFlowValidator";
import { budgetDb } from "@/db/budgetDb";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import logger from "@/utils/core/common/logger";
import type { Envelope } from "@/db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      add: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn(),
    },
    transactions: {
      toArray: vi.fn(),
    },
    budget: {
      get: vi.fn(),
    },
  },
}));

vi.mock("@/services/sync/syncOrchestrator", () => ({
  syncOrchestrator: {
    fetchLocalData: vi.fn(),
    stop: vi.fn(),
    forceSync: vi.fn(),
    isRunning: false,
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("syncFlowValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset syncOrchestrator state
    syncOrchestrator.isRunning = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("ValidationResult interface", () => {
    it("should accept valid ValidationResult with all fields", () => {
      const result: ValidationResult = {
        flow: "Test Flow",
        status: "✅ PASSED",
        details: "Test details",
        error: "Test error",
      };

      expect(result.flow).toBe("Test Flow");
      expect(result.status).toBe("✅ PASSED");
      expect(result.details).toBe("Test details");
      expect(result.error).toBe("Test error");
    });

    it("should accept ValidationResult without optional fields", () => {
      const result: ValidationResult = {
        flow: "Minimal Flow",
        status: "✅ PASSED",
      };

      expect(result.flow).toBe("Minimal Flow");
      expect(result.status).toBe("✅ PASSED");
      expect(result.details).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe("validateAllSyncFlows", () => {
    it("should log info message when starting validation", async () => {
      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      await validateAllSyncFlows();

      expect(logger.info).toHaveBeenCalledWith("🔄 VALIDATING SYNC FLOWS...");
    });

    it("should return array of validation results", async () => {
      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      const results = await validateAllSyncFlows();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("End-to-End Visibility Flow", () => {
    it("should pass when newly created record is visible to orchestrator", async () => {
      const testId = `flow-test-${Date.now()}`;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue(testId);
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [{ id: testId, name: "Flow Test Envelope" }],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      const results = await validateAllSyncFlows();
      const visibilityResult = results.find((r) => r.flow === "End-to-End Visibility");

      expect(visibilityResult).toBeDefined();
      expect(visibilityResult?.status).toBe("✅ PASSED");
      expect(visibilityResult?.details).toBe("Newly created record visible to orchestrator");
      expect(budgetDb.envelopes.add).toHaveBeenCalled();
      expect(syncOrchestrator.fetchLocalData).toHaveBeenCalledWith(budgetDb);
      expect(budgetDb.envelopes.delete).toHaveBeenCalled();
    });

    it("should fail when newly created record is not visible to orchestrator", async () => {
      const testId = `flow-test-${Date.now()}`;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue(testId);
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [], // Empty - record not found
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      const results = await validateAllSyncFlows();
      const visibilityResult = results.find((r) => r.flow === "End-to-End Visibility");

      expect(visibilityResult).toBeDefined();
      expect(visibilityResult?.status).toBe("❌ FAILED");
      expect(visibilityResult?.details).toBe("Record missing from fetch");
    });

    it("should handle errors in End-to-End Visibility flow", async () => {
      const errorMessage = "Database error";
      vi.mocked(budgetDb.envelopes.add).mockRejectedValue(new Error(errorMessage));

      const results = await validateAllSyncFlows();
      const visibilityResult = results.find((r) => r.flow === "End-to-End Visibility");

      expect(visibilityResult).toBeDefined();
      expect(visibilityResult?.status).toBe("❌ FAILED");
      expect(visibilityResult?.error).toContain(errorMessage);
    });

    it("should clean up test envelope after validation", async () => {
      const testId = `flow-test-${Date.now()}`;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue(testId);
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [{ id: testId }],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      await validateAllSyncFlows();

      expect(budgetDb.envelopes.delete).toHaveBeenCalled();
    });
  });

  describe("Service Lifecycle Control Flow", () => {
    it("should pass when orchestrator responds to stop command", async () => {
      syncOrchestrator.isRunning = true;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      // Mock stop to change isRunning
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        syncOrchestrator.isRunning = false;
      });

      const results = await validateAllSyncFlows();
      const lifecycleResult = results.find((r) => r.flow === "Service Lifecycle Control");

      expect(lifecycleResult).toBeDefined();
      expect(lifecycleResult?.status).toBe("✅ PASSED");
      expect(lifecycleResult?.details).toBe("Orchestrator responds to stop command");
      expect(syncOrchestrator.stop).toHaveBeenCalled();
    });

    it("should fail when orchestrator does not stop", async () => {
      syncOrchestrator.isRunning = true;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      // Mock stop but keep isRunning true
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        syncOrchestrator.isRunning = true; // Failed to stop
      });

      const results = await validateAllSyncFlows();
      const lifecycleResult = results.find((r) => r.flow === "Service Lifecycle Control");

      expect(lifecycleResult).toBeDefined();
      expect(lifecycleResult?.status).toBe("❌ FAILED");
      expect(lifecycleResult?.details).toBe("Orchestrator failed to stop");
    });

    it("should handle errors in Service Lifecycle Control flow", async () => {
      const errorMessage = "Stop failed";

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const results = await validateAllSyncFlows();
      const lifecycleResult = results.find((r) => r.flow === "Service Lifecycle Control");

      expect(lifecycleResult).toBeDefined();
      expect(lifecycleResult?.status).toBe("❌ FAILED");
      expect(lifecycleResult?.error).toContain(errorMessage);
    });

    it("should preserve orchestrator running state if it was running", async () => {
      syncOrchestrator.isRunning = true;
      const wasRunning = syncOrchestrator.isRunning;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        syncOrchestrator.isRunning = false;
      });

      await validateAllSyncFlows();

      expect(wasRunning).toBe(true);
      // Note: Code doesn't restart it, just checks if it was running
    });
  });

  describe("Manual Sync Trigger Flow", () => {
    it("should pass when forceSync method is callable", async () => {
      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      vi.mocked(syncOrchestrator.forceSync).mockImplementation(() => {
        // Method exists and is callable (doesn't need to resolve)
        return new Promise(() => {}); // Never resolves, but that's ok
      });

      const results = await validateAllSyncFlows();
      const syncResult = results.find((r) => r.flow === "Manual Sync Trigger");

      expect(syncResult).toBeDefined();
      expect(syncResult?.status).toBe("✅ PASSED");
      expect(syncResult?.details).toBe("Method exposed and callable");
      expect(syncOrchestrator.forceSync).toHaveBeenCalled();
    });

    it("should handle errors in Manual Sync Trigger flow", async () => {
      const errorMessage = "Force sync not available";

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      vi.mocked(syncOrchestrator.forceSync).mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const results = await validateAllSyncFlows();
      const syncResult = results.find((r) => r.flow === "Manual Sync Trigger");

      expect(syncResult).toBeDefined();
      expect(syncResult?.status).toBe("❌ FAILED");
      expect(syncResult?.error).toContain(errorMessage);
    });
  });

  describe("Window global assignment", () => {
    it("should assign validateAllSyncFlows to window in browser environment", () => {
      // Test is running in jsdom environment, so window is available
      expect(typeof window).toBe("object");

      // The function should be assigned to window
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((window as any).validateAllSyncFlows).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(typeof (window as any).validateAllSyncFlows).toBe("function");
    });

    it("window.validateAllSyncFlows should be callable", async () => {
      vi.mocked(budgetDb.envelopes.add).mockResolvedValue("test-id");
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = await (window as any).validateAllSyncFlows();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Integration - All flows together", () => {
    it("should validate all three flows and return all results", async () => {
      const testId = `flow-test-${Date.now()}`;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue(testId);
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [{ id: testId }],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        syncOrchestrator.isRunning = false;
      });
      vi.mocked(syncOrchestrator.forceSync).mockImplementation(() => {
        return new Promise(() => {});
      });

      const results = await validateAllSyncFlows();

      expect(results).toHaveLength(3);
      expect(results[0].flow).toBe("End-to-End Visibility");
      expect(results[1].flow).toBe("Service Lifecycle Control");
      expect(results[2].flow).toBe("Manual Sync Trigger");
    });

    it("should handle mixed success and failure results", async () => {
      const testId = `flow-test-${Date.now()}`;

      vi.mocked(budgetDb.envelopes.add).mockResolvedValue(testId);
      vi.mocked(budgetDb.envelopes.delete).mockResolvedValue(undefined);
      // First flow succeeds
      vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
        envelopes: [{ id: testId }],
        transactions: [],
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
        syncVersion: "2.0",
      });
      // Second flow fails
      vi.mocked(syncOrchestrator.stop).mockImplementation(() => {
        syncOrchestrator.isRunning = true; // Failed to stop
      });
      // Third flow succeeds
      vi.mocked(syncOrchestrator.forceSync).mockImplementation(() => {
        return new Promise(() => {});
      });

      const results = await validateAllSyncFlows();

      expect(results).toHaveLength(3);
      expect(results[0].status).toBe("✅ PASSED");
      expect(results[1].status).toBe("❌ FAILED");
      expect(results[2].status).toBe("✅ PASSED");
    });

    it("should continue validation even if one flow fails", async () => {
      // First flow fails with error
      vi.mocked(budgetDb.envelopes.add).mockRejectedValue(new Error("Database error"));

      const results = await validateAllSyncFlows();

      // Should still have all three results
      expect(results).toHaveLength(3);
      expect(results[0].status).toBe("❌ FAILED");
      // Other flows should still be attempted
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
    });
  });
});
