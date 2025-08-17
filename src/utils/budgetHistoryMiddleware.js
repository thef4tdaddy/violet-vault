import { budgetHistory } from "./budgetHistory.js";
import logger from "./logger.js";

/**
 * Zustand middleware to automatically track budget changes with encrypted history
 */
export const budgetHistoryMiddleware = (config) => (set, get, api) => {
  let isInitialized = false;
  let isCommitting = false; // Prevent recursive commits
  let commitTimer = null;
  let lastCommittedState = null;

  // Initialize history when password is available
  const initializeHistory = async (password) => {
    if (!password) {
      logger.warn("Budget history initialization attempted without password");
      return;
    }
    
    if (isInitialized) {
      logger.debug("Budget history already initialized");
      return;
    }

    try {
      logger.debug("Initializing budget history with password");
      await budgetHistory.initialize(password);
      isInitialized = true;
      lastCommittedState = getCommittableState(get());

      // Create initial commit if this is the first time
      if (!budgetHistory.currentCommitHash) {
        logger.debug("Creating initial budget commit");
        await budgetHistory.commit(lastCommittedState, "Initial budget state", "system");
      }

      logger.info("✅ Budget history initialized and ready", {
        hasCommitHash: !!budgetHistory.currentCommitHash,
        isInitialized: true
      });
    } catch (error) {
      logger.error("❌ Failed to initialize budget history", error);
      isInitialized = false; // Ensure we stay in uninitialized state
    }
  };

  // Extract only the state we want to track in history
  const getCommittableState = (state) => {
    return {
      envelopes: state.envelopes || [],
      bills: state.bills || [],
      transactions: state.transactions || [],
      allTransactions: state.allTransactions || [],
      savingsGoals: state.savingsGoals || [],
      supplementalAccounts: state.supplementalAccounts || [],
      debts: state.debts || [],
      unassignedCash: state.unassignedCash || 0,
      biweeklyAllocation: state.biweeklyAllocation || 0,
      actualBalance: state.actualBalance || 0,
      paycheckHistory: state.paycheckHistory || [],
    };
  };

  // Debounced commit function to avoid too many history entries
  const scheduleCommit = (message = "Budget updated", author = "user") => {
    if (!isInitialized || isCommitting) return;

    // Clear any existing timer
    if (commitTimer) {
      clearTimeout(commitTimer);
    }

    // Schedule a commit after a brief delay
    commitTimer = setTimeout(async () => {
      if (isCommitting) return;

      try {
        isCommitting = true;
        const currentState = getCommittableState(get());

        // Only commit if state has actually changed
        if (JSON.stringify(currentState) !== JSON.stringify(lastCommittedState)) {
          await budgetHistory.commit(currentState, message, author);
          lastCommittedState = currentState;
        }
      } catch (error) {
        logger.error("Failed to commit budget history", error);
      } finally {
        isCommitting = false;
        commitTimer = null;
      }
    }, 1000); // 1 second debounce
  };

  // Wrap the original set function to track changes
  const enhancedSet = (partial, replace, meta) => {
    // Call the original set function
    const result = set(partial, replace);

    // Schedule a commit after state change (if we have meta context about what changed)
    if (meta?.historyMessage && !meta?.skipHistory) {
      scheduleCommit(meta.historyMessage, meta.author);
    } else if (!meta?.skipHistory) {
      // Default commit with generic message
      scheduleCommit();
    }

    return result;
  };

  // Create the store with enhanced set function
  const store = config(enhancedSet, get, api);

  // Add history-related methods to the store
  return {
    ...store,

    // History management methods
    initializeBudgetHistory: initializeHistory,

    // Manual commit with custom message
    commitBudgetHistory: async (message, author = "user") => {
      if (!isInitialized) {
        logger.warn("Budget history not initialized");
        return;
      }

      try {
        const currentState = getCommittableState(get());
        const commitHash = await budgetHistory.commit(currentState, message, author);
        lastCommittedState = currentState;
        return commitHash;
      } catch (error) {
        logger.error("Failed to manually commit budget history", error);
        throw error;
      }
    },

    // Get budget history
    getBudgetHistory: async (options = {}) => {
      if (!isInitialized) {
        logger.error("❌ getBudgetHistory called but history not initialized", {
          isInitialized,
          hasPassword: !!budgetHistory.historyKey
        });
        throw new Error("Budget history not initialized");
      }
      
      logger.debug("📚 Fetching budget history", options);
      const history = await budgetHistory.getHistory(options);
      logger.debug("📚 Retrieved budget history", { count: history?.length || 0 });
      return history;
    },

    // Get specific commit details
    getBudgetCommit: async (commitHash) => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      return budgetHistory.getCommit(commitHash);
    },

    // Get commit changes
    getBudgetCommitChanges: async (commitHash) => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      return budgetHistory.getCommitChanges(commitHash);
    },

    // Restore budget to a previous state
    restoreBudgetFromHistory: async (commitHash) => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }

      try {
        const restoredState = await budgetHistory.checkout(commitHash);

        // Update the store with the restored state (skip history to prevent recursive commit)
        set(() => restoredState, false, { skipHistory: true });

        // Create a new commit documenting the restoration
        setTimeout(() => {
          scheduleCommit(`Restored to commit ${commitHash.substring(0, 8)}`, "user");
        }, 100);

        return restoredState;
      } catch (error) {
        logger.error("Failed to restore budget from history", error);
        throw error;
      }
    },

    // Get history statistics
    getBudgetHistoryStats: async () => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      return budgetHistory.getStatistics();
    },

    // Export budget history
    exportBudgetHistory: async (options = {}) => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      return budgetHistory.exportHistory(options);
    },

    // Clear all history (destructive)
    clearBudgetHistory: async () => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      await budgetHistory.clearHistory();
      isInitialized = false;
      lastCommittedState = null;
    },

    // Verify budget history integrity
    verifyBudgetHistoryIntegrity: async () => {
      if (!isInitialized) {
        throw new Error("Budget history not initialized");
      }
      return budgetHistory.verifyIntegrity();
    },

    // Enhanced action methods that include history metadata
    addEnvelopeWithHistory: (envelope) =>
      enhancedSet(
        (state) => {
          state.envelopes.push(envelope);
        },
        false,
        {
          historyMessage: `Added envelope: ${envelope.name}`,
          author: "user",
        }
      ),

    updateEnvelopeWithHistory: (envelope) =>
      enhancedSet(
        (state) => {
          const index = state.envelopes.findIndex((e) => e.id === envelope.id);
          if (index !== -1) {
            state.envelopes[index] = envelope;
          }
        },
        false,
        {
          historyMessage: `Updated envelope: ${envelope.name}`,
          author: "user",
        }
      ),

    deleteEnvelopeWithHistory: (id, name = "Unknown") =>
      enhancedSet(
        (state) => {
          state.envelopes = state.envelopes.filter((e) => e.id !== id);
        },
        false,
        {
          historyMessage: `Deleted envelope: ${name}`,
          author: "user",
        }
      ),

    addTransactionWithHistory: (transaction) =>
      enhancedSet(
        (state) => {
          state.transactions.push(transaction);
          state.allTransactions.push(transaction);
        },
        false,
        {
          historyMessage: `Added transaction: ${transaction.description}`,
          author: "user",
        }
      ),

    updateTransactionWithHistory: (transaction) =>
      enhancedSet(
        (state) => {
          const transIndex = state.transactions.findIndex((t) => t.id === transaction.id);
          const allTransIndex = state.allTransactions.findIndex((t) => t.id === transaction.id);

          if (transIndex !== -1) {
            state.transactions[transIndex] = transaction;
          }
          if (allTransIndex !== -1) {
            state.allTransactions[allTransIndex] = transaction;
          }
        },
        false,
        {
          historyMessage: `Updated transaction: ${transaction.description}`,
          author: "user",
        }
      ),

    updateUnassignedCashWithHistory: (amount, reason = "Cash updated") =>
      enhancedSet(
        (state) => {
          state.unassignedCash = amount;
        },
        false,
        {
          historyMessage: reason,
          author: "user",
        }
      ),

    // Import operations (bulk updates)
    importDataWithHistory: (data, source = "import") =>
      enhancedSet(
        (state) => {
          if (data.envelopes) state.envelopes = data.envelopes;
          if (data.transactions) state.transactions = data.transactions;
          if (data.allTransactions) state.allTransactions = data.allTransactions;
          if (data.bills) state.bills = data.bills;
          if (data.savingsGoals) state.savingsGoals = data.savingsGoals;
          if (data.supplementalAccounts) state.supplementalAccounts = data.supplementalAccounts;
          if (data.debts) state.debts = data.debts;
          if (typeof data.unassignedCash === "number") state.unassignedCash = data.unassignedCash;
          if (typeof data.biweeklyAllocation === "number")
            state.biweeklyAllocation = data.biweeklyAllocation;
          if (typeof data.actualBalance === "number") state.actualBalance = data.actualBalance;
        },
        false,
        {
          historyMessage: `Data imported from ${source}`,
          author: "system",
        }
      ),
  };
};
