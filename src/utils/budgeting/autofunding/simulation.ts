/**
 * Auto-Funding Simulation Utilities
 * Pure functions for simulating rule executions and planning transfers
 * Extracted from autoFundingEngine.js for Issue #506
 */

import {
  RULE_TYPES,
  type AutoFundingRule,
  type AutoFundingContext,
  type EnvelopeData,
} from "./rules.ts";
import { calculateFundingAmount, sortRulesByPriority } from "./rules.ts";
import { shouldRuleExecute } from "./conditions.ts";

// Simulation result types
interface PlannedTransfer {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description: string;
  ruleId: string;
  ruleName: string;
}

interface RuleResult {
  ruleId: string;
  ruleName: string;
  success: boolean;
  amount: number;
  plannedTransfers: PlannedTransfer[];
  targetEnvelopes?: string[];
  error?: string;
}

interface SimulationError {
  ruleId: string;
  ruleName: string;
  error: string;
}

interface Simulation {
  totalPlanned: number;
  rulesExecuted: number;
  plannedTransfers: PlannedTransfer[];
  ruleResults: RuleResult[];
  remainingCash: number;
  errors: SimulationError[];
}

interface SimulationResult {
  success: boolean;
  simulation: Simulation | null;
  error?: string;
}

interface ExecutionPlan {
  plannedAt: string;
  trigger: string;
  initialCash: number;
  finalCash: number;
  totalToTransfer: number;
  rulesCount: number;
  transfersCount: number;
  rules: RuleResult[];
  transfers: PlannedTransfer[];
  errors: SimulationError[];
  warnings: PlanWarning[];
}

interface PlanWarning {
  type: string;
  message: string;
  severity: string;
}

interface ValidationError {
  transferIndex?: number;
  error: string;
  transfer?: PlannedTransfer;
  totalAmount?: number;
  availableCash?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: PlanWarning[];
  totalAmount: number;
}

interface EnvelopeImpact {
  id: string;
  name?: string;
  currentBalance?: number;
  change: number;
  newBalance: number;
  monthlyAmount?: number;
  fillPercentage: number;
  newFillPercentage: number;
}

interface TransferImpact {
  envelopes: Map<string, EnvelopeImpact>;
  unassignedChange: number;
  totalTransferred: number;
}

interface PlanSummary {
  overview: {
    totalAmount: number;
    rulesCount: number;
    transfersCount: number;
    remainingCash: number;
    hasErrors: boolean;
    hasWarnings: boolean;
  };
  rulesSummary: Array<{
    name: string;
    amount: number;
    targetCount: number;
    targets: string[];
  }>;
  transfersSummary: Array<{
    amount: number;
    to: string;
    description: string;
  }>;
  errors: SimulationError[];
  warnings: PlanWarning[];
}

/**
 * Simulates execution of all applicable rules without making changes
 * @param {Array} rules - Rules to simulate
 * @param {Object} context - Execution context
 * @returns {Object} Simulation results with planned transfers and totals
 */
export const simulateRuleExecution = (
  rules: AutoFundingRule[],
  context: AutoFundingContext
): SimulationResult => {
  const simulation: Simulation = {
    totalPlanned: 0,
    rulesExecuted: 0,
    plannedTransfers: [],
    ruleResults: [],
    remainingCash: context.data.unassignedCash,
    errors: [],
  };

  try {
    // Filter and sort rules by priority
    const executableRules = rules.filter((rule) => shouldRuleExecute(rule, context));
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
        const errorResult: RuleResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          error: errorMessage,
          amount: 0,
          plannedTransfers: [],
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
 * @param {Object} rule - Rule to simulate
 * @param {Object} context - Execution context
 * @param {number} availableCash - Available cash for this rule
 * @returns {Object} Single rule simulation result
 */
export const simulateSingleRule = (
  rule: AutoFundingRule,
  context: AutoFundingContext,
  availableCash: number
): RuleResult => {
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
        plannedTransfers: [],
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
      plannedTransfers: [],
    };
  }
};

/**
 * Plans transfers for a rule execution
 * @param {Object} rule - Rule configuration
 * @param {number} totalAmount - Total amount to transfer
 * @returns {Array} Array of planned transfer objects
 */
export const planRuleTransfers = (
  rule: AutoFundingRule,
  totalAmount: number
): PlannedTransfer[] => {
  const transfers: PlannedTransfer[] = [];

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

        rule.config.targetIds.forEach((envelopeId: string, index: number) => {
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
 * @param {Array} rules - Rules to plan for
 * @param {Object} context - Execution context
 * @returns {Object} Detailed execution plan
 */
export const createExecutionPlan = (
  rules: AutoFundingRule[],
  context: AutoFundingContext & { trigger: string }
): SimulationResult | { success: true; plan: ExecutionPlan } => {
  const simulation = simulateRuleExecution(rules, context);

  if (!simulation.success || !simulation.simulation) {
    return simulation;
  }

  const plan: ExecutionPlan = {
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
 * @param {Object} simulation - Simulation results
 * @param {Object} context - Execution context
 * @returns {Array} Array of warning objects
 */
export const generatePlanWarnings = (
  simulation: Simulation,
  context: AutoFundingContext
): PlanWarning[] => {
  const warnings: PlanWarning[] = [];
  const { unassignedCash } = context.data;

  // Warning if not enough cash for all rules
  if (simulation.errors.some((e: SimulationError) => e.error.includes("No funds available"))) {
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
 * @param {Array} transfers - Planned transfers
 * @param {Object} context - Execution context with envelopes
 * @returns {Object} Validation result
 */
export const validateTransfers = (
  transfers: PlannedTransfer[],
  context: AutoFundingContext
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: PlanWarning[] = [];
  const { envelopes } = context.data;

  let totalAmount = 0;

  transfers.forEach((transfer: PlannedTransfer, index: number) => {
    // Check if target envelope exists
    if (transfer.toEnvelopeId !== "unassigned") {
      const targetEnvelope = envelopes.find((e: EnvelopeData) => e.id === transfer.toEnvelopeId);
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
 * @param {Array} transfers - Planned transfers
 * @param {Object} context - Execution context with current envelope balances
 * @returns {Object} Impact analysis
 */
export const calculateTransferImpact = (
  transfers: PlannedTransfer[],
  context: AutoFundingContext
): TransferImpact => {
  const { envelopes } = context.data;
  const impact: TransferImpact = {
    envelopes: new Map<string, EnvelopeImpact>(),
    unassignedChange: 0,
    totalTransferred: 0,
  };

  // Initialize envelope impact tracking
  envelopes.forEach((envelope: EnvelopeData) => {
    const currentBalance = envelope.currentBalance ?? 0;
    const monthlyAmount = envelope.monthlyAmount ?? 0;
    impact.envelopes.set(envelope.id, {
      id: envelope.id,
      currentBalance,
      change: 0,
      newBalance: currentBalance,
      monthlyAmount,
      fillPercentage: monthlyAmount > 0 ? (currentBalance / monthlyAmount) * 100 : 0,
      newFillPercentage: 0,
    });
  });

  // Track unassigned cash impact
  impact.unassignedChange = -transfers.reduce(
    (sum: number, t: PlannedTransfer) => sum + t.amount,
    0
  );
  impact.totalTransferred = -impact.unassignedChange;

  // Calculate per-envelope impact
  transfers.forEach((transfer: PlannedTransfer) => {
    if (impact.envelopes.has(transfer.toEnvelopeId)) {
      const envelopeImpact = impact.envelopes.get(transfer.toEnvelopeId);
      if (envelopeImpact) {
        envelopeImpact.change += transfer.amount;
        envelopeImpact.newBalance = (envelopeImpact.currentBalance ?? 0) + envelopeImpact.change;

        const monthlyAmount = envelopeImpact.monthlyAmount ?? 0;
        if (monthlyAmount > 0) {
          envelopeImpact.newFillPercentage = (envelopeImpact.newBalance / monthlyAmount) * 100;
        }
      }
    }
  });

  return impact;
};

/**
 * Generates a summary of the execution plan for display
 * @param {Object} plan - Execution plan
 * @param {Array} envelopes - Available envelopes for name lookup (name optional for display)
 * @returns {Object} Human-readable plan summary
 * Note: EnvelopeData doesn't include name, but it's needed for display purposes.
 * This is a read-only display function, not business logic.
 */
export const generatePlanSummary = (
  plan: ExecutionPlan,
  envelopes: Array<EnvelopeData & { name?: string }> = []
): PlanSummary => {
  const envelopeMap = new Map(envelopes.map((e) => [e.id, e]));

  const summary: PlanSummary = {
    overview: {
      totalAmount: plan.totalToTransfer,
      rulesCount: plan.rulesCount,
      transfersCount: plan.transfersCount,
      remainingCash: plan.finalCash,
      hasErrors: plan.errors.length > 0,
      hasWarnings: plan.warnings.length > 0,
    },
    rulesSummary: plan.rules.map((rule: RuleResult) => ({
      name: rule.ruleName,
      amount: rule.amount,
      targetCount: rule.targetEnvelopes?.length || 0,
      targets:
        rule.targetEnvelopes?.map((id: string) => {
          const envelope = envelopeMap.get(id);
          return envelope?.name ?? id;
        }) || [],
    })),
    transfersSummary: plan.transfers.map((transfer: PlannedTransfer) => ({
      amount: transfer.amount,
      to: envelopeMap.get(transfer.toEnvelopeId)?.name ?? transfer.toEnvelopeId,
      description: transfer.description,
    })),
    errors: plan.errors,
    warnings: plan.warnings,
  };

  return summary;
};
