import { useCallback } from "react";
import {
  simulateRuleExecution,
  createExecutionPlan,
  validateTransfers,
  calculateTransferImpact,
} from "../../../../utils/budgeting/autofunding/simulation.js";
import { shouldRuleExecute } from "../../../../utils/budgeting/autofunding/conditions.js";
import { TRIGGER_TYPES } from "../../../../utils/budgeting/autofunding/rules.js";
import logger from "../../../../utils/common/logger";

/**
 * Hook for utility functions like simulation and planning
 * Extracted from useAutoFundingExecution.js for better maintainability
 */
export const useExecutionUtils = (budget) => {
  // Execute a single transfer using the budget store
  const executeTransfer = useCallback(
    async (transfer) => {
      try {
        await budget.transferFunds(
          transfer.fromEnvelopeId,
          transfer.toEnvelopeId,
          transfer.amount,
          transfer.description
        );

        logger.debug("Transfer executed", transfer);
      } catch (error) {
        logger.error("Transfer failed", { transfer, error: error.message });
        throw error;
      }
    },
    [budget]
  );

  // Simulate rule execution without making actual transfers
  const simulateExecution = useCallback(
    (rules, trigger = TRIGGER_TYPES.MANUAL, triggerData = {}) => {
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

        return simulateRuleExecution(rules, context);
      } catch (error) {
        logger.error("Simulation failed", error);
        return { success: false, error: error.message };
      }
    },
    [budget]
  );

  // Create detailed execution plan
  const createPlan = useCallback(
    (rules, trigger = TRIGGER_TYPES.MANUAL, triggerData = {}) => {
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

        return createExecutionPlan(rules, context);
      } catch (error) {
        logger.error("Plan creation failed", error);
        return { success: false, error: error.message };
      }
    },
    [budget]
  );

  // Validate planned transfers
  const validatePlannedTransfers = useCallback(
    (transfers, triggerData = {}) => {
      try {
        const context = {
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            ...triggerData,
          },
        };

        return validateTransfers(transfers, context);
      } catch (error) {
        logger.error("Transfer validation failed", error);
        return { isValid: false, errors: [{ error: error.message }] };
      }
    },
    [budget]
  );

  // Calculate impact of transfers on envelope balances
  const calculateImpact = useCallback(
    (transfers, triggerData = {}) => {
      try {
        const context = {
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            ...triggerData,
          },
        };

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
    (rules, trigger = TRIGGER_TYPES.MANUAL) => {
      try {
        const context = {
          trigger,
          currentDate: new Date().toISOString(),
          data: {
            envelopes: budget.envelopes || [],
            unassignedCash: budget.unassignedCash || 0,
            transactions: budget.allTransactions || [],
          },
        };

        const executableRules = rules.filter((rule) => shouldRuleExecute(rule, context));
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
