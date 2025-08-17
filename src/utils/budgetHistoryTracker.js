import { budgetDb } from "../db/budgetDb";
import { encryptionUtils } from "./encryption";
import logger from "./logger";

/**
 * Utility for automatically tracking budget changes for family collaboration
 * Creates git-like commit history for unassigned cash, actual balance, and debt changes
 */
export class BudgetHistoryTracker {
  /**
   * Create a budget history commit for a change
   * @param {Object} options - Commit options
   * @param {string} options.entityType - Type of entity (unassignedCash, actualBalance, debt)
   * @param {string} options.entityId - ID of the entity (for debts)
   * @param {string} options.changeType - Type of change (modify, add, delete)
   * @param {string} options.description - Human-readable description
   * @param {any} options.beforeData - Data before the change
   * @param {any} options.afterData - Data after the change
   * @param {string} options.author - User who made the change
   * @param {string} [options.deviceFingerprint] - Device identifier
   * @param {string} [options.parentHash] - Parent commit hash for linking
   */
  static async createHistoryCommit({
    entityType,
    entityId = null,
    changeType,
    description,
    beforeData,
    afterData,
    author = "Unknown User",
    deviceFingerprint = null,
    parentHash = null,
  }) {
    try {
      // Generate commit hash
      const commitData = {
        entityType,
        entityId,
        changeType,
        description,
        beforeData,
        afterData,
        author,
        timestamp: Date.now(),
        deviceFingerprint:
          deviceFingerprint || encryptionUtils.generateDeviceFingerprint(),
      };

      const hash = encryptionUtils.generateHash(JSON.stringify(commitData));

      // Create minimal encrypted snapshot for the change
      const snapshot = {
        [entityType]: {
          [entityId || "main"]: afterData,
        },
        timestamp: Date.now(),
      };

      // For now, we'll store a simple encrypted version
      // In production, this would use the user's encryption key
      const encryptedSnapshot = await encryptionUtils.encrypt(
        snapshot,
        // Use a temporary key for now - in real implementation this would be the user's key
        new Uint8Array(32).fill(42),
      );

      // Create the commit
      const commit = {
        hash,
        timestamp: commitData.timestamp,
        message: description,
        author,
        parentHash,
        encryptedSnapshot: encryptedSnapshot.data,
        deviceFingerprint: commitData.deviceFingerprint,
      };

      // Create the change record
      const change = {
        commitHash: hash,
        entityType,
        entityId: entityId || "main",
        changeType,
        description,
        beforeData,
        afterData,
      };

      // Save to Dexie
      await budgetDb.createBudgetCommit(commit);
      await budgetDb.createBudgetChanges([change]);

      logger.info("Budget history commit created", {
        hash: hash.substring(0, 8),
        entityType,
        changeType,
        author,
      });

      return { commit, changes: [change] };
    } catch (error) {
      logger.error("Failed to create budget history commit:", error);
      throw error;
    }
  }

  /**
   * Track unassigned cash changes
   */
  static async trackUnassignedCashChange({
    previousAmount,
    newAmount,
    author = "Unknown User",
    source = "manual",
  }) {
    const description =
      source === "distribution"
        ? `Distributed ${encryptionUtils.formatCurrency(previousAmount - newAmount)} to envelopes`
        : `Updated unassigned cash from ${encryptionUtils.formatCurrency(previousAmount)} to ${encryptionUtils.formatCurrency(newAmount)}`;

    return await this.createHistoryCommit({
      entityType: "unassignedCash",
      entityId: null,
      changeType: "modify",
      description,
      beforeData: { amount: previousAmount },
      afterData: { amount: newAmount },
      author,
    });
  }

  /**
   * Track actual balance changes
   */
  static async trackActualBalanceChange({
    previousBalance,
    newBalance,
    isManual = true,
    author = "Unknown User",
  }) {
    const source = isManual ? "manual entry" : "automatic calculation";
    const description = `Updated actual balance via ${source} from ${encryptionUtils.formatCurrency(previousBalance)} to ${encryptionUtils.formatCurrency(newBalance)}`;

    return await this.createHistoryCommit({
      entityType: "actualBalance",
      entityId: null,
      changeType: "modify",
      description,
      beforeData: { balance: previousBalance, isManual: !isManual },
      afterData: { balance: newBalance, isManual },
      author,
    });
  }

  /**
   * Track debt changes
   */
  static async trackDebtChange({
    debtId,
    changeType,
    previousData,
    newData,
    author = "Unknown User",
  }) {
    let description = "";

    switch (changeType) {
      case "add":
        description = `Added new debt: ${newData.name} (${encryptionUtils.formatCurrency(newData.currentBalance)})`;
        break;
      case "modify":
        if (previousData.currentBalance !== newData.currentBalance) {
          description = `Updated ${newData.name} balance from ${encryptionUtils.formatCurrency(previousData.currentBalance)} to ${encryptionUtils.formatCurrency(newData.currentBalance)}`;
        } else {
          description = `Updated debt: ${newData.name}`;
        }
        break;
      case "delete":
        description = `Deleted debt: ${previousData.name}`;
        break;
      default:
        description = `Modified debt: ${newData?.name || previousData?.name}`;
    }

    return await this.createHistoryCommit({
      entityType: "debt",
      entityId: debtId,
      changeType,
      description,
      beforeData: previousData,
      afterData: newData,
      author,
    });
  }

  /**
   * Get recent changes for a specific entity type
   */
  static async getRecentChanges(entityType, limit = 10) {
    try {
      const changes = await budgetDb.budgetChanges
        .where("entityType")
        .equals(entityType)
        .reverse()
        .limit(limit)
        .toArray();

      return changes;
    } catch (error) {
      logger.error("Failed to get recent changes:", error);
      return [];
    }
  }

  /**
   * Get all changes for a specific entity
   */
  static async getEntityHistory(entityType, entityId = null) {
    try {
      let query = budgetDb.budgetChanges.where("entityType").equals(entityType);

      if (entityId) {
        query = query.and((change) => change.entityId === entityId);
      }

      const changes = await query.reverse().toArray();
      return changes;
    } catch (error) {
      logger.error("Failed to get entity history:", error);
      return [];
    }
  }

  /**
   * Get summary of recent activity across all tracked entities
   */
  static async getRecentActivity(limit = 20) {
    try {
      const changes = await budgetDb.budgetChanges
        .where("entityType")
        .anyOf(["unassignedCash", "actualBalance", "debt"])
        .reverse()
        .limit(limit)
        .toArray();

      return changes;
    } catch (error) {
      logger.error("Failed to get recent activity:", error);
      return [];
    }
  }
}

// Helper function to add currency formatting to encryptionUtils if not present
if (!encryptionUtils.formatCurrency) {
  encryptionUtils.formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };
}

export default BudgetHistoryTracker;
