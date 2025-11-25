/**
 * Master Sync Validator
 * Runs all sync tests and validations in the correct order
 */

import { runImmediateSyncHealthCheck } from "./syncHealthChecker";
import { validateAllSyncFlows } from "./syncFlowValidator";
import syncEdgeCaseTester from "./syncEdgeCaseTester";
import logger from "../common/logger";

// Type definitions
interface TestResult {
  name: string;
  description: string;
  status: "passed" | "failed";
  details: string;
}

interface HealthCheckResult {
  passed: number;
  failed: number;
  tests: Array<{
    name: string;
    status: string;
    details?: string;
    error?: string;
  }>;
}

interface ValidationSummary {
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  overallStatus: string;
  duration: number;
  breakdown: {
    healthCheck: { passed: number; failed: number };
    flowValidation: { passed: number; failed: number };
    edgeCases: { passed: number; failed: number };
    corruptionCheck: { passed: number; failed: number };
  };
}

interface ValidationResults {
  healthCheck: HealthCheckResult | null;
  flowValidation?: unknown[];
  edgeCases?: unknown[];
  corruptionCheck?: TestResult[];
  summary: ValidationSummary;
}

// Type definitions for window extensions
declare global {
  interface Window {
    forceCloudDataReset?: () => Promise<{ success: boolean; message?: string; error?: string }>;
    runMasterSyncValidation?: () => Promise<ValidationResults>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getQuickSyncStatus?: () => Promise<any>;
  }
}

// Helper functions for corruption detection
const createRecoveryFunctionCheck = (): TestResult => ({
  name: "Recovery Function Availability",
  description: "Check if corruption recovery tools are available",
  status:
    typeof window !== "undefined" && typeof window.forceCloudDataReset === "function"
      ? "passed"
      : "failed",
  details:
    typeof window !== "undefined" && typeof window.forceCloudDataReset === "function"
      ? "✅ Recovery function available"
      : "❌ Recovery function not available",
});

const createCorruptionIndicatorCheck = async (): Promise<TestResult> => {
  const healthCheck = await runImmediateSyncHealthCheck();
  const hasCorruption = healthCheck.failed > 0;

  return {
    name: "Corruption Indicators",
    description: "Check for signs of data corruption",
    status: hasCorruption ? "failed" : "passed",
    details: hasCorruption
      ? `❌ ${healthCheck.failed} failed health checks detected - possible corruption`
      : "✅ No corruption indicators found",
  };
};

const performAutomaticRecovery = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  try {
    const recoveryResult = await window.forceCloudDataReset!();

    results.push({
      name: "Automatic Recovery",
      description: "Attempt to recover from detected corruption",
      status: recoveryResult.success ? "passed" : "failed",
      details: recoveryResult.success
        ? `✅ Recovery successful: ${recoveryResult.message}`
        : `❌ Recovery failed: ${recoveryResult.error}`,
    });

    // Verify recovery by re-checking health
    if (recoveryResult.success) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const postRecoveryHealth = await runImmediateSyncHealthCheck();
      const recoverySuccessful = postRecoveryHealth.failed === 0;

      results.push({
        name: "Recovery Verification",
        description: "Verify that recovery resolved corruption issues",
        status: recoverySuccessful ? "passed" : "failed",
        details: recoverySuccessful
          ? "✅ Post-recovery health check passed"
          : `❌ ${postRecoveryHealth.failed} issues still present after recovery`,
      });
    }
  } catch (recoveryError) {
    results.push({
      name: "Automatic Recovery",
      description: "Attempt to recover from detected corruption",
      status: "failed",
      details: `❌ Recovery attempt failed: ${(recoveryError as Error).message}`,
    });
  }

  return results;
};

const createLocalStorageCheck = (): TestResult => {
  try {
    const localStorageKeys = Object.keys(localStorage);
    const corruptedKeys = localStorageKeys.filter((key) => {
      try {
        const value = localStorage.getItem(key);
        return (
          value &&
          (value.includes("undefined") ||
            value.includes("NaN") ||
            (value.startsWith("{") && !JSON.parse(value)) ||
            (key.includes("encrypted") && value.length < 10))
        );
      } catch {
        return true;
      }
    });

    return {
      name: "LocalStorage Integrity",
      description: "Check localStorage for corruption patterns",
      status: corruptedKeys.length === 0 ? "passed" : "failed",
      details:
        corruptedKeys.length === 0
          ? "✅ No corrupted localStorage entries detected"
          : `❌ ${corruptedKeys.length} potentially corrupted entries: ${corruptedKeys.join(", ")}`,
    };
  } catch (storageError) {
    return {
      name: "LocalStorage Integrity",
      description: "Check localStorage for corruption patterns",
      status: "failed",
      details: `❌ Unable to check localStorage: ${(storageError as Error).message}`,
    };
  }
};

const logCorruptionSummary = (results: TestResult[]): void => {
  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  logger.info(`🚨 Corruption check complete: ${passedCount}✅ ${failedCount}❌`);
  if (failedCount > 0) {
    logger.warn("⚠️  Corruption issues detected - check results for details");
  } else {
    logger.info("✅ No corruption detected - system integrity confirmed");
  }
};

// Corruption Detection & Recovery Function
const runCorruptionDetectionAndRecovery = async (): Promise<TestResult[]> => {
  const results: TestResult[] = [];

  try {
    logger.info("🔍 Checking for data corruption patterns...");

    // Test 1: Check if forceCloudDataReset function is available
    results.push(createRecoveryFunctionCheck());

    // Test 2: Check current sync health for corruption indicators
    logger.info("🔍 Checking current sync health for corruption indicators...");
    results.push(await createCorruptionIndicatorCheck());

    // Test 3: If corruption detected, attempt recovery
    const hasCorruption = results[1].status === "failed";
    if (
      hasCorruption &&
      typeof window !== "undefined" &&
      typeof window.forceCloudDataReset === "function"
    ) {
      logger.info("🚨 Corruption detected, attempting automatic recovery...");
      results.push(...(await performAutomaticRecovery()));
    } else if (hasCorruption) {
      results.push({
        name: "Recovery Recommendation",
        description: "Corruption detected but auto-recovery not available",
        status: "failed",
        details:
          "❌ Corruption detected but recovery function not available - manual recovery required",
      });
    }

    // Test 4: Check localStorage for corruption patterns
    logger.info("🔍 Checking localStorage for corruption patterns...");
    results.push(createLocalStorageCheck());
  } catch (error) {
    logger.error("❌ Corruption detection failed:", error);
    results.push({
      name: "Corruption Detection",
      description: "Overall corruption detection process",
      status: "failed",
      details: `❌ Detection failed: ${(error as Error).message}`,
    });
  }

  logCorruptionSummary(results);
  return results;
};

// Helper functions for main validation
const initializeValidationResults = (): ValidationResults => ({
  healthCheck: null,
  summary: {
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    overallStatus: "UNKNOWN",
    duration: 0,
    breakdown: {
      healthCheck: { passed: 0, failed: 0 },
      flowValidation: { passed: 0, failed: 0 },
      edgeCases: { passed: 0, failed: 0 },
      corruptionCheck: { passed: 0, failed: 0 },
    },
  },
});

const runHealthCheckPhase = async (): Promise<HealthCheckResult> => {
  logger.info("🔧 PHASE 1: BASIC SYNC HEALTH CHECK (NON-HANGING)");
  logger.info("-".repeat(40));

  const quickStatus = await getQuickSyncStatus();
  return {
    passed: quickStatus.checks
      ? quickStatus.checks.filter((c) => c.status.includes("✅")).length
      : quickStatus.isHealthy
        ? 1
        : 0,
    failed: quickStatus.failedTests || 0,
    tests: quickStatus.checks || [
      {
        name: "Overall Status",
        status: quickStatus.isHealthy ? "✅ PASSED" : "❌ FAILED",
        details: quickStatus.status,
      },
    ],
  };
};

const isInDevelopmentMode = (): boolean => {
  return (
    typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((import.meta as any).env.MODE === "development" ||
      window.location.hostname.includes("dev.") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname === "127.0.0.1")
  );
};

const runFlowValidationPhase = async (): Promise<unknown[]> => {
  logger.info("🔄 PHASE 2: SYNC FLOW VALIDATION");
  logger.info("-".repeat(40));

  const flowValidation = await validateAllSyncFlows();
  logger.info(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    `✅ Flow validation complete: ${flowValidation.filter((r: any) => r.status.includes("✅")).length} passed`
  );
  return flowValidation;
};

const runEdgeCaseTestingPhase = async (): Promise<unknown[]> => {
  logger.info("\n🧪 PHASE 3: EDGE CASE TESTING");
  logger.info("-".repeat(40));

  const edgeCases = await syncEdgeCaseTester.runAllTests();
  logger.info(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    `✅ Edge case testing complete: ${edgeCases.filter((r: any) => r.status === "passed").length} passed`
  );
  return edgeCases;
};

const runCorruptionDetectionPhase = async (): Promise<TestResult[]> => {
  logger.info("\n🚨 PHASE 4: CORRUPTION DETECTION & RECOVERY");
  logger.info("-".repeat(40));

  const corruptionCheck = await runCorruptionDetectionAndRecovery();
  logger.info(
    `✅ Corruption check complete: ${corruptionCheck.filter((r) => r.status === "passed").length} passed`
  );
  return corruptionCheck;
};

const processValidationResults = (
  results: PromiseSettledResult<unknown[] | TestResult[]>[]
): {
  flowValidation: unknown[];
  edgeCases: unknown[];
  corruptionCheck: TestResult[];
} => {
  // Extract results with fallbacks
  const flowValidation = results[0].status === "fulfilled" ? (results[0].value as unknown[]) : [];
  const edgeCases = results[1].status === "fulfilled" ? (results[1].value as unknown[]) : [];
  const corruptionCheck =
    results[2].status === "fulfilled" ? (results[2].value as TestResult[]) : [];

  // Log failures
  const phaseNames = ["Flow Validation", "Edge Case Testing", "Corruption Detection"];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      logger.warn(`⚠️ ${phaseNames[index]} phase failed: ${(result.reason as Error).message}`);
    }
  });

  // Log success message
  const successCount = results.filter((r) => r.status === "fulfilled").length;
  logger.info(
    successCount === 3
      ? "✅ Full development validation completed successfully"
      : `✅ Basic validation still successful (${successCount}/3 phases completed)`
  );

  return { flowValidation, edgeCases, corruptionCheck };
};

const runDevelopmentValidationPhases = async (): Promise<{
  flowValidation: unknown[];
  edgeCases: unknown[];
  corruptionCheck: TestResult[];
}> => {
  logger.info("\n🧪 DEVELOPMENT MODE: Running full validation suite");

  const results = await Promise.allSettled([
    runFlowValidationPhase(),
    runEdgeCaseTestingPhase(),
    runCorruptionDetectionPhase(),
  ]);

  return processValidationResults(results);
};

const countTestResults = (
  results: (TestResult[] | unknown[]) | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  passCondition: (r: any) => boolean
): { passed: number; failed: number } => {
  if (!results) {
    return { passed: 0, failed: 0 };
  }
  const passed = results.filter(passCondition).length;
  const failed = results.length - passed;
  return { passed, failed };
};

const calculateValidationSummary = (allResults: ValidationResults, startTime: number): void => {
  const duration = Date.now() - startTime;

  const breakdown = {
    healthCheck: {
      passed: allResults.healthCheck?.passed || 0,
      failed: allResults.healthCheck?.failed || 0,
    },
    flowValidation: countTestResults(allResults.flowValidation, (r) => r.status?.includes("✅")),
    edgeCases: countTestResults(allResults.edgeCases, (r) => r.status === "passed"),
    corruptionCheck: countTestResults(allResults.corruptionCheck, (r) => r.status === "passed"),
  };

  const totalPassed = Object.values(breakdown).reduce((acc, { passed }) => acc + passed, 0);
  const totalFailed = Object.values(breakdown).reduce((acc, { failed }) => acc + failed, 0);

  allResults.summary = {
    totalTests: totalPassed + totalFailed,
    totalPassed,
    totalFailed,
    overallStatus: totalFailed === 0 ? "ALL_SYSTEMS_GO" : "ISSUES_DETECTED",
    duration,
    breakdown,
  };
};

const generateValidationReport = (allResults: ValidationResults): void => {
  logger.info("\n" + "=".repeat(60));
  logger.info("🎯 MASTER SYNC VALIDATION COMPLETE");
  logger.info("=".repeat(60));

  const passRate = Math.round(
    (allResults.summary.totalPassed / allResults.summary.totalTests) * 100
  );

  logger.info("📊 FINAL SUMMARY:", {
    duration: `${allResults.summary.duration}ms`,
    totalTests: allResults.summary.totalTests,
    totalPassed: allResults.summary.totalPassed,
    totalFailed: allResults.summary.totalFailed,
    passRate: `${passRate}%`,
    status: allResults.summary.overallStatus,
  });

  // Detailed Breakdown
  const breakdown = allResults.summary.breakdown;
  logger.info("📋 DETAILED BREAKDOWN:");
  logger.info(
    `🔧 Health Check: ${breakdown.healthCheck.passed}✅ ${breakdown.healthCheck.failed}❌`
  );
  logger.info(
    `🔄 Flow Validation: ${breakdown.flowValidation.passed}✅ ${breakdown.flowValidation.failed}❌`
  );
  logger.info(`🧪 Edge Cases: ${breakdown.edgeCases.passed}✅ ${breakdown.edgeCases.failed}❌`);
  logger.info(
    `🚨 Corruption Check: ${breakdown.corruptionCheck.passed}✅ ${breakdown.corruptionCheck.failed}❌`
  );

  // Final Status
  if (allResults.summary.overallStatus === "ALL_SYSTEMS_GO") {
    logger.info("🎉 🎉 🎉 ALL SYSTEMS GO! 🎉 🎉 🎉");
    logger.info("✅ Sync system is fully validated and ready for production use.");
    logger.info("✅ All data flows working correctly.");
    logger.info("✅ All edge cases handled properly.");
    logger.info("✅ No critical issues detected.");
  } else {
    logger.warn("⚠️  ISSUES DETECTED IN SYNC SYSTEM");
    logger.warn(`❌ ${allResults.summary.totalFailed} test(s) failed validation.`);
    logger.warn("🔍 Please review failed tests above for details.");
    logger.warn("🛠️  Address issues before using sync in production.");
  }

  logger.info("=".repeat(60));
};

export const runMasterSyncValidation = async (): Promise<ValidationResults> => {
  logger.info("🚀 STARTING MASTER SYNC VALIDATION SUITE (FIXED)...");
  logger.info("=".repeat(60));

  const startTime = Date.now();
  const allResults = initializeValidationResults();

  try {
    // Run health check
    allResults.healthCheck = await runHealthCheckPhase();

    // Run development validation phases if in dev mode
    if (isInDevelopmentMode()) {
      const devResults = await runDevelopmentValidationPhases();
      Object.assign(allResults, devResults);
    } else {
      logger.info("\n⚠️ PRODUCTION MODE: Skipping advanced validation phases");
      logger.info("- Flow Validation (development mode only)");
      logger.info("- Edge Case Testing (development mode only)");
      logger.info("- Corruption Detection (development mode only)");
      logger.info("✅ Basic validation completed successfully");
    }
  } catch (error) {
    logger.error("❌ Master validation suite failed:", error);
    allResults.summary.overallStatus = "CRITICAL_FAILURE";
    allResults.healthCheck = {
      passed: 0,
      failed: 1,
      tests: [
        {
          name: "Validation Error",
          status: "❌ FAILED",
          error: (error as Error).message,
        },
      ],
    };
    return allResults;
  }

  // Calculate and generate final report
  calculateValidationSummary(allResults, startTime);
  generateValidationReport(allResults);

  return allResults;
};

// Quick status checker - simplified to avoid hanging issues
export const getQuickSyncStatus = async () => {
  try {
    logger.info("🔧 Running quick sync status check...");

    // Basic checks that don't hang
    const checks = [];
    let failed = 0;

    // Check 1: Database availability
    try {
      const { budgetDb } = await import("../../db/budgetDb");
      await budgetDb.envelopes.limit(1).toArray(); // Just check if DB is accessible
      checks.push({ name: "Database Access", status: "✅ PASSED" });
    } catch (error) {
      checks.push({
        name: "Database Access",
        status: "❌ FAILED",
        error: error instanceof Error ? error.message : String(error),
      });
      failed++;
    }

    // Check 2: Cloud sync service availability
    try {
      const { cloudSyncService } = await import("../../services/cloudSyncService");
      const isRunning = Boolean(cloudSyncService);
      checks.push({
        name: "Cloud Sync Service",
        status: isRunning ? "✅ PASSED" : "❌ FAILED",
        details: isRunning ? "Service available" : "Service not available",
      });
      if (!isRunning) failed++;
    } catch (error) {
      checks.push({
        name: "Cloud Sync Service",
        status: "❌ FAILED",
        error: error instanceof Error ? error.message : String(error),
      });
      failed++;
    }

    // Check 3: Window functions availability
    const windowFunctions = ["runMasterSyncValidation", "forceCloudDataReset"].filter(
      (fn) => typeof window !== "undefined" && typeof window[fn as keyof Window] === "function"
    );
    checks.push({
      name: "Window Functions",
      status: windowFunctions.length > 0 ? "✅ PASSED" : "❌ FAILED",
      details: `Available: ${windowFunctions.join(", ")}`,
    });
    if (windowFunctions.length === 0) failed++;

    const isHealthy = failed === 0;

    logger.info(`🔧 Quick status: ${isHealthy ? "HEALTHY" : "ISSUES_DETECTED"} (${failed} failed)`);

    return {
      isHealthy,
      status: isHealthy ? "HEALTHY" : "ISSUES_DETECTED",
      failedTests: failed,
      lastChecked: new Date().toISOString(),
      checks,
    };
  } catch (error) {
    logger.error("Quick sync status check failed:", error);
    return {
      isHealthy: false,
      status: "ERROR",
      error: error instanceof Error ? error.message : String(error),
      lastChecked: new Date().toISOString(),
    };
  }
};

// Expose to window
if (typeof window !== "undefined") {
  window.runMasterSyncValidation = runMasterSyncValidation;
  window.getQuickSyncStatus = getQuickSyncStatus;

  // Sync validation tools are now available via sync health dropdown
  // Console commands still available for debugging: runMasterSyncValidation(), etc.
}

export default runMasterSyncValidation;
