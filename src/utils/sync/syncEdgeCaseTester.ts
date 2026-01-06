/**
 * Comprehensive Sync Edge Case Tester v2.0
 * Tests various failure scenarios and edge cases for sync reliability
 */

import { budgetDb } from "../../db/budgetDb";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import logger from "../common/logger";
import type { Envelope, Transaction } from "../../db/types";

export interface TestResult {
  test: string;
  status: "passed" | "failed";
  details?: string;
  error?: string;
}

/**
 * Runs a suite of edge case tests against local data extraction
 */
export const runSyncEdgeCaseTests = async (): Promise<TestResult[]> => {
  logger.info("🧪 Starting sync edge case testing...");
  const results: TestResult[] = [];

  const addResult = (
    test: string,
    status: "passed" | "failed",
    details?: string,
    error?: string
  ) => {
    results.push({ test, status, details, error });
  };

  try {
    // 1. Empty Database
    await clearStores();
    const emptyData = await syncOrchestrator.fetchLocalData(
      budgetDb as unknown as Parameters<typeof syncOrchestrator.fetchLocalData>[0]
    );
    const emptyPassed = emptyData.envelopes.length === 0 && !isNaN(emptyData.lastModified);
    addResult(
      "Empty Database",
      emptyPassed ? "passed" : "failed",
      `LastModified: ${emptyData.lastModified}`
    );

    // 2. Corrupted Timestamps (Normalization)
    await budgetDb.envelopes.add({
      id: "corrupted-ts",
      name: "Corrupted",
      lastModified: "invalid-date" as unknown as number,
      archived: false,
    } as Envelope);
    const tsData = await syncOrchestrator.fetchLocalData(
      budgetDb as unknown as Parameters<typeof syncOrchestrator.fetchLocalData>[0]
    );
    const tsPassed = !isNaN(tsData.lastModified);
    addResult(
      "Timestamp Normalization",
      tsPassed ? "passed" : "failed",
      `Result: ${tsData.lastModified}`
    );

    // 3. Large Dataset Handling
    const largeTxns = Array.from({ length: 500 }, (_, i) => ({
      id: `large-${i}`,
      description: "Test",
      amount: 10,
      date: new Date(),
      lastModified: Date.now(),
    }));
    await budgetDb.transactions.bulkAdd(largeTxns as Transaction[]);
    const localData = await syncOrchestrator.fetchLocalData(
      budgetDb as unknown as Parameters<typeof syncOrchestrator.fetchLocalData>[0]
    );
    const largePassed = localData.transactions.length >= 500;
    addResult(
      "Large Dataset Load",
      largePassed ? "passed" : "failed",
      `Count: ${localData.transactions.length}`
    );

    // 4. Unicode / Special Characters
    const unicodeId = "unicode-test";
    await budgetDb.envelopes.add({
      id: unicodeId,
      name: "🎉 Unicode ñáéíóú",
      category: "Test",
      lastModified: Date.now(),
      archived: false,
    } as Envelope);
    const syncData = await syncOrchestrator.fetchLocalData(
      budgetDb as unknown as Parameters<typeof syncOrchestrator.fetchLocalData>[0]
    );
    const found = syncData.envelopes.find((e: unknown) => (e as { id: string }).id === unicodeId);
    const uniPassed = !!found && (found as { name: string }).name.includes("🎉");
    addResult("Unicode Integrity", uniPassed ? "passed" : "failed");

    // Cleanup
    await clearStores();
  } catch (e) {
    logger.error("Edge case tester crashed:", e);
    addResult("Global Logic", "failed", undefined, String(e));
  }

  return results;
};

async function clearStores() {
  await budgetDb.envelopes.clear();
  await budgetDb.transactions.clear();
  await budgetDb.bills.clear();
  await budgetDb.debts.clear();
}

// Global exposure
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).runSyncEdgeCaseTests = runSyncEdgeCaseTests;
}

export default runSyncEdgeCaseTests;
