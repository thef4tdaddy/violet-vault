import { useState, useCallback } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Hook for managing encrypted budget history
 * Provides methods to view, export, and restore from budget history
 */
export const useBudgetHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const store = useBudgetStore();

  // Initialize history (should be called once with user's password)
  const initializeHistory = useCallback(
    async (password) => {
      try {
        setLoading(true);
        setError(null);
        await store.initializeBudgetHistory(password);
        logger.debug("Budget history initialized via hook");
      } catch (err) {
        setError(err.message);
        logger.error("Failed to initialize budget history via hook", err);
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Manual commit with custom message
  const commitChanges = useCallback(
    async (message, author = "user") => {
      try {
        setLoading(true);
        setError(null);
        const commitHash = await store.commitBudgetHistory(message, author);
        logger.debug("Manual budget commit created", {
          commitHash: commitHash?.substring(0, 8),
        });
        return commitHash;
      } catch (err) {
        setError(err.message);
        logger.error("Failed to commit budget changes", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Get commit history
  const getHistory = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);
        setError(null);
        const history = await store.getBudgetHistory(options);
        return history;
      } catch (err) {
        setError(err.message);
        logger.error("Failed to get budget history", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Get detailed commit information
  const getCommitDetails = useCallback(
    async (commitHash) => {
      try {
        setLoading(true);
        setError(null);
        const [commit, changes] = await Promise.all([
          store.getBudgetCommit(commitHash),
          store.getBudgetCommitChanges(commitHash),
        ]);
        return { commit, changes };
      } catch (err) {
        setError(err.message);
        logger.error("Failed to get commit details", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Restore budget to a previous state
  const restoreFromHistory = useCallback(
    async (commitHash) => {
      try {
        setLoading(true);
        setError(null);
        const restoredState = await store.restoreBudgetFromHistory(commitHash);
        logger.debug("Budget restored from history", {
          commitHash: commitHash?.substring(0, 8),
        });
        return restoredState;
      } catch (err) {
        setError(err.message);
        logger.error("Failed to restore from history", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Get history statistics
  const getStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await store.getBudgetHistoryStats();
      return stats;
    } catch (err) {
      setError(err.message);
      logger.error("Failed to get history statistics", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [store]);

  // Export history for backup
  const exportHistory = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);
        setError(null);
        const exportData = await store.exportBudgetHistory(options);

        // Create downloadable file
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `violet-vault-history-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        logger.debug("Budget history exported", {
          totalEntries: exportData.totalEntries,
        });
        return exportData;
      } catch (err) {
        setError(err.message);
        logger.error("Failed to export history", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [store]
  );

  // Clear all history (destructive)
  const clearHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await store.clearBudgetHistory();
      logger.debug("Budget history cleared");
    } catch (err) {
      setError(err.message);
      logger.error("Failed to clear history", err);
    } finally {
      setLoading(false);
    }
  }, [store]);

  // Verify history integrity
  const verifyIntegrity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await store.verifyBudgetHistoryIntegrity();
      logger.debug("History integrity check completed", {
        valid: result.valid,
      });
      return result;
    } catch (err) {
      setError(err.message);
      logger.error("Failed to verify history integrity", err);
      return { valid: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [store]);

  // Enhanced store actions that include history tracking
  const actions = {
    addEnvelope: useCallback(
      (envelope) => {
        store.addEnvelopeWithHistory(envelope);
      },
      [store]
    ),

    updateEnvelope: useCallback(
      (envelope) => {
        store.updateEnvelopeWithHistory(envelope);
      },
      [store]
    ),

    deleteEnvelope: useCallback(
      (id, name) => {
        store.deleteEnvelopeWithHistory(id, name);
      },
      [store]
    ),

    addTransaction: useCallback(
      (transaction) => {
        store.addTransactionWithHistory(transaction);
      },
      [store]
    ),

    updateTransaction: useCallback(
      (transaction) => {
        store.updateTransactionWithHistory(transaction);
      },
      [store]
    ),

    updateUnassignedCash: useCallback(
      (amount, reason) => {
        store.updateUnassignedCashWithHistory(amount, reason);
      },
      [store]
    ),

    importData: useCallback(
      (data, source) => {
        store.importDataWithHistory(data, source);
      },
      [store]
    ),
  };

  // Utility functions for UI
  const formatCommitMessage = useCallback((commit) => {
    if (!commit) return "Unknown commit";

    const date = new Date(commit.timestamp).toLocaleString();
    const shortHash = commit.hash?.substring(0, 8) || "unknown";

    return `${commit.message} (${shortHash}) - ${date}`;
  }, []);

  const formatChangeDescription = useCallback((change) => {
    if (!change) return "Unknown change";

    switch (change.type) {
      case "add":
        return `➕ ${change.description}`;
      case "modify":
        return `✏️ ${change.description}`;
      case "delete":
        return `🗑️ ${change.description}`;
      case "create":
        return `🆕 ${change.description}`;
      default:
        return `🔄 ${change.description}`;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,

    // History management
    initializeHistory,
    commitChanges,
    getHistory,
    getCommitDetails,
    restoreFromHistory,
    getStatistics,
    exportHistory,
    clearHistory,
    verifyIntegrity,

    // Enhanced actions with history tracking
    actions,

    // Utility functions
    formatCommitMessage,
    formatChangeDescription,
  };
};
