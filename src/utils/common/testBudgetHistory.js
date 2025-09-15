import { budgetDb } from "../../db/budgetDb.js";
import logger from "./logger.js";

/**
 * Test utility to create sample budget history commits
 * This tests the Dexie → Cloud Sync → Family Collaboration flow
 */
export const createTestBudgetHistory = async () => {
  try {
    logger.info("🧪 Creating test budget history commits...");

    // Create a test commit
    const testCommit = {
      hash: "test_commit_" + Date.now(),
      timestamp: Date.now(),
      message: "Test commit for family collaboration",
      author: "test_user",
      parentHash: null,
      encryptedSnapshot: "encrypted_test_data",
      deviceFingerprint: "test_device",
    };

    // Create test changes
    const testChanges = [
      {
        commitHash: testCommit.hash,
        entityType: "envelope",
        entityId: "test_envelope_1",
        changeType: "modify",
        description: "Updated envelope balance for testing",
        beforeData: { balance: 100 },
        afterData: { balance: 150 },
      },
      {
        commitHash: testCommit.hash,
        entityType: "transaction",
        entityId: "test_transaction_1",
        changeType: "add",
        description: "Added test transaction",
        beforeData: null,
        afterData: { amount: 50, description: "Test transaction" },
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
    const commits = await budgetDb.getBudgetCommits({ limit: 10 });
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
