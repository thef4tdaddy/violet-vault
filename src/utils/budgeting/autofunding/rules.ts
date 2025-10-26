/**
 * Auto-Funding Rules Utilities
 * Pure functions for rule processing and validation
 * Extracted from autoFundingEngine.js for Issue #506
 */

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

// Type definitions
interface RuleConfig {
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  trigger?: string;
  priority?: number;
  enabled?: boolean;
  createdAt?: string;
  lastExecuted?: string | null;
  executionCount?: number;
  config?: {
    sourceType?: string;
    sourceId?: string | null;
    targetType?: string;
    targetId?: string | null;
    targetIds?: string[];
    amount?: number;
    percentage?: number;
    conditions?: unknown[];
    scheduleConfig?: Record<string, unknown>;
  };
}

interface RuleContext {
  data: {
    envelopes: Array<{ id: string; currentBalance?: number; monthlyAmount?: number }>;
    unassignedCash: number;
    newIncomeAmount?: number;
  };
}

/**
 * Validate required fields
 */
const validateRequiredFields = (ruleConfig: RuleConfig, errors: string[]) => {
  if (!ruleConfig.name?.trim()) {
    errors.push("Rule name is required");
  }

  if (!ruleConfig.type || !Object.values(RULE_TYPES).includes(ruleConfig.type)) {
    errors.push("Valid rule type is required");
  }

  if (!ruleConfig.trigger || !Object.values(TRIGGER_TYPES).includes(ruleConfig.trigger)) {
    errors.push("Valid trigger type is required");
  }
};

/**
 * Validate fixed amount rule
 */
const validateFixedAmount = (ruleConfig: RuleConfig, errors: string[]) => {
  if (!ruleConfig.config?.amount || ruleConfig.config.amount <= 0) {
    errors.push("Fixed amount rules require a positive amount");
  }
};

/**
 * Validate percentage rule
 */
const validatePercentage = (ruleConfig: RuleConfig, errors: string[]) => {
  if (
    !ruleConfig.config?.percentage ||
    ruleConfig.config.percentage <= 0 ||
    ruleConfig.config.percentage > 100
  ) {
    errors.push("Percentage rules require a percentage between 0 and 100");
  }
};

/**
 * Validate conditional rule
 */
const validateConditional = (ruleConfig: RuleConfig, errors: string[]) => {
  if (!ruleConfig.config?.conditions || ruleConfig.config.conditions.length === 0) {
    errors.push("Conditional rules require at least one condition");
  }
};

/**
 * Validate priority fill rule
 */
const validatePriorityFill = (ruleConfig: RuleConfig, errors: string[]) => {
  if (!ruleConfig.config?.targetId) {
    errors.push("Priority fill rules require a target envelope");
  }
};

/**
 * Validate type-specific requirements
 */
const validateTypeSpecificFields = (ruleConfig: RuleConfig, errors: string[]) => {
  switch (ruleConfig.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      validateFixedAmount(ruleConfig, errors);
      break;
    case RULE_TYPES.PERCENTAGE:
      validatePercentage(ruleConfig, errors);
      break;
    case RULE_TYPES.CONDITIONAL:
      validateConditional(ruleConfig, errors);
      break;
    case RULE_TYPES.PRIORITY_FILL:
      validatePriorityFill(ruleConfig, errors);
      break;
  }
};

/**
 * Validate target configuration
 */
const validateTargetFields = (ruleConfig: RuleConfig, errors: string[]) => {
  if (ruleConfig.config?.targetType === "envelope" && !ruleConfig.config?.targetId) {
    errors.push("Single envelope rules require a target envelope");
  }

  if (
    ruleConfig.config?.targetType === "multiple" &&
    (!ruleConfig.config?.targetIds || ruleConfig.config.targetIds.length === 0)
  ) {
    errors.push("Multiple envelope rules require at least one target envelope");
  }
};

/**
 * Validates a rule configuration
 */
export const validateRule = (ruleConfig: RuleConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  validateRequiredFields(ruleConfig, errors);
  validateTypeSpecificFields(ruleConfig, errors);
  validateTargetFields(ruleConfig, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculates the funding amount for a rule based on context
 */
export const calculateFundingAmount = (rule: RuleConfig, context: RuleContext): number => {
  const { unassignedCash } = context.data;

  switch (rule.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return Math.min(rule.config?.amount || 0, unassignedCash);

    case RULE_TYPES.PERCENTAGE: {
      const baseAmount = getBaseAmountForPercentage(rule, context);
      return Math.round(((baseAmount * (rule.config?.percentage || 0)) / 100) * 100) / 100;
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
export const getBaseAmountForPercentage = (rule: RuleConfig, context: RuleContext): number => {
  const { envelopes, unassignedCash, newIncomeAmount } = context.data;

  switch (rule.config?.sourceType) {
    case "unassigned":
      return unassignedCash;

    case "envelope":
      if (rule.config?.sourceId) {
        const envelope = envelopes.find((e) => e.id === rule.config?.sourceId);
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
export const calculatePriorityFillAmount = (rule: RuleConfig, context: RuleContext): number => {
  const { envelopes, unassignedCash } = context.data;

  if (!rule.config?.targetId) return 0;

  const targetEnvelope = envelopes.find((e) => e.id === rule.config?.targetId);
  if (!targetEnvelope) return 0;

  const needed = (targetEnvelope.monthlyAmount || 0) - (targetEnvelope.currentBalance || 0);
  return Math.max(0, Math.min(needed, unassignedCash));
};

/**
 * Sorts rules by priority (lower number = higher priority)
 */
export const sortRulesByPriority = (rules: RuleConfig[]): RuleConfig[] => {
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

interface RuleStatistics {
  total: number;
  enabled: number;
  disabled: number;
  byType: Record<string, number>;
  byTrigger: Record<string, number>;
  totalExecutions: number;
  lastExecuted: string | null;
}

/**
 * Filters rules based on various criteria
 */
export const filterRules = (rules: RuleConfig[], filters: RuleFilters = {}): RuleConfig[] => {
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
export const getRuleStatistics = (rules: RuleConfig[]): RuleStatistics => {
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

interface RuleSummary {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  type: string;
  trigger: string;
  description: string;
  targetDescription: string;
}

/**
 * Get description for rule type
 */
const getRuleDescription = (rule: RuleConfig): string => {
  switch (rule.type) {
    case RULE_TYPES.FIXED_AMOUNT:
      return `Move $${rule.config?.amount || 0}`;
    case RULE_TYPES.PERCENTAGE:
      return `Move ${rule.config?.percentage || 0}%`;
    case RULE_TYPES.PRIORITY_FILL:
      return "Fill to monthly amount";
    case RULE_TYPES.SPLIT_REMAINDER:
      return "Split remaining funds";
    case RULE_TYPES.CONDITIONAL:
      return `If ${rule.config?.conditions?.length || 0} condition(s) met`;
    default:
      return rule.type || "";
  }
};

/**
 * Get target description for rule
 */
const getTargetDescription = (rule: RuleConfig): string => {
  if (rule.config?.targetType === "envelope") {
    return "to envelope";
  }
  if (rule.config?.targetType === "multiple") {
    const count = rule.config?.targetIds?.length || 0;
    return `to ${count} envelope${count !== 1 ? "s" : ""}`;
  }
  return "";
};

/**
 * Creates a rule summary for display
 */
export const createRuleSummary = (rule: RuleConfig): RuleSummary => {
  return {
    id: rule.id || "",
    name: rule.name || "",
    enabled: rule.enabled || false,
    priority: rule.priority || 100,
    type: rule.type || "",
    trigger: rule.trigger || "",
    description: getRuleDescription(rule),
    targetDescription: getTargetDescription(rule),
  };
};
