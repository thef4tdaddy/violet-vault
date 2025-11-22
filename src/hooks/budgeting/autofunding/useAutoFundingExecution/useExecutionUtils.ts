import { useCallback } from "react";
import {
  simulateRuleExecution,
  createExecutionPlan,
  validateTransfers,
  calculateTransferImpact,
} from "../../../../utils/budgeting/autofunding/simulation.ts";
import { shouldRuleExecute } from "../../../../utils/budgeting/autofunding/conditions.ts";
import { TRIGGER_TYPES, AutoFundingRule } from "../../../../utils/budgeting/autofunding/rules.ts";
import logger from "../../../../utils/common/logger";

interface Transfer {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description?: string;
}

interface Budget {
  transferFunds: (from: string, to: string, amount: number, description?: string) => Promise<void>;
  envelopes?: unknown[];
  unassignedCash?: number;
  allTransactions?: unknown[];
}

/**
 * Hook for utility functions like simulation and planning
 * Extracted from useAutoFundingExecution.js for better maintainability
 */
export const useExecutionUtils = (budget: Budget) => {
  // Execute a single transfer using the budget store
  const executeTransfer = useCallback(
    async (transfer: Transfer) => {
      try {
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

  // Simulate rule execution without making actual transfers
  const simulateExecution = useCallback(
    (
      rules: AutoFundingRule[],
      trigger = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ) => {
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
        } as unknown as Parameters<typeof simulateRuleExecution>[1];

        return simulateRuleExecution(rules, context);
      } catch (error) {
        logger.error("Simulation failed", error);
        return { success: false, error: (error as Error).message };
      }
    },
    [budget]
  );

  // Create detailed execution plan
  const createPlan = useCallback(
    (
      rules: AutoFundingRule[],
      trigger = TRIGGER_TYPES.MANUAL,
      triggerData: Record<string, unknown> = {}
    ) => {
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
        } as unknown as Parameters<typeof createExecutionPlan>[1];

        return createExecutionPlan(rules, context);
      } catch (error) {
        logger.error("Plan creation failed", error);
        return { success: false, error: (error as Error).message };
      }
    },
    [budget]
  );

  // Validate planned transfers
  const validatePlannedTransfers = useCallback(
    (transfers: Transfer[], triggerData: Record<string, unknown> = {}) => {
      try {
        const context = {
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            ...triggerData,
          },
        } as unknown as Parameters<typeof validateTransfers>[1];

        return validateTransfers(transfers, context);
      } catch (error) {
        logger.error("Transfer validation failed", error);
        return { isValid: false, errors: [{ error: (error as Error).message }] };
      }
    },
    [budget]
  );

  // Calculate impact of transfers on envelope balances
  const calculateImpact = useCallback(
    (transfers: Transfer[], triggerData: Record<string, unknown> = {}) => {
      try {
        const context = {
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            ...triggerData,
          },
        } as unknown as Parameters<typeof calculateTransferImpact>[1];

        return calculateTransferImpact(transfers, context);
      } catch (error) {
        logger.error("Impact calculation failed", error);
        return {
          envelopes: new Map(),
          unassignedChange: 0,
          totalTransferred: 0,
        };
      }
    },
    [budget]
  );

  // Check if rules can execute with current budget state
  const canExecuteRules = useCallback(
    (rules: AutoFundingRule[], trigger = TRIGGER_TYPES.MANUAL) => {
      try {
        const context = {
          trigger,
          currentDate: new Date().toISOString(),
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            transactions: budget.allTransactions || [],
          },
        } as unknown as import("../../../../utils/budgeting/autofunding/conditions.ts").ExecutionContext;

        const executableRules = rules.filter((rule: AutoFundingRule) =>
          shouldRuleExecute(
            rule as unknown as import("../../../../utils/budgeting/autofunding/conditions.ts").Rule,
            context
          )
        );
        return {
          canExecute: executableRules.length > 0 && context.data.unassignedCash > 0,
          executableCount: executableRules.length,
          totalRules: rules.length,
          availableCash: context.data.unassignedCash,
          executableRules: executableRules.map((rule: AutoFundingRule) => ({
            id: rule.id,
            name: rule.name,
            priority: rule.priority,
          })),
        };
      } catch (error) {
        logger.error("Failed to check rule executability", error);
        return {
          canExecute: false,
          executableCount: 0,
          totalRules: rules.length,
          availableCash: 0,
          executableRules: [],
        };
      }
    },
    [budget]
  );

  return {
    executeTransfer,
    simulateExecution,
    createPlan,
    validatePlannedTransfers,
    calculateImpact,
    canExecuteRules,
  };
};
