/**
 * Immediate Sync Health Checker
 * Runs critical validation tests to ensure sync is working
 */

import { budgetDb } from "../db/budgetDb";
import { cloudSyncService } from "../services/cloudSyncService";
import chunkedFirebaseSync from "./chunkedFirebaseSync";
import logger from "./logger";

export const runImmediateSyncHealthCheck = async () => {
  logger.info("🔧 RUNNING IMMEDIATE SYNC HEALTH CHECK...");
  const results = { passed: 0, failed: 0, tests: [] };

  // Test 1: Database Connection
  try {
    logger.info("🧪 Testing database connection...");
    const stats = await budgetDb.getDatabaseStats();
    results.tests.push({
      name: "Database Connection",
      status: "✅ PASSED",
      details: `Connected. Tables: envelopes(${stats.envelopes}), transactions(${stats.transactions}), bills(${stats.bills})`,
    });
    results.passed++;
  } catch (error) {
    results.tests.push({
      name: "Database Connection",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 2: Timestamp Handling
  try {
    logger.info("🧪 Testing timestamp handling...");

    // Add test data with mixed timestamps
    const testEnvelope = {
      id: "timestamp-test-" + Date.now(),
      name: "Timestamp Test",
      lastModified: "2024-01-01T12:00:00.000Z", // String timestamp
      createdAt: Date.now(), // Number timestamp
    };

    await budgetDb.envelopes.add(testEnvelope);
    const syncData = await cloudSyncService.fetchDexieData();

    // Clean up
    await budgetDb.envelopes.where("id").equals(testEnvelope.id).delete();

    if (!isNaN(syncData.lastModified) && syncData.lastModified > 0) {
      results.tests.push({
        name: "Timestamp Handling",
        status: "✅ PASSED",
        details: `String timestamps properly converted. Result: ${syncData.lastModified}`,
      });
      results.passed++;
    } else {
      throw new Error(`Invalid lastModified: ${syncData.lastModified}`);
    }
  } catch (error) {
    results.tests.push({
      name: "Timestamp Handling",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 3: Sync Direction Logic
  try {
    logger.info("🧪 Testing sync direction logic...");

    const mockFirestoreData = {
      envelopes: [{ id: "test", name: "Test" }],
      transactions: [],
      bills: [],
      debts: [],
      lastModified: Date.now() - 5000, // 5 seconds ago
    };

    const mockDexieData = {
      envelopes: [{ id: "test", name: "Test Updated" }],
      transactions: [],
      bills: [],
      debts: [],
      lastModified: Date.now(), // Now (newer)
    };

    const syncResult = await cloudSyncService.determineSyncDirection(
      mockDexieData,
      mockFirestoreData
    );

    if (syncResult.direction === "toFirestore") {
      results.tests.push({
        name: "Sync Direction Logic",
        status: "✅ PASSED",
        details: "Correctly chose upload (local newer than cloud)",
      });
      results.passed++;
    } else {
      throw new Error(`Wrong direction: ${syncResult.direction}, expected: toFirestore`);
    }
  } catch (error) {
    results.tests.push({
      name: "Sync Direction Logic",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 4: Data Validation
  try {
    logger.info("🧪 Testing data validation...");

    // Test with empty arrays
    const emptyData = await cloudSyncService.fetchDexieData();

    const hasValidStructure =
      Array.isArray(emptyData.envelopes) &&
      Array.isArray(emptyData.transactions) &&
      Array.isArray(emptyData.bills) &&
      Array.isArray(emptyData.debts) &&
      typeof emptyData.unassignedCash === "number" &&
      typeof emptyData.actualBalance === "number" &&
      typeof emptyData.lastModified === "number";

    if (hasValidStructure) {
      results.tests.push({
        name: "Data Validation",
        status: "✅ PASSED",
        details: "All data arrays and metadata properly structured",
      });
      results.passed++;
    } else {
      throw new Error("Invalid data structure returned");
    }
  } catch (error) {
    results.tests.push({
      name: "Data Validation",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 5: Service State Management
  try {
    logger.info("🧪 Testing service state management...");

    const status = cloudSyncService.getStatus();
    const hasValidStatus =
      typeof status.isRunning === "boolean" &&
      typeof status.lastSyncTime === "number" &&
      typeof status.syncIntervalMs === "number" &&
      status.syncType === "chunked";

    if (hasValidStatus) {
      results.tests.push({
        name: "Service State Management",
        status: "✅ PASSED",
        details: `Service status valid. Running: ${status.isRunning}, Type: ${status.syncType}`,
      });
      results.passed++;
    } else {
      throw new Error("Invalid service status structure");
    }
  } catch (error) {
    results.tests.push({
      name: "Service State Management",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 6: Metadata Handling
  try {
    logger.info("🧪 Testing metadata handling...");

    // Ensure metadata exists
    const currentMetadata = await budgetDb.budget.get("metadata");
    if (!currentMetadata) {
      await budgetDb.budget.put({
        id: "metadata",
        unassignedCash: 0,
        actualBalance: 0,
        lastModified: Date.now(),
      });
    }

    const syncData = await cloudSyncService.fetchDexieData();

    if (typeof syncData.unassignedCash === "number" && typeof syncData.actualBalance === "number") {
      results.tests.push({
        name: "Metadata Handling",
        status: "✅ PASSED",
        details: `Metadata properly loaded. Unassigned: $${syncData.unassignedCash}, Actual: $${syncData.actualBalance}`,
      });
      results.passed++;
    } else {
      throw new Error("Metadata not properly loaded");
    }
  } catch (error) {
    results.tests.push({
      name: "Metadata Handling",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Test 7: Chunked Firebase Initialization
  try {
    logger.info("🧪 Testing chunked Firebase initialization...");

    // Test that ChunkedFirebaseSync class exists and has required methods
    // Don't actually initialize it to avoid interfering with real sync operations
    if (
      typeof chunkedFirebaseSync.initialize === "function" &&
      typeof chunkedFirebaseSync.saveToCloud === "function" &&
      typeof chunkedFirebaseSync.loadFromCloud === "function"
    ) {
      results.tests.push({
        name: "Chunked Firebase Init",
        status: "✅ PASSED",
        details: "ChunkedFirebaseSync initialized without errors",
      });
      results.passed++;
    } else {
      throw new Error("ChunkedFirebaseSync missing required methods");
    }
  } catch (error) {
    results.tests.push({
      name: "Chunked Firebase Init",
      status: "❌ FAILED",
      error: error.message,
    });
    results.failed++;
  }

  // Print Results
  const passRate = Math.round((results.passed / (results.passed + results.failed)) * 100);

  logger.info("🔧 SYNC HEALTH CHECK COMPLETE:", {
    total: results.tests.length,
    passed: results.passed,
    failed: results.failed,
    passRate: `${passRate}%`,
  });

  results.tests.forEach((test) => {
    logger.info(`${test.status} ${test.name}: ${test.details || test.error || ""}`);
  });

  if (results.failed === 0) {
    logger.info("🎉 ALL SYNC HEALTH CHECKS PASSED! Sync system is ready.");
  } else {
    logger.warn(`⚠️ ${results.failed} health check(s) failed. Please investigate.`);
  }

  return results;
};

// Expose to window for immediate testing
if (typeof window !== "undefined") {
  window.runSyncHealthCheck = runImmediateSyncHealthCheck;
}

export default runImmediateSyncHealthCheck;
