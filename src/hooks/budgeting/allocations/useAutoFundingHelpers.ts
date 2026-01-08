/**
 * Helper functions for useAutoFunding
 * Extracted to reduce file size and complexity
 */
import { TRIGGER_TYPES } from "@/utils/budgeting/autofunding/rules";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/types/finance";
import type {
  UseAutoFundingRulesReturn,
  UseAutoFundingHistoryReturn,
  UseAutoFundingDataReturn,
  UseAutoFundingExecutionReturn,
  BudgetContext,
  ExecutionResult,
  RuleExecutionResult,
  ExecutionHistoryEntry,
} from "./types";

/**
 * Check if a transaction looks like income
 */
export const isLikelyIncome = (transaction: Transaction): boolean => {
  return transaction.amount > 0 && transaction.amount >= 100;
};

/**
 * Handle income detection trigger
 */
export const handleIncomeDetection = async (
  transaction: Transaction,
  rulesHook: Pick<UseAutoFundingRulesReturn, "getRulesByTrigger">,
  executeRules: (trigger: string, data: Record<string, unknown>) => Promise<ExecutionResult>
): Promise<void> => {
  const incomeRules = rulesHook.getRulesByTrigger(TRIGGER_TYPES.INCOME_DETECTED);

  if (incomeRules.length > 0) {
    const result = await executeRules(TRIGGER_TYPES.INCOME_DETECTED, {
      newIncomeAmount: transaction.amount,
      triggerTransaction: transaction,
    });

    if (result.success && result.execution) {
      logger.info("Auto-funding triggered by income detection", {
        transactionAmount: transaction.amount,
        rulesExecuted: result.execution.rulesExecuted,
        totalFunded: result.execution.totalFunded,
      });
    }
  }
};

/**
 * Get scheduled triggers list
 */
export const getScheduledTriggers = () => [
  TRIGGER_TYPES.MONTHLY,
  TRIGGER_TYPES.WEEKLY,
  TRIGGER_TYPES.BIWEEKLY,
  TRIGGER_TYPES.PAYDAY,
];

/**
 * Check and execute scheduled rules
 */
export const checkScheduledRules = async (
  rulesHook: Pick<UseAutoFundingRulesReturn, "getRulesByTrigger" | "getExecutableRules">,
  budget: BudgetContext,
  executeRules: (trigger: string, triggerData?: Record<string, unknown>) => Promise<ExecutionResult>
): Promise<void> => {
  const now = new Date();
  const scheduledTriggers = getScheduledTriggers();

  for (const trigger of scheduledTriggers) {
    const scheduledRules = rulesHook.getRulesByTrigger(trigger);

    if (scheduledRules.length > 0) {
      const context = {
        trigger,
        currentDate: now.toISOString(),
        data: {
          envelopes: ((budget.envelopes as unknown as import("@/db/types").Envelope[]) || []).map(
            (e) => ({
              ...e,
              id: String(e.id),
              currentBalance: e.currentBalance || 0,
            })
          ),
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

        // we don't need the result here, but support ExecutionResult-returning executeRules
        await executeRules(trigger);
      }
    }
  }
};

/**
 * Get comprehensive statistics
 */
export const getStatistics = (
  rulesHook: UseAutoFundingRulesReturn,
  historyHook: UseAutoFundingHistoryReturn,
  budget: BudgetContext,
  dataHook: UseAutoFundingDataReturn,
  executionHook: UseAutoFundingExecutionReturn
) => {
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
};

/**
 * Export current data state
 */
export const exportCurrentData = (
  rulesHook: UseAutoFundingRulesReturn,
  historyHook: UseAutoFundingHistoryReturn,
  dataHook: UseAutoFundingDataReturn
) => {
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
};

/**
 * Import and update data
 */
export const importAndUpdateData = (
  importData: Record<string, unknown>,
  dataHook: UseAutoFundingDataReturn,
  rulesHook: UseAutoFundingRulesReturn
) => {
  try {
    const data = dataHook.importData(importData);

    if (data.rules) {
      rulesHook.setAllRules(data.rules);
    }

    logger.info("Auto-funding data import completed");
  } catch (error) {
    logger.error("Failed to import auto-funding data", error);
    throw error;
  }
};

/**
 * Process execution results and update state
 */
export const processExecutionResults = (
  result: ExecutionResult,
  historyHook: Pick<UseAutoFundingHistoryReturn, "addToHistory" | "addToUndoStack">,
  rulesHook: Pick<UseAutoFundingRulesReturn, "updateRule" | "getRuleById">,
  dataHook: Pick<UseAutoFundingDataReturn, "markUnsavedChanges">
): void => {
  if (result.success && result.execution && result.results) {
    // Ensure the history entry has a `timestamp` field (required by ExecutionHistoryEntry)
    const historyEntry: ExecutionHistoryEntry = {
      ...result.execution,
      // execution.executedAt exists on ExecutionDetails; use it for timestamp if timestamp is missing
      timestamp: result.execution.timestamp ?? result.execution.executedAt,
      // Ensure required properties are present
      totalFunded: result.execution.totalFunded,
      rulesExecuted: result.execution.rulesExecuted,
    };

    historyHook.addToHistory(historyEntry);

    if (result.execution.totalFunded > 0) {
      historyHook.addToUndoStack(result.execution, result.results);
    }

    result.results
      .filter((r: RuleExecutionResult) => r.success)
      .forEach((ruleResult: RuleExecutionResult) => {
        rulesHook.updateRule(ruleResult.ruleId, {
          lastExecuted: result.execution!.executedAt,
          executionCount: (rulesHook.getRuleById(ruleResult.ruleId)?.executionCount || 0) + 1,
        });
      });

    dataHook.markUnsavedChanges();
  }
};

/**
 * Enhanced rule execution with history tracking
 */
export const createExecuteRules =
  (
    rulesHook: UseAutoFundingRulesReturn,
    executionHook: UseAutoFundingExecutionReturn,
    historyHook: Pick<UseAutoFundingHistoryReturn, "addToHistory" | "addToUndoStack">,
    dataHook: Pick<UseAutoFundingDataReturn, "markUnsavedChanges">
  ) =>
  async (trigger = TRIGGER_TYPES.MANUAL, triggerData: Record<string, unknown> = {}) => {
    try {
      const result = await executionHook.executeRules(rulesHook.rules, trigger, triggerData);
      processExecutionResults(result, historyHook, rulesHook, dataHook);
      return result;
    } catch (error) {
      logger.error("Enhanced rule execution failed", error);
      // Return a shaped ExecutionResult even on error so callers have a consistent type
      const execution = {
        id: `err-${Date.now()}`,
        executedAt: new Date().toISOString(),
        trigger,
        rulesExecuted: 0,
        totalFunded: 0,
      };
      return {
        success: false,
        execution,
        results: [],
        error: String((error as Error)?.message || error),
      };
    }
  };

/**
 * Get current data for auto-save
 */
export const getCurrentDataForSave = (
  rulesHook: UseAutoFundingRulesReturn,
  historyHook: UseAutoFundingHistoryReturn
) => ({
  rules: rulesHook.rules,
  executionHistory: historyHook.executionHistory,
  undoStack: historyHook.undoStack,
});

/**
 * Initialize auto-funding system
 */
export const initializeAutoFundingSystem = async (
  dataHook: UseAutoFundingDataReturn,
  rulesHook: UseAutoFundingRulesReturn
): Promise<void> => {
  try {
    const savedData = await dataHook.initialize();

    if (savedData?.rules) {
      rulesHook.setAllRules(savedData.rules);
    }

    logger.info("Complete auto-funding system initialized");
  } catch (error) {
    logger.error("Failed to initialize auto-funding system", error);
  }
};
