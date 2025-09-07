import { useState, useCallback } from "react";
import {
  simulateRuleExecution,
  createExecutionPlan,
  validateTransfers,
  calculateTransferImpact,
  planRuleTransfers,
} from "../../../utils/budgeting/autofunding/simulation.js";
import { shouldRuleExecute } from "../../../utils/budgeting/autofunding/conditions.js";
import {
  sortRulesByPriority,
  calculateFundingAmount,
} from "../../../utils/budgeting/autofunding/rules.js";
import { TRIGGER_TYPES } from "../../../utils/budgeting/autofunding/rules.js";
import { useBudgetStore } from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";

/**
 * Hook for executing auto-funding rules and managing execution state
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingExecution = () => {
  const budget = useBudgetStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecution, setLastExecution] = useState(null);

  // Execute rules with given trigger
  const executeRules = useCallback(
    async (rules, trigger = TRIGGER_TYPES.MANUAL, triggerData = {}) => {
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

        const result = await executeRulesWithContext(rules, context);

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
        return { success: false, error: error.message };
      } finally {
        setIsExecuting(false);
      }
    },
    [budget, isExecuting]
  );

  // Core execution logic with priority handling
  const executeRulesWithContext = useCallback(async (rules, context) => {
    const executionId = `execution_${Date.now()}`;
    const executionResults = [];

    try {
      // Filter and sort rules by priority
      const executableRules = rules.filter((rule) => shouldRuleExecute(rule, context));
      const sortedRules = sortRulesByPriority(executableRules);

      logger.debug("Filtered executable rules", {
        totalRules: rules.length,
        executableRules: sortedRules.length,
        trigger: context.trigger,
      });

      // Track remaining cash across rule executions
      let remainingCash = context.data.unassignedCash;

      // Execute each rule in priority order
      for (const rule of sortedRules) {
        try {
          const result = await executeSingleRule(rule, context, remainingCash);

          executionResults.push(result);

          if (result.success && result.amount > 0) {
            remainingCash -= result.amount;
            logger.debug("Rule executed successfully", {
              ruleId: rule.id,
              amount: result.amount,
              remainingCash,
            });
          }
        } catch (error) {
          logger.error("Failed to execute rule", {
            ruleId: rule.id,
            error: error.message,
          });

          executionResults.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: error.message,
            amount: 0,
            executedAt: new Date().toISOString(),
          });
        }
      }

      // Create execution record
      const executionRecord = {
        id: executionId,
        trigger: context.trigger,
        executedAt: new Date().toISOString(),
        rulesExecuted: executionResults.filter((r) => r.success).length,
        totalFunded: executionResults
          .filter((r) => r.success)
          .reduce((sum, r) => sum + (r.amount || 0), 0),
        results: executionResults,
        remainingCash,
        initialCash: context.data.unassignedCash,
      };

      logger.info("Auto-funding execution completed", executionRecord);

      return {
        success: true,
        execution: executionRecord,
        results: executionResults,
      };
    } catch (error) {
      logger.error("Auto-funding execution failed", {
        executionId,
        error: error.message,
      });
      return {
        success: false,
        error: error.message,
        executionId,
      };
    }
  }, []);

  // Execute a single rule
  const executeSingleRule = useCallback(async (rule, context, availableCash) => {
    logger.debug("Executing single rule", {
      ruleId: rule.id,
      name: rule.name,
      priority: rule.priority,
      availableCash,
    });

    // Calculate funding amount considering available cash
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

    // Plan and execute transfers
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
  }, []);

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

  // Get execution summary for display
  const getExecutionSummary = useCallback(() => {
    if (!lastExecution) {
      return null;
    }

    return {
      id: lastExecution.id,
      trigger: lastExecution.trigger,
      executedAt: lastExecution.executedAt,
      rulesExecuted: lastExecution.rulesExecuted,
      totalFunded: lastExecution.totalFunded,
      remainingCash: lastExecution.remainingCash,
      initialCash: lastExecution.initialCash,
      success: lastExecution.success !== false,
      hasErrors: lastExecution.results?.some((r) => !r.success) || false,
    };
  }, [lastExecution]);

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
