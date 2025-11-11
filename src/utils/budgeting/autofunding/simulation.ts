/**
 * Auto-Funding Simulation Utilities
 * Pure functions for simulating rule executions and planning transfers
 * Extracted from autoFundingEngine.js for Issue #506
 */

import { RULE_TYPES } from "./rules.ts";
import { calculateFundingAmount, sortRulesByPriority } from "./rules.ts";
import { shouldRuleExecute } from "./conditions.ts";
import type { AutoFundingRule, AutoFundingContext, EnvelopeData } from "./rules.ts";
import type { ExecutionContext } from "./conditions.ts";

/**
 * Simulates execution of all applicable rules without making changes
 */
export const simulateRuleExecution = (
  rules: AutoFundingRule[],
  context: AutoFundingContext & { trigger: string }
) => {
  const simulation = {
    totalPlanned: 0,
    rulesExecuted: 0,
    plannedTransfers: [] as Array<{
      fromEnvelopeId: string;
      toEnvelopeId: string;
      amount: number;
      description: string;
      ruleId: string;
      ruleName: string;
    }>,
    ruleResults: [] as Array<{
      ruleId: string;
      ruleName: string;
      success: boolean;
      error?: string;
      amount: number;
      plannedTransfers: Array<{
        fromEnvelopeId: string;
        toEnvelopeId: string;
        amount: number;
        description: string;
        ruleId: string;
        ruleName: string;
      }>;
      targetEnvelopes?: string[];
    }>,
    remainingCash: context.data.unassignedCash,
    errors: [] as Array<{
      ruleId: string;
      ruleName: string;
      error: string;
    }>,
  };

  try {
    // Filter and sort rules by priority
    const executableRules = rules.filter((rule) =>
      shouldRuleExecute(rule, context as ExecutionContext)
    );
    const sortedRules = sortRulesByPriority(executableRules);

    let availableCash = context.data.unassignedCash;

    // Simulate each rule execution
    for (const rule of sortedRules) {
      try {
        const ruleResult = simulateSingleRule(rule, context, availableCash);

        if (ruleResult.success && ruleResult.amount > 0) {
          simulation.ruleResults.push(ruleResult);
          simulation.plannedTransfers.push(...ruleResult.plannedTransfers);
          simulation.totalPlanned += ruleResult.amount;
          simulation.rulesExecuted++;
          availableCash -= ruleResult.amount;
        } else if (!ruleResult.success) {
          simulation.ruleResults.push(ruleResult);
          if (ruleResult.error) {
            simulation.errors.push({
              ruleId: rule.id,
              ruleName: rule.name,
              error: ruleResult.error,
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          error: errorMessage,
          amount: 0,
          plannedTransfers: [] as Array<{
            fromEnvelopeId: string;
            toEnvelopeId: string;
            amount: number;
            description: string;
            ruleId: string;
            ruleName: string;
          }>,
        };

        simulation.ruleResults.push(errorResult);
        simulation.errors.push({
          ruleId: rule.id,
          ruleName: rule.name,
          error: errorMessage,
        });
      }
    }

    simulation.remainingCash = Math.max(0, availableCash);

    return {
      success: true,
      simulation,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
      simulation: null,
    };
  }
};

/**
 * Simulates execution of a single rule
 */
export const simulateSingleRule = (
  rule: AutoFundingRule,
  context: AutoFundingContext,
  availableCash: number
) => {
  try {
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
        plannedTransfers: [] as Array<{
          fromEnvelopeId: string;
          toEnvelopeId: string;
          amount: number;
          description: string;
          ruleId: string;
          ruleName: string;
        }>,
      };
    }

    // Plan transfers for this rule
    const plannedTransfers = planRuleTransfers(rule, fundingAmount);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      success: true,
      amount: fundingAmount,
      plannedTransfers,
      targetEnvelopes: plannedTransfers.map((t) => t.toEnvelopeId),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      success: false,
      error: errorMessage,
      amount: 0,
      plannedTransfers: [] as Array<{
        fromEnvelopeId: string;
        toEnvelopeId: string;
        amount: number;
        description: string;
        ruleId: string;
        ruleName: string;
      }>,
    };
  }
};

/**
 * Plans transfers for a rule execution
 */
export const planRuleTransfers = (rule: AutoFundingRule, totalAmount: number) => {
  const transfers = [] as Array<{
    fromEnvelopeId: string;
    toEnvelopeId: string;
    amount: number;
    description: string;
    ruleId: string;
    ruleName: string;
  }>;

  switch (rule.type) {
    case RULE_TYPES.FIXED_AMOUNT:
    case RULE_TYPES.PERCENTAGE:
    case RULE_TYPES.CONDITIONAL:
    case RULE_TYPES.PRIORITY_FILL:
      if (rule.config.targetId) {
        transfers.push({
          fromEnvelopeId: "unassigned",
          toEnvelopeId: rule.config.targetId,
          amount: totalAmount,
          description: `Auto-funding: ${rule.name}`,
          ruleId: rule.id,
          ruleName: rule.name,
        });
      }
      break;

    case RULE_TYPES.SPLIT_REMAINDER:
      if (rule.config.targetIds && rule.config.targetIds.length > 0) {
        const amountPerEnvelope =
          Math.floor((totalAmount / rule.config.targetIds.length) * 100) / 100;

        rule.config.targetIds.forEach((envelopeId, index) => {
          // Handle rounding by giving any remainder to the last envelope
          const amount =
            index === rule.config.targetIds.length - 1
              ? totalAmount - amountPerEnvelope * (rule.config.targetIds.length - 1)
              : amountPerEnvelope;

          transfers.push({
            fromEnvelopeId: "unassigned",
            toEnvelopeId: envelopeId,
            amount: amount,
            description: `Auto-funding (split): ${rule.name}`,
            ruleId: rule.id,
            ruleName: rule.name,
          });
        });
      }
      break;
  }

  return transfers;
};

/**
 * Creates an execution plan without executing
 */
export const createExecutionPlan = (
  rules: AutoFundingRule[],
  context: AutoFundingContext & { trigger: string }
) => {
  const simulation = simulateRuleExecution(rules, context);

  if (!simulation.success) {
    return simulation;
  }

  const plan = {
    plannedAt: new Date().toISOString(),
    trigger: context.trigger,
    initialCash: context.data.unassignedCash,
    finalCash: simulation.simulation.remainingCash,
    totalToTransfer: simulation.simulation.totalPlanned,
    rulesCount: simulation.simulation.rulesExecuted,
    transfersCount: simulation.simulation.plannedTransfers.length,
    rules: simulation.simulation.ruleResults.filter((r) => r.success),
    transfers: simulation.simulation.plannedTransfers,
    errors: simulation.simulation.errors,
    warnings: generatePlanWarnings(simulation.simulation, context),
  };

  return {
    success: true,
    plan,
  };
};

/**
 * Generates warnings for potential issues in the execution plan
 */
export const generatePlanWarnings = (
  simulation: {
    errors: Array<{ error: string }>;
    rulesExecuted: number;
    remainingCash: number;
  },
  context: AutoFundingContext
) => {
  const warnings = [] as Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  const { unassignedCash } = context.data;

  // Warning if not enough cash for all rules
  if (simulation.errors.some((e) => e.error.includes("No funds available"))) {
    warnings.push({
      type: "insufficient_funds",
      message: "Some rules cannot execute due to insufficient unassigned cash",
      severity: "high",
    });
  }

  // Warning if no rules will execute
  if (simulation.rulesExecuted === 0) {
    warnings.push({
      type: "no_execution",
      message: "No rules will execute with current conditions",
      severity: "medium",
    });
  }

  // Warning if very little cash will remain
  const remainingPercentage = (simulation.remainingCash / unassignedCash) * 100;
  if (remainingPercentage < 5 && simulation.remainingCash > 0) {
    warnings.push({
      type: "low_remaining_cash",
      message: `Only $${simulation.remainingCash.toFixed(2)} will remain unassigned`,
      severity: "low",
    });
  }

  return warnings;
};

/**
 * Validates transfer feasibility
 */
export const validateTransfers = (
  transfers: Array<{
    toEnvelopeId: string;
    amount: number;
  }>,
  context: AutoFundingContext
) => {
  const errors = [] as Array<{
    transferIndex?: number;
    error: string;
    transfer?: {
      toEnvelopeId: string;
      amount: number;
    };
    totalAmount?: number;
    availableCash?: number;
  }>;
  const warnings = [] as unknown[];
  const { envelopes } = context.data;

  let totalAmount = 0;

  transfers.forEach((transfer, index) => {
    // Check if target envelope exists
    if (transfer.toEnvelopeId !== "unassigned") {
      const targetEnvelope = envelopes.find((e) => e.id === transfer.toEnvelopeId);
      if (!targetEnvelope) {
        errors.push({
          transferIndex: index,
          error: `Target envelope ${transfer.toEnvelopeId} not found`,
          transfer,
        });
      }
    }

    // Check transfer amount is positive
    if (transfer.amount <= 0) {
      errors.push({
        transferIndex: index,
        error: "Transfer amount must be positive",
        transfer,
      });
    }

    totalAmount += transfer.amount;
  });

  // Check total doesn't exceed available cash
  if (totalAmount > context.data.unassignedCash) {
    errors.push({
      error: `Total transfers ($${totalAmount}) exceed available cash ($${context.data.unassignedCash})`,
      totalAmount,
      availableCash: context.data.unassignedCash,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalAmount,
  };
};

/**
 * Calculates the impact of proposed transfers on envelope balances
 */
export const calculateTransferImpact = (
  transfers: Array<{
    toEnvelopeId: string;
    amount: number;
  }>,
  context: AutoFundingContext
) => {
  const { envelopes } = context.data;
  const impact = {
    envelopes: new Map<
      string,
      {
        id: string;
        name: string;
        currentBalance: number;
        change: number;
        newBalance: number;
        monthlyAmount?: number;
        fillPercentage: number;
        newFillPercentage: number;
      }
    >(),
    unassignedChange: 0,
    totalTransferred: 0,
  };

  // Initialize envelope impact tracking
  envelopes.forEach((envelope) => {
    impact.envelopes.set(envelope.id, {
      id: envelope.id,
      name: envelope.name || envelope.id,
      currentBalance: envelope.currentBalance || 0,
      change: 0,
      newBalance: envelope.currentBalance || 0,
      monthlyAmount: envelope.monthlyAmount,
      fillPercentage:
        envelope.monthlyAmount && envelope.monthlyAmount > 0
          ? ((envelope.currentBalance || 0) / envelope.monthlyAmount) * 100
          : 0,
      newFillPercentage: 0,
    });
  });

  // Track unassigned cash impact
  impact.unassignedChange = -transfers.reduce((sum, t) => sum + t.amount, 0);
  impact.totalTransferred = -impact.unassignedChange;

  // Calculate per-envelope impact
  transfers.forEach((transfer) => {
    if (impact.envelopes.has(transfer.toEnvelopeId)) {
      const envelopeImpact = impact.envelopes.get(transfer.toEnvelopeId);
      if (envelopeImpact) {
        envelopeImpact.change += transfer.amount;
        envelopeImpact.newBalance = envelopeImpact.currentBalance + envelopeImpact.change;

        if (envelopeImpact.monthlyAmount && envelopeImpact.monthlyAmount > 0) {
          envelopeImpact.newFillPercentage =
            (envelopeImpact.newBalance / envelopeImpact.monthlyAmount) * 100;
        }
      }
    }
  });

  return impact;
};

/**
 * Generates a summary of the execution plan for display
 */
export const generatePlanSummary = (
  plan: {
    totalToTransfer: number;
    rulesCount: number;
    transfersCount: number;
    finalCash: number;
    errors: unknown[];
    warnings: unknown[];
    rules: Array<{
      ruleName: string;
      amount: number;
      targetEnvelopes?: string[];
    }>;
    transfers: Array<{
      toEnvelopeId: string;
      amount: number;
      description: string;
    }>;
  },
  envelopes: EnvelopeData[] = []
) => {
  const envelopeMap = new Map(envelopes.map((e) => [e.id, e]));

  const summary = {
    overview: {
      totalAmount: plan.totalToTransfer,
      rulesCount: plan.rulesCount,
      transfersCount: plan.transfersCount,
      remainingCash: plan.finalCash,
      hasErrors: plan.errors.length > 0,
      hasWarnings: plan.warnings.length > 0,
    },
    rulesSummary: plan.rules.map((rule) => ({
      name: rule.ruleName,
      amount: rule.amount,
      targetCount: rule.targetEnvelopes?.length || 0,
      targets:
        rule.targetEnvelopes?.map((id) => {
          const envelope = envelopeMap.get(id);
          return envelope ? envelope.name : id;
        }) || [],
    })),
    transfersSummary: plan.transfers.map((transfer) => ({
      amount: transfer.amount,
      to: envelopeMap.get(transfer.toEnvelopeId)?.name || transfer.toEnvelopeId,
      description: transfer.description,
    })),
    errors: plan.errors,
    warnings: plan.warnings,
  };

  return summary;
};
