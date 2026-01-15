/**
 * Immediate Sync Health Checker v2.0
 * Simplified diagnostic tool for the consolidated SyncOrchestrator
 */

import { budgetDb } from "@/db/budgetDb";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import { detectLocalData } from "@/utils/features/sync/dataDetectionHelper";
import logger from "@/utils/core/common/logger";

export interface HealthCheckResults {
  passed: number;
  failed: number;
  tests: Array<{
    name: string;
    status: string;
    details?: string;
    error?: string;
  }>;
}

/**
 * Runs critical validation tests to ensure the sync system is operational.
 */
export const runImmediateSyncHealthCheck = async (): Promise<HealthCheckResults> => {
  logger.info("🔧 RUNNING SYNC HEALTH CHECK...");
  const results: HealthCheckResults = { passed: 0, failed: 0, tests: [] };

  try {
    // 1. Database Connectivity
    const stats = await budgetDb.getDatabaseStats();
    addResult(
      results,
      "Database Connectivity",
      true,
      `Connected. Tables populated: ${Object.keys(stats).length}`
    );

    // 2. Orchestrator Initialization
    const orchestratorReady =
      !!syncOrchestrator && typeof syncOrchestrator.fetchLocalData === "function";
    addResult(
      results,
      "SyncOrchestrator Readiness",
      orchestratorReady,
      orchestratorReady ? "Service instance active" : "Service instance missing"
    );

    // 3. Local Data Extraction
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localData = await syncOrchestrator.fetchLocalData(budgetDb as any);
      const dataValid = !!localData && Array.isArray(localData.envelopes);
      addResult(
        results,
        "Data Extraction (Dexie)",
        dataValid,
        dataValid ? "Schema valid" : "Schema mismatch"
      );
    } catch (e) {
      addResult(results, "Data Extraction (Dexie)", false, undefined, String(e));
    }

    // 4. Data Detection
    const detection = await detectLocalData();
    addResult(
      results,
      "Data Detection Helper",
      detection.hasData,
      `Has Data: ${detection.hasData}, Total Items: ${detection.totalItems}`
    );

    // 5. Service State
    const isRunning = syncOrchestrator.isRunning;
    addResult(results, "Service Running State", true, `Background sync active: ${isRunning}`);
  } catch (error) {
    logger.error("Health check crashed:", error);
    addResult(results, "General System Health", false, undefined, String(error));
  }

  const passRate = Math.round((results.passed / results.tests.length) * 100);
  logger.info(`🔧 HEALTH CHECK COMPLETE: ${passRate}% Pass Rate`);

  return results;
};

function addResult(
  results: HealthCheckResults,
  name: string,
  success: boolean,
  details?: string,
  error?: string
) {
  results.tests.push({
    name,
    status: success ? "✅ PASSED" : "❌ FAILED",
    details,
    error,
  });
  if (success) results.passed++;
  else results.failed++;
}

// Global exposure for debugging
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).runSyncHealthCheck = runImmediateSyncHealthCheck;
}

export default runImmediateSyncHealthCheck;
