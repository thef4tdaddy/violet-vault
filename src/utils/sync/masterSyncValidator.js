/**
 * Master Sync Validator
 * Runs all sync tests and validations in the correct order
 */

import { runImmediateSyncHealthCheck } from "./syncHealthChecker.js";
import { validateAllSyncFlows } from "./syncFlowValidator.js";
import syncEdgeCaseTester from "./syncEdgeCaseTester.js";
import logger from "../common/logger.js";

// Corruption Detection & Recovery Function
const runCorruptionDetectionAndRecovery = async () => {
  const results = [];

  try {
    logger.info("🔍 Checking for data corruption patterns...");

    // Test 1: Check if forceCloudDataReset function is available
    results.push({
      name: "Recovery Function Availability",
      description: "Check if corruption recovery tools are available",
      status:
        typeof window !== "undefined" &&
        typeof window.forceCloudDataReset === "function"
          ? "passed"
          : "failed",
      details:
        typeof window !== "undefined" &&
        typeof window.forceCloudDataReset === "function"
          ? "✅ Recovery function available"
          : "❌ Recovery function not available",
    });

    // Test 2: Check current sync health for corruption indicators
    logger.info("🔍 Checking current sync health for corruption indicators...");
    const healthCheck = await runImmediateSyncHealthCheck();
    const hasCorruption = healthCheck.failed > 0;

    results.push({
      name: "Corruption Indicators",
      description: "Check for signs of data corruption",
      status: hasCorruption ? "failed" : "passed",
      details: hasCorruption
        ? `❌ ${healthCheck.failed} failed health checks detected - possible corruption`
        : "✅ No corruption indicators found",
    });

    // Test 3: If corruption detected, attempt recovery
    if (
      hasCorruption &&
      typeof window !== "undefined" &&
      typeof window.forceCloudDataReset === "function"
    ) {
      logger.info("🚨 Corruption detected, attempting automatic recovery...");

      try {
        const recoveryResult = await window.forceCloudDataReset();

        results.push({
          name: "Automatic Recovery",
          description: "Attempt to recover from detected corruption",
          status: recoveryResult.success ? "passed" : "failed",
          details: recoveryResult.success
            ? `✅ Recovery successful: ${recoveryResult.message}`
            : `❌ Recovery failed: ${recoveryResult.error}`,
        });

        // Test 4: Verify recovery by re-checking health
        if (recoveryResult.success) {
          logger.info("🔍 Verifying recovery by re-checking sync health...");
          // Wait a moment for recovery to take effect
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
          details: `❌ Recovery attempt failed: ${recoveryError.message}`,
        });
      }
    } else if (hasCorruption) {
      results.push({
        name: "Recovery Recommendation",
        description: "Corruption detected but auto-recovery not available",
        status: "failed",
        details:
          "❌ Corruption detected but recovery function not available - manual recovery required",
      });
    }

    // Test 5: Check localStorage for corruption patterns
    logger.info("🔍 Checking localStorage for corruption patterns...");
    try {
      const localStorageKeys = Object.keys(localStorage);
      const corruptedKeys = localStorageKeys.filter((key) => {
        try {
          const value = localStorage.getItem(key);
          // Check for common corruption patterns
          return (
            value &&
            (value.includes("undefined") ||
              value.includes("NaN") ||
              (value.startsWith("{") && !JSON.parse(value)) ||
              (key.includes("encrypted") && value.length < 10))
          );
        } catch (e) {
          return true; // If we can't parse it, it might be corrupted
        }
      });

      results.push({
        name: "LocalStorage Integrity",
        description: "Check localStorage for corruption patterns",
        status: corruptedKeys.length === 0 ? "passed" : "failed",
        details:
          corruptedKeys.length === 0
            ? "✅ No corrupted localStorage entries detected"
            : `❌ ${corruptedKeys.length} potentially corrupted entries: ${corruptedKeys.join(", ")}`,
      });
    } catch (storageError) {
      results.push({
        name: "LocalStorage Integrity",
        description: "Check localStorage for corruption patterns",
        status: "failed",
        details: `❌ Unable to check localStorage: ${storageError.message}`,
      });
    }
  } catch (error) {
    logger.error("❌ Corruption detection failed:", error);
    results.push({
      name: "Corruption Detection",
      description: "Overall corruption detection process",
      status: "failed",
      details: `❌ Detection failed: ${error.message}`,
    });
  }

  // Log summary
  const passedCount = results.filter((r) => r.status === "passed").length;
  const failedCount = results.filter((r) => r.status === "failed").length;

  logger.info(
    `🚨 Corruption check complete: ${passedCount}✅ ${failedCount}❌`,
  );
  if (failedCount > 0) {
    logger.warn("⚠️  Corruption issues detected - check results for details");
  } else {
    logger.info("✅ No corruption detected - system integrity confirmed");
  }

  return results;
};

export const runMasterSyncValidation = async () => {
  logger.info("🚀 STARTING MASTER SYNC VALIDATION SUITE...");
  logger.info("=".repeat(60));

  const startTime = Date.now();
  const allResults = {
    healthCheck: null,
    flowValidation: null,
    edgeCases: null,
    corruptionCheck: null,
    summary: {
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      overallStatus: "UNKNOWN",
      duration: 0,
    },
  };

  try {
    // Phase 1: Health Check
    logger.info("🔧 PHASE 1: SYNC HEALTH CHECK");
    logger.info("-".repeat(40));
    allResults.healthCheck = await runImmediateSyncHealthCheck();

    // Phase 2: Flow Validation
    logger.info("\n🔄 PHASE 2: SYNC FLOW VALIDATION");
    logger.info("-".repeat(40));
    allResults.flowValidation = await validateAllSyncFlows();

    // Phase 3: Edge Case Testing
    logger.info("\n🧪 PHASE 3: EDGE CASE TESTING");
    logger.info("-".repeat(40));
    allResults.edgeCases = await syncEdgeCaseTester.runAllTests();

    // Phase 4: Corruption Detection & Recovery
    logger.info("\n🚨 PHASE 4: CORRUPTION DETECTION & RECOVERY");
    logger.info("-".repeat(40));
    allResults.corruptionCheck = await runCorruptionDetectionAndRecovery();
  } catch (error) {
    logger.error("❌ Master validation suite failed:", error);
    allResults.summary.overallStatus = "CRITICAL_FAILURE";
    return allResults;
  }

  // Calculate summary
  const duration = Date.now() - startTime;

  // Count health check results
  const healthPassed = allResults.healthCheck?.passed || 0;
  const healthFailed = allResults.healthCheck?.failed || 0;

  // Count flow validation results
  const flowPassed =
    allResults.flowValidation?.filter((r) => r.status.includes("✅")).length ||
    0;
  const flowFailed = allResults.flowValidation?.length - flowPassed || 0;

  // Count edge case results
  const edgePassed =
    allResults.edgeCases?.filter((r) => r.status === "passed").length || 0;
  const edgeFailed =
    allResults.edgeCases?.filter((r) => r.status === "failed").length || 0;

  // Count corruption check results
  const corruptionPassed =
    allResults.corruptionCheck?.filter((r) => r.status === "passed").length ||
    0;
  const corruptionFailed =
    allResults.corruptionCheck?.filter((r) => r.status === "failed").length ||
    0;

  allResults.summary = {
    totalTests:
      healthPassed +
      healthFailed +
      flowPassed +
      flowFailed +
      edgePassed +
      edgeFailed +
      corruptionPassed +
      corruptionFailed,
    totalPassed: healthPassed + flowPassed + edgePassed + corruptionPassed,
    totalFailed: healthFailed + flowFailed + edgeFailed + corruptionFailed,
    overallStatus:
      healthFailed + flowFailed + edgeFailed + corruptionFailed === 0
        ? "ALL_SYSTEMS_GO"
        : "ISSUES_DETECTED",
    duration,
    breakdown: {
      healthCheck: { passed: healthPassed, failed: healthFailed },
      flowValidation: { passed: flowPassed, failed: flowFailed },
      edgeCases: { passed: edgePassed, failed: edgeFailed },
      corruptionCheck: { passed: corruptionPassed, failed: corruptionFailed },
    },
  };

  // Final Report
  logger.info("\n" + "=".repeat(60));
  logger.info("🎯 MASTER SYNC VALIDATION COMPLETE");
  logger.info("=".repeat(60));

  const passRate = Math.round(
    (allResults.summary.totalPassed / allResults.summary.totalTests) * 100,
  );

  logger.info("📊 FINAL SUMMARY:", {
    duration: `${duration}ms`,
    totalTests: allResults.summary.totalTests,
    totalPassed: allResults.summary.totalPassed,
    totalFailed: allResults.summary.totalFailed,
    passRate: `${passRate}%`,
    status: allResults.summary.overallStatus,
  });

  // Detailed Breakdown
  logger.info("📋 DETAILED BREAKDOWN:");
  logger.info(`🔧 Health Check: ${healthPassed}✅ ${healthFailed}❌`);
  logger.info(`🔄 Flow Validation: ${flowPassed}✅ ${flowFailed}❌`);
  logger.info(`🧪 Edge Cases: ${edgePassed}✅ ${edgeFailed}❌`);
  logger.info(
    `🚨 Corruption Check: ${corruptionPassed}✅ ${corruptionFailed}❌`,
  );

  // Final Status
  if (allResults.summary.overallStatus === "ALL_SYSTEMS_GO") {
    logger.info("🎉 🎉 🎉 ALL SYSTEMS GO! 🎉 🎉 🎉");
    logger.info(
      "✅ Sync system is fully validated and ready for production use.",
    );
    logger.info("✅ All data flows working correctly.");
    logger.info("✅ All edge cases handled properly.");
    logger.info("✅ No critical issues detected.");
  } else {
    logger.warn("⚠️  ISSUES DETECTED IN SYNC SYSTEM");
    logger.warn(
      `❌ ${allResults.summary.totalFailed} test(s) failed validation.`,
    );
    logger.warn("🔍 Please review failed tests above for details.");
    logger.warn("🛠️  Address issues before using sync in production.");
  }

  logger.info("=".repeat(60));

  return allResults;
};

// Quick status checker
export const getQuickSyncStatus = async () => {
  try {
    const healthCheck = await runImmediateSyncHealthCheck();
    const isHealthy = healthCheck.failed === 0;

    return {
      isHealthy,
      status: isHealthy ? "HEALTHY" : "ISSUES_DETECTED",
      failedTests: healthCheck.failed,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      isHealthy: false,
      status: "ERROR",
      error: error.message,
      lastChecked: new Date().toISOString(),
    };
  }
};

// Expose to window
if (typeof window !== "undefined") {
  window.runMasterSyncValidation = runMasterSyncValidation;
  window.getQuickSyncStatus = getQuickSyncStatus;

  // Add helpful console message
  console.log("🚀 SYNC VALIDATION TOOLS LOADED!");
  console.log("Run these commands in console:");
  console.log("• runMasterSyncValidation() - Complete validation suite");
  console.log("• runSyncHealthCheck() - Quick health check");
  console.log("• validateAllSyncFlows() - Flow validation only");
  console.log("• runSyncEdgeCaseTests() - Edge case testing only");
  console.log("• getQuickSyncStatus() - Quick status check");
}

export default runMasterSyncValidation;
