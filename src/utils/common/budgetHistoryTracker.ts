import { budgetDb } from "../../db/budgetDb";
import type { BudgetTag } from "../../db/types";
import { encryptionUtils } from "../security/encryption";
import logger from "../common/logger";
import { formatCurrency } from "../accounts/accountHelpers";

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
        deviceFingerprint: deviceFingerprint || encryptionUtils.generateDeviceFingerprint(),
      };

      const hash = encryptionUtils.generateHash(JSON.stringify(commitData));

      // Create minimal encrypted snapshot for the change
      const snapshot = {
        [entityType]: {
          [entityId || "main"]: afterData,
        },
        timestamp: Date.now(),
      };

      // For now, we'll store the snapshot as JSON
      // TODO: Implement proper encryption using user's encryption key
      const snapshotData = JSON.stringify(snapshot);

      // Create the commit
      const commit = {
        hash,
        timestamp: commitData.timestamp,
        message: description,
        author,
        parentHash,
        snapshotData: snapshotData,
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
        ? `Distributed ${formatCurrency(previousAmount - newAmount)} to envelopes`
        : `Updated unassigned cash from ${formatCurrency(previousAmount)} to ${formatCurrency(newAmount)}`;

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
    const description = `Updated actual balance via ${source} from ${formatCurrency(previousBalance)} to ${formatCurrency(newBalance)}`;

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
        description = `Added new debt: ${newData.name} (${formatCurrency(newData.currentBalance)})`;
        break;
      case "modify":
        if (previousData.currentBalance !== newData.currentBalance) {
          description = `Updated ${newData.name} balance from ${formatCurrency(previousData.currentBalance)} to ${formatCurrency(newData.currentBalance)}`;
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

  /**
   * Advanced Features: Branching and Tagging
   */

  /**
   * Create a new branch from a specific commit
   * @param {string} commitHash - Hash of the commit to branch from
   * @param {string} branchName - Name for the new branch
   * @param {string} author - Author creating the branch
   */
  static async createBranch({
    fromCommitHash,
    branchName,
    description = "",
    author = "Unknown User",
  }) {
    try {
      // Check if branch name already exists
      const existingBranch = await budgetDb.budgetBranches.where("name").equals(branchName).first();

      if (existingBranch) {
        throw new Error(`Branch '${branchName}' already exists`);
      }

      // Verify the source commit exists
      const sourceCommit = await budgetDb.budgetCommits
        .where("hash")
        .equals(fromCommitHash)
        .first();

      if (!sourceCommit) {
        throw new Error(`Source commit '${fromCommitHash}' not found`);
      }

      const branch = {
        name: branchName,
        description,
        sourceCommitHash: fromCommitHash,
        headCommitHash: fromCommitHash,
        author,
        created: Date.now(),
        isActive: false,
        isMerged: false,
      };

      await budgetDb.createBudgetBranch(branch);

      logger.info("Budget history branch created", {
        branchName,
        fromCommit: fromCommitHash.substring(0, 8),
        author,
      });

      return branch;
    } catch (error) {
      logger.error("Failed to create budget history branch:", error);
      throw error;
    }
  }

  /**
   * Create a tag for a specific commit (milestone marker)
   * @param {string} commitHash - Hash of the commit to tag
   * @param {string} tagName - Name for the tag
   * @param {string} description - Description of the milestone
   * @param {string} author - Author creating the tag
   */
  static async createTag({
    commitHash,
    tagName,
    description = "",
    tagType = "milestone", // milestone, release, backup
    author = "Unknown User",
  }) {
    try {
      // Check if tag name already exists
      const existingTag = await budgetDb.budgetTags.where("name").equals(tagName).first();

      if (existingTag) {
        throw new Error(`Tag '${tagName}' already exists`);
      }

      // Verify the commit exists
      const commit = await budgetDb.budgetCommits.where("hash").equals(commitHash).first();

      if (!commit) {
        throw new Error(`Commit '${commitHash}' not found`);
      }

      const tag = {
        name: tagName,
        description,
        commitHash,
        tagType,
        author,
        created: Date.now(),
      };

      await budgetDb.createBudgetTag(tag as unknown as BudgetTag);

      logger.info("Budget history tag created", {
        tagName,
        commitHash: commitHash.substring(0, 8),
        tagType,
        author,
      });

      return tag;
    } catch (error) {
      logger.error("Failed to create budget history tag:", error);
      throw error;
    }
  }

  /**
   * Switch to a different branch
   * @param {string} branchName - Name of the branch to switch to
   */
  static async switchBranch(branchName) {
    try {
      // Deactivate current branch
      // Note: Dexie requires IndexableType, so we cast true to 1 for boolean index queries
      await budgetDb.budgetBranches
        .where("isActive")
        .equals(1 as number)
        .modify({
          isActive: false,
        });

      // Activate the target branch
      const updatedCount = await budgetDb.budgetBranches.where("name").equals(branchName).modify({
        isActive: true,
      });

      if (updatedCount === 0) {
        throw new Error(`Branch '${branchName}' not found`);
      }

      logger.info("Switched to budget history branch", { branchName });

      return true;
    } catch (error) {
      logger.error("Failed to switch budget history branch:", error);
      throw error;
    }
  }

  /**
   * Get all branches with their metadata
   */
  static async getBranches() {
    try {
      const branches = await budgetDb.budgetBranches.orderBy("created").toArray();
      return branches;
    } catch (error) {
      logger.error("Failed to get budget history branches:", error);
      return [];
    }
  }

  /**
   * Get all tags with their metadata
   */
  static async getTags() {
    try {
      const tags = await budgetDb.budgetTags.orderBy("created").reverse().toArray();
      return tags;
    } catch (error) {
      logger.error("Failed to get budget history tags:", error);
      return [];
    }
  }

  /**
   * Enhanced commit signing with device fingerprint verification
   * @param {Object} commitData - The commit data to sign
   * @param {string} deviceFingerprint - Current device fingerprint
   */
  static async signCommit(commitData, deviceFingerprint) {
    try {
      // Create signature payload
      const signaturePayload = {
        ...commitData,
        deviceFingerprint,
        timestamp: Date.now(),
      };

      // Generate signature hash (in production, this would use proper cryptographic signing)
      const signature = encryptionUtils.generateHash(
        JSON.stringify(signaturePayload) + deviceFingerprint
      );

      // Verify device consistency
      const isDeviceConsistent = await this.verifyDeviceConsistency(
        commitData.author,
        deviceFingerprint
      );

      return {
        signature,
        deviceFingerprint,
        isDeviceConsistent,
        signedAt: Date.now(),
      };
    } catch (error) {
      logger.error("Failed to sign commit:", error);
      throw error;
    }
  }

  /**
   * Verify device consistency for tamper detection
   * @param {string} author - Commit author
   * @param {string} currentFingerprint - Current device fingerprint
   */
  static async verifyDeviceConsistency(author, currentFingerprint) {
    try {
      // Get recent commits from this author
      const recentCommits = await budgetDb.budgetCommits
        .where("author")
        .equals(author)
        .reverse()
        .limit(10)
        .toArray();

      if (recentCommits.length === 0) {
        return true; // First commit from this author
      }

      // Check fingerprint consistency
      const knownFingerprints = [
        ...new Set(recentCommits.map((c) => c.deviceFingerprint).filter((f) => f && f !== "")),
      ];

      // Allow up to 3 different fingerprints per author (multiple devices)
      if (knownFingerprints.length <= 3) {
        return knownFingerprints.includes(currentFingerprint) || knownFingerprints.length < 3;
      }

      return knownFingerprints.includes(currentFingerprint);
    } catch (error) {
      logger.error("Failed to verify device consistency:", error);
      return false;
    }
  }

  /**
   * Advanced Analytics: Change patterns and usage statistics
   */
  static async getChangePatterns(timeRangeMs = 30 * 24 * 60 * 60 * 1000) {
    try {
      const cutoffTime = Date.now() - timeRangeMs;

      const changes = await budgetDb.budgetChanges.where("commitHash").above("").toArray();

      // Get commits within time range
      const commits = await budgetDb.budgetCommits.where("timestamp").above(cutoffTime).toArray();

      const commitHashes = new Set(commits.map((c) => c.hash));
      const recentChanges = changes.filter((c) => commitHashes.has(c.commitHash));

      // Analyze patterns
      const patterns = {
        totalChanges: recentChanges.length,
        changesByType: {},
        changesByEntity: {},
        authorActivity: {},
        dailyActivity: {},
        mostActiveHour: null,
        averageChangesPerDay: 0,
      };

      // Group by change type
      recentChanges.forEach((change) => {
        patterns.changesByType[change.changeType] =
          (patterns.changesByType[change.changeType] || 0) + 1;
        patterns.changesByEntity[change.entityType] =
          (patterns.changesByEntity[change.entityType] || 0) + 1;
      });

      // Group by author activity
      commits.forEach((commit) => {
        patterns.authorActivity[commit.author] = (patterns.authorActivity[commit.author] || 0) + 1;
      });

      // Daily activity pattern
      commits.forEach((commit) => {
        const date = new Date(commit.timestamp).toDateString();
        patterns.dailyActivity[date] = (patterns.dailyActivity[date] || 0) + 1;
      });

      // Calculate average changes per day
      const days = Object.keys(patterns.dailyActivity).length;
      patterns.averageChangesPerDay = days > 0 ? recentChanges.length / days : 0;

      // Find most active hour
      const hourCounts = {};
      commits.forEach((commit) => {
        const hour = new Date(commit.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      patterns.mostActiveHour = Object.keys(hourCounts).reduce(
        (maxHour, hour) => (hourCounts[hour] > (hourCounts[maxHour] || 0) ? hour : maxHour),
        null
      );

      return patterns;
    } catch (error) {
      logger.error("Failed to analyze change patterns:", error);
      return null;
    }
  }
}

export default BudgetHistoryTracker;
