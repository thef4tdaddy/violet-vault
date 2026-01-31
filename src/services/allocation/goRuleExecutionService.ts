/**
 * Go Rule Execution Service - Issue #1845
 * Type-safe client for Go Autofunding Rule Engine
 * Provides ultra-fast rule execution (<1ms) with JavaScript fallback
 */

export interface AutofundingRule {
  id: string;
  name: string;
  description?: string;
  type: "fixed_amount" | "percentage" | "priority_fill" | "split_remainder" | "conditional";
  trigger: string;
  priority: number;
  enabled: boolean;
  config: RuleConfig;
  createdAt?: string;
  lastExecuted?: string | null;
  executionCount?: number;
}

export interface RuleConfig {
  sourceType: string;
  sourceId?: string | null;
  targetType: string;
  targetId?: string | null;
  targetIds?: string[];
  amount?: number;
  percentage?: number;
  conditions?: Condition[];
  scheduleConfig?: unknown;
}

export interface Condition {
  type: string;
  envelopeId?: string | null;
  value?: number;
  operator?: string | null;
}

export interface EnvelopeData {
  id: string;
  name?: string;
  currentBalance: number;
  monthlyTarget?: number;
  category?: string;
}

export interface AllocationContext {
  unassignedCash: number;
  newIncomeAmount?: number;
  envelopes: EnvelopeData[];
}

export interface RuleAllocation {
  envelopeId: string;
  amountCents: number;
  reason?: string;
  ruleId?: string | null;
}

export interface AutofundingResponse {
  allocations: RuleAllocation[];
  totalAllocatedCents: number;
  remainingCents: number;
  executionTimeMs: number;
  rulesExecuted: number;
}

/**
 * API Error class for autofunding service errors
 */
export class AutofundingServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AutofundingServiceError";
  }
}

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTOFUNDING_ENDPOINT = "/api/autofunding/execute-go";

/**
 * Execute autofunding rules via Go engine
 * Falls back to JavaScript execution if Go engine unavailable
 *
 * @param rules - Rules to execute
 * @param context - Allocation context (envelopes, unassigned cash)
 * @returns Autofunding response with allocations
 *
 * @example
 * ```typescript
 * const result = await executeRulesViaGo(
 *   [
 *     {
 *       id: "rule_1",
 *       type: "percentage",
 *       priority: 10,
 *       enabled: true,
 *       config: { targetId: "env_rent", percentage: 40 }
 *     }
 *   ],
 *   {
 *     unassignedCash: 250000,
 *     envelopes: [{ id: "env_rent", currentBalance: 0 }]
 *   }
 * );
 * ```
 */
export async function executeRulesViaGo(
  rules: AutofundingRule[],
  context: AllocationContext
): Promise<AutofundingResponse> {
  try {
    // Try Go engine first
    const response = await fetch(`${API_BASE_URL}${AUTOFUNDING_ENDPOINT}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rules,
        trigger: "manual",
        context,
      }),
    });

    if (response.ok) {
      return await response.json();
    }

    // Log Go engine failure
    console.warn(
      `Go autofunding engine failed with status ${response.status}, falling back to JavaScript execution`
    );
  } catch (error) {
    console.warn(
      `Go autofunding engine unavailable (${error instanceof Error ? error.message : "unknown error"}), falling back to JavaScript execution`
    );
  }

  // Fallback to JavaScript execution
  return executeRulesViaJavaScript(rules, context);
}

/**
 * Execute rules using JavaScript (fallback implementation)
 * This is a simplified version for when Go engine is unavailable
 *
 * @param rules - Rules to execute
 * @param context - Allocation context
 * @returns Autofunding response
 */
export function executeRulesViaJavaScript(
  rules: AutofundingRule[],
  context: AllocationContext
): AutofundingResponse {
  const startTime = performance.now();

  // Sort by priority (lower = higher priority)
  const sortedRules = [...rules]
    .filter((r) => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  const allocations: RuleAllocation[] = [];
  let remainingCash = context.unassignedCash;

  for (const rule of sortedRules) {
    const ruleAllocations = executeRuleJS(rule, {
      ...context,
      unassignedCash: remainingCash,
    });

    for (const alloc of ruleAllocations) {
      remainingCash -= alloc.amountCents;
      allocations.push(alloc);
    }
  }

  const executionTime = performance.now() - startTime;
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amountCents, 0);

  return {
    allocations,
    totalAllocatedCents: totalAllocated,
    remainingCents: context.unassignedCash - totalAllocated,
    executionTimeMs: executionTime,
    rulesExecuted: sortedRules.length,
  };
}

/**
 * Execute a single rule (JavaScript implementation)
 */
function executeRuleJS(rule: AutofundingRule, context: AllocationContext): RuleAllocation[] {
  switch (rule.type) {
    case "fixed_amount":
      return [executeFixedAmountJS(rule, context)];
    case "percentage":
      return [executePercentageJS(rule, context)];
    case "priority_fill":
      return [executePriorityFillJS(rule, context)];
    case "split_remainder":
      return executeSplitRemainderJS(rule, context);
    case "conditional":
      const result = executeConditionalJS(rule, context);
      return result ? [result] : [];
    default:
      console.warn(`Unknown rule type: ${rule.type}`);
      return [];
  }
}

function executeFixedAmountJS(rule: AutofundingRule, context: AllocationContext): RuleAllocation {
  const amount = Math.min(rule.config.amount || 0, context.unassignedCash);

  return {
    envelopeId: rule.config.targetId || "",
    amountCents: Math.max(0, amount),
    reason: `Fixed: $${(amount / 100).toFixed(2)}`,
    ruleId: rule.id,
  };
}

function executePercentageJS(rule: AutofundingRule, context: AllocationContext): RuleAllocation {
  const baseAmount =
    rule.config.sourceType === "income"
      ? context.newIncomeAmount || context.unassignedCash
      : context.unassignedCash;

  const amount = Math.min(
    Math.round((baseAmount * (rule.config.percentage || 0)) / 100),
    context.unassignedCash
  );

  return {
    envelopeId: rule.config.targetId || "",
    amountCents: Math.max(0, amount),
    reason: `${rule.config.percentage?.toFixed(1)}% of source`,
    ruleId: rule.id,
  };
}

function executePriorityFillJS(
  rule: AutofundingRule,
  context: AllocationContext
): RuleAllocation {
  const envelope = context.envelopes.find((e) => e.id === rule.config.targetId);
  if (!envelope) {
    return {
      envelopeId: rule.config.targetId || "",
      amountCents: 0,
      reason: "Envelope not found",
      ruleId: rule.id,
    };
  }

  const needed = (envelope.monthlyTarget || 0) - envelope.currentBalance;
  const amount = Math.min(needed, context.unassignedCash);

  return {
    envelopeId: rule.config.targetId || "",
    amountCents: Math.max(0, amount),
    reason: "Priority fill to monthly target",
    ruleId: rule.id,
  };
}

function executeSplitRemainderJS(
  rule: AutofundingRule,
  context: AllocationContext
): RuleAllocation[] {
  const targetIds = rule.config.targetIds || [];
  if (targetIds.length === 0) {
    return [];
  }

  const perEnvelope = Math.floor(context.unassignedCash / targetIds.length);
  const remainder = context.unassignedCash % targetIds.length;

  return targetIds.map((targetId, i) => ({
    envelopeId: targetId,
    amountCents: perEnvelope + (i === 0 ? remainder : 0),
    reason: "Even split of remainder",
    ruleId: rule.id,
  }));
}

function executeConditionalJS(
  rule: AutofundingRule,
  context: AllocationContext
): RuleAllocation | null {
  // Check all conditions
  const conditions = rule.config.conditions || [];
  for (const condition of conditions) {
    if (!evaluateConditionJS(condition, context)) {
      return null; // Condition not met
    }
  }

  // All conditions met
  const amount = Math.min(rule.config.amount || 0, context.unassignedCash);

  return {
    envelopeId: rule.config.targetId || "",
    amountCents: Math.max(0, amount),
    reason: "Conditional rule triggered",
    ruleId: rule.id,
  };
}

function evaluateConditionJS(condition: Condition, context: AllocationContext): boolean {
  switch (condition.type) {
    case "balance_less_than": {
      const envelope = context.envelopes.find((e) => e.id === condition.envelopeId);
      return envelope ? envelope.currentBalance < (condition.value || 0) : false;
    }
    case "balance_greater_than": {
      const envelope = context.envelopes.find((e) => e.id === condition.envelopeId);
      return envelope ? envelope.currentBalance > (condition.value || 0) : false;
    }
    case "unassigned_greater_than":
      return context.unassignedCash > (condition.value || 0);
    case "unassigned_less_than":
      return context.unassignedCash < (condition.value || 0);
    default:
      return true; // Unknown conditions pass by default
  }
}
