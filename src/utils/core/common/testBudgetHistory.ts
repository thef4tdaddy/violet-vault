import { budgetDb } from "@/db/budgetDb";
import type { BudgetChange } from "@/db/types";
import logger from "./logger.ts";

/**
 * Test utility to create sample budget history commits
 * This tests the Dexie → Cloud Sync → Family Collaboration flow
 */
export const createTestBudgetHistory = async () => {
  try {
    logger.info("🧪 Creating test budget history commits...");

    // Create a test commit
    const testCommit: import("@/db/types").BudgetCommit = {
      hash: "test_commit_" + Date.now(),
      timestamp: Date.now(),
      message: "Test commit for family collaboration",
      author: "test_user",
      parentHash: undefined,
      deviceFingerprint: "test_device",
    };

    // Create test changes
    const testChanges: BudgetChange[] = [
      {
        commitHash: testCommit.hash,
        entityType: "envelope",
        entityId: "test_envelope_1",
        changeType: "update",
        description: "Updated envelope balance for testing",
        oldValue: { balance: 100 },
        newValue: { balance: 150 },
      },
      {
        commitHash: testCommit.hash,
        entityType: "transaction",
        entityId: "test_transaction_1",
        changeType: "create",
        description: "Added test transaction",
        oldValue: null,
        newValue: { amount: 50, description: "Test transaction" },
      },
    ];

    // Save to Dexie
    await budgetDb.createBudgetCommit(testCommit);
    await budgetDb.createBudgetChanges(testChanges);

    logger.info("✅ Test budget history created", {
      commitHash: testCommit.hash,
      changesCount: testChanges.length,
    });

    return { commit: testCommit, changes: testChanges };
  } catch (error) {
    logger.error("❌ Failed to create test budget history", error);
    throw error;
  }
};

/**
 * Check if budget history exists in Dexie
 */
export const checkBudgetHistory = async () => {
  try {
    const commits = await budgetDb.budgetCommits.limit(10).toArray();
    const changes = await budgetDb.budgetChanges.limit(10).toArray();

    logger.info("📊 Budget history status", {
      commitsCount: commits.length,
      changesCount: changes.length,
      latestCommit: commits[0]?.message || "none",
    });

    return { commits, changes };
  } catch (error) {
    logger.error("❌ Failed to check budget history", error);
    return { commits: [], changes: [] };
  }
};
