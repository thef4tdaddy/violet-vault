import { useState, useCallback, useMemo } from "react";
import { TRIGGER_TYPES, type AutoFundingRule } from "@/utils/budgeting/autofunding/rules.ts";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import { useRuleExecution } from "./useAutoFundingExecution/useRuleExecution";
import { useExecutionUtils } from "./useAutoFundingExecution/useExecutionUtils";
import { useExecutionSummary } from "./useAutoFundingExecution/useExecutionSummary";
import type { ExecutionContext, Envelope } from "@/utils/budgeting/autofunding/conditions";
import type { ExecutionResult, ExecutionDetails } from "./types";
import logger from "@/utils/common/logger";

interface BudgetData {
  envelopes?: Envelope[];
  unassignedCash?: number;
  allTransactions?: unknown[];
  transferFunds?: (from: string, to: string, amount: number, description?: string) => Promise<void>;
}

// Internal interfaces moved to types.ts or unified

// Extended store interface for legacy budget property
interface ExtendedUiStore extends UiStore {
  budget?: BudgetData;
}

/**
 * Hook for executing auto-funding rules and managing execution state
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingExecution = () => {
  const budget = useUiStore((state: ExtendedUiStore) => state.budget) as BudgetData | undefined;
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<ExecutionResult["execution"] | null>(null);

  // Use focused sub-hooks
  const budgetWithDefaults: BudgetData = useMemo(
    () =>
      budget ?? {
        envelopes: [],
        unassignedCash: 0,
        allTransactions: [],
      },
    [budget]
  );
  const { executeRulesWithContext, executeSingleRule } = useRuleExecution(budgetWithDefaults);
  // Provide a default no-op transferFunds if not present
  const budgetForExecution = {
    ...budgetWithDefaults,
    transferFunds:
      budgetWithDefaults.transferFunds ??
      (async () => {
        logger.warn("transferFunds not available - operation skipped");
      }),
  };
  const {
    executeTransfer,
    simulateExecution,
    createPlan,
    validatePlannedTransfers,
    calculateImpact,
    canExecuteRules,
  } = useExecutionUtils(budgetForExecution);
  const { getExecutionSummary } = useExecutionSummary(lastExecution as ExecutionDetails | null);

  // Execute rules with given trigger
  const executeRules = useCallback(
    async (
      rules: AutoFundingRule[],
      trigger: string = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ): Promise<ExecutionResult> => {
      if (isExecuting) {
        logger.warn("Auto-funding execution already in progress");
        return {
          success: false,
          error: "Execution already in progress",
        };
      }

      setIsExecuting(true);

      try {
        const context: ExecutionContext = {
          trigger,
          currentDate: new Date().toISOString(),
          data: {
            envelopes: budgetWithDefaults.envelopes ?? [],
            unassignedCash: budgetWithDefaults.unassignedCash ?? 0,
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

        return {
          ...result,
          results: result.results || [],
        };
      } catch (error) {
        logger.error("Error during auto-funding execution", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      } finally {
        setIsExecuting(false);
      }
    },
    [budgetWithDefaults, isExecuting, executeRulesWithContext, executeTransfer]
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
