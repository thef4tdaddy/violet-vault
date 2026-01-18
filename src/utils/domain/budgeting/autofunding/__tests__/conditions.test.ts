/**
 * Auto-Funding Conditions Utilities Tests
 * Tests for the extracted condition evaluation utilities from Issue #506
 */
import { describe, it, expect } from "vitest";
import {
  evaluateConditions,
  evaluateDateRangeCondition,
  evaluateTransactionAmountCondition,
  checkSchedule,
  checkPaydaySchedule,
  shouldRuleExecute,
  createDefaultCondition,
  validateCondition,
  getConditionDescription,
  filterConditions,
  type Condition,
  type ExecutionContext,
  type Envelope,
} from "../conditions";
import { CONDITION_TYPES, TRIGGER_TYPES, RULE_TYPES } from "../rules";

describe("conditions", () => {
  const mockContext: ExecutionContext = {
    trigger: TRIGGER_TYPES.MANUAL,
    currentDate: "2024-01-15T12:00:00.000Z",
    data: {
      envelopes: [
        {
          id: "env1",
          name: "Groceries",
          currentBalance: 150,
          monthlyAmount: 400,
        },
        { id: "env2", name: "Rent", currentBalance: 800, monthlyAmount: 1200 },
      ],
      unassignedCash: 500,
      newIncomeAmount: 2500,
    },
  };

  describe("evaluateConditions", () => {
    it("should return true for empty conditions array", () => {
      expect(evaluateConditions([], mockContext)).toBe(true);
      expect(evaluateConditions(null as unknown as Condition[], mockContext)).toBe(true);
      expect(evaluateConditions(undefined as unknown as Condition[], mockContext)).toBe(true);
    });

    it("should evaluate BALANCE_LESS_THAN condition for unassigned cash", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          value: 600,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          value: 400,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should evaluate BALANCE_LESS_THAN condition for specific envelope", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          envelopeId: "env1",
          value: 200,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          envelopeId: "env1",
          value: 100,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should evaluate BALANCE_GREATER_THAN condition for unassigned cash", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          value: 400,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          value: 600,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should evaluate BALANCE_GREATER_THAN condition for specific envelope", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          envelopeId: "env2",
          value: 700,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          envelopeId: "env2",
          value: 900,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should evaluate UNASSIGNED_ABOVE condition", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.UNASSIGNED_ABOVE,
          value: 300,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.UNASSIGNED_ABOVE,
          value: 700,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should evaluate multiple conditions with AND logic", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          value: 400,
        },
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          envelopeId: "env1",
          value: 200,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);

      const conditions2 = [
        {
          type: CONDITION_TYPES.BALANCE_GREATER_THAN,
          value: 400,
        },
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          envelopeId: "env1",
          value: 100,
        },
      ];
      expect(evaluateConditions(conditions2, mockContext)).toBe(false);
    });

    it("should return true for unknown condition types", () => {
      const conditions = [
        {
          type: "unknown_condition",
          value: 100,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(true);
    });

    it("should handle missing envelope gracefully", () => {
      const conditions = [
        {
          type: CONDITION_TYPES.BALANCE_LESS_THAN,
          envelopeId: "nonexistent",
          value: 100,
        },
      ];
      expect(evaluateConditions(conditions, mockContext)).toBe(false);
    });
  });

  describe("evaluateDateRangeCondition", () => {
    it("should return true if current date is within range", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-31T23:59:59.999Z",
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(true);
    });

    it("should return false if current date is before range", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-02-01T00:00:00.000Z",
        endDate: "2024-02-28T23:59:59.999Z",
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(false);
    });

    it("should return false if current date is after range", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2023-12-01T00:00:00.000Z",
        endDate: "2023-12-31T23:59:59.999Z",
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(false);
    });

    it("should return true if no date range specified", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(true);
    });

    it("should handle edge case where current date equals start date", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-01-15T12:00:00.000Z",
        endDate: "2024-01-31T23:59:59.999Z",
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(true);
    });

    it("should handle edge case where current date equals end date", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-15T12:00:00.000Z",
      } as Condition;
      expect(evaluateDateRangeCondition(condition, "2024-01-15T12:00:00.000Z")).toBe(true);
    });
  });

  describe("evaluateTransactionAmountCondition", () => {
    const contextWithIncome: ExecutionContext = {
      ...mockContext,
      data: { ...mockContext.data, newIncomeAmount: 1000 },
    };

    it("should evaluate greater_than operator", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than",
        value: 500,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);

      const condition2 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than",
        value: 1500,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition2, contextWithIncome)).toBe(false);
    });

    it("should evaluate less_than operator", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "less_than",
        value: 1500,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);

      const condition2 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "less_than",
        value: 500,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition2, contextWithIncome)).toBe(false);
    });

    it("should evaluate equals operator", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "equals",
        value: 1000,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);

      const condition2 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "equals",
        value: 999.99,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition2, contextWithIncome)).toBe(true);

      const condition3 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "equals",
        value: 1001,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition3, contextWithIncome)).toBe(false);
    });

    it("should evaluate greater_than_or_equal operator", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than_or_equal",
        value: 1000,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);

      const condition2 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than_or_equal",
        value: 1001,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition2, contextWithIncome)).toBe(false);
    });

    it("should evaluate less_than_or_equal operator", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "less_than_or_equal",
        value: 1000,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);

      const condition2 = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "less_than_or_equal",
        value: 999,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition2, contextWithIncome)).toBe(false);
    });

    it("should return false if no income amount provided", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than",
        value: 500,
      } as Condition;
      const contextWithoutIncome: ExecutionContext = {
        ...mockContext,
        data: { ...mockContext.data, newIncomeAmount: undefined },
      };
      expect(evaluateTransactionAmountCondition(condition, contextWithoutIncome)).toBe(false);
    });

    it("should return true for unknown operators", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "unknown",
        value: 500,
      } as Condition;
      expect(evaluateTransactionAmountCondition(condition, contextWithIncome)).toBe(true);
    });
  });

  describe("checkSchedule", () => {
    const currentDate = "2024-01-15T12:00:00.000Z";

    it("should return true if never executed", () => {
      expect(checkSchedule(TRIGGER_TYPES.WEEKLY, null, currentDate)).toBe(true);
      expect(checkSchedule(TRIGGER_TYPES.MONTHLY, undefined, currentDate)).toBe(true);
    });

    it("should check weekly schedule", () => {
      const lastExecuted = "2024-01-01T12:00:00.000Z"; // 14 days ago
      expect(checkSchedule(TRIGGER_TYPES.WEEKLY, lastExecuted, currentDate)).toBe(true);

      const recentExecution = "2024-01-10T12:00:00.000Z"; // 5 days ago
      expect(checkSchedule(TRIGGER_TYPES.WEEKLY, recentExecution, currentDate)).toBe(false);
    });

    it("should check biweekly schedule", () => {
      const lastExecuted = "2024-01-01T12:00:00.000Z"; // 14 days ago
      expect(checkSchedule(TRIGGER_TYPES.BIWEEKLY, lastExecuted, currentDate)).toBe(true);

      const recentExecution = "2024-01-05T12:00:00.000Z"; // 10 days ago
      expect(checkSchedule(TRIGGER_TYPES.BIWEEKLY, recentExecution, currentDate)).toBe(false);
    });

    it("should check monthly schedule", () => {
      const lastExecuted = "2023-12-15T12:00:00.000Z"; // 31 days ago
      expect(checkSchedule(TRIGGER_TYPES.MONTHLY, lastExecuted, currentDate)).toBe(true);

      const recentExecution = "2024-01-01T12:00:00.000Z"; // 14 days ago
      expect(checkSchedule(TRIGGER_TYPES.MONTHLY, recentExecution, currentDate)).toBe(false);
    });

    it("should return true for manual and other trigger types", () => {
      const lastExecuted = "2024-01-14T12:00:00.000Z"; // 1 day ago
      expect(checkSchedule(TRIGGER_TYPES.MANUAL, lastExecuted, currentDate)).toBe(true);
      expect(checkSchedule(TRIGGER_TYPES.INCOME_DETECTED, lastExecuted, currentDate)).toBe(true);
    });
  });

  describe("checkPaydaySchedule", () => {
    it("should return true if 14 or more days have passed", () => {
      const lastExecuted = new Date("2024-01-01T12:00:00.000Z");
      const now = new Date("2024-01-15T12:00:00.000Z");
      expect(checkPaydaySchedule(lastExecuted, now)).toBe(true);
    });

    it("should return false if less than 14 days have passed", () => {
      const lastExecuted = new Date("2024-01-10T12:00:00.000Z");
      const now = new Date("2024-01-15T12:00:00.000Z");
      expect(checkPaydaySchedule(lastExecuted, now)).toBe(false);
    });
  });

  describe("shouldRuleExecute", () => {
    const mockRule = {
      enabled: true,
      trigger: TRIGGER_TYPES.MANUAL,
      type: RULE_TYPES.FIXED_AMOUNT,
      lastExecuted: null,
      config: { conditions: [] },
    };

    it("should return false for disabled rules", () => {
      const rule = { ...mockRule, enabled: false };
      expect(shouldRuleExecute(rule, mockContext)).toBe(false);
    });

    it("should return false for trigger mismatch", () => {
      const rule = { ...mockRule, trigger: TRIGGER_TYPES.WEEKLY };
      const context = { ...mockContext, trigger: TRIGGER_TYPES.MONTHLY };
      expect(shouldRuleExecute(rule, context)).toBe(false);
    });

    it("should return true for manual trigger rules regardless of context trigger", () => {
      const rule = { ...mockRule, trigger: TRIGGER_TYPES.MANUAL };
      const context = {
        ...mockContext,
        trigger: TRIGGER_TYPES.INCOME_DETECTED,
      };
      expect(shouldRuleExecute(rule, context)).toBe(true);
    });

    it("should check schedule for time-based triggers", () => {
      const rule = {
        ...mockRule,
        trigger: TRIGGER_TYPES.WEEKLY,
        lastExecuted: "2024-01-10T12:00:00.000Z", // 5 days ago
      };
      const context = { ...mockContext, trigger: TRIGGER_TYPES.WEEKLY };
      expect(shouldRuleExecute(rule, context)).toBe(false);
    });

    it("should evaluate conditions for conditional rules", () => {
      const rule = {
        ...mockRule,
        type: "conditional",
        config: {
          conditions: [
            {
              type: CONDITION_TYPES.BALANCE_GREATER_THAN,
              value: 400,
            },
          ],
        },
      };
      expect(shouldRuleExecute(rule, mockContext)).toBe(true);

      const rule2 = {
        ...mockRule,
        type: "conditional",
        config: {
          conditions: [
            {
              type: CONDITION_TYPES.BALANCE_GREATER_THAN,
              value: 600,
            },
          ],
        },
      };
      expect(shouldRuleExecute(rule2, mockContext)).toBe(false);
    });

    it("should return true for matching trigger and enabled rule", () => {
      const rule = { ...mockRule };
      expect(shouldRuleExecute(rule, mockContext)).toBe(true);
    });
  });

  describe("createDefaultCondition", () => {
    it("should create default condition with BALANCE_LESS_THAN type", () => {
      const condition = createDefaultCondition();
      expect(condition).toMatchObject({
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        envelopeId: null,
        value: 0,
        operator: "greater_than",
        startDate: null,
        endDate: null,
      });
      expect(condition.id).toMatch(/^condition_\d+_[a-z0-9]{9}$/);
    });

    it("should create condition with specified type", () => {
      const condition = createDefaultCondition(CONDITION_TYPES.UNASSIGNED_ABOVE);
      expect(condition.type).toBe(CONDITION_TYPES.UNASSIGNED_ABOVE);
    });
  });

  describe("validateCondition", () => {
    it("should validate condition type requirement", () => {
      const condition = { value: 100 };
      const result = validateCondition(condition as Partial<Condition> as Condition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid condition type is required");
    });

    it("should validate balance conditions", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        value: -100,
      };
      const result = validateCondition(condition as Condition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Balance conditions require a non-negative value");
    });

    it("should validate date range conditions", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-01-15T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
      };
      const result = validateCondition(condition as Condition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Start date must be before end date");
    });

    it("should validate transaction amount conditions", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        value: undefined, // Changed from 0 to undefined to actually trigger validation error
        operator: "invalid_operator",
      };
      const result = validateCondition(condition as Condition);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Transaction amount conditions require a value");
      expect(result.errors).toContain("Transaction amount conditions require a valid operator");
    });

    it("should validate complete valid condition", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        value: 100,
      };
      const result = validateCondition(condition);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("getConditionDescription", () => {
    const envelopes: Envelope[] = [
      { id: "env1", name: "Groceries", currentBalance: 0 },
      { id: "env2", name: "Rent", currentBalance: 0 },
    ];

    it("should describe BALANCE_LESS_THAN for unassigned cash", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        value: 100,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Unassigned cash < $100");
    });

    it("should describe BALANCE_LESS_THAN for specific envelope", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        envelopeId: "env1",
        value: 50,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Groceries balance < $50");
    });

    it("should describe BALANCE_GREATER_THAN conditions", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_GREATER_THAN,
        value: 200,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Unassigned cash > $200");
    });

    it("should describe UNASSIGNED_ABOVE conditions", () => {
      const condition = {
        type: CONDITION_TYPES.UNASSIGNED_ABOVE,
        value: 300,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Unassigned cash > $300");
    });

    it("should describe DATE_RANGE conditions", () => {
      const condition = {
        type: CONDITION_TYPES.DATE_RANGE,
        value: 0,
        startDate: "2024-01-01T00:00:00.000Z",
        endDate: "2024-01-31T23:59:59.999Z",
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toContain("Between");
    });

    it("should describe TRANSACTION_AMOUNT conditions", () => {
      const condition = {
        type: CONDITION_TYPES.TRANSACTION_AMOUNT,
        operator: "greater_than",
        value: 1000,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Transaction amount > $1000");
    });

    it("should handle unknown condition types", () => {
      const condition = {
        type: "unknown_type",
        value: 0,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Unknown condition");
    });

    it("should handle missing envelope", () => {
      const condition = {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        envelopeId: "nonexistent",
        value: 100,
      } as Condition;
      expect(getConditionDescription(condition, envelopes)).toBe("Unknown Envelope balance < $100");
    });
  });

  describe("filterConditions", () => {
    const conditions = [
      {
        id: "1",
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
        envelopeId: "env1",
        value: 100,
      },
      {
        id: "2",
        type: CONDITION_TYPES.BALANCE_GREATER_THAN,
        envelopeId: "env2",
        value: 200,
      },
      {
        id: "3",
        type: CONDITION_TYPES.UNASSIGNED_ABOVE,
        value: 300,
      },
    ];

    it("should return all conditions when no filters applied", () => {
      expect(filterConditions(conditions)).toEqual(conditions);
    });

    it("should filter by condition type", () => {
      const filtered = filterConditions(conditions, {
        type: CONDITION_TYPES.BALANCE_LESS_THAN,
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should filter by envelope ID", () => {
      const filtered = filterConditions(conditions, { envelopeId: "env2" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should combine multiple filters", () => {
      const filtered = filterConditions(conditions, {
        type: CONDITION_TYPES.BALANCE_GREATER_THAN,
        envelopeId: "env2",
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should return empty array when no matches", () => {
      const filtered = filterConditions(conditions, {
        envelopeId: "nonexistent",
      });
      expect(filtered).toHaveLength(0);
    });
  });
});
