/**
 * Comprehensive Sync Flow Validator
 * Tests all sync data flows and scenarios
 */

import { budgetDb } from "../../db/budgetDb";
import { cloudSyncService } from "../../services/cloudSyncService";
import logger from "../common/logger";
import type { Envelope, Transaction, Bill, Debt } from "../../db/types";

interface TestData {
  envelope: Partial<Envelope>;
  transaction: Partial<Transaction>;
  bill: Partial<Bill>;
  debt: Partial<Debt>;
}

interface ValidationResult {
  flow: string;
  status: string;
  details?: string;
  error?: string;
}

export const validateAllSyncFlows = async (): Promise<ValidationResult[]> => {
  logger.info("🔄 VALIDATING ALL SYNC FLOWS...");
  const results: ValidationResult[] = [];

  // Flow 1: Create → Sync → Validate
  try {
    logger.info("🧪 Testing complete data flow: Create → Sync → Validate");

    const testData: TestData = {
      envelope: {
        id: "flow-test-env-" + Date.now(),
        name: "Flow Test Envelope",
        category: "Test",
        currentBalance: 100,
        lastModified: Date.now(),
        archived: false,
      },
      transaction: {
        id: "flow-test-txn-" + Date.now(),
        description: "Flow Test Transaction",
        amount: -25.5,
        date: new Date(),
        lastModified: Date.now(),
        envelopeId: "",
        category: "test",
        type: "expense",
      },
      bill: {
        id: "flow-test-bill-" + Date.now(),
        name: "Flow Test Bill",
        amount: 75,
        dueDate: new Date(),
        lastModified: Date.now(),
        category: "test",
        isPaid: false,
        isRecurring: false,
      },
      debt: {
        id: "flow-test-debt-" + Date.now(),
        name: "Flow Test Debt",
        creditor: "Test Bank",
        currentBalance: 1000,
        lastModified: Date.now(),
        type: "other",
        status: "active",
        minimumPayment: 50,
      },
    };

    // Add test data
    await budgetDb.envelopes.add(testData.envelope as Envelope);
    await budgetDb.transactions.add(testData.transaction as Transaction);
    await budgetDb.bills.add(testData.bill as Bill);
    await budgetDb.debts.add(testData.debt as Debt);

    // Update metadata
    await budgetDb.budget.put({
      id: "metadata",
      unassignedCash: 500,
      actualBalance: 2000,
      lastEditedBy: "Flow Test User",
      lastEditedAt: new Date().toISOString(),
      lastModified: Date.now(),
    });

    // Fetch sync data
    const syncData = await cloudSyncService.fetchDexieData();

    // Validate all data types are present
    const validations = [
      {
        name: "Envelope in sync",
        test: syncData.envelopes.some((e) => e.id === testData.envelope.id),
      },
      {
        name: "Transaction in sync",
        test: syncData.transactions.some((t) => t.id === testData.transaction.id),
      },
      {
        name: "Bill in sync",
        test: syncData.bills.some((b) => b.id === testData.bill.id),
      },
      {
        name: "Debt in sync",
        test: syncData.debts.some((d) => d.id === testData.debt.id),
      },
      {
        name: "Metadata synced",
        test: syncData.unassignedCash === 500 && syncData.actualBalance === 2000,
      },
      {
        name: "Timestamp valid",
        test: !isNaN(syncData.lastModified) && syncData.lastModified > 0,
      },
    ];

    const allPassed = validations.every((v) => v.test);

    results.push({
      flow: "Complete Data Flow",
      status: allPassed ? "✅ PASSED" : "❌ FAILED",
      details: validations.map((v) => `${v.name}: ${v.test ? "✅" : "❌"}`).join(", "),
    });

    // Cleanup
    await budgetDb.envelopes.where("id").equals(testData.envelope.id).delete();
    await budgetDb.transactions.where("id").equals(testData.transaction.id).delete();
    await budgetDb.bills.where("id").equals(testData.bill.id).delete();
    await budgetDb.debts.where("id").equals(testData.debt.id).delete();
  } catch (error) {
    results.push({
      flow: "Complete Data Flow",
      status: "❌ FAILED",
      error: (error as Error).message,
    });
  }

  // Flow 2: Bulk Operations
  try {
    logger.info("🧪 Testing bulk operations flow");

    const bulkEnvelopes = Array.from({ length: 10 }, (_, i) => ({
      id: `bulk-env-${i}-${Date.now()}`,
      name: `Bulk Envelope ${i}`,
      lastModified: Date.now() + i,
      category: "test",
      archived: false,
    }));

    const bulkTransactions = Array.from({ length: 20 }, (_, i) => ({
      id: `bulk-txn-${i}-${Date.now()}`,
      description: `Bulk Transaction ${i}`,
      amount: Math.random() * 100,
      lastModified: Date.now() + i,
      date: new Date(),
      envelopeId: "",
      category: "test",
      type: "expense" as const,
    }));

    // Add bulk data
    await budgetDb.bulkUpsertEnvelopes(bulkEnvelopes as Envelope[]);
    await budgetDb.bulkUpsertTransactions(bulkTransactions as Transaction[]);

    // Fetch and validate
    const syncData = await cloudSyncService.fetchDexieData();

    const bulkValidations = [
      {
        name: "All envelopes synced",
        test: bulkEnvelopes.every((e) => syncData.envelopes.some((se) => se.id === e.id)),
      },
      {
        name: "All transactions synced",
        test: bulkTransactions.every((t) => syncData.transactions.some((st) => st.id === t.id)),
      },
      {
        name: "Counts correct",
        test: syncData.envelopes.length >= 10 && syncData.transactions.length >= 20,
      },
    ];

    const bulkPassed = bulkValidations.every((v) => v.test);

    results.push({
      flow: "Bulk Operations",
      status: bulkPassed ? "✅ PASSED" : "❌ FAILED",
      details: bulkValidations.map((v) => `${v.name}: ${v.test ? "✅" : "❌"}`).join(", "),
    });

    // Cleanup
    await budgetDb.envelopes.where("id").startsWith("bulk-env-").delete();
    await budgetDb.transactions.where("id").startsWith("bulk-txn-").delete();
  } catch (error) {
    results.push({
      flow: "Bulk Operations",
      status: "❌ FAILED",
      error: (error as Error).message,
    });
  }

  // Flow 3: Sync Direction Logic
  try {
    logger.info("🧪 Testing sync direction logic flows");

    const scenarios = [
      {
        name: "Local newer than cloud",
        firestore: { lastModified: Date.now() - 10000, envelopes: [] },
        dexie: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        expected: "toFirestore",
      },
      {
        name: "Cloud newer than local",
        firestore: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        dexie: { lastModified: Date.now() - 10000, envelopes: [] },
        expected: "fromFirestore",
      },
      {
        name: "Equal timestamps",
        firestore: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        dexie: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        expected: "bidirectional", // Same timestamp, need full sync
      },
      {
        name: "Local only data",
        firestore: null,
        dexie: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        expected: "toFirestore",
      },
      {
        name: "Cloud only data",
        firestore: { lastModified: Date.now(), envelopes: [{ id: "test" }] },
        dexie: { lastModified: 0, envelopes: [] },
        expected: "fromFirestore",
      },
    ];

    const directionResults = [];
    for (const scenario of scenarios) {
      try {
        const result = await cloudSyncService.determineSyncDirection(
          scenario.dexie as Parameters<typeof cloudSyncService.determineSyncDirection>[0],
          scenario.firestore as Parameters<typeof cloudSyncService.determineSyncDirection>[1]
        );
        const correct = result.direction === scenario.expected;
        directionResults.push(`${scenario.name}: ${correct ? "✅" : "❌"}`);
      } catch {
        directionResults.push(`${scenario.name}: ❌ Error`);
      }
    }

    const allDirectionsCorrect = directionResults.every((r) => r.includes("✅"));

    results.push({
      flow: "Sync Direction Logic",
      status: allDirectionsCorrect ? "✅ PASSED" : "❌ FAILED",
      details: directionResults.join(", "),
    });
  } catch (error) {
    results.push({
      flow: "Sync Direction Logic",
      status: "❌ FAILED",
      error: (error as Error).message,
    });
  }

  // Flow 4: Service Lifecycle
  try {
    logger.info("🧪 Testing service lifecycle flow");

    const initialStatus = cloudSyncService.getStatus();

    // Test config
    const testConfig = {
      budgetId: "test-budget-" + Date.now(),
      encryptionKey: new Uint8Array(32),
      currentUser: { userName: "Test User", userColor: "#123456" },
    };

    // Start service
    await cloudSyncService.start(testConfig);
    const runningStatus = cloudSyncService.getStatus();

    // Stop service
    cloudSyncService.stop();
    const stoppedStatus = cloudSyncService.getStatus();

    const lifecycleChecks = [
      {
        name: "Initial state valid",
        test: typeof initialStatus.isRunning === "boolean",
      },
      { name: "Service starts", test: runningStatus.isRunning === true },
      { name: "Service stops", test: stoppedStatus.isRunning === false },
      { name: "Config managed", test: runningStatus.hasConfig === true },
    ];

    const lifecyclePassed = lifecycleChecks.every((c) => c.test);

    results.push({
      flow: "Service Lifecycle",
      status: lifecyclePassed ? "✅ PASSED" : "❌ FAILED",
      details: lifecycleChecks.map((c) => `${c.name}: ${c.test ? "✅" : "❌"}`).join(", "),
    });
  } catch (error) {
    results.push({
      flow: "Service Lifecycle",
      status: "❌ FAILED",
      error: (error as Error).message,
    });
  }

  // Print Results
  const totalFlows = results.length;
  const passedFlows = results.filter((r) => r.status.includes("✅")).length;
  const passRate = Math.round((passedFlows / totalFlows) * 100);

  logger.info("🔄 SYNC FLOW VALIDATION COMPLETE:", {
    totalFlows,
    passed: passedFlows,
    failed: totalFlows - passedFlows,
    passRate: `${passRate}%`,
  });

  results.forEach((result) => {
    logger.info(`${result.status} ${result.flow}: ${result.details || result.error || ""}`);
  });

  if (passedFlows === totalFlows) {
    logger.info("🎉 ALL SYNC FLOWS VALIDATED! System is fully operational.");
  } else {
    logger.warn(`⚠️ ${totalFlows - passedFlows} flow(s) failed validation.`);
  }

  return results;
};

// Expose to window
if (typeof window !== "undefined") {
  (
    window as unknown as Window & { validateAllSyncFlows?: typeof validateAllSyncFlows }
  ).validateAllSyncFlows = validateAllSyncFlows;
}

export default validateAllSyncFlows;
