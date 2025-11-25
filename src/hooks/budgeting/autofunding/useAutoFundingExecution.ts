import { useState, useCallback } from "react";
import { TRIGGER_TYPES, type AutoFundingRule } from "../../../utils/budgeting/autofunding/rules.ts";
import useUiStore, { type UiStore } from "../../../stores/ui/uiStore";
import { useRuleExecution } from "./useAutoFundingExecution/useRuleExecution";
import { useExecutionUtils } from "./useAutoFundingExecution/useExecutionUtils";
import { useExecutionSummary } from "./useAutoFundingExecution/useExecutionSummary";
import logger from "../../../utils/common/logger";

interface BudgetData {
  envelopes?: unknown[];
  unassignedCash?: number;
  allTransactions?: unknown[];
}

interface ExecutionResult {
  success: boolean;
  error?: string;
  execution?: {
    rulesExecuted: number;
    totalFunded: number;
  };
}

// Extended store interface for legacy budget property
interface ExtendedUiStore extends UiStore {
  budget?: BudgetData;
}

/**
 * Hook for executing auto-funding rules and managing execution state
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingExecution = () => {
  const budget = useUiStore(
    (state: ExtendedUiStore) => state.budget
  ) as BudgetData | undefined;
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

        if (result.success) {
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
