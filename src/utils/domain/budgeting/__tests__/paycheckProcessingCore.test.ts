/**
 * Tests for pure paycheck processing domain logic
 * Tests the execution plan creation without side effects
 */

import { describe, it, expect } from "vitest";
import {
  createPaycheckExecutionPlan,
  calculateTotalAllocated,
  validatePaycheckInput,
} from "../paycheckProcessingCore";
import type { CurrentBalances, PaycheckInput } from "../paycheckProcessingTypes";

describe("paycheckProcessingCore - Pure Domain Logic", () => {
  describe("calculateTotalAllocated", () => {
    it("should calculate total from multiple allocations", () => {
      const allocations = [
        { envelopeId: "env-1", amount: 100 },
        { envelopeId: "env-2", amount: 200 },
        { envelopeId: "env-3", amount: 150 },
      ];

      const total = calculateTotalAllocated(allocations);

      expect(total).toBe(450);
    });

    it("should return 0 for empty allocations", () => {
      const total = calculateTotalAllocated([]);
      expect(total).toBe(0);
    });

    it("should handle decimal amounts", () => {
      const allocations = [
        { envelopeId: "env-1", amount: 100.5 },
        { envelopeId: "env-2", amount: 200.75 },
      ];

      const total = calculateTotalAllocated(allocations);

      expect(total).toBe(301.25);
    });
  });

  describe("validatePaycheckInput", () => {
    it("should validate valid paycheck input", () => {
      const input: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 500 },
          { envelopeId: "env-2", amount: 800 },
        ],
        payerName: "Employer",
        notes: "Regular paycheck",
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should reject negative paycheck amount", () => {
      const input: PaycheckInput = {
        amount: -100,
        mode: "allocate",
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Paycheck amount must be greater than 0");
    });

    it("should reject zero paycheck amount", () => {
      const input: PaycheckInput = {
        amount: 0,
        mode: "allocate",
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Paycheck amount must be greater than 0");
    });

    it("should reject invalid mode", () => {
      const input: PaycheckInput = {
        amount: 2000,
        mode: "invalid-mode",
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Paycheck mode must be 'allocate' or 'leftover'");
    });

    it("should reject over-allocation", () => {
      const input: PaycheckInput = {
        amount: 1000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 600 },
          { envelopeId: "env-2", amount: 600 },
        ],
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain("Total allocations");
      expect(validation.errors[0]).toContain("exceed paycheck amount");
    });

    it("should reject allocation without envelopeId", () => {
      const input: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "", amount: 500 }],
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain("missing envelopeId");
    });

    it("should reject allocation with negative amount", () => {
      const input: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: -100 }],
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain("negative amount");
    });

    it("should accept partial allocations", () => {
      const input: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 500 },
          { envelopeId: "env-2", amount: 300 },
        ],
      };

      const validation = validatePaycheckInput(input);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe("createPaycheckExecutionPlan", () => {
    const mockCurrentBalances: CurrentBalances = {
      actualBalance: 1000,
      virtualBalance: 800,
      unassignedCash: 500,
      isActualBalanceManual: false,
    };

    it("should create execution plan for paycheck with allocations", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", envelopeName: "Groceries", amount: 500 },
          { envelopeId: "env-2", envelopeName: "Rent", amount: 1200 },
        ],
        payerName: "Employer Inc",
        notes: "Bi-weekly paycheck",
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckId).toContain("paycheck_");
      expect(plan.balanceUpdates).toBeDefined();
      expect(plan.envelopeAllocations).toHaveLength(2);
      expect(plan.transactionCreation.amount).toBe(2000);
      expect(plan.transactionCreation.payerName).toBe("Employer Inc");
      expect(plan.paycheckRecord.amount).toBe(2000);
      expect(plan.paycheckRecord.mode).toBe("allocate");
      expect(plan.validation).toBeDefined();
    });

    it("should create execution plan for leftover mode", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "leftover",
        payerName: "Employer Inc",
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckId).toContain("paycheck_");
      expect(plan.envelopeAllocations).toHaveLength(0);
      expect(plan.paycheckRecord.mode).toBe("leftover");
    });

    it("should include balance before and after in paycheck record", () => {
      const paycheckData: PaycheckInput = {
        amount: 1000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckRecord.actualBalanceBefore).toBe(1000);
      expect(plan.paycheckRecord.unassignedCashBefore).toBe(500);
      expect(plan.paycheckRecord.actualBalanceAfter).toBeDefined();
      expect(plan.paycheckRecord.unassignedCashAfter).toBeDefined();
    });

    it("should create allocations map in paycheck record", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [
          { envelopeId: "env-1", amount: 500 },
          { envelopeId: "env-2", amount: 800 },
        ],
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckRecord.allocations).toEqual({
        "env-1": 500,
        "env-2": 800,
      });
    });

    it("should generate unique paycheck IDs", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
      };

      const plan1 = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);
      const plan2 = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan1.paycheckId).not.toBe(plan2.paycheckId);
      expect(plan1.paycheckId).toContain("paycheck_");
      expect(plan2.paycheckId).toContain("paycheck_");
    });

    it("should handle missing payerName with default", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckRecord.payerName).toBe("Unknown");
    });

    it("should handle missing notes with empty string", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckRecord.notes).toBe("");
    });

    it("should set correct record type and category", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.paycheckRecord.type).toBe("income");
      expect(plan.paycheckRecord.category).toBe("Income");
      expect(plan.paycheckRecord.envelopeId).toBe("unassigned");
      expect(plan.paycheckRecord.isScheduled).toBe(false);
    });

    it("should include validation result in plan", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const plan = createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(plan.validation).toBeDefined();
      expect(plan.validation.isValid).toBeDefined();
      expect(plan.validation.errors).toBeDefined();
      expect(plan.validation.warnings).toBeDefined();
    });

    it("should be pure - not modify input data", () => {
      const paycheckData: PaycheckInput = {
        amount: 2000,
        mode: "allocate",
        envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
      };

      const originalData = JSON.parse(JSON.stringify(paycheckData));
      const originalBalances = JSON.parse(JSON.stringify(mockCurrentBalances));

      createPaycheckExecutionPlan(paycheckData, mockCurrentBalances);

      expect(paycheckData).toEqual(originalData);
      expect(mockCurrentBalances).toEqual(originalBalances);
    });
  });
});
