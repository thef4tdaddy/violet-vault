import { useEffect, useCallback } from "react";
import { useAutoFundingRules } from "./useAutoFundingRules";
import { useAutoFundingExecution } from "./useAutoFundingExecution";
import { useAutoFundingHistory } from "./useAutoFundingHistory";
import type { BudgetContext } from "./types";
import type { Transaction } from "@/types/finance";
import {
  isLikelyIncome,
  handleIncomeDetection,
  checkScheduledRules,
} from "./useAutoFundingHelpers";
import logger from "@/utils/core/common/logger";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";

// Extended store interface for legacy budget property
interface ExtendedUiStore extends UiStore {
  budget?: {
    envelopes?: unknown[];
    unassignedCash?: number;
    allTransactions?: unknown[];
    transferFunds?: (
      from: string,
      to: string,
      amount: number,
      description?: string
    ) => Promise<void>;
  };
}

/**
 * Master hook that combines all auto-funding functionality
 * Unified with TanStack Query and Dexie (Hybrid v2.0 Architecture)
 */
export const useAutoFunding = () => {
  // Get budget context from store
  const budget = useUiStore((state) => (state as ExtendedUiStore).budget);

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
          await handleIncomeDetection(transaction, rulesHook, executeWrapper);
        }
      } catch (error) {
        logger.error("Error handling transaction-based auto-funding", error);
      }
    },
    [executionHook, rulesHook]
  );

  // Periodic check for scheduled rules
  // TODO: Move this to a dedicated scheduler service/worker in the future
  useEffect(() => {
    if (!budget) return; // Wait for budget to be ready

    const checkRules = () => {
      const executeWrapper = async (trigger: string, data: Record<string, unknown> = {}) => {
        return executionHook.executeRules(
          rulesHook.rules as unknown as import("@/utils/domain/budgeting/autofunding/rules").AutoFundingRule[],
          trigger,
          data
        );
      };

      const budgetContext: BudgetContext = {
        envelopes:
          (budget.envelopes as unknown as import("@/utils/domain/budgeting/autofunding/conditions").Envelope[]) ||
          [],
        unassignedCash: budget.unassignedCash || 0,
        allTransactions:
          (budget.allTransactions as unknown as import("@/types/finance").Transaction[]) || [],
      };

      checkScheduledRules(rulesHook, budgetContext, executeWrapper);
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
    // Override executeRules to provide default arguments
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
