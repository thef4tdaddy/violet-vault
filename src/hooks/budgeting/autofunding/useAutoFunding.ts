import { useEffect, useCallback } from "react";
import { useAutoFundingRules } from "@/hooks/budgeting/autofunding/useAutoFundingRules";
import { useAutoFundingExecution } from "@/hooks/budgeting/autofunding/useAutoFundingExecution";
import { useAutoFundingData } from "@/hooks/budgeting/autofunding/useAutoFundingData";
import { useAutoFundingHistory } from "@/hooks/budgeting/autofunding/useAutoFundingHistory";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useShallow } from "zustand/react/shallow";
import type {
  UseAutoFundingRulesReturn,
  UseAutoFundingHistoryReturn,
  UseAutoFundingDataReturn,
  UseAutoFundingExecutionReturn,
  BudgetContext,
  ExecutionResult,
} from "@/hooks/budgeting/autofunding/types";
import type { Transaction, Envelope } from "@/types/finance";
import {
  isLikelyIncome,
  handleIncomeDetection,
  checkScheduledRules,
  getStatistics,
  exportCurrentData,
  importAndUpdateData,
  initializeAutoFundingSystem,
  getCurrentDataForSave,
  createExecuteRules,
} from "@/hooks/budgeting/autofunding/useAutoFundingHelpers";
import logger from "@/utils/common/logger";

/**
 * Master hook that combines all auto-funding functionality
 * Refactored from original useAutoFunding.js for Issue #506 - Logic ↔ UI separation
 */
export const useAutoFunding = () => {
  type BudgetSelector = {
    envelopes?: Envelope[];
    unassignedCash?: number;
    allTransactions?: Transaction[];
  };

  const budget = useBudgetStore(
    useShallow((state: BudgetSelector) => ({
      envelopes: state.envelopes,
      unassignedCash: state.unassignedCash,
      allTransactions: state.allTransactions,
    }))
  ) as BudgetContext;

  // Initialize individual hooks
  const dataHook = useAutoFundingData() as UseAutoFundingDataReturn;
  const rulesHook = useAutoFundingRules([]) as unknown as UseAutoFundingRulesReturn;
  const executionHook = useAutoFundingExecution() as unknown as UseAutoFundingExecutionReturn;
  const historyHook = useAutoFundingHistory([], []) as unknown as UseAutoFundingHistoryReturn;

  // Initialize the complete auto-funding system
  useEffect(() => {
    if (dataHook.isInitialized) {
      initializeAutoFundingSystem(dataHook, rulesHook);
    }
  }, [dataHook.isInitialized, dataHook, rulesHook]);

  // Auto-save functionality
  useEffect(() => {
    if (dataHook.isInitialized && dataHook.hasUnsavedChanges) {
      const currentData = getCurrentDataForSave(rulesHook, historyHook);
      return dataHook.enableAutoSave(currentData, 30000);
    }
  }, [dataHook.isInitialized, dataHook.hasUnsavedChanges, dataHook, rulesHook, historyHook]);

  // Enhanced rule execution with history tracking
  const executeRules = useCallback(
    (trigger: string, triggerData?: Record<string, unknown>): Promise<ExecutionResult> => {
      const executeFunction = createExecuteRules(rulesHook, executionHook, historyHook, dataHook);
      return executeFunction(trigger, triggerData);
    },
    [rulesHook, executionHook, historyHook, dataHook]
  );

  // Handle transaction-based auto-funding triggers
  const handleTransactionAdded = useCallback(
    async (transaction: Transaction) => {
      if (!dataHook.isInitialized || executionHook.isExecuting) {
        return;
      }

      try {
        if (isLikelyIncome(transaction)) {
          await handleIncomeDetection(transaction, rulesHook, executeRules);
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

    const checkRules = () => checkScheduledRules(rulesHook, budget, executeRules);

    // Check every 5 minutes
    const interval = setInterval(checkRules, 5 * 60 * 1000);
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
    async (executionId: string) => {
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
    return exportCurrentData(rulesHook, historyHook, dataHook);
  }, [rulesHook, historyHook, dataHook]);

  // Import data and update all hooks
  const importData = useCallback(
    (importedData: Record<string, unknown>) => {
      importAndUpdateData(importedData, dataHook, rulesHook);
    },
    [dataHook, rulesHook]
  );

  // Get comprehensive statistics
  const getStatsCallback = useCallback(() => {
    return getStatistics(rulesHook, historyHook, budget, dataHook, executionHook);
  }, [rulesHook, historyHook, budget, dataHook, executionHook]);

  return {
    // System state
    isInitialized: dataHook.isInitialized,
    isLoading: dataHook.isLoading,
    isExecuting: executionHook.isExecuting,
    hasUnsavedChanges: dataHook.hasUnsavedChanges,
    lastSaved: dataHook.lastSaved,
    statistics: getStatsCallback(),

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
