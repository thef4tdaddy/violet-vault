import { useState, useEffect, useCallback } from "react";
import { autoFundingEngine, TRIGGER_TYPES } from "../utils/autoFundingEngine";
import { useBudgetStore } from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Hook to manage auto-funding integration with the application
 */
export const useAutoFunding = () => {
  const budget = useBudgetStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [rules, setRules] = useState([]);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Initialize auto-funding system
  useEffect(() => {
    initializeAutoFunding();
  }, [initializeAutoFunding]);

  // Load saved rules and history from localStorage
  const initializeAutoFunding = useCallback(async () => {
    try {
      // Load saved rules from localStorage
      const savedData = localStorage.getItem("violetVault_autoFunding");
      if (savedData) {
        const data = JSON.parse(savedData);
        autoFundingEngine.importDataWithUndoStack(data);
        logger.info("Auto-funding data with undo stack loaded from localStorage", {
          rulesCount: data.rules?.length || 0,
          historyCount: data.executionHistory?.length || 0,
          patternsCount: data.incomePatterns?.length || 0,
          undoableCount: data.undoStack?.filter((item) => item.canUndo).length || 0,
        });
      }

      // Load current rules and history
      setRules(autoFundingEngine.getRules());
      setExecutionHistory(autoFundingEngine.getExecutionHistory());
      setIsInitialized(true);

      logger.info("Auto-funding system initialized");
    } catch (error) {
      logger.error("Failed to initialize auto-funding system", error);
      setIsInitialized(true); // Still mark as initialized to avoid blocking
    }
  }, []);

  // Save data to localStorage whenever rules or history changes
  const saveToLocalStorage = useCallback(() => {
    try {
      const data = autoFundingEngine.exportDataWithUndoStack();
      localStorage.setItem("violetVault_autoFunding", JSON.stringify(data));
      logger.debug("Auto-funding data with undo stack saved to localStorage");
    } catch (error) {
      logger.error("Failed to save auto-funding data to localStorage", error);
    }
  }, []);

  // Refresh rules and history from engine
  const refreshData = useCallback(() => {
    setRules(autoFundingEngine.getRules());
    setExecutionHistory(autoFundingEngine.getExecutionHistory());
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Execute rules with given trigger
  const executeRules = useCallback(
    async (trigger = TRIGGER_TYPES.MANUAL, triggerData = {}) => {
      if (isExecuting) {
        logger.warn("Auto-funding execution already in progress");
        return { success: false, error: "Execution already in progress" };
      }

      setIsExecuting(true);

      try {
        const context = {
          trigger,
          currentDate: new Date().toISOString(),
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            transactions: budget.allTransactions || [],
            ...triggerData,
          },
        };

        logger.info("Executing auto-funding rules", { trigger, context });

        const result = await autoFundingEngine.executeRules(context, budget);

        if (result.success) {
          refreshData();
          logger.info("Auto-funding execution completed successfully", {
            rulesExecuted: result.execution.rulesExecuted,
            totalFunded: result.execution.totalFunded,
          });
        } else {
          logger.error("Auto-funding execution failed", {
            error: result.error,
          });
        }

        return result;
      } catch (error) {
        logger.error("Error during auto-funding execution", error);
        return { success: false, error: error.message };
      } finally {
        setIsExecuting(false);
      }
    },
    [budget, isExecuting, refreshData]
  );

  // Add new rule
  const addRule = useCallback(
    (ruleConfig) => {
      try {
        const rule = autoFundingEngine.addRule(ruleConfig);
        refreshData();
        return rule;
      } catch (error) {
        logger.error("Failed to add auto-funding rule", error);
        throw error;
      }
    },
    [refreshData]
  );

  // Update existing rule
  const updateRule = useCallback(
    (ruleId, updates) => {
      try {
        const rule = autoFundingEngine.updateRule(ruleId, updates);
        refreshData();
        return rule;
      } catch (error) {
        logger.error("Failed to update auto-funding rule", error);
        throw error;
      }
    },
    [refreshData]
  );

  // Delete rule
  const deleteRule = useCallback(
    (ruleId) => {
      try {
        const success = autoFundingEngine.deleteRule(ruleId);
        if (success) {
          refreshData();
        }
        return success;
      } catch (error) {
        logger.error("Failed to delete auto-funding rule", error);
        throw error;
      }
    },
    [refreshData]
  );

  // Toggle rule enabled status
  const toggleRule = useCallback(
    (ruleId) => {
      try {
        const rule = autoFundingEngine.rules.get(ruleId);
        if (rule) {
          return updateRule(ruleId, { enabled: !rule.enabled });
        }
        return null;
      } catch (error) {
        logger.error("Failed to toggle auto-funding rule", error);
        throw error;
      }
    },
    [updateRule]
  );

  // Clear execution history
  const clearHistory = useCallback(() => {
    try {
      autoFundingEngine.clearExecutionHistory();
      refreshData();
    } catch (error) {
      logger.error("Failed to clear auto-funding history", error);
      throw error;
    }
  }, [refreshData]);

  // Export all data
  const exportData = useCallback(() => {
    try {
      return autoFundingEngine.exportData();
    } catch (error) {
      logger.error("Failed to export auto-funding data", error);
      throw error;
    }
  }, []);

  // Import data
  const importData = useCallback(
    (data) => {
      try {
        autoFundingEngine.importDataWithUndoStack(data);
        refreshData();
      } catch (error) {
        logger.error("Failed to import auto-funding data", error);
        throw error;
      }
    },
    [refreshData]
  );

  // Undo operations
  const undoLastExecution = useCallback(async () => {
    try {
      const result = await autoFundingEngine.undoLastExecution(budget);
      refreshData();
      return result;
    } catch (error) {
      logger.error("Failed to undo last execution", error);
      throw error;
    }
  }, [budget, refreshData]);

  const undoExecution = useCallback(
    async (executionId) => {
      try {
        const result = await autoFundingEngine.undoExecution(executionId, budget);
        refreshData();
        return result;
      } catch (error) {
        logger.error("Failed to undo execution", error);
        throw error;
      }
    },
    [budget, refreshData]
  );

  const getUndoableExecutions = useCallback(() => {
    return autoFundingEngine.getUndoableExecutions();
  }, []);

  const getUndoStatistics = useCallback(() => {
    return autoFundingEngine.getUndoStatistics();
  }, []);

  // Payday detection and insights
  const getPaydayInsights = useCallback(() => {
    return autoFundingEngine.getPaydayInsights();
  }, []);

  const isLikelyPayday = useCallback((transaction) => {
    return autoFundingEngine.isLikelyPayday(transaction);
  }, []);

  // Auto-trigger rules based on transaction events with smart income detection
  const handleTransactionAdded = useCallback(
    async (transaction) => {
      if (!isInitialized || isExecuting) return;

      try {
        // Use smart income detection instead of simple positive amount check
        const result = await autoFundingEngine.handleNewTransaction(transaction, budget);

        if (result) {
          logger.info("Auto-funding triggered by income detection", {
            transactionAmount: transaction.amount,
            rulesExecuted: result.execution.rulesExecuted,
            totalFunded: result.execution.totalFunded,
          });

          // Refresh data to reflect changes
          refreshData();
        }
      } catch (error) {
        logger.error("Error handling smart income detection", error);
      }
    },
    [isInitialized, isExecuting, budget, refreshData]
  );

  // Check for scheduled rule execution
  const checkScheduledRules = useCallback(async () => {
    if (!isInitialized || isExecuting) return;

    try {
      const now = new Date();
      const scheduledRules = rules.filter((rule) => {
        if (!rule.enabled) return false;

        // Check for scheduled triggers
        return [TRIGGER_TYPES.MONTHLY, TRIGGER_TYPES.WEEKLY, TRIGGER_TYPES.BIWEEKLY].includes(
          rule.trigger
        );
      });

      if (scheduledRules.length > 0) {
        // Check if any rules are due for execution
        for (const rule of scheduledRules) {
          const context = {
            trigger: rule.trigger,
            currentDate: now.toISOString(),
            data: {
              envelopes: budget.envelopes || [],
              unassignedCash: budget.unassignedCash || 0,
              transactions: budget.allTransactions || [],
            },
          };

          if (rule.shouldExecute(context)) {
            logger.info("Scheduled rule ready for execution", {
              ruleId: rule.id,
              ruleName: rule.name,
              trigger: rule.trigger,
            });

            // Execute just this rule
            await autoFundingEngine.executeRule(rule, context, budget);
            refreshData();
          }
        }
      }
    } catch (error) {
      logger.error("Error checking scheduled rules", error);
    }
  }, [isInitialized, isExecuting, rules, budget, refreshData]);

  // Set up periodic check for scheduled rules (every 5 minutes)
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(
      () => {
        checkScheduledRules();
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isInitialized, checkScheduledRules]);

  // Get summary statistics
  const getStatistics = useCallback(() => {
    const activeRules = rules.filter((rule) => rule.enabled);
    const totalExecutions = executionHistory.length;
    const totalFunded = executionHistory.reduce(
      (sum, execution) => sum + (execution.totalFunded || 0),
      0
    );
    const lastExecution = executionHistory.length > 0 ? executionHistory[0] : null;

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      totalExecutions,
      totalFunded,
      lastExecution,
      availableCash: budget.unassignedCash || 0,
    };
  }, [rules, executionHistory, budget.unassignedCash]);

  return {
    // State
    isInitialized,
    rules,
    executionHistory,
    isExecuting,
    statistics: getStatistics(),

    // Actions
    executeRules,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    clearHistory,
    exportData,
    importData,

    // Undo operations
    undoLastExecution,
    undoExecution,
    getUndoableExecutions,
    getUndoStatistics,

    // Payday detection
    getPaydayInsights,
    isLikelyPayday,

    // Event handlers
    handleTransactionAdded,
    checkScheduledRules,

    // Utils
    refreshData,
    saveToLocalStorage,
  };
};

export default useAutoFunding;
