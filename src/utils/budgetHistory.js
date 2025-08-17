import { encryptionUtils } from "./encryption.js";
import logger from "./logger.js";

/**
 * Encrypted Budget History System
 *
 * Git-like version control for budget data with encrypted snapshots and diffs.
 * Tracks all changes to envelopes, transactions, bills, goals, and settings.
 */
class BudgetHistory {
  constructor() {
    this.STORAGE_KEY = "violet-vault-budget-history";
    this.MAX_COMMITS = 1000; // Prevent unbounded growth
    this.initialized = false;
    this.historyKey = null;
    this.currentCommitHash = null;
    this.integrityStatus = null; // Track chain integrity
  }

  /**
   * Initialize the budget history system with user's encryption key
   * @param {string} password - User's master password
   */
  async initialize(password) {
    try {
      if (!password) {
        throw new Error("Password required to initialize budget history");
      }

      // Use the same key derivation as the main vault
      const { key } = await encryptionUtils.generateKey(password);
      this.historyKey = key;
      this.initialized = true;

      // Load the current commit hash
      await this.loadCurrentCommit();

      // Perform automatic integrity check on initialization
      await this.performIntegrityCheck();

      logger.debug("Budget history system initialized with integrity check");
    } catch (error) {
      logger.error("Failed to initialize budget history system", error);
      throw error;
    }
  }

  /**
   * Load the current commit hash from storage
   */
  async loadCurrentCommit() {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}-head`);
      this.currentCommitHash = stored || null;
    } catch (error) {
      logger.warn("Failed to load current commit", error);
    }
  }

  /**
   * Save the current commit hash to storage
   */
  async saveCurrentCommit(commitHash) {
    try {
      this.currentCommitHash = commitHash;
      localStorage.setItem(`${this.STORAGE_KEY}-head`, commitHash);
    } catch (error) {
      logger.error("Failed to save current commit", error);
    }
  }

  /**
   * Generate a hash for a commit
   * @param {Object} commit - The commit object
   * @returns {Promise<string>} - SHA-256 hash
   */
  async generateCommitHash(commit) {
    const commitString = JSON.stringify({
      timestamp: commit.timestamp,
      message: commit.message,
      author: commit.author,
      parentHash: commit.parentHash,
      changes: commit.changes,
    });

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(commitString));

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Create a snapshot of the current budget state
   * @param {Object} budgetState - Current budget state
   * @param {string} message - Commit message
   * @param {string} author - Author of the change (default: "local_user")
   * @returns {Promise<string>} - Commit hash
   */
  async commit(budgetState, message, author = "local_user") {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const timestamp = new Date().toISOString();

      // Get the previous state for diffing
      const previousState = this.currentCommitHash
        ? await this.getCommitState(this.currentCommitHash)
        : null;

      // Generate changes (diff)
      const changes = this.generateDiff(previousState, budgetState);

      // Only commit if there are actual changes
      if (changes.length === 0) {
        logger.debug("No changes detected, skipping commit");
        return this.currentCommitHash;
      }

      // Create the commit object
      const commit = {
        timestamp,
        message,
        author,
        parentHash: this.currentCommitHash,
        deviceFingerprint: encryptionUtils.generateDeviceFingerprint(),
        changes,
        // Store full state for easier retrieval (will be encrypted)
        state: budgetState,
      };

      // Generate commit hash
      const commitHash = await this.generateCommitHash(commit);
      commit.hash = commitHash;

      // Encrypt and store the commit
      await this.storeCommit(commitHash, commit);

      // Update HEAD pointer
      await this.saveCurrentCommit(commitHash);

      logger.debug("Budget state committed", {
        hash: commitHash.substring(0, 8),
        message,
        changes: changes.length,
      });

      return commitHash;
    } catch (error) {
      logger.error("Failed to commit budget state", error);
      throw error;
    }
  }

  /**
   * Generate a diff between two budget states
   * @param {Object} oldState - Previous state
   * @param {Object} newState - New state
   * @returns {Array} - Array of changes
   */
  generateDiff(oldState, newState) {
    const changes = [];

    if (!oldState) {
      changes.push({
        type: "create",
        path: "root",
        description: "Initial budget state created",
      });
      return changes;
    }

    // Check each major collection for changes
    const collections = [
      "envelopes",
      "transactions",
      "allTransactions",
      "bills",
      "savingsGoals",
      "supplementalAccounts",
      "debts",
    ];

    for (const collection of collections) {
      const oldItems = oldState[collection] || [];
      const newItems = newState[collection] || [];

      // Track added items
      for (const newItem of newItems) {
        const oldItem = oldItems.find((old) => old.id === newItem.id);
        if (!oldItem) {
          changes.push({
            type: "add",
            path: `${collection}[${newItem.id}]`,
            description: `Added ${collection.slice(0, -1)}: ${newItem.name || newItem.description || newItem.id}`,
            newValue: newItem,
          });
        } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          // Track modified items
          changes.push({
            type: "modify",
            path: `${collection}[${newItem.id}]`,
            description: `Modified ${collection.slice(0, -1)}: ${newItem.name || newItem.description || newItem.id}`,
            oldValue: oldItem,
            newValue: newItem,
            diff: this.createObjectDiff(oldItem, newItem),
          });
        }
      }

      // Track deleted items
      for (const oldItem of oldItems) {
        const newItem = newItems.find((item) => item.id === oldItem.id);
        if (!newItem) {
          changes.push({
            type: "delete",
            path: `${collection}[${oldItem.id}]`,
            description: `Deleted ${collection.slice(0, -1)}: ${oldItem.name || oldItem.description || oldItem.id}`,
            oldValue: oldItem,
          });
        }
      }
    }

    // Check simple properties
    const simpleProps = ["unassignedCash", "biweeklyAllocation", "actualBalance"];
    for (const prop of simpleProps) {
      if (oldState[prop] !== newState[prop]) {
        changes.push({
          type: "modify",
          path: prop,
          description: `Changed ${prop}: ${oldState[prop]} → ${newState[prop]}`,
          oldValue: oldState[prop],
          newValue: newState[prop],
        });
      }
    }

    return changes;
  }

  /**
   * Create a detailed diff between two objects
   * @param {Object} oldObj
   * @param {Object} newObj
   * @returns {Object} - Field-level changes
   */
  createObjectDiff(oldObj, newObj) {
    const diff = {};
    const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

    for (const key of allKeys) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = {
          from: oldObj[key],
          to: newObj[key],
        };
      }
    }

    return diff;
  }

  /**
   * Store an encrypted commit
   * @param {string} commitHash
   * @param {Object} commit
   */
  async storeCommit(commitHash, commit) {
    try {
      // Get existing commits
      const commitsKey = `${this.STORAGE_KEY}-commits`;
      const existing = JSON.parse(localStorage.getItem(commitsKey) || "{}");

      // Encrypt the commit
      const encryptedCommit = await encryptionUtils.encrypt(commit, this.historyKey);

      // Store with commit hash as key
      existing[commitHash] = {
        timestamp: commit.timestamp, // Keep timestamp unencrypted for sorting
        message: commit.message, // Keep message unencrypted for browsing
        author: commit.author,
        parentHash: commit.parentHash,
        hash: commitHash,
        encrypted: encryptedCommit,
      };

      // Maintain max commits limit (remove oldest)
      const commitHashes = Object.keys(existing);
      if (commitHashes.length > this.MAX_COMMITS) {
        // Sort by timestamp and remove oldest
        const sortedHashes = commitHashes
          .sort((a, b) => new Date(existing[a].timestamp) - new Date(existing[b].timestamp))
          .slice(0, commitHashes.length - this.MAX_COMMITS);

        for (const hashToRemove of sortedHashes) {
          delete existing[hashToRemove];
        }
      }

      localStorage.setItem(commitsKey, JSON.stringify(existing));
    } catch (error) {
      logger.error("Failed to store commit", error);
      throw error;
    }
  }

  /**
   * Get a specific commit by hash
   * @param {string} commitHash
   * @returns {Promise<Object>} - Decrypted commit
   */
  async getCommit(commitHash) {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const commitsKey = `${this.STORAGE_KEY}-commits`;
      const commits = JSON.parse(localStorage.getItem(commitsKey) || "{}");

      const storedCommit = commits[commitHash];
      if (!storedCommit) {
        throw new Error(`Commit ${commitHash} not found`);
      }

      // Decrypt the commit
      const decryptedCommit = await encryptionUtils.decrypt(
        storedCommit.encrypted.data,
        this.historyKey,
        storedCommit.encrypted.iv
      );

      return {
        ...decryptedCommit,
        // Include unencrypted metadata
        timestamp: storedCommit.timestamp,
        message: storedCommit.message,
        author: storedCommit.author,
        hash: storedCommit.hash,
      };
    } catch (error) {
      logger.error("Failed to get commit", error, { commitHash });
      throw error;
    }
  }

  /**
   * Get the budget state at a specific commit
   * @param {string} commitHash
   * @returns {Promise<Object>} - Budget state
   */
  async getCommitState(commitHash) {
    const commit = await this.getCommit(commitHash);
    return commit.state;
  }

  /**
   * Get commit history
   * @param {Object} options - Filter options
   * @param {number} options.limit - Number of commits to return
   * @param {Date} options.since - Only commits after this date
   * @param {string} options.author - Filter by author
   * @returns {Promise<Array>} - Array of commit summaries
   */
  async getHistory({ limit = 50, since, author } = {}) {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const commitsKey = `${this.STORAGE_KEY}-commits`;
      const commits = JSON.parse(localStorage.getItem(commitsKey) || "{}");

      let commitList = Object.values(commits);

      // Apply filters
      if (since) {
        commitList = commitList.filter((c) => new Date(c.timestamp) > since);
      }

      if (author) {
        commitList = commitList.filter((c) => c.author === author);
      }

      // Sort by timestamp (newest first)
      commitList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      if (limit > 0) {
        commitList = commitList.slice(0, limit);
      }

      // Return summary info (without encrypted data)
      return commitList.map((commit) => ({
        hash: commit.hash,
        shortHash: commit.hash.substring(0, 8),
        timestamp: commit.timestamp,
        message: commit.message,
        author: commit.author,
        parentHash: commit.parentHash,
      }));
    } catch (error) {
      logger.error("Failed to get commit history", error);
      throw error;
    }
  }

  /**
   * Get detailed changes for a commit
   * @param {string} commitHash
   * @returns {Promise<Array>} - Array of changes
   */
  async getCommitChanges(commitHash) {
    const commit = await this.getCommit(commitHash);
    return commit.changes || [];
  }

  /**
   * Restore budget state to a specific commit (manual rollback)
   * @param {string} commitHash
   * @returns {Promise<Object>} - The restored budget state
   */
  async checkout(commitHash) {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const budgetState = await this.getCommitState(commitHash);

      // Update HEAD to point to this commit
      await this.saveCurrentCommit(commitHash);

      logger.debug("Checked out to commit", {
        hash: commitHash.substring(0, 8),
      });

      return budgetState;
    } catch (error) {
      logger.error("Failed to checkout commit", error, { commitHash });
      throw error;
    }
  }

  /**
   * Get statistics about the budget history
   * @returns {Promise<Object>} - History statistics
   */
  async getStatistics() {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const history = await this.getHistory({ limit: -1 }); // Get all
      const authorCounts = {};

      let oldestCommit = null;
      let newestCommit = null;
      let totalChanges = 0;

      // Get detailed stats by examining some commits
      for (const commitSummary of history.slice(0, 10)) {
        // Sample first 10
        try {
          const changes = await this.getCommitChanges(commitSummary.hash);
          totalChanges += changes.length;
        } catch {
          // Skip if we can't read the commit
        }

        // Count authors
        authorCounts[commitSummary.author] = (authorCounts[commitSummary.author] || 0) + 1;

        // Track date ranges
        const commitDate = new Date(commitSummary.timestamp);
        if (!oldestCommit || commitDate < new Date(oldestCommit)) {
          oldestCommit = commitSummary.timestamp;
        }
        if (!newestCommit || commitDate > new Date(newestCommit)) {
          newestCommit = commitSummary.timestamp;
        }
      }

      return {
        totalCommits: history.length,
        currentCommit: this.currentCommitHash,
        dateRange: {
          oldest: oldestCommit,
          newest: newestCommit,
        },
        authorBreakdown: authorCounts,
        averageChangesPerCommit:
          history.length > 0 ? totalChanges / Math.min(history.length, 10) : 0,
        storageSize: localStorage.getItem(`${this.STORAGE_KEY}-commits`)?.length || 0,
      };
    } catch (error) {
      logger.error("Failed to get history statistics", error);
      throw error;
    }
  }

  /**
   * Verify the integrity of the commit history chain
   * @returns {Promise<Object>} - Verification result
   */
  async verifyIntegrity() {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const history = await this.getHistory({ limit: -1 }); // Get all commits

      if (history.length === 0) {
        return {
          valid: true,
          totalCommits: 0,
          message: "No commits to verify",
        };
      }

      // Sort commits chronologically (oldest first) for chain verification
      history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      let validChain = true;
      let brokenAt = null;
      let previousHash = "";
      const verifiedCommits = [];

      for (let i = 0; i < history.length; i++) {
        const commitSummary = history[i];

        try {
          // Get full commit details
          const commit = await this.getCommit(commitSummary.hash);

          // Verify parent hash matches expected previous hash
          // For the first commit (i === 0), we're more lenient as it might be a legacy commit
          if (i === 0) {
            // First commit - accept any parent hash (including empty, null, or legacy values)
            // This handles cases where the initial commit was created before strict validation
            logger.debug("First commit parent hash", {
              commitHash: commit.hash,
              parentHash: commit.parentHash,
            });
          } else {
            // Non-first commits must have correct parent chain
            if (commit.parentHash !== previousHash) {
              validChain = false;
              brokenAt = i;
              logger.warn("Hash chain broken", {
                commitIndex: i,
                commitHash: commit.hash,
                expectedParent: previousHash,
                actualParent: commit.parentHash,
              });
              break;
            }
          }

          // Verify commit hash integrity
          const expectedHash = await this.generateCommitHash({
            timestamp: commit.timestamp,
            message: commit.message,
            author: commit.author,
            parentHash: commit.parentHash,
            changes: commit.changes,
          });

          if (expectedHash !== commit.hash) {
            validChain = false;
            brokenAt = i;
            logger.warn("Commit hash verification failed", {
              commitIndex: i,
              expected: expectedHash,
              actual: commit.hash,
            });
            break;
          }

          verifiedCommits.push({
            hash: commit.hash,
            timestamp: commit.timestamp,
            message: commit.message,
            verified: true,
          });

          previousHash = commit.hash;
        } catch (error) {
          logger.error("Failed to verify commit", error, {
            commitIndex: i,
            commitHash: commitSummary.hash,
          });
          validChain = false;
          brokenAt = i;
          break;
        }
      }

      return {
        valid: validChain,
        totalCommits: history.length,
        verifiedCommits: verifiedCommits.length,
        brokenAt,
        message: validChain
          ? `All ${history.length} commits verified successfully`
          : `Chain integrity compromised at commit ${brokenAt}`,
        details: validChain
          ? null
          : {
              lastValidCommit: brokenAt > 0 ? verifiedCommits[brokenAt - 1] : null,
              suspiciousCommit: brokenAt < history.length ? history[brokenAt] : null,
            },
      };
    } catch (error) {
      logger.error("Failed to verify history integrity", error);
      return {
        valid: false,
        totalCommits: 0,
        error: error.message,
        message: "Integrity verification failed due to error",
      };
    }
  }

  /**
   * Export budget history for backup
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Exported history data
   */
  async exportHistory(options = {}) {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const history = await this.getHistory(options);
      const stats = await this.getStatistics();

      return {
        exportTimestamp: new Date().toISOString(),
        currentCommit: this.currentCommitHash,
        statistics: stats,
        commits: history,
        // Note: Full commit data is encrypted and not included for privacy
        note: "Full commit data remains encrypted. Use checkout() to restore specific states.",
      };
    } catch (error) {
      logger.error("Failed to export history", error);
      throw error;
    }
  }

  /**
   * Clear all history (destructive operation)
   */
  async clearHistory() {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}-commits`);
      localStorage.removeItem(`${this.STORAGE_KEY}-head`);
      this.currentCommitHash = null;

      logger.debug("Budget history cleared");
    } catch (error) {
      logger.error("Failed to clear history", error);
      throw error;
    }
  }

  /**
   * Perform integrity check and update status
   * @private
   */
  async performIntegrityCheck() {
    try {
      this.integrityStatus = await this.verifyIntegrity();

      if (!this.integrityStatus.valid) {
        logger.warn("Budget history integrity compromised", this.integrityStatus);
      } else {
        logger.debug("Budget history integrity verified", {
          totalCommits: this.integrityStatus.totalCommits,
          verifiedCommits: this.integrityStatus.verifiedCommits,
        });
      }
    } catch (error) {
      logger.error("Failed to perform integrity check", error);
      this.integrityStatus = {
        valid: false,
        error: error.message,
        message: "Integrity check failed",
      };
    }
  }

  /**
   * Get current integrity status
   * @returns {Object|null} - Current integrity status
   */
  getIntegrityStatus() {
    return this.integrityStatus;
  }

  /**
   * Check if history has integrity issues
   * @returns {boolean} - True if there are integrity issues
   */
  hasIntegrityIssues() {
    return this.integrityStatus && !this.integrityStatus.valid;
  }

  /**
   * Get integrity warnings for UI display
   * @returns {Array} - Array of warning objects
   */
  getIntegrityWarnings() {
    if (!this.hasIntegrityIssues()) {
      return [];
    }

    const warnings = [];
    const status = this.integrityStatus;

    if (status.brokenAt !== null) {
      warnings.push({
        type: "chain_broken",
        severity: "high",
        title: "Hash Chain Broken",
        message: `History integrity compromised at commit ${status.brokenAt}. This may indicate tampering or data corruption.`,
        details: status.details,
        recommendation: "Review recent changes and consider restoring from a backup.",
      });
    }

    if (status.error) {
      warnings.push({
        type: "verification_error",
        severity: "medium",
        title: "Verification Error",
        message: `Unable to verify history integrity: ${status.error}`,
        recommendation: "Check system logs and retry initialization.",
      });
    }

    return warnings;
  }

  /**
   * Advanced tamper detection using statistical analysis
   * @returns {Promise<Object>} - Tamper detection results
   */
  async detectTampering() {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const history = await this.getHistory({ limit: -1 });
      const results = {
        suspicious: false,
        confidence: 0,
        indicators: [],
        recommendations: [],
      };

      if (history.length < 3) {
        return results; // Not enough data for analysis
      }

      // Analyze timestamp patterns for irregularities
      const timestamps = history.map((h) => new Date(h.timestamp).getTime());
      const intervals = [];

      for (let i = 1; i < timestamps.length; i++) {
        intervals.push(timestamps[i] - timestamps[i - 1]);
      }

      // Check for unusual timestamp patterns
      const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
      const suspiciousIntervals = intervals.filter(
        (int) =>
          int < 0 || // Negative intervals (time went backwards)
          Math.abs(int - avgInterval) > avgInterval * 10 // Extremely large gaps
      );

      if (suspiciousIntervals.length > 0) {
        results.suspicious = true;
        results.confidence += 30;
        results.indicators.push({
          type: "timestamp_anomaly",
          description: `${suspiciousIntervals.length} commits with suspicious timestamps`,
          severity: "medium",
        });
      }

      // Check for missing parent hash chains
      let chainBreaks = 0;
      for (let i = 1; i < history.length; i++) {
        const current = history[i];
        const previous = history[i - 1];

        if (current.parentHash !== previous.hash) {
          chainBreaks++;
        }
      }

      if (chainBreaks > 0) {
        results.suspicious = true;
        results.confidence += 50;
        results.indicators.push({
          type: "chain_breaks",
          description: `${chainBreaks} broken parent-child relationships`,
          severity: "high",
        });
      }

      // Check for unusual commit patterns (too many commits in short time)
      const recentCommits = history.filter(
        (h) => new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      if (recentCommits.length > 100) {
        results.suspicious = true;
        results.confidence += 20;
        results.indicators.push({
          type: "excessive_commits",
          description: `${recentCommits.length} commits in the last 24 hours`,
          severity: "low",
        });
      }

      // Generate recommendations
      if (results.suspicious) {
        if (results.confidence >= 70) {
          results.recommendations.push("Immediate review required - high likelihood of tampering");
          results.recommendations.push("Consider restoring from a known good backup");
        } else if (results.confidence >= 40) {
          results.recommendations.push("Investigate recent changes and verify system integrity");
          results.recommendations.push("Monitor for additional suspicious activity");
        } else {
          results.recommendations.push("Minor anomalies detected - continue monitoring");
        }
      }

      logger.debug("Tamper detection completed", {
        suspicious: results.suspicious,
        confidence: results.confidence,
        indicators: results.indicators.length,
      });

      return results;
    } catch (error) {
      logger.error("Failed to perform tamper detection", error);
      throw error;
    }
  }

  /**
   * Generate security report including integrity and tamper detection
   * @returns {Promise<Object>} - Comprehensive security report
   */
  async generateSecurityReport() {
    if (!this.initialized) {
      throw new Error("Budget history not initialized");
    }

    try {
      const [integrityResult, tamperResult] = await Promise.all([
        this.verifyIntegrity(),
        this.detectTampering(),
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        integrity: integrityResult,
        tamperDetection: tamperResult,
        overallStatus: "secure",
        riskLevel: "low",
        actionRequired: false,
        summary: "",
      };

      // Determine overall status
      if (!integrityResult.valid || tamperResult.suspicious) {
        if (tamperResult.confidence >= 70 || integrityResult.brokenAt !== null) {
          report.overallStatus = "compromised";
          report.riskLevel = "high";
          report.actionRequired = true;
          report.summary = "History integrity is compromised. Immediate action required.";
        } else if (tamperResult.confidence >= 40) {
          report.overallStatus = "suspicious";
          report.riskLevel = "medium";
          report.actionRequired = true;
          report.summary = "Suspicious activity detected. Investigation recommended.";
        } else {
          report.overallStatus = "warning";
          report.riskLevel = "low";
          report.summary = "Minor integrity issues detected. Monitoring recommended.";
        }
      } else {
        report.summary = `History verified secure with ${integrityResult.totalCommits} commits.`;
      }

      logger.info("Security report generated", {
        status: report.overallStatus,
        riskLevel: report.riskLevel,
        actionRequired: report.actionRequired,
      });

      return report;
    } catch (error) {
      logger.error("Failed to generate security report", error);
      throw error;
    }
  }
}

// Export singleton instance
export const budgetHistory = new BudgetHistory();
export default budgetHistory;
