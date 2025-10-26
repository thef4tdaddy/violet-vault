/**
 * Auto-Funding Rules Utilities
 * Pure functions for rule processing and validation
 * Extracted from autoFundingEngine.js for Issue #506
 */

// TypeScript interfaces for auto-funding rules
export interface RuleConfig {
  sourceType: 'unassigned' | 'envelope' | 'income';
  sourceId: string | null;
  targetType: 'envelope' | 'multiple';
  targetId: string | null;
  targetIds: string[];
  amount: number;
  percentage: number;
  conditions: RuleCondition[];
  scheduleConfig: Record<string, unknown>;
}

export interface RuleCondition {
  type: string;
  value: unknown;
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
  config: RuleConfig;
}

export interface AutoFundingContext {
  data: {
    unassignedCash: number;
    newIncomeAmount?: number;
    envelopes: EnvelopeData[];
  };
}

export interface EnvelopeData {
  id: string;
  currentBalance?: number;
  monthlyAmount?: number;
}

export interface RuleStatistics {
  total: number;
  enabled: number;
  disabled: number;
  byType: Record<string, number>;
  byTrigger: Record<string, number>;
  totalExecutions: number;
  lastExecuted: string | null;
}

export interface RuleSummary {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  type: string;
  trigger: string;
  description: string;
  targetDescription: string;
}

// Rule Types
export const RULE_TYPES = {
  FIXED_AMOUNT: "fixed_amount", // "Move $200 to Rent"
  PERCENTAGE: "percentage", // "Move 30% to Savings"
  CONDITIONAL: "conditional", // "If balance < $50, move $100"
  SPLIT_REMAINDER: "split_remainder", // "Split leftover funds evenly"
  PRIORITY_FILL: "priority_fill", // "Fill Rent before other envelopes"
};

// Trigger Types
export const TRIGGER_TYPES = {
  MANUAL: "manual", // User clicks "Run Rules"
  INCOME_DETECTED: "income_detected", // New positive transaction
  MONTHLY: "monthly", // Monthly schedule
  WEEKLY: "weekly", // Weekly schedule
  BIWEEKLY: "biweekly", // Biweekly schedule
  PAYDAY: "payday", // Detected payday pattern
};

// Condition Types for Conditional Rules
export const CONDITION_TYPES = {
  BALANCE_LESS_THAN: "balance_less_than",
  BALANCE_GREATER_THAN: "balance_greater_than",
  DATE_RANGE: "date_range",
  TRANSACTION_AMOUNT: "transaction_amount",
  UNASSIGNED_ABOVE: "unassigned_above",
};

// Income Detection Types
export const INCOME_DETECTION_TYPES = {
  AMOUNT_THRESHOLD: "amount_threshold", // Income >= certain amount
  DESCRIPTION_KEYWORDS: "description_keywords", // Contains keywords like "payroll", "salary"
  RECURRING_PATTERN: "recurring_pattern", // Recurring positive amounts
  BANK_CATEGORY: "bank_category", // Categorized as income by bank
};

/**
 * Creates a default auto-funding rule configuration
 * @returns {Object} Default rule configuration
 */
export const createDefaultRule = () => ({
  id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: "Untitled Rule",
  description: "",
  type: RULE_TYPES.FIXED_AMOUNT,
  trigger: TRIGGER_TYPES.MANUAL,
  priority: 100, // Lower = higher priority
  enabled: true,
  createdAt: new Date().toISOString(),
  lastExecuted: null,
  executionCount: 0,
  config: {
    sourceType: "unassigned", // 'unassigned' | 'envelope' | 'income'
    sourceId: null,
    targetType: "envelope", // 'envelope' | 'multiple'
    targetId: null,
    targetIds: [],
    amount: 0,
    percentage: 0,
    conditions: [],
    scheduleConfig: {},
  },
});

/**
 * Validates a rule configuration
 */
export const validateRule = (ruleConfig: Partial<AutoFundingRule>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  if (!ruleConfig.name?.trim()) {
    errors.push("Rule name is required");
  }

  if (!ruleConfig.type || !Object.values(RULE_TYPES).includes(ruleConfig.type)) {
    errors.push("Valid rule type is required");
  }

  if (!ruleConfig.trigger || !Object.values(TRIGGER_TYPES).includes(ruleConfig.trigger)) {
    errors.push("Valid trigger type is required");
  }

  // Type-specific validation
  switch (ruleConfig.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      if (!ruleConfig.config?.amount || ruleConfig.config.amount <= 0) {
        errors.push("Fixed amount rules require a positive amount");
      }
      break;

    case RULE_TYPES.PERCENTAGE:
      if (
        !ruleConfig.config?.percentage ||
        ruleConfig.config.percentage <= 0 ||
        ruleConfig.config.percentage > 100
      ) {
        errors.push("Percentage rules require a percentage between 0 and 100");
      }
      break;

    case RULE_TYPES.CONDITIONAL:
      if (!ruleConfig.config?.conditions || ruleConfig.config.conditions.length === 0) {
        errors.push("Conditional rules require at least one condition");
      }
      break;

    case RULE_TYPES.PRIORITY_FILL:
      if (!ruleConfig.config?.targetId) {
        errors.push("Priority fill rules require a target envelope");
      }
      break;
  }

  // Target validation
  if (ruleConfig.config?.targetType === "envelope" && !ruleConfig.config?.targetId) {
    errors.push("Single envelope rules require a target envelope");
  }

  if (
    ruleConfig.config?.targetType === "multiple" &&
    (!ruleConfig.config?.targetIds || ruleConfig.config.targetIds.length === 0)
  ) {
    errors.push("Multiple envelope rules require at least one target envelope");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculates the funding amount for a rule based on context
 */
export const calculateFundingAmount = (rule: AutoFundingRule, context: AutoFundingContext): number => {
  const { unassignedCash } = context.data;

  switch (rule.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return Math.min(rule.config.amount, unassignedCash);

    case RULE_TYPES.PERCENTAGE: {
      const baseAmount = getBaseAmountForPercentage(rule, context);
      return Math.round(((baseAmount * rule.config.percentage) / 100) * 100) / 100;
    }

    case RULE_TYPES.PRIORITY_FILL:
      return calculatePriorityFillAmount(rule, context);

    case RULE_TYPES.SPLIT_REMAINDER:
      return unassignedCash; // Return total available cash for splitting

    default:
      return 0;
  }
};

/**
 * Gets base amount for percentage calculations
 */
export const getBaseAmountForPercentage = (rule: AutoFundingRule, context: AutoFundingContext): number => {
  const { envelopes, unassignedCash, newIncomeAmount } = context.data;

  switch (rule.config.sourceType) {
    case "unassigned":
      return unassignedCash;

    case "envelope":
      if (rule.config.sourceId) {
        const envelope = envelopes.find((e) => e.id === rule.config.sourceId);
        return envelope?.currentBalance || 0;
      }
      return 0;

    case "income":
      return newIncomeAmount || unassignedCash;

    default:
      return unassignedCash;
  }
};

/**
 * Calculates priority fill amount
 */
export const calculatePriorityFillAmount = (rule: AutoFundingRule, context: AutoFundingContext): number => {
  const { envelopes, unassignedCash } = context.data;

  if (!rule.config.targetId) return 0;

  const targetEnvelope = envelopes.find((e) => e.id === rule.config.targetId);
  if (!targetEnvelope) return 0;

  const needed = (targetEnvelope.monthlyAmount || 0) - (targetEnvelope.currentBalance || 0);
  return Math.max(0, Math.min(needed, unassignedCash));
};

/**
 * Sorts rules by priority (lower number = higher priority)
 */
export const sortRulesByPriority = (rules: AutoFundingRule[]): AutoFundingRule[] => {
  return [...rules].sort((a, b) => {
    // First by priority (lower number = higher priority)
    const priorityDiff = (a.priority || 100) - (b.priority || 100);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by creation date (older first)
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });
};

interface RuleFilters {
  enabled?: boolean;
  type?: string;
  trigger?: string;
  search?: string;
}

/**
 * Filters rules based on various criteria
 */
export const filterRules = (rules: AutoFundingRule[], filters: RuleFilters = {}): AutoFundingRule[] => {
  let filtered = [...rules];

  if (filters.enabled !== undefined) {
    filtered = filtered.filter((rule) => rule.enabled === filters.enabled);
  }

  if (filters.type) {
    filtered = filtered.filter((rule) => rule.type === filters.type);
  }

  if (filters.trigger) {
    filtered = filtered.filter((rule) => rule.trigger === filters.trigger);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (rule) =>
        (rule.name || "").toLowerCase().includes(searchTerm) ||
        (rule.description || "").toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

/**
 * Gets rule execution statistics
 */
export const getRuleStatistics = (rules: AutoFundingRule[]): RuleStatistics => {
  const stats: RuleStatistics = {
    total: rules.length,
    enabled: 0,
    disabled: 0,
    byType: {},
    byTrigger: {},
    totalExecutions: 0,
    lastExecuted: null,
  };

  rules.forEach((rule) => {
    // Enabled/disabled count
    if (rule.enabled) {
      stats.enabled++;
    } else {
      stats.disabled++;
    }

    // By type
    stats.byType[rule.type] = (stats.byType[rule.type] || 0) + 1;

    // By trigger
    stats.byTrigger[rule.trigger] = (stats.byTrigger[rule.trigger] || 0) + 1;

    // Execution stats
    stats.totalExecutions += rule.executionCount || 0;

    if (rule.lastExecuted) {
      const lastExecuted = new Date(rule.lastExecuted);
      if (!stats.lastExecuted || lastExecuted > new Date(stats.lastExecuted)) {
        stats.lastExecuted = rule.lastExecuted;
      }
    }
  });

  return stats;
};

/**
 * Creates a rule summary for display
 */
export const createRuleSummary = (rule: AutoFundingRule): RuleSummary => {
  const summary: RuleSummary = {
    id: rule.id,
    name: rule.name,
    enabled: rule.enabled,
    priority: rule.priority || 100,
    type: rule.type,
    trigger: rule.trigger,
    description: "",
    targetDescription: "",
  };

  // Create human-readable description
  switch (rule.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      summary.description = `Move $${rule.config.amount || 0}`;
      break;

    case RULE_TYPES.PERCENTAGE:
      summary.description = `Move ${rule.config.percentage || 0}%`;
      break;

    case RULE_TYPES.PRIORITY_FILL:
      summary.description = "Fill to monthly amount";
      break;

    case RULE_TYPES.SPLIT_REMAINDER:
      summary.description = "Split remaining funds";
      break;

    case RULE_TYPES.CONDITIONAL:
      summary.description = `If ${rule.config.conditions?.length || 0} condition(s) met`;
      break;

    default:
      summary.description = rule.type;
  }

  // Add target description
  if (rule.config.targetType === "envelope") {
    summary.targetDescription = "to envelope";
  } else if (rule.config.targetType === "multiple") {
    const count = rule.config.targetIds?.length || 0;
    summary.targetDescription = `to ${count} envelope${count !== 1 ? "s" : ""}`;
  }

  return summary;
};
