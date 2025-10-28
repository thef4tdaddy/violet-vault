/**
 * Auto-Funding Condition Evaluation Utilities
 * Pure functions for evaluating rule conditions and schedules
 * Extracted from autoFundingEngine.js for Issue #506
 */

import { CONDITION_TYPES, TRIGGER_TYPES } from "./rules.ts";

/**
 * Envelope interface
 */
export interface Envelope {
  id: string;
  currentBalance: number;
  [key: string]: unknown;
}

/**
 * Condition interface
 */
export interface Condition {
  id?: string;
  type: string;
  envelopeId?: string | null;
  value: number;
  operator?: string;
  startDate?: string | null;
  endDate?: string | null;
}

/**
 * Execution context
 */
export interface ExecutionContext {
  data: {
    envelopes: Envelope[];
    unassignedCash: number;
    newIncomeAmount?: number;
  };
  currentDate: string;
  trigger: string;
}

/**
 * Rule configuration
 */
export interface Rule {
  enabled: boolean;
  trigger: string;
  type: string;
  lastExecuted?: string;
  config?: {
    conditions?: Condition[];
  };
}

/**
 * Filter criteria for conditions
 */
export interface FilterCriteria {
  type?: string;
  envelopeId?: string;
}

/**
 * Evaluates all conditions for a conditional rule
 * @param {Array} conditions - Array of condition objects to evaluate
 * @param {Object} context - Execution context with envelopes, unassigned cash, etc.
 * @returns {boolean} True if all conditions are met
 */
export const evaluateConditions = (
  conditions: Condition[],
  context: ExecutionContext
): boolean => {
  if (!conditions || conditions.length === 0) {
    return true;
  }

  const { envelopes, unassignedCash } = context.data;

  return conditions.every((condition) => {
    switch (condition.type) {
      case CONDITION_TYPES.BALANCE_LESS_THAN:
        if (condition.envelopeId) {
          const envelope = envelopes.find((e) => e.id === condition.envelopeId);
          return envelope && envelope.currentBalance < condition.value;
        }
        return unassignedCash < condition.value;

      case CONDITION_TYPES.BALANCE_GREATER_THAN:
        if (condition.envelopeId) {
          const envelope = envelopes.find((e) => e.id === condition.envelopeId);
          return envelope && envelope.currentBalance > condition.value;
        }
        return unassignedCash > condition.value;

      case CONDITION_TYPES.UNASSIGNED_ABOVE:
        return unassignedCash > condition.value;

      case CONDITION_TYPES.DATE_RANGE:
        return evaluateDateRangeCondition(condition, context.currentDate);

      case CONDITION_TYPES.TRANSACTION_AMOUNT:
        return evaluateTransactionAmountCondition(condition, context);

      default:
        return true;
    }
  });
};

/**
 * Evaluates a date range condition
 * @param {Object} condition - Date range condition
 * @param {string} currentDate - Current date in ISO string format
 * @returns {boolean} True if current date is within range
 */
export const evaluateDateRangeCondition = (condition: Condition, currentDate: string): boolean => {
  if (!condition.startDate || !condition.endDate) {
    return true;
  }

  const current = new Date(currentDate);
  const start = new Date(condition.startDate);
  const end = new Date(condition.endDate);

  return current >= start && current <= end;
};

/**
 * Evaluates a transaction amount condition
 * @param {Object} condition - Transaction amount condition
 * @param {Object} context - Execution context
 * @returns {boolean} True if transaction amount meets condition
 */
export const evaluateTransactionAmountCondition = (
  condition: Condition,
  context: ExecutionContext
): boolean => {
  const { newIncomeAmount } = context.data;

  if (newIncomeAmount === undefined) {
    return false;
  }

  switch (condition.operator) {
    case "greater_than":
      return newIncomeAmount > condition.value;
    case "less_than":
      return newIncomeAmount < condition.value;
    case "equals":
      return Math.abs(newIncomeAmount - condition.value) < 0.01;
    case "greater_than_or_equal":
      return newIncomeAmount >= condition.value;
    case "less_than_or_equal":
      return newIncomeAmount <= condition.value;
    default:
      return true;
  }
};

/**
 * Checks if a rule should execute based on schedule
 * @param {string} trigger - Rule trigger type
 * @param {string} lastExecuted - Last execution date in ISO string format
 * @param {string} currentDate - Current date in ISO string format
 * @returns {boolean} True if rule should execute based on schedule
 */
export const checkSchedule = (
  trigger: string,
  lastExecuted: string | undefined,
  currentDate: string
): boolean => {
  if (!lastExecuted) return true;

  const lastExecutedDate = new Date(lastExecuted);
  const now = new Date(currentDate);
  const daysDiff = (now.getTime() - lastExecutedDate.getTime()) / (1000 * 60 * 60 * 24);

  switch (trigger) {
    case TRIGGER_TYPES.WEEKLY:
      return daysDiff >= 7;
    case TRIGGER_TYPES.BIWEEKLY:
      return daysDiff >= 14;
    case TRIGGER_TYPES.MONTHLY:
      return daysDiff >= 28; // Approximate monthly
    case TRIGGER_TYPES.PAYDAY:
      return checkPaydaySchedule(lastExecutedDate, now);
    default:
      return true;
  }
};

/**
 * Checks if it's time for payday-based execution
 * @param {Date} lastExecuted - Last execution date
 * @param {Date} now - Current date
 * @returns {boolean} True if payday condition is met
 */
export const checkPaydaySchedule = (lastExecuted: Date, now: Date): boolean => {
  // Basic payday logic - could be enhanced with more sophisticated detection
  const daysDiff = (now.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24);

  // Assume bi-weekly payday pattern is most common
  return daysDiff >= 14;
};

/**
 * Determines if a rule should execute based on all criteria
 * @param {Object} rule - Rule configuration
 * @param {Object} context - Execution context
 * @returns {boolean} True if rule should execute
 */
export const shouldRuleExecute = (rule: Rule, context: ExecutionContext): boolean => {
  if (!rule.enabled) {
    return false;
  }

  // Check trigger compatibility
  if (rule.trigger !== context.trigger && rule.trigger !== TRIGGER_TYPES.MANUAL) {
    return false;
  }

  // Check schedule for time-based triggers
  if (
    [
      TRIGGER_TYPES.WEEKLY,
      TRIGGER_TYPES.BIWEEKLY,
      TRIGGER_TYPES.MONTHLY,
      TRIGGER_TYPES.PAYDAY,
    ].includes(rule.trigger)
  ) {
    if (!checkSchedule(rule.trigger, rule.lastExecuted, context.currentDate)) {
      return false;
    }
  }

  // Check conditions for conditional rules
  if (rule.type === "conditional") {
    return evaluateConditions(rule.config.conditions, context);
  }

  return true;
};

/**
 * Creates a default condition configuration
 * @param {string} type - Condition type
 * @returns {Object} Default condition configuration
 */
export const createDefaultCondition = (type = CONDITION_TYPES.BALANCE_LESS_THAN): Condition => ({
  id: `condition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  envelopeId: null,
  value: 0,
  operator: "greater_than",
  startDate: null,
  endDate: null,
});

/**
 * Validate balance-related condition
 */
const validateBalanceCondition = (condition: Condition): string | null => {
  if (condition.value === undefined || condition.value === null || condition.value < 0) {
    return "Balance conditions require a non-negative value";
  }
  return null;
};

/**
 * Validate date range condition
 */
const validateDateRangeCondition = (condition: Condition): string | null => {
  if (!condition.startDate || !condition.endDate) {
    return "Date range conditions require both start and end dates";
  }
  if (new Date(condition.startDate) >= new Date(condition.endDate)) {
    return "Start date must be before end date";
  }
  return null;
};

/**
 * Validate transaction amount condition
 */
const validateTransactionAmountCondition = (condition: Condition): string[] => {
  const errors = [];

  if (condition.value === undefined || condition.value === null) {
    errors.push("Transaction amount conditions require a value");
  }

  const validOperators = [
    "greater_than",
    "less_than",
    "equals",
    "greater_than_or_equal",
    "less_than_or_equal",
  ];

  if (!condition.operator || !validOperators.includes(condition.operator)) {
    errors.push("Transaction amount conditions require a valid operator");
  }

  return errors;
};

/**
 * Validates a condition configuration
 * @param {Object} condition - Condition to validate
 * @returns {Object} Validation result with isValid flag and errors
 */
export const validateCondition = (condition: Condition): { isValid: boolean; errors: string[] } => {
  const errors = [];

  if (!condition.type || !Object.values(CONDITION_TYPES).includes(condition.type)) {
    errors.push("Valid condition type is required");
  }

  switch (condition.type) {
    case CONDITION_TYPES.BALANCE_LESS_THAN:
    case CONDITION_TYPES.BALANCE_GREATER_THAN:
    case CONDITION_TYPES.UNASSIGNED_ABOVE: {
      const error = validateBalanceCondition(condition);
      if (error) errors.push(error);
      break;
    }

    case CONDITION_TYPES.DATE_RANGE: {
      const error = validateDateRangeCondition(condition);
      if (error) errors.push(error);
      break;
    }

    case CONDITION_TYPES.TRANSACTION_AMOUNT: {
      const amountErrors = validateTransactionAmountCondition(condition);
      errors.push(...amountErrors);
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Gets a human-readable description of a condition
 * @param {Object} condition - Condition to describe
 * @param {Array} envelopes - Available envelopes for name lookup
 * @returns {string} Human-readable condition description
 */
export const getConditionDescription = (condition: Condition, envelopes: Envelope[] = []): string => {
  switch (condition.type) {
    case CONDITION_TYPES.BALANCE_LESS_THAN:
      if (condition.envelopeId) {
        const envelope = envelopes.find((e) => e.id === condition.envelopeId);
        const envelopeName = envelope?.name || "Unknown Envelope";
        return `${envelopeName} balance < $${condition.value}`;
      }
      return `Unassigned cash < $${condition.value}`;

    case CONDITION_TYPES.BALANCE_GREATER_THAN:
      if (condition.envelopeId) {
        const envelope = envelopes.find((e) => e.id === condition.envelopeId);
        const envelopeName = envelope?.name || "Unknown Envelope";
        return `${envelopeName} balance > $${condition.value}`;
      }
      return `Unassigned cash > $${condition.value}`;

    case CONDITION_TYPES.UNASSIGNED_ABOVE:
      return `Unassigned cash > $${condition.value}`;

    case CONDITION_TYPES.DATE_RANGE: {
      const startDate = new Date(condition.startDate).toLocaleDateString();
      const endDate = new Date(condition.endDate).toLocaleDateString();
      return `Between ${startDate} and ${endDate}`;
    }

    case CONDITION_TYPES.TRANSACTION_AMOUNT: {
      const operators = {
        greater_than: ">",
        less_than: "<",
        equals: "=",
        greater_than_or_equal: "≥",
        less_than_or_equal: "≤",
      };
      const operator = operators[condition.operator] || condition.operator;
      return `Transaction amount ${operator} $${condition.value}`;
    }

    default:
      return "Unknown condition";
  }
};

/**
 * Filters conditions based on criteria
 * @param {Array} conditions - Conditions to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered conditions
 */
export const filterConditions = (
  conditions: Condition[],
  filters: FilterCriteria = {}
): Condition[] => {
  let filtered = [...conditions];

  if (filters.type) {
    filtered = filtered.filter((condition) => condition.type === filters.type);
  }

  if (filters.envelopeId) {
    filtered = filtered.filter((condition) => condition.envelopeId === filters.envelopeId);
  }

  return filtered;
};
