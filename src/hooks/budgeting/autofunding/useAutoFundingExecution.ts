import { useState, useCallback } from "react";
import { TRIGGER_TYPES } from "../../../utils/budgeting/autofunding/rules.ts";
import useUiStore, { type UiStore } from "../../../stores/ui/uiStore";
import { useRuleExecution } from "./useAutoFundingExecution/useRuleExecution";
import { useExecutionUtils } from "./useAutoFundingExecution/useExecutionUtils";
import { useExecutionSummary } from "./useAutoFundingExecution/useExecutionSummary";
import logger from "../../../utils/common/logger";
import type { AutoFundingRule } from "../../../utils/budgeting/autofunding/rules";

interface ExecutionResult {
  success: boolean;
  error?: string;
  execution?: {
    rulesExecuted: number;
    totalFunded: number;
  };
}

/**
 * Budget state interface for auto-funding execution
 * Legacy compatibility - data is sourced from TanStack Query
 */
interface BudgetState {
  envelopes: unknown[];
  unassignedCash: number;
  allTransactions: unknown[];
  transferFunds?: (
    fromEnvelopeId: string,
    toEnvelopeId: string,
    amount: number,
    description: string
  ) => Promise<void>;
}

/**
 * Hook for executing auto-funding rules and managing execution state
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingExecution = () => {
  // Access UI store state - budget data comes from TanStack Query hooks in actual usage
  // This provides fallback empty state for initialization
  const budget: BudgetState = useUiStore((_state: UiStore) => ({
    envelopes: [],
    unassignedCash: 0,
    allTransactions: [],
  }));
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<ExecutionResult["execution"] | null>(null);

  // Use focused sub-hooks
  const { executeRulesWithContext, executeSingleRule } = useRuleExecution(budget);
  const {
    executeTransfer,
    simulateExecution,
    createPlan,
    validatePlannedTransfers,
    calculateImpact,
    canExecuteRules,
  } = useExecutionUtils(budget);
  const { getExecutionSummary } = useExecutionSummary(lastExecution);

  // Execute rules with given trigger
  const executeRules = useCallback(
    async (
      rules: AutoFundingRule[],
      trigger: string = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ): Promise<ExecutionResult> => {
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

        logger.info("Executing auto-funding rules", {
          trigger,
          rulesCount: rules.length,
          availableCash: context.data.unassignedCash,
        });

        const result = await executeRulesWithContext(rules, context, executeTransfer);

        if (result.success && result.execution) {
          setLastExecution(result.execution);
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
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      } finally {
        setIsExecuting(false);
      }
    },
    [budget, isExecuting, executeRulesWithContext, executeTransfer]
  );

  return {
    // State
    isExecuting,
    lastExecution,

    // Execution
    executeRules,
    executeSingleRule,

    // Planning and simulation
    simulateExecution,
    createPlan,

    // Validation and analysis
    validatePlannedTransfers,
    calculateImpact,
    canExecuteRules,

    // Utils
    getExecutionSummary,
  };
};
