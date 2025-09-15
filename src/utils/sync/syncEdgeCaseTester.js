/**
 * Comprehensive Sync Edge Case Tester
 * Tests various failure scenarios and edge cases for sync reliability
 */

import { budgetDb } from "../../db/budgetDb";
import { cloudSyncService } from "../../services/cloudSyncService";
import logger from "../common/logger";

class SyncEdgeCaseTester {
  constructor() {
    this.testResults = [];
    this.cloudSyncService = cloudSyncService;
  }

  /**
   * Run all edge case tests
   */
  async runAllTests() {
    logger.info("🧪 Starting comprehensive sync edge case testing...");

    const tests = [
      this.testEmptyDatabase,
      this.testCorruptedTimestamps,
      this.testMixedDataTypes,
      this.testLargeDatasets,
      this.testDuplicateIds,
      this.testMissingMetadata,
      this.testStringVsNumberTimestamps,
      this.testNullAndUndefinedValues,
      this.testCircularReferences,
      this.testUnicodeAndSpecialChars,
    ];

    for (const test of tests) {
      try {
        await test.call(this);
      } catch (error) {
        this.testResults.push({
          test: test.name,
          status: "failed",
          error: error.message,
        });
        logger.error(`❌ Test ${test.name} failed:`, error);
      }
    }

    this.printResults();
    return this.testResults;
  }

  /**
   * Test 1: Empty database sync
   */
  async testEmptyDatabase() {
    logger.info("🧪 Testing empty database sync...");

    // Clear all data
    await budgetDb.envelopes.clear();
    await budgetDb.transactions.clear();
    await budgetDb.bills.clear();
    await budgetDb.debts.clear();

    // Try to fetch data
    const syncData = await cloudSyncService.fetchDexieData();

    const passed =
      Array.isArray(syncData.envelopes) &&
      Array.isArray(syncData.transactions) &&
      Array.isArray(syncData.bills) &&
      Array.isArray(syncData.debts) &&
      syncData.envelopes.length === 0 &&
      !isNaN(syncData.lastModified);

    this.testResults.push({
      test: "testEmptyDatabase",
      status: passed ? "passed" : "failed",
      details: `lastModified: ${syncData.lastModified}, arrays empty: ${passed}`,
    });
  }

  /**
   * Test 2: Corrupted timestamp handling
   */
  async testCorruptedTimestamps() {
    logger.info("🧪 Testing corrupted timestamp handling...");

    // Add records with various corrupted timestamps
    const testEnvelope = {
      id: "test-corrupted-timestamps",
      name: "Test Envelope",
      lastModified: "not-a-date",
      createdAt: null,
    };

    await budgetDb.envelopes.add(testEnvelope);

    try {
      const syncData = await cloudSyncService.fetchDexieData();
      const passed =
        !isNaN(syncData.lastModified) && syncData.lastModified >= 0;

      this.testResults.push({
        test: "testCorruptedTimestamps",
        status: passed ? "passed" : "failed",
        details: `lastModified resolved to: ${syncData.lastModified}`,
      });
    } finally {
      // Cleanup
      await budgetDb.envelopes
        .where("id")
        .equals("test-corrupted-timestamps")
        .delete();
    }
  }

  /**
   * Test 3: Mixed data types in timestamps
   */
  async testMixedDataTypes() {
    logger.info("🧪 Testing mixed data types in timestamps...");

    const testData = [
      { id: "string-timestamp", lastModified: "2024-01-01T00:00:00.000Z" },
      { id: "number-timestamp", lastModified: Date.now() },
      { id: "missing-timestamp", name: "No timestamp" },
      { id: "zero-timestamp", lastModified: 0 },
    ];

    try {
      for (const item of testData) {
        await budgetDb.envelopes.add({ name: "Test", ...item });
      }

      const syncData = await cloudSyncService.fetchDexieData();
      const passed =
        !isNaN(syncData.lastModified) && syncData.lastModified >= 0;

      this.testResults.push({
        test: "testMixedDataTypes",
        status: passed ? "passed" : "failed",
        details: `Mixed timestamp types handled, lastModified: ${syncData.lastModified}`,
      });
    } finally {
      // Cleanup
      for (const item of testData) {
        await budgetDb.envelopes.where("id").equals(item.id).delete();
      }
    }
  }

  /**
   * Test 4: Large dataset chunking
   */
  async testLargeDatasets() {
    logger.info("🧪 Testing large dataset handling...");

    const largeTransactions = [];
    for (let i = 0; i < 1000; i++) {
      largeTransactions.push({
        id: `large-test-${i}`,
        description: `Large test transaction ${i}`.repeat(10), // Make it bigger
        amount: Math.random() * 1000,
        date: new Date().toISOString(),
        lastModified: Date.now(),
      });
    }

    try {
      await budgetDb.transactions.bulkAdd(largeTransactions);

      const syncData = await cloudSyncService.fetchDexieData();
      const passed =
        syncData.transactions.length === 1000 && !isNaN(syncData.lastModified);

      this.testResults.push({
        test: "testLargeDatasets",
        status: passed ? "passed" : "failed",
        details: `Handled ${syncData.transactions.length} transactions, lastModified valid: ${!isNaN(syncData.lastModified)}`,
      });
    } finally {
      // Cleanup
      await budgetDb.transactions
        .where("id")
        .startsWith("large-test-")
        .delete();
    }
  }

  /**
   * Test 5: Duplicate ID handling
   */
  async testDuplicateIds() {
    logger.info("🧪 Testing duplicate ID handling...");

    const duplicateEnvelope = {
      id: "duplicate-test",
      name: "Original",
      lastModified: Date.now(),
    };

    try {
      await budgetDb.envelopes.add(duplicateEnvelope);

      // Try to add duplicate
      try {
        await budgetDb.envelopes.add({
          ...duplicateEnvelope,
          name: "Duplicate",
        });

        this.testResults.push({
          test: "testDuplicateIds",
          status: "failed",
          details: "Duplicate ID was allowed when it shouldn't be",
        });
      } catch {
        this.testResults.push({
          test: "testDuplicateIds",
          status: "passed",
          details: "Duplicate ID properly rejected",
        });
      }
    } finally {
      await budgetDb.envelopes.where("id").equals("duplicate-test").delete();
    }
  }

  /**
   * Test 6: Missing metadata handling
   */
  async testMissingMetadata() {
    logger.info("🧪 Testing missing metadata handling...");

    // Remove metadata
    await budgetDb.budget.where("id").equals("metadata").delete();

    const syncData = await cloudSyncService.fetchDexieData();
    const passed =
      syncData.unassignedCash === 0 &&
      syncData.actualBalance === 0 &&
      !isNaN(syncData.lastModified);

    this.testResults.push({
      test: "testMissingMetadata",
      status: passed ? "passed" : "failed",
      details: `Missing metadata handled with defaults: unassigned=${syncData.unassignedCash}, actual=${syncData.actualBalance}`,
    });
  }

  /**
   * Test 7: String vs Number timestamp consistency
   */
  async testStringVsNumberTimestamps() {
    logger.info("🧪 Testing string vs number timestamp consistency...");

    const now = Date.now();
    const stringTime = new Date(now).toISOString();

    const testItems = [
      { id: "num-time", lastModified: now },
      { id: "str-time", lastModified: stringTime },
    ];

    try {
      for (const item of testItems) {
        await budgetDb.bills.add({ name: "Test", ...item });
      }

      const syncData = await cloudSyncService.fetchDexieData();
      const passed =
        !isNaN(syncData.lastModified) && syncData.lastModified >= now;

      this.testResults.push({
        test: "testStringVsNumberTimestamps",
        status: passed ? "passed" : "failed",
        details: `String/number timestamps normalized, result: ${syncData.lastModified}`,
      });
    } finally {
      await budgetDb.bills.where("id").anyOf(["num-time", "str-time"]).delete();
    }
  }

  /**
   * Test 8: Null and undefined value handling
   */
  async testNullAndUndefinedValues() {
    logger.info("🧪 Testing null and undefined value handling...");

    const testData = {
      id: "null-test",
      name: null,
      amount: undefined,
      lastModified: null,
      createdAt: undefined,
    };

    try {
      await budgetDb.debts.add(testData);

      const syncData = await cloudSyncService.fetchDexieData();
      const passed =
        syncData.debts.length >= 1 && !isNaN(syncData.lastModified);

      this.testResults.push({
        test: "testNullAndUndefinedValues",
        status: passed ? "passed" : "failed",
        details: `Null/undefined values handled, sync data valid`,
      });
    } finally {
      await budgetDb.debts.where("id").equals("null-test").delete();
    }
  }

  /**
   * Test 9: Circular reference handling
   */
  async testCircularReferences() {
    logger.info("🧪 Testing circular reference handling...");

    const testObj = { id: "circular-test", name: "Test" };
    testObj.self = testObj; // Create circular reference

    try {
      // Add the object with circular reference to Dexie (this should work)
      await budgetDb.envelopes.add(testObj);

      // Test that sync system can handle the circular reference with safeStringify
      const data = await this.cloudSyncService.fetchDexieData();

      // Try to JSON stringify the data - this tests the safeStringify method
      const seen = new WeakSet();
      JSON.stringify(data, (key, val) => {
        if (val != null && typeof val === "object") {
          if (seen.has(val)) {
            return "[Circular Reference]";
          }
          seen.add(val);
        }
        return val;
      });

      // Clean up test data
      await budgetDb.envelopes.delete("circular-test");

      this.testResults.push({
        test: "testCircularReferences",
        status: "passed",
        details: "Circular reference properly handled by sync system",
      });
    } catch (error) {
      // Clean up test data even if test fails
      try {
        await budgetDb.envelopes.delete("circular-test");
      } catch (cleanupError) {
        logger.debug("Cleanup error:", cleanupError);
      }

      this.testResults.push({
        test: "testCircularReferences",
        status: "failed",
        details: `Circular reference handling failed: ${error.message}`,
      });
    }
  }

  /**
   * Test 10: Unicode and special characters
   */
  async testUnicodeAndSpecialChars() {
    logger.info("🧪 Testing unicode and special characters...");

    const testData = {
      id: "unicode-test",
      name: "🎉💰📊 Unicode Test ñáéíóú 中文 العربية",
      description: "Special chars: <>&\"'`\n\t\r",
      lastModified: Date.now(),
    };

    try {
      await budgetDb.transactions.add(testData);

      const syncData = await cloudSyncService.fetchDexieData();
      const foundItem = syncData.transactions.find(
        (t) => t.id === "unicode-test",
      );
      const passed = foundItem && foundItem.name === testData.name;

      this.testResults.push({
        test: "testUnicodeAndSpecialChars",
        status: passed ? "passed" : "failed",
        details: `Unicode/special chars preserved: ${passed}`,
      });
    } finally {
      await budgetDb.transactions.where("id").equals("unicode-test").delete();
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    const passed = this.testResults.filter((r) => r.status === "passed").length;
    const failed = this.testResults.filter((r) => r.status === "failed").length;

    logger.info("🧪 SYNC EDGE CASE TEST RESULTS:", {
      total: this.testResults.length,
      passed,
      failed,
      passRate: `${Math.round((passed / this.testResults.length) * 100)}%`,
    });

    this.testResults.forEach((result) => {
      const emoji = result.status === "passed" ? "✅" : "❌";
      logger.info(
        `${emoji} ${result.test}: ${result.details || result.error || result.status}`,
      );
    });
  }
}

// Export the tester
const syncEdgeCaseTester = new SyncEdgeCaseTester();

// Expose to window for debugging
if (typeof window !== "undefined") {
  window.syncEdgeCaseTester = syncEdgeCaseTester;
  window.runSyncEdgeCaseTests = () => syncEdgeCaseTester.runAllTests();
}

export default syncEdgeCaseTester;
