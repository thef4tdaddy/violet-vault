import { useEffect, useCallback, useMemo } from "react";
import { useAutoFundingRules } from "@/hooks/budgeting/autofunding/useAutoFundingRules";
import { useAutoFundingExecution } from "@/hooks/budgeting/autofunding/useAutoFundingExecution";
import { useAutoFundingHistory } from "@/hooks/budgeting/autofunding/useAutoFundingHistory";
import type { BudgetContext } from "@/hooks/budgeting/autofunding/types";
import type { Transaction } from "@/types/finance";
import {
  isLikelyIncome,
  handleIncomeDetection,
  checkScheduledRules,
} from "@/hooks/budgeting/autofunding/useAutoFundingHelpers";
import logger from "@/utils/common/logger";

/**
 * Master hook that combines all auto-funding functionality
 * Unified with TanStack Query and Dexie (Hybrid v2.0 Architecture)
 */
export const useAutoFunding = () => {
  // Budget context (default empty, but should be managed by consumers)
  const budget = useMemo<BudgetContext>(
    () => ({
      envelopes: [],
      unassignedCash: 0,
      allTransactions: [],
    }),
    []
  );

  // Initialize individual hooks (new architecture)
  const rulesHook = useAutoFundingRules();
  const executionHook = useAutoFundingExecution();
  const historyHook = useAutoFundingHistory();

  // Handle transaction-based auto-funding triggers
  const handleTransactionAdded = useCallback(
    async (transaction: Transaction) => {
      if (executionHook.isExecuting) return;

      try {
        if (isLikelyIncome(transaction)) {
          const executeWrapper = async (trigger: string, data: Record<string, unknown> = {}) => {
            return executionHook.executeRules(rulesHook.rules, trigger, data);
          };
          await handleIncomeDetection(
            transaction,
            rulesHook,
            executeWrapper as (
              trigger: string,
              data: Record<string, unknown>
            ) => Promise<import("./types").ExecutionResult>
          );
        }
      } catch (error) {
        logger.error("Error handling transaction-based auto-funding", error);
      }
    },
    [executionHook, rulesHook]
  );

  // Periodic check for scheduled rules
  useEffect(() => {
    const checkRules = () => {
      const executeWrapper = async (trigger: string, data: Record<string, unknown> = {}) => {
        return executionHook.executeRules(
          rulesHook.rules as unknown as import("@/utils/budgeting/autofunding/rules").AutoFundingRule[],
          trigger,
          data
        );
      };
      checkScheduledRules(
        rulesHook,
        budget,
        executeWrapper as (
          trigger: string,
          triggerData?: Record<string, unknown>
        ) => Promise<import("./types").ExecutionResult>
      );
    };

    // Check every 5 minutes
    const interval = setInterval(checkRules, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [rulesHook, budget, executionHook]);

  return {
    // System state
    isInitialized: true,
    hasUnsavedChanges: false,
    lastSaved: null,
    statistics: rulesHook.getRulesStatistics(),

    // Rules management
    ...rulesHook,

    // Execution
    ...executionHook,
    executeRules: (trigger: string = "manual", data: Record<string, unknown> = {}) =>
      executionHook.executeRules(rulesHook.rules, trigger, data),

    // History and undo
    ...historyHook,

    // Event handlers
    handleTransactionAdded,

    // Utilities
    refreshData: () => {
      /* No-op, managed by TanStack Query */
    },
  };
};
