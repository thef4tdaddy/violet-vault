/**
 * Conversion Helpers - Issue #1846
 * Convert allocation results to reusable autofunding rules
 */

export interface AllocationResult {
  allocations: Array<{
    envelopeId: string;
    amountCents: number;
    reason?: string;
  }>;
  totalAllocatedCents: number;
  strategy: string;
}

export interface AutoFundingRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  lastExecuted: string | null;
  executionCount: number;
  config: {
    sourceType: string;
    sourceId: string | null;
    targetType: string;
    targetId: string | null;
    targetIds: string[];
    amount: number;
    percentage: number;
    conditions: unknown[];
    scheduleConfig: Record<string, unknown>;
  };
}

export interface AllocationToRulesOptions {
  trigger?: "income_detected" | "manual" | "biweekly" | "weekly" | "monthly";
  enabled?: boolean;
  baseRuleName?: string;
}

export const RULE_TYPES = {
  FIXED_AMOUNT: "fixed_amount",
  PERCENTAGE: "percentage",
  PRIORITY_FILL: "priority_fill",
  SPLIT_REMAINDER: "split_remainder",
  CONDITIONAL: "conditional",
} as const;

/**
 * Convert allocation result to reusable autofunding rules
 *
 * @param allocation - Allocation result from Go/Python engine
 * @param paycheckAmountCents - Total paycheck amount (for percentage calculation)
 * @param options - Configuration options
 * @returns Array of autofunding rules
 *
 * @example
 * ```typescript
 * const rules = convertAllocationToRules(
 *   {
 *     allocations: [
 *       { envelopeId: "env_rent", amountCents: 100000 },
 *       { envelopeId: "env_savings", amountCents: 150000 }
 *     ],
 *     strategy: "even_split",
 *     totalAllocatedCents: 250000
 *   },
 *   250000,
 *   { trigger: "income_detected", enabled: false }
 * );
 * ```
 */
export function convertAllocationToRules(
  allocation: AllocationResult,
  paycheckAmountCents: number,
  options: AllocationToRulesOptions = {}
): AutoFundingRule[] {
  const {
    trigger = "income_detected",
    enabled = false, // Disabled by default - user must enable
    baseRuleName = "Paycheck Allocation",
  } = options;

  const rules: AutoFundingRule[] = [];
  const timestamp = new Date().toISOString();

  // Convert each allocation to a rule
  allocation.allocations.forEach((alloc, index) => {
    const percentage = (alloc.amountCents / paycheckAmountCents) * 100;

    rules.push({
      id: `rule_${Date.now()}_${index}`,
      name: `${baseRuleName} → ${alloc.envelopeId} (${percentage.toFixed(1)}%)`,
      description: `Auto-generated from ${allocation.strategy} strategy`,
      type: RULE_TYPES.PERCENTAGE,
      trigger,
      priority: (index + 1) * 10, // 10, 20, 30, etc.
      enabled,
      createdAt: timestamp,
      lastExecuted: null,
      executionCount: 0,
      config: {
        sourceType: "income",
        sourceId: null,
        targetType: "envelope",
        targetId: alloc.envelopeId,
        targetIds: [],
        amount: 0,
        percentage,
        conditions: [],
        scheduleConfig: {},
      },
    });
  });

  return rules;
}

/**
 * Convert Last Split allocation to fixed amount rules
 *
 * @param allocation - Allocation result from last_split strategy
 * @param options - Configuration options
 * @returns Array of fixed amount rules
 */
export function convertLastSplitToRules(
  allocation: AllocationResult,
  options: AllocationToRulesOptions = {}
): AutoFundingRule[] {
  const {
    trigger = "income_detected",
    enabled = false,
    baseRuleName = "Last Split",
  } = options;

  const rules: AutoFundingRule[] = [];
  const timestamp = new Date().toISOString();

  allocation.allocations.forEach((alloc, index) => {
    rules.push({
      id: `rule_${Date.now()}_${index}`,
      name: `${baseRuleName} → ${alloc.envelopeId} ($${(alloc.amountCents / 100).toFixed(2)})`,
      description: `Auto-generated from last_split strategy`,
      type: RULE_TYPES.FIXED_AMOUNT,
      trigger,
      priority: (index + 1) * 10,
      enabled,
      createdAt: timestamp,
      lastExecuted: null,
      executionCount: 0,
      config: {
        sourceType: "income",
        sourceId: null,
        targetType: "envelope",
        targetId: alloc.envelopeId,
        targetIds: [],
        amount: alloc.amountCents,
        percentage: 0,
        conditions: [],
        scheduleConfig: {},
      },
    });
  });

  return rules;
}

/**
 * Convert Target First allocation to priority fill rules
 *
 * @param allocation - Allocation result from target_first strategy
 * @param options - Configuration options
 * @returns Array of priority fill rules (bills) and percentage rules (discretionary)
 */
export function convertTargetFirstToRules(
  allocation: AllocationResult,
  paycheckAmountCents: number,
  options: AllocationToRulesOptions = {}
): AutoFundingRule[] {
  const {
    trigger = "income_detected",
    enabled = false,
    baseRuleName = "Target First",
  } = options;

  const rules: AutoFundingRule[] = [];
  const timestamp = new Date().toISOString();

  allocation.allocations.forEach((alloc, index) => {
    const isBill = alloc.reason?.toLowerCase().includes("bill") || false;
    const percentage = (alloc.amountCents / paycheckAmountCents) * 100;

    rules.push({
      id: `rule_${Date.now()}_${index}`,
      name: `${baseRuleName} → ${alloc.envelopeId} ${isBill ? "(Priority)" : `(${percentage.toFixed(1)}%)`}`,
      description: `Auto-generated from target_first strategy`,
      type: isBill ? RULE_TYPES.PRIORITY_FILL : RULE_TYPES.PERCENTAGE,
      trigger,
      priority: isBill ? index : 100 + index, // Bills get higher priority
      enabled,
      createdAt: timestamp,
      lastExecuted: null,
      executionCount: 0,
      config: {
        sourceType: "income",
        sourceId: null,
        targetType: "envelope",
        targetId: alloc.envelopeId,
        targetIds: [],
        amount: 0,
        percentage: isBill ? 0 : percentage,
        conditions: [],
        scheduleConfig: {},
      },
    });
  });

  return rules;
}

/**
 * Smart conversion based on strategy type
 * Automatically picks the best rule type for the strategy
 */
export function smartConvertAllocationToRules(
  allocation: AllocationResult,
  paycheckAmountCents: number,
  options: AllocationToRulesOptions = {}
): AutoFundingRule[] {
  switch (allocation.strategy) {
    case "last_split":
      return convertLastSplitToRules(allocation, options);
    case "target_first":
      return convertTargetFirstToRules(allocation, paycheckAmountCents, options);
    case "even_split":
    case "smart_split":
    default:
      return convertAllocationToRules(allocation, paycheckAmountCents, options);
  }
}
