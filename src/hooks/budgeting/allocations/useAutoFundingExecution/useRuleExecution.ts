import { useCallback } from "react";
import {
  sortRulesByPriority,
  calculateFundingAmount,
  AutoFundingRule,
} from "@/utils/budgeting/autofunding/rules.ts";
import { shouldRuleExecute, ExecutionContext } from "@/utils/budgeting/autofunding/conditions.ts";
import { planRuleTransfers } from "@/utils/budgeting/autofunding/simulation.ts";
import logger from "@/utils/common/logger";

interface TransferFunction {
  (transfer: { fromEnvelopeId: string; toEnvelopeId: string; amount: number }): Promise<void>;
}

/**
 * Hook for core rule execution logic
 * Extracted from useAutoFundingExecution.js for better maintainability
 */
export const useRuleExecution = (_budget: unknown) => {
  // Execute a single rule
  const executeSingleRule = useCallback(
    async (
      rule: AutoFundingRule,
      context: ExecutionContext,
      availableCash: number,
      executeTransfer: TransferFunction
    ) => {
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
    },
    []
  );

  // Core execution logic with priority handling
  const executeRulesWithContext = useCallback(
    async (
      rules: AutoFundingRule[],
      context: ExecutionContext,
      executeTransfer: TransferFunction
    ) => {
      const executionId = `execution_${Date.now()}`;
      const executionResults = [];

      try {
        // Filter and sort rules by priority
        const executableRules = rules.filter((rule: AutoFundingRule) =>
          shouldRuleExecute(
            rule as unknown as import("../../../../utils/budgeting/autofunding/conditions.ts").Rule,
            context
          )
        );
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
            const result = await executeSingleRule(rule, context, remainingCash, executeTransfer);

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
            const err = error as Error;
            logger.error("Failed to execute rule", {
              ruleId: rule.id,
              error: err.message,
            });

            executionResults.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: false,
              error: err.message,
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
        const err = error as Error;
        logger.error("Auto-funding execution failed", {
          executionId,
          error: err.message,
        });
        return {
          success: false,
          error: err.message,
          executionId,
        };
      }
    },
    [executeSingleRule]
  );

  return {
    executeSingleRule,
    executeRulesWithContext,
  };
};
