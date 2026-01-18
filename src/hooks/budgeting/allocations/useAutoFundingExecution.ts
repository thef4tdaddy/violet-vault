import { useState, useCallback, useMemo } from "react";
import { TRIGGER_TYPES, type AutoFundingRule } from "@/utils/domain/budgeting/autofunding/rules.ts";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import {
  shouldRuleExecute,
  type ExecutionContext,
  type Envelope,
} from "@/utils/domain/budgeting/autofunding/conditions.ts";
import {
  sortRulesByPriority,
  calculateFundingAmount,
} from "@/utils/domain/budgeting/autofunding/rules.ts";
import {
  planRuleTransfers,
  simulateRuleExecution,
  createExecutionPlan,
  validateTransfers,
  calculateTransferImpact,
} from "@/utils/domain/budgeting/autofunding/simulation.ts";
import type { ExecutionResult, ExecutionDetails } from "./types";
import logger from "@/utils/core/common/logger";

interface Transfer {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description?: string;
}

interface BudgetData {
  envelopes?: Envelope[];
  unassignedCash?: number;
  allTransactions?: unknown[];
  transferFunds?: (from: string, to: string, amount: number, description?: string) => Promise<void>;
}

interface ExtendedUiStore extends UiStore {
  budget?: BudgetData;
}

/**
 * Unified hook for executing auto-funding rules and managing execution state
 */
// eslint-disable-next-line max-lines-per-function -- Unified engine managing core execution logic
export const useAutoFundingExecution = () => {
  const budget = useUiStore((state: ExtendedUiStore) => state.budget) as BudgetData | undefined;
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState<ExecutionDetails | null>(null);

  const budgetWithDefaults: BudgetData = useMemo(
    () =>
      budget ?? {
        envelopes: [],
        unassignedCash: 0,
        allTransactions: [],
      },
    [budget]
  );

  // --- Core execution logic ---

  const executeTransfer = useCallback(
    async (transfer: Transfer) => {
      try {
        if (!budget?.transferFunds) {
          logger.warn("transferFunds not available - operation skipped");
          return;
        }
        await budget.transferFunds(
          transfer.fromEnvelopeId,
          transfer.toEnvelopeId,
          transfer.amount,
          transfer.description
        );
        logger.debug("Transfer executed", transfer as unknown as Record<string, unknown>);
      } catch (error) {
        logger.error("Transfer failed", { transfer, error: (error as Error).message });
        throw error;
      }
    },
    [budget]
  );

  const executeSingleRule = useCallback(
    async (rule: AutoFundingRule, context: ExecutionContext, availableCash: number) => {
      const fundingAmount = calculateFundingAmount(rule, {
        ...context,
        data: { ...context.data, unassignedCash: availableCash },
      });

      if (fundingAmount <= 0) {
        return {
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          error: availableCash <= 0 ? "No funds available" : "Amount calculated as zero",
          amount: 0,
          executedAt: new Date().toISOString(),
        };
      }

      const plannedTransfers = planRuleTransfers(rule, fundingAmount);
      for (const transfer of plannedTransfers) {
        await executeTransfer(transfer);
      }

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        success: true,
        amount: fundingAmount,
        transfers: plannedTransfers.length,
        targetEnvelopes: plannedTransfers.map((t) => t.toEnvelopeId),
        executedAt: new Date().toISOString(),
      };
    },
    [executeTransfer]
  );

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
        const context: ExecutionContext = {
          trigger,
          currentDate: new Date().toISOString(),
          data: {
            envelopes: budgetWithDefaults.envelopes ?? [],
            unassignedCash: budgetWithDefaults.unassignedCash ?? 0,
            ...triggerData,
          },
        };

        const executableRules = rules.filter((rule) =>
          shouldRuleExecute(
            rule as unknown as import("@/utils/domain/budgeting/autofunding/conditions.ts").Rule,
            context
          )
        );
        const sortedRules = sortRulesByPriority(executableRules);
        const executionResults: import("./types").RuleExecutionResult[] = [];
        let remainingCash = context.data.unassignedCash;

        for (const rule of sortedRules) {
          try {
            const result = await executeSingleRule(rule, context, remainingCash);
            executionResults.push(result);
            if (result.success && (result.amount || 0) > 0) {
              remainingCash -= result.amount || 0;
            }
          } catch (error) {
            executionResults.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: false,
              error: (error as Error).message,
              amount: 0,
              executedAt: new Date().toISOString(),
            });
          }
        }

        const executionRecord: ExecutionDetails = {
          id: `execution_${Date.now()}`,
          trigger,
          executedAt: new Date().toISOString(),
          rulesExecuted: executionResults.filter((r) => r.success).length,
          totalFunded: executionResults
            .filter((r) => r.success)
            .reduce((sum, r) => sum + (r.amount || 0), 0),
          results: executionResults,
          remainingCash,
          initialCash: context.data.unassignedCash,
        };

        setLastExecution(executionRecord);
        return { success: true, execution: executionRecord, results: executionResults };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      } finally {
        setIsExecuting(false);
      }
    },
    [budgetWithDefaults, isExecuting, executeSingleRule]
  );

  // --- Utilities ---

  const simulateExecution = useCallback(
    (
      rules: AutoFundingRule[],
      trigger = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ) => {
      const context = {
        trigger,
        currentDate: new Date().toISOString(),
        data: {
          envelopes: budgetWithDefaults.envelopes || [],
          unassignedCash: budgetWithDefaults.unassignedCash || 0,
          ...triggerData,
        },
      } as unknown as ExecutionContext;
      return simulateRuleExecution(rules, context);
    },
    [budgetWithDefaults]
  );

  const createPlan = useCallback(
    (
      rules: AutoFundingRule[],
      trigger = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ) => {
      const context = {
        trigger,
        currentDate: new Date().toISOString(),
        data: {
          envelopes: budgetWithDefaults.envelopes || [],
          unassignedCash: budgetWithDefaults.unassignedCash || 0,
          ...triggerData,
        },
      } as unknown as ExecutionContext;
      return createExecutionPlan(rules, context);
    },
    [budgetWithDefaults]
  );

  const validatePlannedTransfers = useCallback(
    (transfers: Transfer[], triggerData: Record<string, unknown> = {}) => {
      const context = {
        data: {
          envelopes: budgetWithDefaults.envelopes || [],
          unassignedCash: budgetWithDefaults.unassignedCash || 0,
          ...triggerData,
        },
      } as unknown as ExecutionContext;
      return validateTransfers(transfers, context);
    },
    [budgetWithDefaults]
  );

  const calculateImpact = useCallback(
    (transfers: Transfer[], triggerData: Record<string, unknown> = {}) => {
      const context = {
        data: {
          envelopes: budgetWithDefaults.envelopes || [],
          unassignedCash: budgetWithDefaults.unassignedCash || 0,
          ...triggerData,
        },
      } as unknown as ExecutionContext;
      return calculateTransferImpact(transfers, context);
    },
    [budgetWithDefaults]
  );

  const canExecuteRules = useCallback(
    (rules: AutoFundingRule[], trigger = TRIGGER_TYPES.MANUAL) => {
      const context: ExecutionContext = {
        trigger,
        currentDate: new Date().toISOString(),
        data: {
          envelopes: budgetWithDefaults.envelopes || [],
          unassignedCash: budgetWithDefaults.unassignedCash || 0,
        },
      };

      const executableRules = rules.filter((rule) =>
        shouldRuleExecute(
          rule as unknown as import("@/utils/domain/budgeting/autofunding/conditions.ts").Rule,
          context
        )
      );
      return {
        canExecute: executableRules.length > 0 && context.data.unassignedCash > 0,
        executableCount: executableRules.length,
        totalRules: rules.length,
        availableCash: context.data.unassignedCash,
        executableRules: executableRules.map((rule) => ({
          id: rule.id,
          name: rule.name,
          priority: rule.priority,
        })),
      };
    },
    [budgetWithDefaults]
  );

  const getExecutionSummary = useCallback(() => {
    if (!lastExecution) return null;
    return {
      ...lastExecution,
      success: lastExecution.success !== false,
      hasErrors: lastExecution.results?.some((r) => !r.success) || false,
    };
  }, [lastExecution]);

  return {
    isExecuting,
    lastExecution,
    executeRules,
    executeSingleRule,
    simulateExecution,
    createPlan,
    validatePlannedTransfers,
    calculateImpact,
    canExecuteRules,
    getExecutionSummary,
  };
};
