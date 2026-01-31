/**
 * Tests for Sync Edge Case Tester
 * Part of Daily Targets for Test Coverage
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { runSyncEdgeCaseTests } from "../syncEdgeCaseTester";
import { budgetDb } from "@/db/budgetDb";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      add: vi.fn().mockResolvedValue("ok"),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    transactions: {
      bulkAdd: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock syncOrchestrator
vi.mock("@/services/sync/syncOrchestrator", () => ({
  syncOrchestrator: {
    fetchLocalData: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("syncEdgeCaseTester", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs all edge case tests and reports success", async () => {
    // Mock fetchLocalData to return different data based on the test case
    // Scenario 1: Empty
    vi.mocked(syncOrchestrator.fetchLocalData)
      .mockResolvedValueOnce({
        envelopes: [],
        transactions: [],
        lastModified: Date.now(),
        unassignedCash: 0,
        actualBalance: 0,
        syncVersion: "2.0",
      })
      // Scenario 2: Corrupted TS
      .mockResolvedValueOnce({
        envelopes: [{ id: "corrupted-ts" }],
        transactions: [],
        lastModified: Date.now(),
        unassignedCash: 0,
        actualBalance: 0,
        syncVersion: "2.0",
      })
      // Scenario 3: Large Dataset
      .mockResolvedValueOnce({
        envelopes: [],
        transactions: Array.from({ length: 500 }, (_, i) => ({ id: i })),
        lastModified: Date.now(),
        unassignedCash: 0,
        actualBalance: 0,
        syncVersion: "2.0",
      } as any)
      // Scenario 4: Unicode
      .mockResolvedValueOnce({
        envelopes: [{ id: "unicode-test", name: "🎉 Unicode ñáéíóú" }],
        transactions: [],
        lastModified: Date.now(),
        unassignedCash: 0,
        actualBalance: 0,
        syncVersion: "2.0",
      } as any);

    const results = await runSyncEdgeCaseTests();

    expect(results).toHaveLength(4);
    expect(results.every((r) => r.status === "passed")).toBe(true);

    // Verify interactions
    expect(budgetDb.envelopes.clear).toHaveBeenCalled();
    expect(budgetDb.transactions.clear).toHaveBeenCalled();
    expect(budgetDb.envelopes.add).toHaveBeenCalledWith(
      expect.objectContaining({ id: "corrupted-ts" })
    );
    expect(budgetDb.transactions.bulkAdd).toHaveBeenCalled();
  });

  it("handles empty database specifically", async () => {
    vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
      envelopes: [],
      transactions: [],
      lastModified: Date.now(),
      unassignedCash: 0,
      actualBalance: 0,
      syncVersion: "2.0",
    });

    const results = await runSyncEdgeCaseTests();
    const emptyTest = results.find((r) => r.test === "Empty Database");
    expect(emptyTest?.status).toBe("passed");
  });

  it("reports failure when scenarios don't meet criteria", async () => {
    // Mock failure for Scenario 1
    vi.mocked(syncOrchestrator.fetchLocalData).mockResolvedValue({
      envelopes: [{ id: "not-empty" }],
      transactions: [],
      lastModified: NaN, // Trigger failure
      unassignedCash: 0,
      actualBalance: 0,
      syncVersion: "2.0",
    });

    const results = await runSyncEdgeCaseTests();
    expect(results.some((r) => r.status === "failed")).toBe(true);
  });

  it("captures global logic errors if the tester crashes", async () => {
    vi.mocked(syncOrchestrator.fetchLocalData).mockRejectedValue(new Error("Database crash"));

    const results = await runSyncEdgeCaseTests();
    const globalError = results.find((r) => r.test === "Global Logic");
    expect(globalError?.status).toBe("failed");
    expect(globalError?.error).toContain("Database crash");
  });
});
