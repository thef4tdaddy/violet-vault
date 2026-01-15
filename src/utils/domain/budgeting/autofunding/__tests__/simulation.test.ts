/**
 * Auto-Funding Simulation Utilities Tests
 * Tests for the extracted simulation utilities from Issue #506
 */
import { describe, it, expect } from "vitest";
import {
  simulateRuleExecution,
  simulateSingleRule,
  planRuleTransfers,
  createExecutionPlan,
  generatePlanWarnings,
  validateTransfers,
  calculateTransferImpact,
  generatePlanSummary,
} from "../simulation.js";
import { RULE_TYPES, TRIGGER_TYPES } from "../rules.js";

describe("simulation", () => {
  const mockEnvelopes = [
    { id: "env1", name: "Groceries", currentBalance: 150, monthlyAmount: 400 },
    { id: "env2", name: "Rent", currentBalance: 800, monthlyAmount: 1200 },
    { id: "env3", name: "Savings", currentBalance: 500, monthlyAmount: 300 },
  ];

  const mockContext = {
    trigger: TRIGGER_TYPES.MANUAL,
    currentDate: "2024-01-15T12:00:00.000Z",
    data: {
      envelopes: mockEnvelopes,
      unassignedCash: 1000,
      newIncomeAmount: 2500,
    },
  };

  const mockRules = [
    {
      id: "rule1",
      name: "Groceries Top-up",
      enabled: true,
      type: RULE_TYPES.FIXED_AMOUNT,
      trigger: TRIGGER_TYPES.MANUAL,
      priority: 1,
      config: {
        amount: 200,
        targetId: "env1",
      },
      lastExecuted: null,
    },
    {
      id: "rule2",
      name: "Rent Priority Fill",
      enabled: true,
      type: RULE_TYPES.PRIORITY_FILL,
      trigger: TRIGGER_TYPES.MANUAL,
      priority: 2,
      config: {
        targetId: "env2",
      },
      lastExecuted: null,
    },
    {
      id: "rule3",
      name: "Split Remaining",
      enabled: true,
      type: RULE_TYPES.SPLIT_REMAINDER,
      trigger: TRIGGER_TYPES.MANUAL,
      priority: 3,
      config: {
        targetIds: ["env1", "env3"],
      },
      lastExecuted: null,
    },
  ];

  describe("simulateRuleExecution", () => {
    it("should simulate execution of all applicable rules", () => {
      const result = simulateRuleExecution(mockRules, mockContext);

      expect(result.success).toBe(true);
      expect(result.simulation).toBeDefined();
      expect(result.simulation.rulesExecuted).toBeGreaterThan(0);
      expect(result.simulation.totalPlanned).toBeGreaterThan(0);
      expect(result.simulation.ruleResults).toHaveLength(3);
      expect(result.simulation.remainingCash).toBeLessThan(mockContext.data.unassignedCash);
    });

    it("should handle rules in priority order", () => {
      const result = simulateRuleExecution(mockRules, mockContext);

      expect(result.success).toBe(true);

      // Check that rules were processed in priority order (1, 2, 3)
      const successfulRules = result.simulation.ruleResults.filter((r) => r.success);
      expect(successfulRules[0].ruleId).toBe("rule1"); // Priority 1
      expect(successfulRules[1].ruleId).toBe("rule2"); // Priority 2
    });

    it("should handle insufficient funds gracefully", () => {
      const lowCashContext = {
        ...mockContext,
        data: { ...mockContext.data, unassignedCash: 50 },
      };

      const result = simulateRuleExecution(mockRules, lowCashContext);

      expect(result.success).toBe(true);
      expect(result.simulation.errors.length).toBeGreaterThan(0);
      expect(result.simulation.remainingCash).toBe(0);
    });

    it("should filter out disabled rules", () => {
      const rulesWithDisabled = [
        ...mockRules,
        {
          id: "rule4",
          name: "Disabled Rule",
          enabled: false,
          type: RULE_TYPES.FIXED_AMOUNT,
          trigger: TRIGGER_TYPES.MANUAL,
          priority: 1,
          config: { amount: 100, targetId: "env1" },
          lastExecuted: null,
        },
      ];

      const result = simulateRuleExecution(rulesWithDisabled, mockContext);

      expect(result.success).toBe(true);
      expect(result.simulation.ruleResults).toHaveLength(3); // Still only 3 results
      expect(result.simulation.ruleResults.find((r) => r.ruleId === "rule4")).toBeUndefined();
    });

    it("should handle empty rules array", () => {
      const result = simulateRuleExecution([], mockContext);

      expect(result.success).toBe(true);
      expect(result.simulation.rulesExecuted).toBe(0);
      expect(result.simulation.totalPlanned).toBe(0);
      expect(result.simulation.remainingCash).toBe(mockContext.data.unassignedCash);
    });

    it("should track available cash across rules", () => {
      const result = simulateRuleExecution(mockRules, mockContext);

      expect(result.success).toBe(true);

      let expectedRemaining = mockContext.data.unassignedCash;
      result.simulation.ruleResults.forEach((ruleResult) => {
        if (ruleResult.success && ruleResult.amount > 0) {
          expectedRemaining -= ruleResult.amount;
        }
      });

      expect(result.simulation.remainingCash).toBe(Math.max(0, expectedRemaining));
    });
  });

  describe("simulateSingleRule", () => {
    it("should simulate fixed amount rule", () => {
      const rule = mockRules[0]; // Fixed amount rule
      const result = simulateSingleRule(rule, mockContext, 1000);

      expect(result.success).toBe(true);
      expect(result.ruleId).toBe(rule.id);
      expect(result.ruleName).toBe(rule.name);
      expect(result.amount).toBe(200);
      expect(result.plannedTransfers).toHaveLength(1);
      expect(result.plannedTransfers[0].amount).toBe(200);
      expect(result.plannedTransfers[0].toEnvelopeId).toBe("env1");
    });

    it("should simulate priority fill rule", () => {
      const rule = mockRules[1]; // Priority fill rule
      const result = simulateSingleRule(rule, mockContext, 1000);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(400); // 1200 - 800 = 400 needed
      expect(result.plannedTransfers).toHaveLength(1);
      expect(result.plannedTransfers[0].toEnvelopeId).toBe("env2");
    });

    it("should simulate split remainder rule", () => {
      const rule = mockRules[2]; // Split remainder rule
      const result = simulateSingleRule(rule, mockContext, 300);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(300); // calculateFundingAmount returns total amount for SPLIT_REMAINDER
      expect(result.plannedTransfers).toHaveLength(2);
      expect(result.plannedTransfers[0].amount).toBe(150);
      expect(result.plannedTransfers[1].amount).toBe(150);
    });

    it("should handle insufficient funds", () => {
      const rule = mockRules[0];
      const result = simulateSingleRule(rule, mockContext, 0);

      expect(result.success).toBe(false);
      expect(result.error).toBe("No funds available");
      expect(result.amount).toBe(0);
      expect(result.plannedTransfers).toHaveLength(0);
    });

    it("should handle rule execution errors", () => {
      const invalidRule = {
        id: "invalid",
        name: "Invalid Rule",
        type: "INVALID_TYPE",
        config: {},
      };

      const result = simulateSingleRule(invalidRule, mockContext, 1000);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.amount).toBe(0);
    });
  });

  describe("planRuleTransfers", () => {
    it("should plan single target transfer", () => {
      const rule = {
        type: RULE_TYPES.FIXED_AMOUNT,
        name: "Test Rule",
        id: "test1",
        config: { targetId: "env1" },
      };

      const transfers = planRuleTransfers(rule, 200);

      expect(transfers).toHaveLength(1);
      expect(transfers[0]).toMatchObject({
        fromEnvelopeId: "unassigned",
        toEnvelopeId: "env1",
        amount: 200,
        description: "Auto-funding: Test Rule",
        ruleId: "test1",
        ruleName: "Test Rule",
      });
    });

    it("should plan split remainder transfers", () => {
      const rule = {
        type: RULE_TYPES.SPLIT_REMAINDER,
        name: "Split Rule",
        id: "split1",
        config: { targetIds: ["env1", "env2", "env3"] },
      };

      const transfers = planRuleTransfers(rule, 300);

      expect(transfers).toHaveLength(3);
      expect(transfers[0].amount).toBe(100);
      expect(transfers[1].amount).toBe(100);
      expect(transfers[2].amount).toBe(100);

      transfers.forEach((transfer) => {
        expect(transfer.fromEnvelopeId).toBe("unassigned");
        expect(transfer.description).toBe("Auto-funding (split): Split Rule");
      });
    });

    it("should handle rounding in split transfers", () => {
      const rule = {
        type: RULE_TYPES.SPLIT_REMAINDER,
        name: "Split Rule",
        id: "split1",
        config: { targetIds: ["env1", "env2", "env3"] },
      };

      const transfers = planRuleTransfers(rule, 101); // Doesn't divide evenly

      expect(transfers).toHaveLength(3);
      // Math.floor(101/3 * 100) / 100 = Math.floor(33.66 * 100) / 100 = 33.66
      expect(transfers[0].amount).toBeCloseTo(33.66, 2);
      expect(transfers[1].amount).toBeCloseTo(33.66, 2);
      expect(transfers[2].amount).toBeCloseTo(33.68, 2); // Gets the remainder to equal 101

      const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);
      expect(totalAmount).toBeCloseTo(101, 2);
    });

    it("should return empty array for unsupported rule types", () => {
      const rule = {
        type: "UNSUPPORTED_TYPE",
        name: "Unsupported Rule",
        id: "unsupported1",
        config: {},
      };

      const transfers = planRuleTransfers(rule, 200);
      expect(transfers).toHaveLength(0);
    });
  });

  describe("createExecutionPlan", () => {
    it("should create comprehensive execution plan", () => {
      const result = createExecutionPlan(mockRules, mockContext);

      expect(result.success).toBe(true);
      if ("plan" in result && result.plan) {
        expect(result.plan).toBeDefined();
        expect(result.plan.plannedAt).toBeDefined();
        expect(result.plan.trigger).toBe(mockContext.trigger);
        expect(result.plan.initialCash).toBe(mockContext.data.unassignedCash);
        expect(result.plan.totalToTransfer).toBeGreaterThan(0);
        expect(result.plan.rulesCount).toBeGreaterThan(0);
        expect(result.plan.transfersCount).toBeGreaterThan(0);
        expect(result.plan.rules).toBeDefined();
        expect(result.plan.transfers).toBeDefined();
        expect(result.plan.errors).toBeDefined();
        expect(result.plan.warnings).toBeDefined();
      }
    });

    it("should include warnings in plan", () => {
      const lowCashContext = {
        ...mockContext,
        data: { ...mockContext.data, unassignedCash: 10 },
      };

      const result = createExecutionPlan(mockRules, lowCashContext);

      expect(result.success).toBe(true);
      if ("plan" in result && result.plan) {
        expect(result.plan.warnings.length).toBeGreaterThan(0);
        expect(result.plan.warnings.some((w) => w.type === "insufficient_funds")).toBe(true);
      }
    });
  });

  describe("generatePlanWarnings", () => {
    it("should generate insufficient funds warning", () => {
      const simulation = {
        rulesExecuted: 1,
        remainingCash: 50,
        errors: [{ error: "No funds available" }],
      };

      const warnings = generatePlanWarnings(simulation, mockContext);

      expect(warnings.some((w) => w.type === "insufficient_funds")).toBe(true);
      expect(warnings.find((w) => w.type === "insufficient_funds").severity).toBe("high");
    });

    it("should generate no execution warning", () => {
      const simulation = {
        rulesExecuted: 0,
        remainingCash: 1000,
        errors: [],
      };

      const warnings = generatePlanWarnings(simulation, mockContext);

      expect(warnings.some((w) => w.type === "no_execution")).toBe(true);
      expect(warnings.find((w) => w.type === "no_execution").severity).toBe("medium");
    });

    it("should generate low remaining cash warning", () => {
      const simulation = {
        rulesExecuted: 2,
        remainingCash: 20, // Less than 5% of 1000
        errors: [],
      };

      const warnings = generatePlanWarnings(simulation, mockContext);

      expect(warnings.some((w) => w.type === "low_remaining_cash")).toBe(true);
      expect(warnings.find((w) => w.type === "low_remaining_cash").severity).toBe("low");
    });
  });

  describe("validateTransfers", () => {
    const mockTransfers = [
      {
        fromEnvelopeId: "unassigned",
        toEnvelopeId: "env1",
        amount: 200,
        description: "Test transfer",
      },
      {
        fromEnvelopeId: "unassigned",
        toEnvelopeId: "env2",
        amount: 300,
        description: "Another test transfer",
      },
    ];

    it("should validate successful transfers", () => {
      const result = validateTransfers(mockTransfers, mockContext);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalAmount).toBe(500);
    });

    it("should detect missing target envelope", () => {
      const invalidTransfers = [
        ...mockTransfers,
        {
          fromEnvelopeId: "unassigned",
          toEnvelopeId: "nonexistent",
          amount: 100,
          description: "Invalid transfer",
        },
      ];

      const result = validateTransfers(invalidTransfers, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.error.includes("not found"))).toBe(true);
    });

    it("should detect negative transfer amounts", () => {
      const invalidTransfers = [
        {
          fromEnvelopeId: "unassigned",
          toEnvelopeId: "env1",
          amount: -100,
          description: "Invalid amount",
        },
      ];

      const result = validateTransfers(invalidTransfers, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.error.includes("must be positive"))).toBe(true);
    });

    it("should detect total exceeding available cash", () => {
      const excessiveTransfers = [
        {
          fromEnvelopeId: "unassigned",
          toEnvelopeId: "env1",
          amount: 2000, // Exceeds available 1000
          description: "Excessive transfer",
        },
      ];

      const result = validateTransfers(excessiveTransfers, mockContext);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.error.includes("exceed available cash"))).toBe(true);
    });
  });

  describe("calculateTransferImpact", () => {
    const mockTransfers = [
      {
        toEnvelopeId: "env1",
        amount: 200,
      },
      {
        toEnvelopeId: "env2",
        amount: 300,
      },
    ];

    it("should calculate envelope balance changes", () => {
      const impact = calculateTransferImpact(mockTransfers, mockContext);

      expect(impact.unassignedChange).toBe(-500);
      expect(impact.totalTransferred).toBe(500);

      const env1Impact = impact.envelopes.get("env1");
      expect(env1Impact.change).toBe(200);
      expect(env1Impact.newBalance).toBe(350);
      expect(env1Impact.currentBalance).toBe(150);

      const env2Impact = impact.envelopes.get("env2");
      expect(env2Impact.change).toBe(300);
      expect(env2Impact.newBalance).toBe(1100);
    });

    it("should calculate fill percentages", () => {
      const impact = calculateTransferImpact(mockTransfers, mockContext);

      const env1Impact = impact.envelopes.get("env1");
      expect(env1Impact.fillPercentage).toBe(37.5); // 150/400 * 100
      expect(env1Impact.newFillPercentage).toBe(87.5); // 350/400 * 100

      const env2Impact = impact.envelopes.get("env2");
      expect(env2Impact.fillPercentage).toBeCloseTo(66.67, 2); // 800/1200 * 100
      expect(env2Impact.newFillPercentage).toBeCloseTo(91.67, 2); // 1100/1200 * 100
    });

    it("should handle empty transfers", () => {
      const impact = calculateTransferImpact([], mockContext);

      expect(Math.abs(impact.unassignedChange)).toBe(0); // Handle -0 vs +0 by checking absolute value
      expect(Math.abs(impact.totalTransferred)).toBe(0);
      expect(impact.envelopes.size).toBe(mockEnvelopes.length);

      impact.envelopes.forEach((envImpact) => {
        expect(envImpact.change).toBe(0);
        expect(envImpact.newBalance).toBe(envImpact.currentBalance);
      });
    });
  });

  describe("generatePlanSummary", () => {
    const mockPlan = {
      totalToTransfer: 500,
      rulesCount: 2,
      transfersCount: 3,
      finalCash: 500,
      errors: [],
      warnings: [{ type: "test", message: "Test warning" }],
      rules: [
        {
          ruleName: "Test Rule 1",
          amount: 200,
          targetEnvelopes: ["env1"],
        },
        {
          ruleName: "Test Rule 2",
          amount: 300,
          targetEnvelopes: ["env2", "env3"],
        },
      ],
      transfers: [
        {
          amount: 200,
          toEnvelopeId: "env1",
          description: "Transfer to groceries",
        },
        {
          amount: 150,
          toEnvelopeId: "env2",
          description: "Transfer to rent",
        },
        {
          amount: 150,
          toEnvelopeId: "env3",
          description: "Transfer to savings",
        },
      ],
    };

    it("should generate comprehensive plan summary", () => {
      const summary = generatePlanSummary(mockPlan, mockEnvelopes);

      expect(summary.overview).toMatchObject({
        totalAmount: 500,
        rulesCount: 2,
        transfersCount: 3,
        remainingCash: 500,
        hasErrors: false,
        hasWarnings: true,
      });

      expect(summary.rulesSummary).toHaveLength(2);
      expect(summary.rulesSummary[0]).toMatchObject({
        name: "Test Rule 1",
        amount: 200,
        targetCount: 1,
        targets: ["Groceries"],
      });

      expect(summary.transfersSummary).toHaveLength(3);
      expect(summary.transfersSummary[0]).toMatchObject({
        amount: 200,
        to: "Groceries",
        description: "Transfer to groceries",
      });
    });

    it("should handle missing envelope names", () => {
      const planWithMissingEnvelope = {
        ...mockPlan,
        transfers: [
          {
            amount: 100,
            toEnvelopeId: "nonexistent",
            description: "Transfer to missing envelope",
          },
        ],
      };

      const summary = generatePlanSummary(planWithMissingEnvelope, mockEnvelopes);

      expect(summary.transfersSummary[0].to).toBe("nonexistent");
    });

    it("should handle empty plan", () => {
      const emptyPlan = {
        totalToTransfer: 0,
        rulesCount: 0,
        transfersCount: 0,
        finalCash: 1000,
        errors: [],
        warnings: [],
        rules: [],
        transfers: [],
      };

      const summary = generatePlanSummary(emptyPlan, mockEnvelopes);

      expect(summary.overview.totalAmount).toBe(0);
      expect(summary.rulesSummary).toHaveLength(0);
      expect(summary.transfersSummary).toHaveLength(0);
    });
  });
});
