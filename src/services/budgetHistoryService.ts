// Budget History Service - Git-like history tracking for budget changes
import { budgetDb } from "../db/budgetDb";
import { encryptionUtils } from "../utils/security/encryption";
import logger from "../utils/common/logger";

/**
 * Options for creating a history commit
 */
interface CreateCommitOptions {
  entityType: string;
  entityId?: string | null;
  changeType: "create" | "update" | "delete";
  description: string;
  beforeData?: unknown;
  afterData?: unknown;
  author?: string;
  deviceFingerprint?: string | null;
  parentHash?: string | null;
}

/**
 * Options for queries
 */
interface QueryOptions {
  limit?: number;
  startDate?: number;
  endDate?: number;
  entityType?: string;
  author?: string;
}

/**
 * Budget History Service
 * Provides git-like version control for budget changes with commit history,
 * branching, tagging, and device fingerprinting for family collaboration
 */
class BudgetHistoryService {
  maxRecentCommits: number;
  maxDevicesPerAuthor: number;
  defaultAnalysisRange: number;

  constructor() {
    this.maxRecentCommits = 1000;
    this.maxDevicesPerAuthor = 3;
    this.defaultAnalysisRange = 30 * 24 * 60 * 60 * 1000; // 30 days
  }

  /**
   * Initialize history service
   */
  async initialize(): Promise<boolean> {
    try {
      logger.info("Budget history service initialized");
      return true;
    } catch (error: unknown) {
      logger.error("Failed to initialize budget history service", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create a budget history commit
   */
  async createCommit(options: CreateCommitOptions): Promise<unknown> {
    const {
      entityType,
      entityId = null,
      changeType,
      description,
      beforeData,
      afterData,
      author = "Unknown User",
      deviceFingerprint = null,
      parentHash = null,
    } = options;

    try {
      const timestamp = Date.now();
      const fingerprint = deviceFingerprint || encryptionUtils.generateDeviceFingerprint();

      // Create commit data for hashing
      const commitData = {
        entityType,
        entityId,
        changeType,
        description,
        beforeData,
        afterData,
        author,
        timestamp,
        deviceFingerprint: fingerprint,
      };

      // Generate commit hash
      const hash = encryptionUtils.generateHash(JSON.stringify(commitData));

      // Create snapshot of the change
      const snapshot = {
        [entityType]: {
          [entityId || "main"]: afterData,
        },
        timestamp,
      };

      // Create commit record
      const commit = {
        hash,
        timestamp,
        message: description,
        author,
        parentHash,
        snapshotData: JSON.stringify(snapshot),
        deviceFingerprint: fingerprint,
      };

      // Create change record
      const change = {
        commitHash: hash,
        entityType,
        entityId: entityId || "main",
        changeType,
        description,
        beforeData,
        afterData,
      };

      // Save to database
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
      logger.error("Failed to create budget history commit", error);
      throw error;
    }
  }

  /**
   * Track unassigned cash changes
   */
  async trackUnassignedCashChange(options: {
    previousAmount: number;
    newAmount: number;
    author?: string;
    source?: string;
  }): Promise<unknown> {
    const { previousAmount, newAmount, author = "Unknown User", source = "manual" } = options;

    const description =
      source === "distribution"
        ? `Distributed ${this._formatCurrency(previousAmount - newAmount)} to envelopes`
        : `Updated unassigned cash from ${this._formatCurrency(previousAmount)} to ${this._formatCurrency(newAmount)}`;

    return await this.createCommit({
      entityType: "unassignedCash",
      entityId: null,
      changeType: "update",
      description,
      beforeData: { amount: previousAmount },
      afterData: { amount: newAmount },
      author,
    });
  }

  /**
   * Track actual balance changes
   */
  async trackActualBalanceChange(options: {
    previousBalance: number;
    newBalance: number;
    isManual?: boolean;
    author?: string;
  }): Promise<unknown> {
    const { previousBalance, newBalance, isManual = true, author = "Unknown User" } = options;

    const source = isManual ? "manual entry" : "automatic calculation";
    const description = `Updated actual balance via ${source} from ${this._formatCurrency(previousBalance)} to ${this._formatCurrency(newBalance)}`;

    return await this.createCommit({
      entityType: "actualBalance",
      entityId: null,
      changeType: "update",
      description,
      beforeData: { balance: previousBalance, isManual: !isManual },
      afterData: { balance: newBalance, isManual },
      author,
    });
  }

  /**
   * Track debt changes
   */
  async trackDebtChange(options: {
    debtId: string;
    changeType: string;
    previousData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    author?: string;
  }): Promise<unknown> {
    const { debtId, changeType, previousData, newData, author = "Unknown User" } = options;

    let description = "";

    switch (changeType) {
      case "add":
        description = `Added new debt: ${newData?.name} (${this._formatCurrency((newData?.currentBalance as number) || 0)})`;
        break;
      case "modify":
        if ((previousData?.currentBalance as number) !== (newData?.currentBalance as number)) {
          description = `Updated ${newData?.name} balance from ${this._formatCurrency((previousData?.currentBalance as number) || 0)} to ${this._formatCurrency((newData?.currentBalance as number) || 0)}`;
        } else {
          description = `Updated debt: ${newData?.name}`;
        }
        break;
      case "delete":
        description = `Deleted debt: ${previousData?.name}`;
        break;
      default:
        description = `Modified debt: ${newData?.name || previousData?.name}`;
    }

    const mappedChangeType: "create" | "update" | "delete" =
      changeType === "add" ? "create" : changeType === "modify" ? "update" : "delete";

    return await this.createCommit({
      entityType: "debt",
      entityId: debtId,
      changeType: mappedChangeType,
      description,
      beforeData: previousData,
      afterData: newData,
      author,
    });
  }

  /**
   * Get recent changes for specific entity type
   */
  async getRecentChanges(entityType: string, limit = 10): Promise<unknown[]> {
    try {
      const changes = await budgetDb.budgetChanges
        .where("entityType")
        .equals(entityType)
        .reverse()
        .limit(limit)
        .toArray();

      return changes;
    } catch (error: unknown) {
      logger.error("Failed to get recent changes", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get full history for specific entity
   */
  async getEntityHistory(entityType: string, entityId: string | null = null): Promise<unknown[]> {
    try {
      let query = budgetDb.budgetChanges.where("entityType").equals(entityType);

      if (entityId) {
        query = query.and((change) => change.entityId === entityId);
      }

      const changes = await query.reverse().toArray();
      return changes;
    } catch (error) {
      logger.error("Failed to get entity history", error);
      return [];
    }
  }

  /**
   * Get recent activity across all tracked entities
   */
  async getRecentActivity(limit = 20) {
    try {
      const changes = await budgetDb.budgetChanges
        .where("entityType")
        .anyOf(["unassignedCash", "actualBalance", "debt"])
        .reverse()
        .limit(limit)
        .toArray();

      return changes;
    } catch (error) {
      logger.error("Failed to get recent activity", error);
      return [];
    }
  }

  /**
   * Branch Management
   */
  async createBranch(options: {
    fromCommitHash: string;
    branchName: string;
    description?: string;
    author?: string;
  }): Promise<void> {
    const { fromCommitHash, branchName, description = "", author = "Unknown User" } = options;

    try {
      // Check if branch exists
      const existingBranch = await budgetDb.budgetBranches.where("name").equals(branchName).first();

      if (existingBranch) {
        throw new Error(`Branch '${branchName}' already exists`);
      }

      // Verify source commit
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
    } catch (error: unknown) {
      logger.error("Failed to create budget history branch", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async switchBranch(branchName: string): Promise<void> {
    try {
      // Deactivate current branch
      // Note: Dexie requires IndexableType, so we cast true to 1 for boolean index queries
      await budgetDb.budgetBranches
        .where("isActive")
        .equals(1 as number)
        .modify({
          isActive: false,
        });

      // Activate target branch
      const updatedCount = await budgetDb.budgetBranches.where("name").equals(branchName).modify({
        isActive: true,
      });

      if (updatedCount === 0) {
        throw new Error(`Branch '${branchName}' not found`);
      }

      logger.info("Switched to budget history branch", { branchName });
      return true;
    } catch (error) {
      logger.error("Failed to switch budget history branch", error);
      throw error;
    }
  }

  async getBranches() {
    try {
      return await budgetDb.budgetBranches.orderBy("created").toArray();
    } catch (error: unknown) {
      logger.error("Failed to get budget history branches", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Tag Management
   */
  async createTag(options: {
    commitHash: string;
    tagName: string;
    description?: string;
    tagType?: string;
    author?: string;
  }): Promise<unknown> {
    const {
      commitHash,
      tagName,
      description = "",
      tagType = "milestone",
      author = "Unknown User",
    } = options;

    try {
      // Check if tag exists
      const existingTag = await budgetDb.budgetTags.where("name").equals(tagName).first();

      if (existingTag) {
        throw new Error(`Tag '${tagName}' already exists`);
      }

      // Verify commit exists
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

      await budgetDb.createBudgetTag(tag);

      logger.info("Budget history tag created", {
        tagName,
        commitHash: commitHash.substring(0, 8),
        tagType,
        author,
      });

      return tag;
    } catch (error: unknown) {
      logger.error("Failed to create budget history tag", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getTags(): Promise<unknown[]> {
    try {
      return await budgetDb.budgetTags.orderBy("created").reverse().toArray();
    } catch (error: unknown) {
      logger.error("Failed to get budget history tags", {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Security and Device Management
   */
  async signCommit(
    commitData: Record<string, unknown>,
    deviceFingerprint: string
  ): Promise<string> {
    try {
      const signaturePayload = {
        ...commitData,
        deviceFingerprint,
        timestamp: Date.now(),
      };

      const signature = encryptionUtils.generateHash(
        JSON.stringify(signaturePayload) + deviceFingerprint
      );

      const isDeviceConsistent = await this.verifyDeviceConsistency(
        commitData.author,
        deviceFingerprint
      );

      return signature;
    } catch (error: unknown) {
      logger.error("Failed to sign commit", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async verifyDeviceConsistency(author: string, currentFingerprint: string): Promise<boolean> {
    try {
      const recentCommits = await budgetDb.budgetCommits
        .where("author")
        .equals(author)
        .reverse()
        .limit(10)
        .toArray();

      if (recentCommits.length === 0) {
        return true; // First commit from this author
      }

      const knownFingerprints = [
        ...new Set(recentCommits.map((c) => c.deviceFingerprint).filter((f) => f && f !== "")),
      ];

      if (knownFingerprints.length <= this.maxDevicesPerAuthor) {
        return (
          knownFingerprints.includes(currentFingerprint) ||
          knownFingerprints.length < this.maxDevicesPerAuthor
        );
      }

      return knownFingerprints.includes(currentFingerprint);
    } catch (error) {
      logger.error("Failed to verify device consistency", error);
      return false;
    }
  }

  /**
   * Analytics and Patterns
   */
  async getChangePatterns(timeRangeMs = this.defaultAnalysisRange) {
    try {
      const cutoffTime = Date.now() - timeRangeMs;

      const [changes, commits] = await Promise.all([
        budgetDb.budgetChanges.where("commitHash").above("").toArray(),
        budgetDb.budgetCommits.where("timestamp").above(cutoffTime).toArray(),
      ]);

      const commitHashes = new Set(commits.map((c) => c.hash));
      const recentChanges = changes.filter((c) => commitHashes.has(c.commitHash));

      const patterns = {
        totalChanges: recentChanges.length,
        changesByType: {},
        changesByEntity: {},
        authorActivity: {},
        dailyActivity: {},
        mostActiveHour: null,
        averageChangesPerDay: 0,
      };

      // Analyze change patterns
      recentChanges.forEach((change) => {
        patterns.changesByType[change.changeType] =
          (patterns.changesByType[change.changeType] || 0) + 1;
        patterns.changesByEntity[change.entityType] =
          (patterns.changesByEntity[change.entityType] || 0) + 1;
      });

      // Author activity
      commits.forEach((commit) => {
        patterns.authorActivity[commit.author] = (patterns.authorActivity[commit.author] || 0) + 1;
      });

      // Daily activity
      commits.forEach((commit) => {
        const date = new Date(commit.timestamp).toDateString();
        patterns.dailyActivity[date] = (patterns.dailyActivity[date] || 0) + 1;
      });

      // Calculate averages
      const days = Object.keys(patterns.dailyActivity).length;
      patterns.averageChangesPerDay = days > 0 ? recentChanges.length / days : 0;

      // Most active hour
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
      logger.error("Failed to analyze change patterns", error);
      return null;
    }
  }

  /**
   * Utility methods
   */
  _formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      maxRecentCommits: this.maxRecentCommits,
      maxDevicesPerAuthor: this.maxDevicesPerAuthor,
      defaultAnalysisRange: this.defaultAnalysisRange,
    };
  }

  /**
   * Cleanup old commits to maintain performance
   */
  async cleanup() {
    try {
      const totalCommits = await budgetDb.budgetCommits.count();

      if (totalCommits > this.maxRecentCommits) {
        const oldCommits = await budgetDb.budgetCommits
          .orderBy("timestamp")
          .limit(totalCommits - this.maxRecentCommits)
          .toArray();

        const oldHashes = oldCommits.map((c) => c.hash);

        // Clean up old commits and related changes
        await Promise.all([
          budgetDb.budgetCommits.bulkDelete(oldHashes),
          budgetDb.budgetChanges.where("commitHash").anyOf(oldHashes).delete(),
        ]);

        logger.info(`Cleaned up ${oldCommits.length} old commits`);
      }
    } catch (error) {
      logger.error("Failed to cleanup old commits", error);
    }
  }
}

// Export singleton instance
export default new BudgetHistoryService();
