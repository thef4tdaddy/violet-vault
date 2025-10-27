/**
 * Auto-Funding Rules Utilities Tests
 * Tests for the extracted rule processing utilities from Issue #506
 */
import { describe, it, expect } from "vitest";
import {
  RULE_TYPES,
  TRIGGER_TYPES,
  CONDITION_TYPES,
  createDefaultRule,
  validateRule,
  calculateFundingAmount,
  getBaseAmountForPercentage,
  calculatePriorityFillAmount,
  sortRulesByPriority,
  filterRules,
  getRuleStatistics,
  createRuleSummary,
  type AutoFundingRule,
  type AutoFundingContext,
} from "../rules";

describe("autoFundingRules", () => {
  describe("constants", () => {
    it("should export all rule types", () => {
      expect(RULE_TYPES.FIXED_AMOUNT).toBe("fixed_amount");
      expect(RULE_TYPES.PERCENTAGE).toBe("percentage");
      expect(RULE_TYPES.CONDITIONAL).toBe("conditional");
      expect(RULE_TYPES.SPLIT_REMAINDER).toBe("split_remainder");
      expect(RULE_TYPES.PRIORITY_FILL).toBe("priority_fill");
    });

    it("should export all trigger types", () => {
      expect(TRIGGER_TYPES.MANUAL).toBe("manual");
      expect(TRIGGER_TYPES.INCOME_DETECTED).toBe("income_detected");
      expect(TRIGGER_TYPES.MONTHLY).toBe("monthly");
      expect(TRIGGER_TYPES.WEEKLY).toBe("weekly");
      expect(TRIGGER_TYPES.BIWEEKLY).toBe("biweekly");
      expect(TRIGGER_TYPES.PAYDAY).toBe("payday");
    });
  });

  describe("createDefaultRule", () => {
    it("should create a rule with all required fields", () => {
      const rule = createDefaultRule();

      expect(rule.id).toMatch(/^rule_\d+_[a-z0-9]+$/);
      expect(rule.name).toBe("Untitled Rule");
      expect(rule.type).toBe(RULE_TYPES.FIXED_AMOUNT);
      expect(rule.trigger).toBe(TRIGGER_TYPES.MANUAL);
      expect(rule.enabled).toBe(true);
      expect(rule.priority).toBe(100);
      expect(rule.createdAt).toBeDefined();
      expect(rule.config).toBeDefined();
    });

    it("should create unique IDs for different rules", () => {
      const rule1 = createDefaultRule();
      const rule2 = createDefaultRule();
      expect(rule1.id).not.toBe(rule2.id);
    });

    it("should include default config", () => {
      const rule = createDefaultRule();

      expect(rule.config.sourceType).toBe("unassigned");
      expect(rule.config.targetType).toBe("envelope");
      expect(rule.config.amount).toBe(0);
      expect(rule.config.percentage).toBe(0);
      expect(rule.config.conditions).toEqual([]);
    });
  });

  describe("validateRule", () => {
    it("should validate a complete valid rule", () => {
      const rule = {
        name: "Test Rule",
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: {
          amount: 100,
          targetType: "envelope",
          targetId: "env1",
        },
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should require rule name", () => {
      const rule = {
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { amount: 100 },
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Rule name is required");
    });

    it("should require valid rule type", () => {
      const rule = {
        name: "Test Rule",
        type: "invalid_type",
        trigger: TRIGGER_TYPES.MANUAL,
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Valid rule type is required");
    });

    it("should validate fixed amount rules", () => {
      const rule = {
        name: "Test Rule",
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { amount: 0 },
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Fixed amount rules require a positive amount");
    });

    it("should validate percentage rules", () => {
      const rule = {
        name: "Test Rule",
        type: RULE_TYPES.PERCENTAGE,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { percentage: 150 }, // Invalid: over 100%
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Percentage rules require a percentage between 0 and 100");
    });

    it("should validate conditional rules", () => {
      const rule = {
        name: "Test Rule",
        type: RULE_TYPES.CONDITIONAL,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { conditions: [] },
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Conditional rules require at least one condition");
    });

    it("should validate target envelope selection", () => {
      const rule = {
        name: "Test Rule",
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: {
          amount: 100,
          targetType: "envelope",
          // Missing targetId
        },
      };

      const result = validateRule(rule as Partial<AutoFundingRule>);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Single envelope rules require a target envelope");
    });
  });

  describe("calculateFundingAmount", () => {
    const mockContext: AutoFundingContext = {
      data: {
        envelopes: [
          { id: "env1", currentBalance: 200, monthlyAmount: 500 },
          { id: "env2", currentBalance: 100, monthlyAmount: 300 },
        ],
        unassignedCash: 1000,
        newIncomeAmount: 2000,
      },
    };

    it("should calculate fixed amount correctly", () => {
      const rule = {
        type: RULE_TYPES.FIXED_AMOUNT,
        config: { amount: 300 },
      };

      const result = calculateFundingAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(300);
    });

    it("should limit fixed amount to available unassigned cash", () => {
      const rule = {
        type: RULE_TYPES.FIXED_AMOUNT,
        config: { amount: 1500 }, // More than available
      };

      const result = calculateFundingAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(1000); // Limited to unassigned cash
    });

    it("should calculate percentage of unassigned cash", () => {
      const rule = {
        type: RULE_TYPES.PERCENTAGE,
        config: { percentage: 20, sourceType: "unassigned" },
      };

      const result = calculateFundingAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(200); // 20% of 1000
    });

    it("should calculate priority fill amount", () => {
      const rule = {
        type: RULE_TYPES.PRIORITY_FILL,
        config: { targetId: "env1" },
      };

      const result = calculateFundingAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(300); // 500 needed - 200 current = 300 needed
    });

    it("should calculate split remainder correctly", () => {
      const rule = {
        type: RULE_TYPES.SPLIT_REMAINDER,
        config: { targetIds: ["env1", "env2", "env3"] }, // 3 targets
      };

      const result = calculateFundingAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(1000); // Returns total unassigned cash for splitting
    });
  });

  describe("getBaseAmountForPercentage", () => {
    const mockContext: AutoFundingContext = {
      data: {
        envelopes: [{ id: "env1", currentBalance: 500 }],
        unassignedCash: 1000,
        newIncomeAmount: 2000,
      },
    };

    it("should return unassigned cash for unassigned source", () => {
      const rule = { config: { sourceType: "unassigned" } };
      const result = getBaseAmountForPercentage(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(1000);
    });

    it("should return envelope balance for envelope source", () => {
      const rule = { config: { sourceType: "envelope", sourceId: "env1" } };
      const result = getBaseAmountForPercentage(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(500);
    });

    it("should return income amount for income source", () => {
      const rule = { config: { sourceType: "income" } };
      const result = getBaseAmountForPercentage(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(2000);
    });

    it("should return 0 for non-existent envelope", () => {
      const rule = {
        config: { sourceType: "envelope", sourceId: "nonexistent" },
      };
      const result = getBaseAmountForPercentage(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(0);
    });
  });

  describe("calculatePriorityFillAmount", () => {
    const mockContext: AutoFundingContext = {
      data: {
        envelopes: [
          { id: "env1", currentBalance: 200, monthlyAmount: 500 },
          { id: "env2", currentBalance: 400, monthlyAmount: 300 }, // Overfunded
        ],
        unassignedCash: 1000,
      },
    };

    it("should calculate amount needed to reach monthly target", () => {
      const rule = { config: { targetId: "env1" } };
      const result = calculatePriorityFillAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(300); // 500 - 200 = 300 needed
    });

    it("should return 0 for overfunded envelope", () => {
      const rule = { config: { targetId: "env2" } };
      const result = calculatePriorityFillAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(0); // Already above monthly amount
    });

    it("should limit to available unassigned cash", () => {
      const limitedContext: AutoFundingContext = {
        data: {
          envelopes: [{ id: "env1", currentBalance: 0, monthlyAmount: 2000 }],
          unassignedCash: 500, // Less than needed
        },
      };

      const rule = { config: { targetId: "env1" } };
      const result = calculatePriorityFillAmount(rule as unknown as AutoFundingRule, limitedContext);
      expect(result).toBe(500); // Limited to available cash
    });

    it("should return 0 for non-existent envelope", () => {
      const rule = { config: { targetId: "nonexistent" } };
      const result = calculatePriorityFillAmount(rule as unknown as AutoFundingRule, mockContext);
      expect(result).toBe(0);
    });
  });

  describe("sortRulesByPriority", () => {
    it("should sort by priority (lower number = higher priority)", () => {
      const rules = [
        { id: "rule1", priority: 50 },
        { id: "rule2", priority: 10 },
        { id: "rule3", priority: 100 },
      ] as unknown as AutoFundingRule[];

      const sorted = sortRulesByPriority(rules);
      expect(sorted.map((r) => r.id)).toEqual(["rule2", "rule1", "rule3"]);
    });

    it("should sort by creation date when priorities are equal", () => {
      const rules = [
        { id: "rule1", priority: 50, createdAt: "2024-01-02T00:00:00Z" },
        { id: "rule2", priority: 50, createdAt: "2024-01-01T00:00:00Z" },
        { id: "rule3", priority: 50, createdAt: "2024-01-03T00:00:00Z" },
      ] as unknown as AutoFundingRule[];

      const sorted = sortRulesByPriority(rules);
      expect(sorted.map((r) => r.id)).toEqual(["rule2", "rule1", "rule3"]);
    });

    it("should handle missing priority (default to 100)", () => {
      const rules = [
        { id: "rule1", priority: 50 },
        { id: "rule2" }, // Missing priority
        { id: "rule3", priority: 200 },
      ] as unknown as AutoFundingRule[];

      const sorted = sortRulesByPriority(rules);
      expect(sorted.map((r) => r.id)).toEqual(["rule1", "rule2", "rule3"]);
    });
  });

  describe("filterRules", () => {
    const mockRules = [
      {
        id: "rule1",
        name: "Rent Rule",
        enabled: true,
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
      },
      {
        id: "rule2",
        name: "Savings Rule",
        enabled: false,
        type: RULE_TYPES.PERCENTAGE,
        trigger: TRIGGER_TYPES.INCOME_DETECTED,
      },
      {
        id: "rule3",
        name: "Emergency Fund",
        enabled: true,
        type: RULE_TYPES.CONDITIONAL,
        trigger: TRIGGER_TYPES.MANUAL,
      },
    ] as unknown as AutoFundingRule[];

    it("should filter by enabled status", () => {
      const result = filterRules(mockRules, { enabled: true });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["rule1", "rule3"]);
    });

    it("should filter by rule type", () => {
      const result = filterRules(mockRules, { type: RULE_TYPES.FIXED_AMOUNT });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rule1");
    });

    it("should filter by trigger type", () => {
      const result = filterRules(mockRules, { trigger: TRIGGER_TYPES.MANUAL });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["rule1", "rule3"]);
    });

    it("should search by name", () => {
      const result = filterRules(mockRules, { search: "savings" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("rule2");
    });

    it("should combine multiple filters", () => {
      const result = filterRules(mockRules, {
        enabled: true,
        trigger: TRIGGER_TYPES.MANUAL,
      });
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.id)).toEqual(["rule1", "rule3"]);
    });

    it("should return all rules with no filters", () => {
      const result = filterRules(mockRules);
      expect(result).toHaveLength(3);
    });
  });

  describe("getRuleStatistics", () => {
    const mockRules = [
      {
        enabled: true,
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        executionCount: 5,
        lastExecuted: "2024-01-01T00:00:00Z",
      },
      {
        enabled: false,
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.INCOME_DETECTED,
        executionCount: 10,
        lastExecuted: "2024-01-02T00:00:00Z",
      },
      {
        enabled: true,
        type: RULE_TYPES.PERCENTAGE,
        trigger: TRIGGER_TYPES.MANUAL,
        executionCount: 3,
      },
    ] as unknown as AutoFundingRule[];

    it("should calculate overall statistics", () => {
      const stats = getRuleStatistics(mockRules);

      expect(stats.total).toBe(3);
      expect(stats.enabled).toBe(2);
      expect(stats.disabled).toBe(1);
      expect(stats.totalExecutions).toBe(18);
      expect(stats.lastExecuted).toBe("2024-01-02T00:00:00Z");
    });

    it("should group by rule type", () => {
      const stats = getRuleStatistics(mockRules);

      expect(stats.byType[RULE_TYPES.FIXED_AMOUNT]).toBe(2);
      expect(stats.byType[RULE_TYPES.PERCENTAGE]).toBe(1);
    });

    it("should group by trigger type", () => {
      const stats = getRuleStatistics(mockRules);

      expect(stats.byTrigger[TRIGGER_TYPES.MANUAL]).toBe(2);
      expect(stats.byTrigger[TRIGGER_TYPES.INCOME_DETECTED]).toBe(1);
    });

    it("should handle empty rules array", () => {
      const stats = getRuleStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.enabled).toBe(0);
      expect(stats.disabled).toBe(0);
      expect(stats.totalExecutions).toBe(0);
      expect(stats.lastExecuted).toBe(null);
    });
  });

  describe("createRuleSummary", () => {
    it("should create summary for fixed amount rule", () => {
      const rule = {
        id: "rule1",
        name: "Rent Rule",
        enabled: true,
        priority: 10,
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { amount: 500, targetType: "envelope" },
      } as unknown as AutoFundingRule;

      const summary = createRuleSummary(rule);

      expect(summary.name).toBe("Rent Rule");
      expect(summary.description).toBe("Move $500");
      expect(summary.targetDescription).toBe("to envelope");
    });

    it("should create summary for percentage rule", () => {
      const rule = {
        id: "rule2",
        name: "Savings Rule",
        type: RULE_TYPES.PERCENTAGE,
        trigger: TRIGGER_TYPES.INCOME_DETECTED,
        config: {
          percentage: 20,
          targetType: "multiple",
          targetIds: ["env1", "env2"],
        },
      } as unknown as AutoFundingRule;

      const summary = createRuleSummary(rule);

      expect(summary.description).toBe("Move 20%");
      expect(summary.targetDescription).toBe("to 2 envelopes");
    });

    it("should create summary for priority fill rule", () => {
      const rule = {
        id: "rule3",
        name: "Fill Rent",
        type: RULE_TYPES.PRIORITY_FILL,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { targetType: "envelope" },
      } as unknown as AutoFundingRule;

      const summary = createRuleSummary(rule);
      expect(summary.description).toBe("Fill to monthly amount");
    });

    it("should create summary for conditional rule", () => {
      const rule = {
        id: "rule4",
        name: "Emergency Rule",
        type: RULE_TYPES.CONDITIONAL,
        trigger: TRIGGER_TYPES.MANUAL,
        config: {
          conditions: [
            { type: CONDITION_TYPES.BALANCE_LESS_THAN, value: 100 },
            { type: CONDITION_TYPES.UNASSIGNED_ABOVE, value: 500 },
          ],
        },
      } as unknown as AutoFundingRule;

      const summary = createRuleSummary(rule);
      expect(summary.description).toBe("If 2 condition(s) met");
    });

    it("should handle missing priority", () => {
      const rule = {
        id: "rule5",
        name: "Test Rule",
        type: RULE_TYPES.FIXED_AMOUNT,
        trigger: TRIGGER_TYPES.MANUAL,
        config: { amount: 100 },
      } as unknown as AutoFundingRule;

      const summary = createRuleSummary(rule);
      expect(summary.priority).toBe(100); // Default priority
    });
  });
});
