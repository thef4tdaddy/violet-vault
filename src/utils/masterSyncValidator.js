/**
 * Master Sync Validator
 * Runs all sync tests and validations in the correct order
 */

import { runImmediateSyncHealthCheck } from "./syncHealthChecker.js";
import { validateAllSyncFlows } from "./syncFlowValidator.js";
import syncEdgeCaseTester from "./syncEdgeCaseTester.js";
import logger from "./logger.js";

export const runMasterSyncValidation = async () => {
  logger.info("🚀 STARTING MASTER SYNC VALIDATION SUITE...");
  logger.info("=".repeat(60));

  const startTime = Date.now();
  const allResults = {
    healthCheck: null,
    flowValidation: null,
    edgeCases: null,
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
  const flowPassed = allResults.flowValidation?.filter((r) => r.status.includes("✅")).length || 0;
  const flowFailed = allResults.flowValidation?.length - flowPassed || 0;

  // Count edge case results
  const edgePassed = allResults.edgeCases?.filter((r) => r.status === "passed").length || 0;
  const edgeFailed = allResults.edgeCases?.filter((r) => r.status === "failed").length || 0;

  allResults.summary = {
    totalTests: healthPassed + healthFailed + flowPassed + flowFailed + edgePassed + edgeFailed,
    totalPassed: healthPassed + flowPassed + edgePassed,
    totalFailed: healthFailed + flowFailed + edgeFailed,
    overallStatus:
      healthFailed + flowFailed + edgeFailed === 0 ? "ALL_SYSTEMS_GO" : "ISSUES_DETECTED",
    duration,
    breakdown: {
      healthCheck: { passed: healthPassed, failed: healthFailed },
      flowValidation: { passed: flowPassed, failed: flowFailed },
      edgeCases: { passed: edgePassed, failed: edgeFailed },
    },
  };

  // Final Report
  logger.info("\n" + "=".repeat(60));
  logger.info("🎯 MASTER SYNC VALIDATION COMPLETE");
  logger.info("=".repeat(60));

  const passRate = Math.round(
    (allResults.summary.totalPassed / allResults.summary.totalTests) * 100
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
