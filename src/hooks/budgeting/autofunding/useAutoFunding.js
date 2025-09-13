import { useEffect, useCallback } from "react";
import { useAutoFundingRules } from "./useAutoFundingRules.js";
import { useAutoFundingExecution } from "./useAutoFundingExecution.js";
import { useAutoFundingData } from "./useAutoFundingData.js";
import { useAutoFundingHistory } from "./useAutoFundingHistory.js";
import { TRIGGER_TYPES } from "../../../utils/budgeting/autofunding/rules.js";
import { useBudgetStore } from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";

/**
 * Master hook that combines all auto-funding functionality
 * Refactored from original useAutoFunding.js for Issue #506 - Logic ↔ UI separation
 */
export const useAutoFunding = () => {
  const budget = useBudgetStore();

  // Initialize individual hooks
  const dataHook = useAutoFundingData();
  const rulesHook = useAutoFundingRules([]);
  const executionHook = useAutoFundingExecution();
  const historyHook = useAutoFundingHistory([], []);

  // Initialize the complete auto-funding system
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        const savedData = await dataHook.initialize();

        if (savedData) {
          // Load rules
          if (savedData.rules) {
            rulesHook.setAllRules(savedData.rules);
          }

          // Load history (handled by passing to hook initialization)
          // This would require updating the hook calls above to use the loaded data
        }

        logger.info("Complete auto-funding system initialized");
      } catch (error) {
        logger.error("Failed to initialize auto-funding system", error);
      }
    };

    if (dataHook.isInitialized) {
      initializeSystem();
    }
  }, [dataHook.isInitialized, dataHook, rulesHook]);

  // Auto-save functionality
  useEffect(() => {
    if (dataHook.isInitialized && dataHook.hasUnsavedChanges) {
      const currentData = {
        rules: rulesHook.rules,
        executionHistory: historyHook.executionHistory,
        undoStack: historyHook.undoStack,
      };

      const cleanup = dataHook.enableAutoSave(currentData, 30000); // Auto-save every 30 seconds
      return cleanup;
    }
  }, [
    dataHook.isInitialized,
    dataHook.hasUnsavedChanges,
    dataHook,
    rulesHook.rules,
    historyHook.executionHistory,
    historyHook.undoStack,
  ]);

  // Enhanced rule execution with history tracking
  const executeRules = useCallback(
    async (trigger = TRIGGER_TYPES.MANUAL, triggerData = {}) => {
      try {
        const result = await executionHook.executeRules(rulesHook.rules, trigger, triggerData);

        if (result.success) {
          // Add to history
          historyHook.addToHistory(result.execution);

          // Add to undo stack if there were successful transfers
          if (result.execution.totalFunded > 0) {
            historyHook.addToUndoStack(result.execution, result.results);
          }

          // Update rule execution tracking
          result.results
            .filter((r) => r.success)
            .forEach((ruleResult) => {
              rulesHook.updateRule(ruleResult.ruleId, {
                lastExecuted: result.execution.executedAt,
                executionCount: (rulesHook.getRuleById(ruleResult.ruleId)?.executionCount || 0) + 1,
              });
            });

          // Mark data as changed for auto-save
          dataHook.markUnsavedChanges();
        }

        return result;
      } catch (error) {
        logger.error("Enhanced rule execution failed", error);
        return { success: false, error: error.message };
      }
    },
    [rulesHook, executionHook, historyHook, dataHook]
  );

  // Handle transaction-based auto-funding triggers
  const handleTransactionAdded = useCallback(
    async (transaction) => {
      if (!dataHook.isInitialized || executionHook.isExecuting) {
        return;
      }

      try {
        // Check if transaction looks like income (simplified logic)
        const isLikelyIncome = transaction.amount > 0 && transaction.amount >= 100;

        if (isLikelyIncome) {
          // Get rules that should trigger on income detection
          const incomeRules = rulesHook.getRulesByTrigger(TRIGGER_TYPES.INCOME_DETECTED);

          if (incomeRules.length > 0) {
            const result = await executeRules(TRIGGER_TYPES.INCOME_DETECTED, {
              newIncomeAmount: transaction.amount,
              triggerTransaction: transaction,
            });

            if (result.success) {
              logger.info("Auto-funding triggered by income detection", {
                transactionAmount: transaction.amount,
                rulesExecuted: result.execution.rulesExecuted,
                totalFunded: result.execution.totalFunded,
              });
            }
          }
        }
      } catch (error) {
        logger.error("Error handling transaction-based auto-funding", error);
      }
    },
    [dataHook.isInitialized, executionHook.isExecuting, rulesHook, executeRules]
  );

  // Periodic check for scheduled rules
  useEffect(() => {
    if (!dataHook.isInitialized) return;

    const checkScheduledRules = async () => {
      try {
        const now = new Date();
        const scheduledTriggers = [
          TRIGGER_TYPES.MONTHLY,
          TRIGGER_TYPES.WEEKLY,
          TRIGGER_TYPES.BIWEEKLY,
          TRIGGER_TYPES.PAYDAY,
        ];

        for (const trigger of scheduledTriggers) {
          const scheduledRules = rulesHook.getRulesByTrigger(trigger);

          if (scheduledRules.length > 0) {
            const context = {
              trigger,
              currentDate: now.toISOString(),
              data: {
                envelopes: budget.envelopes || [],
                unassignedCash: budget.unassignedCash || 0,
                transactions: budget.allTransactions || [],
              },
            };

            const executableRules = rulesHook.getExecutableRules(context);

            if (executableRules.length > 0) {
              logger.info("Scheduled rules ready for execution", {
                trigger,
                rulesCount: executableRules.length,
              });

              await executeRules(trigger);
            }
          }
        }
      } catch (error) {
        logger.error("Error checking scheduled rules", error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkScheduledRules, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dataHook.isInitialized, rulesHook, budget, executeRules]);

  // Enhanced undo operations with data persistence
  const undoLastExecution = useCallback(async () => {
    try {
      const result = await historyHook.undoLastExecution();
      dataHook.markUnsavedChanges();
      return result;
    } catch (error) {
      logger.error("Failed to undo last execution", error);
      throw error;
    }
  }, [historyHook, dataHook]);

  const undoExecution = useCallback(
    async (executionId) => {
      try {
        const result = await historyHook.undoExecution(executionId);
        dataHook.markUnsavedChanges();
        return result;
      } catch (error) {
        logger.error("Failed to undo execution", error);
        throw error;
      }
    },
    [historyHook, dataHook]
  );

  // Export all data with current state
  const exportData = useCallback(() => {
    try {
      const currentData = {
        rules: rulesHook.rules,
        executionHistory: historyHook.executionHistory,
        undoStack: historyHook.undoStack,
      };

      return dataHook.exportData(currentData);
    } catch (error) {
      logger.error("Failed to export auto-funding data", error);
      throw error;
    }
  }, [rulesHook.rules, historyHook, dataHook]);

  // Import data and update all hooks
  const importData = useCallback(
    (importData) => {
      try {
        const data = dataHook.importData(importData);

        if (data.rules) {
          rulesHook.setAllRules(data.rules);
        }

        // Note: History and undo stack would need to be handled by recreating the hooks
        // This is a limitation of the current architecture that could be improved

        logger.info("Auto-funding data import completed");
      } catch (error) {
        logger.error("Failed to import auto-funding data", error);
        throw error;
      }
    },
    [dataHook, rulesHook]
  );

  // Get comprehensive statistics
  const getStatistics = useCallback(() => {
    try {
      const ruleStats = rulesHook.getRulesStatistics();
      const executionStats = historyHook.getExecutionStatistics();

      return {
        rules: ruleStats,
        executions: executionStats,
        budget: {
          availableCash: budget.unassignedCash || 0,
          totalEnvelopes: budget.envelopes?.length || 0,
        },
        system: {
          isInitialized: dataHook.isInitialized,
          hasUnsavedChanges: dataHook.hasUnsavedChanges,
          lastSaved: dataHook.lastSaved,
          isExecuting: executionHook.isExecuting,
        },
      };
    } catch (error) {
      logger.error("Failed to get statistics", error);
      return {
        rules: { total: 0, enabled: 0, disabled: 0 },
        executions: { totalExecutions: 0, totalFunded: 0 },
        budget: { availableCash: 0, totalEnvelopes: 0 },
        system: { isInitialized: false, hasUnsavedChanges: false },
      };
    }
  }, [rulesHook, historyHook, budget, dataHook, executionHook]);

  return {
    // System state
    isInitialized: dataHook.isInitialized,
    isLoading: dataHook.isLoading,
    isExecuting: executionHook.isExecuting,
    hasUnsavedChanges: dataHook.hasUnsavedChanges,
    lastSaved: dataHook.lastSaved,
    statistics: getStatistics(),

    // Rules management (from useAutoFundingRules)
    rules: rulesHook.rules,
    addRule: rulesHook.addRule,
    updateRule: rulesHook.updateRule,
    deleteRule: rulesHook.deleteRule,
    toggleRule: rulesHook.toggleRule,
    duplicateRule: rulesHook.duplicateRule,
    getFilteredRules: rulesHook.getFilteredRules,
    getExecutableRules: rulesHook.getExecutableRules,
    getRuleById: rulesHook.getRuleById,
    getRulesByType: rulesHook.getRulesByType,
    getRulesByTrigger: rulesHook.getRulesByTrigger,
    getRuleSummaries: rulesHook.getRuleSummaries,
    validateAllRules: rulesHook.validateAllRules,
    reorderRules: rulesHook.reorderRules,
    bulkUpdateRules: rulesHook.bulkUpdateRules,
    bulkDeleteRules: rulesHook.bulkDeleteRules,
    bulkToggleRules: rulesHook.bulkToggleRules,

    // Execution (from useAutoFundingExecution)
    executeRules,
    executeSingleRule: executionHook.executeSingleRule,
    simulateExecution: executionHook.simulateExecution,
    createPlan: executionHook.createPlan,
    validatePlannedTransfers: executionHook.validatePlannedTransfers,
    calculateImpact: executionHook.calculateImpact,
    canExecuteRules: executionHook.canExecuteRules,
    getExecutionSummary: executionHook.getExecutionSummary,

    // History and undo (from useAutoFundingHistory)
    executionHistory: historyHook.executionHistory,
    getHistory: historyHook.getHistory,
    getExecutionById: historyHook.getExecutionById,
    clearHistory: historyHook.clearHistory,
    getUndoableExecutions: historyHook.getUndoableExecutions,
    getUndoStatistics: historyHook.getUndoStatistics,
    undoLastExecution,
    undoExecution,
    exportHistory: historyHook.exportHistory,

    // Data management (from useAutoFundingData)
    saveData: dataHook.saveData,
    loadData: dataHook.loadData,
    exportData,
    importData,
    clearData: dataHook.clearData,
    resetToDefaults: dataHook.resetToDefaults,
    checkStorageHealth: dataHook.checkStorageHealth,
    createBackup: dataHook.createBackup,

    // Event handlers
    handleTransactionAdded,

    // Utilities
    refreshData: () => dataHook.markUnsavedChanges(),
  };
};
