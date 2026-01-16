import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  simulateRuleExecution,
  simulateSingleRule,
  planRuleTransfers,
  createExecutionPlan,
  generatePlanWarnings,
  validateTransfers,
  calculateTransferImpact,
  generatePlanSummary,
} from "../simulation";
import { RULE_TYPES } from "../rules";
import { shouldRuleExecute } from "../conditions";
import { calculateFundingAmount, sortRulesByPriority } from "../rules";

// Mock dependencies
vi.mock("../rules", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../rules")>();
  return {
    ...actual,
    calculateFundingAmount: vi.fn(),
    sortRulesByPriority: vi.fn((rules) => [...rules].sort((a, b) => a.priority - b.priority)),
  };
});

vi.mock("../conditions", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../conditions")>();
  return {
    ...actual,
    shouldRuleExecute: vi.fn(),
  };
});

describe("simulation.ts", () => {
  const mockRule = {
    id: "rule-1",
    name: "Test Rule",
    type: RULE_TYPES.FIXED_AMOUNT,
    priority: 10,
    config: { targetId: "env-1", amount: 100 },
  } as any;

  const mockContext = {
    data: {
      unassignedCash: 500,
      envelopes: [{ id: "env-1", name: "Rent", currentBalance: 0, monthlyAmount: 1000 }],
    },
    trigger: "manual",
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("simulateRuleExecution", () => {
    it("should simulate execution of applicable rules", () => {
      (shouldRuleExecute as any).mockReturnValue(true);
      (calculateFundingAmount as any).mockReturnValue(100);

      const result = simulateRuleExecution([mockRule], mockContext);

      expect(result.success).toBe(true);
      expect(result.simulation.totalPlanned).toBe(100);
      expect(result.simulation.rulesExecuted).toBe(1);
      expect(result.simulation.remainingCash).toBe(400);
      expect(result.simulation.plannedTransfers).toHaveLength(1);
    });

    it("should handle rules that are not applicable", () => {
      (shouldRuleExecute as any).mockReturnValue(false);

      const result = simulateRuleExecution([mockRule], mockContext);

      expect(result.simulation.rulesExecuted).toBe(0);
      expect(result.simulation.totalPlanned).toBe(0);
    });

    it("should handle individual rule failures", () => {
      (shouldRuleExecute as any).mockReturnValue(true);
      (calculateFundingAmount as any).mockImplementation(() => {
        throw new Error("Oops");
      });

      const result = simulateRuleExecution([mockRule], mockContext);

      expect(result.success).toBe(true); // Overall success even if rule fails
      expect(result.simulation.errors).toHaveLength(1);
      expect(result.simulation.errors[0].error).toBe("Oops");
    });
  });

  describe("simulateSingleRule", () => {
    it("should return success and amount for valid rule", () => {
      (calculateFundingAmount as any).mockReturnValue(50);

      const result = simulateSingleRule(mockRule, mockContext, 500);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(50);
      expect(result.plannedTransfers).toHaveLength(1);
    });

    it("should return failure if amount is zero", () => {
      (calculateFundingAmount as any).mockReturnValue(0);

      const result = simulateSingleRule(mockRule, mockContext, 500);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Amount calculated as zero");
    });
  });

  describe("planRuleTransfers", () => {
    it("should plan fixed amount transfers", () => {
      const rule = { ...mockRule, type: RULE_TYPES.FIXED_AMOUNT, config: { targetId: "env-1" } };
      const transfers = planRuleTransfers(rule, 100);

      expect(transfers).toHaveLength(1);
      expect(transfers[0].toEnvelopeId).toBe("env-1");
      expect(transfers[0].amount).toBe(100);
    });

    it("should plan split remainder transfers with rounding handling", () => {
      const rule = {
        ...mockRule,
        type: RULE_TYPES.SPLIT_REMAINDER,
        config: { targetIds: ["env-1", "env-2", "env-3"] },
      };

      const transfers = planRuleTransfers(rule, 10); // 10 / 3 = 3.33 each, last gets remainder

      expect(transfers).toHaveLength(3);
      expect(transfers[0].amount).toBe(3.33);
      expect(transfers[1].amount).toBe(3.33);
      expect(transfers[2].amount).toBe(3.34); // 10 - 6.66
    });
  });

  describe("createExecutionPlan", () => {
    it("should create a comprehensive execution plan", () => {
      (shouldRuleExecute as any).mockReturnValue(true);
      (calculateFundingAmount as any).mockReturnValue(100);

      const result: any = createExecutionPlan([mockRule], mockContext);

      expect(result.success).toBe(true);
      expect(result.plan.initialCash).toBe(500);
      expect(result.plan.finalCash).toBe(400);
      expect(result.plan.totalToTransfer).toBe(100);
      expect(result.plan.rules).toHaveLength(1);
      expect(result.plan.transfers).toHaveLength(1);
    });
  });

  describe("generatePlanWarnings", () => {
    it("should warn about insufficient funds", () => {
      const simulation = {
        errors: [{ error: "No funds available" }],
        rulesExecuted: 1,
        remainingCash: 0,
      };
      const warnings = generatePlanWarnings(simulation, mockContext);
      expect(warnings.some((w) => w.type === "insufficient_funds")).toBe(true);
    });

    it("should warn about no execution", () => {
      const simulation = { errors: [], rulesExecuted: 0, remainingCash: 500 };
      const warnings = generatePlanWarnings(simulation, mockContext);
      expect(warnings.some((w) => w.type === "no_execution")).toBe(true);
    });

    it("should warn about low remaining cash", () => {
      const simulation = { errors: [], rulesExecuted: 1, remainingCash: 1 };
      const warnings = generatePlanWarnings(simulation, mockContext);
      expect(warnings.some((w) => w.type === "low_remaining_cash")).toBe(true);
    });
  });

  describe("validateTransfers", () => {
    it("should validate a correct set of transfers", () => {
      const transfers = [{ toEnvelopeId: "env-1", amount: 100 }];
      const result = validateTransfers(transfers, mockContext);
      expect(result.isValid).toBe(true);
    });

    it("should error if target envelope doesn't exist", () => {
      const transfers = [{ toEnvelopeId: "non-existent", amount: 100 }];
      const result = validateTransfers(transfers, mockContext);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].error).toContain("not found");
    });

    it("should error if total exceeds available cash", () => {
      const transfers = [{ toEnvelopeId: "env-1", amount: 600 }];
      const result = validateTransfers(transfers, mockContext);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].error).toContain("exceed available cash");
    });

    it("should error if amount is non-positive", () => {
      const transfers = [{ toEnvelopeId: "env-1", amount: -10 }];
      const result = validateTransfers(transfers, mockContext);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].error).toContain("positive");
    });
  });

  describe("calculateTransferImpact", () => {
    it("should calculate balance changes correctly", () => {
      const transfers = [{ toEnvelopeId: "env-1", amount: 100 }];
      const impact = calculateTransferImpact(transfers, mockContext);

      expect(impact.totalTransferred).toBe(100);
      expect(impact.unassignedChange).toBe(-100);

      const envImpact = impact.envelopes.get("env-1")!;
      expect(envImpact.change).toBe(100);
      expect(envImpact.newBalance).toBe(100);
    });
  });

  describe("generatePlanSummary", () => {
    it("should generate a human-readable summary", () => {
      const plan = {
        totalToTransfer: 100,
        rulesExecuted: 1,
        rulesCount: 1,
        transfersCount: 1,
        finalCash: 400,
        errors: [],
        warnings: [],
        rules: [{ ruleName: "Rent", amount: 100, targetEnvelopes: ["env-1"] }],
        transfers: [{ toEnvelopeId: "env-1", amount: 100, description: "desc" }],
      } as any;

      const summary = generatePlanSummary(plan, mockContext.data.envelopes);

      expect(summary.overview.totalAmount).toBe(100);
      expect(summary.rulesSummary[0].targets[0]).toBe("Rent");
      expect(summary.transfersSummary[0].to).toBe("Rent");
    });
  });
});
