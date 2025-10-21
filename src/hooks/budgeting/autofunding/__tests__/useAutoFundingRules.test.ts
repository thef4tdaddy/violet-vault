/**
 * useAutoFundingRules Hook Tests
 * Tests for the rule management hook from Issue #506
 */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoFundingRules } from "../useAutoFundingRules.js";
import { RULE_TYPES, TRIGGER_TYPES } from "../../../../utils/budgeting/autofunding/rules.js";

// Mock logger to avoid console output in tests
vi.mock("../../../../utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("useAutoFundingRules", () => {
  const mockRule = {
    name: "Test Rule",
    type: RULE_TYPES.FIXED_AMOUNT,
    trigger: TRIGGER_TYPES.MANUAL,
    config: {
      amount: 200,
      targetId: "env1",
    },
  };

  let hookResult;

  beforeEach(() => {
    hookResult = renderHook(() => useAutoFundingRules([]));
  });

  describe("rule management", () => {
    it("should initialize with empty rules", () => {
      expect(hookResult.result.current.rules).toEqual([]);
    });

    it("should add a new rule", () => {
      act(() => {
        const newRule = hookResult.result.current.addRule(mockRule);
        expect(newRule).toBeDefined();
        expect(newRule.id).toBeDefined();
        expect(newRule.name).toBe(mockRule.name);
      });

      expect(hookResult.result.current.rules).toHaveLength(1);
      expect(hookResult.result.current.rules[0].name).toBe(mockRule.name);
    });

    it("should update an existing rule", () => {
      let ruleId;

      // Add a rule first
      act(() => {
        const newRule = hookResult.result.current.addRule(mockRule);
        ruleId = newRule.id;
      });

      // Update the rule
      act(() => {
        hookResult.result.current.updateRule(ruleId, { name: "Updated Rule" });
      });

      const updatedRule = hookResult.result.current.rules.find((r) => r.id === ruleId);
      expect(updatedRule.name).toBe("Updated Rule");
      expect(updatedRule.updatedAt).toBeDefined();
    });

    it("should delete a rule", () => {
      let ruleId;

      // Add a rule first
      act(() => {
        const newRule = hookResult.result.current.addRule(mockRule);
        ruleId = newRule.id;
      });

      expect(hookResult.result.current.rules).toHaveLength(1);

      // Delete the rule
      act(() => {
        const success = hookResult.result.current.deleteRule(ruleId);
        expect(success).toBe(true);
      });

      expect(hookResult.result.current.rules).toHaveLength(0);
    });

    it("should toggle rule enabled status", () => {
      let ruleId;

      // Add a rule first
      act(() => {
        const newRule = hookResult.result.current.addRule(mockRule);
        ruleId = newRule.id;
      });

      const initialRule = hookResult.result.current.rules.find((r) => r.id === ruleId);
      expect(initialRule.enabled).toBe(true); // Default is enabled

      // Toggle rule
      act(() => {
        hookResult.result.current.toggleRule(ruleId);
      });

      const toggledRule = hookResult.result.current.rules.find((r) => r.id === ruleId);
      expect(toggledRule.enabled).toBe(false);
    });

    it("should duplicate a rule", () => {
      let ruleId;

      // Add a rule first
      act(() => {
        const newRule = hookResult.result.current.addRule(mockRule);
        ruleId = newRule.id;
      });

      // Duplicate the rule
      act(() => {
        const duplicatedRule = hookResult.result.current.duplicateRule(ruleId);
        expect(duplicatedRule.name).toBe("Test Rule (Copy)");
        expect(duplicatedRule.enabled).toBe(false); // Copies are disabled by default
      });

      expect(hookResult.result.current.rules).toHaveLength(2);
    });
  });

  describe("rule validation", () => {
    it("should validate rule configuration on add", () => {
      const invalidRule = {
        // Missing required name
        type: RULE_TYPES.FIXED_AMOUNT,
        config: { amount: 200 },
      };

      expect(() => {
        act(() => {
          hookResult.result.current.addRule(invalidRule);
        });
      }).toThrow("Invalid rule configuration");
    });

    it("should validate all rules", () => {
      // Add a valid rule
      act(() => {
        hookResult.result.current.addRule(mockRule);
      });

      act(() => {
        const validation = hookResult.result.current.validateAllRules();
        expect(validation.allValid).toBe(true);
        expect(validation.results).toHaveLength(1);
        expect(validation.invalidRules).toHaveLength(0);
      });
    });
  });

  describe("rule querying", () => {
    beforeEach(() => {
      // Add some test rules
      act(() => {
        hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 1",
          type: RULE_TYPES.FIXED_AMOUNT,
          priority: 1,
        });
        hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 2",
          type: RULE_TYPES.PERCENTAGE,
          priority: 2,
          enabled: false,
          config: {
            percentage: 10,
            targetId: "env1",
          },
        });
        hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 3",
          type: RULE_TYPES.FIXED_AMOUNT,
          trigger: TRIGGER_TYPES.WEEKLY,
          priority: 3,
        });
      });
    });

    it("should get filtered rules", () => {
      const enabledRules = hookResult.result.current.getFilteredRules({
        enabled: true,
      });
      expect(enabledRules).toHaveLength(2); // Rule 1 and Rule 3

      const fixedAmountRules = hookResult.result.current.getFilteredRules({
        type: RULE_TYPES.FIXED_AMOUNT,
      });
      expect(fixedAmountRules).toHaveLength(2); // Rule 1 and Rule 3
    });

    it("should get rules by type", () => {
      const fixedAmountRules = hookResult.result.current.getRulesByType(RULE_TYPES.FIXED_AMOUNT);
      expect(fixedAmountRules).toHaveLength(2);

      const percentageRules = hookResult.result.current.getRulesByType(RULE_TYPES.PERCENTAGE);
      expect(percentageRules).toHaveLength(1);
    });

    it("should get rules by trigger", () => {
      const manualRules = hookResult.result.current.getRulesByTrigger(TRIGGER_TYPES.MANUAL);
      expect(manualRules).toHaveLength(2);

      const weeklyRules = hookResult.result.current.getRulesByTrigger(TRIGGER_TYPES.WEEKLY);
      expect(weeklyRules).toHaveLength(1);
    });

    it("should get rule by ID", () => {
      const firstRule = hookResult.result.current.rules[0];
      const foundRule = hookResult.result.current.getRuleById(firstRule.id);

      expect(foundRule).toBeDefined();
      expect(foundRule.id).toBe(firstRule.id);
    });

    it("should generate rule summaries", () => {
      const summaries = hookResult.result.current.getRuleSummaries();
      expect(summaries).toHaveLength(3);
      expect(summaries[0].name).toBeDefined();
      expect(summaries[0].description).toBeDefined();
    });
  });

  describe("bulk operations", () => {
    let ruleIds;

    beforeEach(() => {
      ruleIds = [];
      // Add some test rules
      act(() => {
        const rule1 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 1",
        });
        const rule2 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 2",
        });
        const rule3 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 3",
        });
        ruleIds = [rule1.id, rule2.id, rule3.id];
      });
    });

    it("should bulk update rules", () => {
      act(() => {
        hookResult.result.current.bulkUpdateRules([ruleIds[0], ruleIds[1]], {
          priority: 100,
        });
      });

      const rules = hookResult.result.current.rules;
      expect(rules.find((r) => r.id === ruleIds[0]).priority).toBe(100);
      expect(rules.find((r) => r.id === ruleIds[1]).priority).toBe(100);
      // Rule 3 should still have its original priority (which is the default 100 from createDefaultRule)
      // So let's check that it exists and wasn't updated
      const rule3 = rules.find((r) => r.id === ruleIds[2]);
      expect(rule3).toBeDefined();
      expect(rule3.updatedAt).toBeUndefined(); // Should not have been updated
    });

    it("should bulk delete rules", () => {
      act(() => {
        hookResult.result.current.bulkDeleteRules([ruleIds[0], ruleIds[2]]);
      });

      expect(hookResult.result.current.rules).toHaveLength(1);
      expect(hookResult.result.current.rules[0].id).toBe(ruleIds[1]);
    });

    it("should bulk toggle rules", () => {
      act(() => {
        hookResult.result.current.bulkToggleRules([ruleIds[0], ruleIds[1]], false);
      });

      const rules = hookResult.result.current.rules;
      expect(rules.find((r) => r.id === ruleIds[0]).enabled).toBe(false);
      expect(rules.find((r) => r.id === ruleIds[1]).enabled).toBe(false);
      expect(rules.find((r) => r.id === ruleIds[2]).enabled).toBe(true); // Unchanged
    });
  });

  describe("statistics", () => {
    beforeEach(() => {
      // Add some test rules with execution history
      act(() => {
        hookResult.result.current.addRule({
          ...mockRule,
          name: "Active Rule",
          enabled: true,
          executionCount: 5,
          lastExecuted: "2024-01-10T12:00:00.000Z",
        });
        hookResult.result.current.addRule({
          ...mockRule,
          name: "Disabled Rule",
          enabled: false,
          executionCount: 2,
        });
      });
    });

    it("should get rule statistics", () => {
      const stats = hookResult.result.current.getRulesStatistics();

      expect(stats.total).toBe(2);
      expect(stats.enabled).toBe(1);
      expect(stats.disabled).toBe(1);
      expect(stats.totalExecutions).toBe(7); // 5 + 2
      expect(stats.lastExecuted).toBe("2024-01-10T12:00:00.000Z");
    });
  });

  describe("rule ordering", () => {
    let ruleIds;

    beforeEach(() => {
      ruleIds = [];
      // Add rules with different priorities
      act(() => {
        const rule1 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 1",
          priority: 30,
        });
        const rule2 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 2",
          priority: 10,
        });
        const rule3 = hookResult.result.current.addRule({
          ...mockRule,
          name: "Rule 3",
          priority: 20,
        });
        ruleIds = [rule1.id, rule2.id, rule3.id];
      });
    });

    it("should reorder rules by priority", () => {
      // Rules should be ordered: Rule 2 (10), Rule 3 (20), Rule 1 (30)
      const filteredRules = hookResult.result.current.getFilteredRules();
      expect(filteredRules[0].name).toBe("Rule 2"); // Priority 10
      expect(filteredRules[1].name).toBe("Rule 3"); // Priority 20
      expect(filteredRules[2].name).toBe("Rule 1"); // Priority 30
    });

    it("should update rule priorities when reordering", () => {
      act(() => {
        // Reorder: Rule 1, Rule 3, Rule 2
        hookResult.result.current.reorderRules([ruleIds[0], ruleIds[2], ruleIds[1]]);
      });

      const rules = hookResult.result.current.rules;
      expect(rules.find((r) => r.id === ruleIds[0]).priority).toBe(10); // First position
      expect(rules.find((r) => r.id === ruleIds[2]).priority).toBe(20); // Second position
      expect(rules.find((r) => r.id === ruleIds[1]).priority).toBe(30); // Third position
    });
  });
});
