/**
 * Paycheck Wizard Validation Tests
 * Comprehensive test coverage for paycheck wizard Zod schemas
 * Part of Issue #1843: Zod Schema Validation for Paycheck Wizard
 */

import { describe, it, expect } from "vitest";
import {
  PaycheckAmountSchema,
  AllocationItemSchema,
  AllocationsArraySchema,
  AllocationsWithSumSchema,
  PaycheckWizardDataSchema,
  AllocationStrategySchema,
  validatePaycheckAmountSafe,
  validateAllocationsSafe,
  validateAllocationsWithSumSafe,
  validateWizardDataSafe,
  validatePaycheckAmount,
  validateAllocations,
  validateWizardData,
  createPaycheckTransaction,
  formatValidationError,
  doAllocationsSumToPaycheck,
  calculateRemainingAmount,
} from "../paycheckWizardValidation";

describe("paycheckWizardValidation", () => {
  describe("PaycheckAmountSchema", () => {
    it("accepts valid paycheck amounts", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: 250000 })).not.toThrow(); // $2,500
      expect(() => PaycheckAmountSchema.parse({ amountCents: 100 })).not.toThrow(); // $1.00 (minimum)
      expect(() => PaycheckAmountSchema.parse({ amountCents: 100_000_000 })).not.toThrow(); // $1M (maximum)
    });

    it("rejects negative amounts", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: -100 })).toThrow(
        "Amount must be positive"
      );
    });

    it("rejects zero amounts", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: 0 })).toThrow(
        "Amount must be positive"
      );
    });

    it("rejects amounts below minimum ($1.00)", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: 99 })).toThrow(
        "Minimum paycheck is $1.00"
      );
      expect(() => PaycheckAmountSchema.parse({ amountCents: 50 })).toThrow();
    });

    it("rejects amounts above maximum ($1,000,000)", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: 100_000_001 })).toThrow(
        "Maximum paycheck is $1,000,000.00"
      );
      expect(() => PaycheckAmountSchema.parse({ amountCents: 200_000_000 })).toThrow();
    });

    it("rejects fractional cents", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: 100.5 })).toThrow(
        "Amount must be in whole cents"
      );
      expect(() => PaycheckAmountSchema.parse({ amountCents: 250000.99 })).toThrow();
    });

    it("rejects non-number values", () => {
      expect(() => PaycheckAmountSchema.parse({ amountCents: "100" })).toThrow(); // Type error
      expect(() => PaycheckAmountSchema.parse({ amountCents: null })).toThrow();
      expect(() => PaycheckAmountSchema.parse({ amountCents: undefined })).toThrow();
    });
  });

  describe("AllocationItemSchema", () => {
    it("accepts valid allocations", () => {
      expect(() =>
        AllocationItemSchema.parse({ envelopeId: "env_1", amountCents: 100000 })
      ).not.toThrow();
      expect(() =>
        AllocationItemSchema.parse({ envelopeId: "env_groceries", amountCents: 0 })
      ).not.toThrow(); // Zero is valid (non-negative)
    });

    it("rejects missing envelope ID", () => {
      expect(() => AllocationItemSchema.parse({ envelopeId: "", amountCents: 100 })).toThrow(
        "Envelope ID is required"
      );
    });

    it("rejects negative amounts", () => {
      expect(() => AllocationItemSchema.parse({ envelopeId: "env_1", amountCents: -100 })).toThrow(
        "Amount cannot be negative"
      );
    });

    it("rejects fractional cents", () => {
      expect(() => AllocationItemSchema.parse({ envelopeId: "env_1", amountCents: 100.5 })).toThrow(
        "Amount must be in whole cents"
      );
    });

    it("rejects non-number amounts", () => {
      expect(() =>
        AllocationItemSchema.parse({ envelopeId: "env_1", amountCents: "100" })
      ).toThrow(); // Type error
    });
  });

  describe("AllocationsArraySchema", () => {
    it("accepts valid allocations array", () => {
      const allocations = [
        { envelopeId: "env_1", amountCents: 100000 },
        { envelopeId: "env_2", amountCents: 150000 },
      ];
      expect(() => AllocationsArraySchema.parse(allocations)).not.toThrow();
    });

    it("accepts single allocation", () => {
      const allocations = [{ envelopeId: "env_1", amountCents: 250000 }];
      expect(() => AllocationsArraySchema.parse(allocations)).not.toThrow();
    });

    it("rejects empty array", () => {
      expect(() => AllocationsArraySchema.parse([])).toThrow("At least one allocation is required");
    });

    it("validates each allocation item", () => {
      const allocations = [
        { envelopeId: "env_1", amountCents: 100000 },
        { envelopeId: "env_2", amountCents: -50000 }, // Invalid: negative
      ];
      expect(() => AllocationsArraySchema.parse(allocations)).toThrow();
    });
  });

  describe("AllocationsWithSumSchema", () => {
    it("accepts allocations that sum to paycheck amount", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).not.toThrow();
    });

    it("accepts allocations with single envelope", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [{ envelopeId: "env_1", amountCents: 250000 }],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).not.toThrow();
    });

    it("rejects allocations that sum too low", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 140000 }, // Sum = 240000 (too low)
        ],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).toThrow(
        "Allocations must sum to exact paycheck amount"
      );
    });

    it("rejects allocations that sum too high", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 160000 }, // Sum = 260000 (too high)
        ],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).toThrow(
        "Allocations must sum to exact paycheck amount"
      );
    });

    it("rejects allocations with rounding errors", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 149999 }, // Sum = 249999 (off by 1 cent)
        ],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).toThrow();
    });

    it("accepts allocations with many envelopes", () => {
      const data = {
        paycheckAmountCents: 250000,
        allocations: [
          { envelopeId: "env_1", amountCents: 50000 },
          { envelopeId: "env_2", amountCents: 50000 },
          { envelopeId: "env_3", amountCents: 50000 },
          { envelopeId: "env_4", amountCents: 50000 },
          { envelopeId: "env_5", amountCents: 50000 },
        ],
      };
      expect(() => AllocationsWithSumSchema.parse(data)).not.toThrow();
    });
  });

  describe("AllocationStrategySchema", () => {
    it("accepts valid strategies", () => {
      expect(() => AllocationStrategySchema.parse("last")).not.toThrow();
      expect(() => AllocationStrategySchema.parse("even")).not.toThrow();
      expect(() => AllocationStrategySchema.parse("smart")).not.toThrow();
      expect(() => AllocationStrategySchema.parse("manual")).not.toThrow();
    });

    it("rejects invalid strategies", () => {
      expect(() => AllocationStrategySchema.parse("invalid")).toThrow();
      expect(() => AllocationStrategySchema.parse("custom")).toThrow();
      expect(() => AllocationStrategySchema.parse("")).toThrow();
    });
  });

  describe("PaycheckWizardDataSchema", () => {
    it("accepts complete valid wizard data", () => {
      const data = {
        paycheckAmountCents: 250000,
        selectedStrategy: "smart",
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ],
      };
      expect(() => PaycheckWizardDataSchema.parse(data)).not.toThrow();
    });

    it("validates all fields", () => {
      const data = {
        paycheckAmountCents: -100, // Invalid
        selectedStrategy: "smart",
        allocations: [{ envelopeId: "env_1", amountCents: 100000 }],
      };
      expect(() => PaycheckWizardDataSchema.parse(data)).toThrow();
    });

    it("rejects missing fields", () => {
      const data = {
        paycheckAmountCents: 250000,
        // Missing selectedStrategy
        allocations: [{ envelopeId: "env_1", amountCents: 250000 }],
      };
      expect(() => PaycheckWizardDataSchema.parse(data)).toThrow();
    });
  });

  describe("Safe Validation Helpers", () => {
    describe("validatePaycheckAmountSafe", () => {
      it("returns success for valid amount", () => {
        const result = validatePaycheckAmountSafe(250000);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amountCents).toBe(250000);
        }
      });

      it("returns error for invalid amount", () => {
        const result = validatePaycheckAmountSafe(-100);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe("validateAllocationsSafe", () => {
      it("returns success for valid allocations", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        const result = validateAllocationsSafe(allocations);
        expect(result.success).toBe(true);
      });

      it("returns error for invalid allocations", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: -100 }, // Invalid: negative
        ];
        const result = validateAllocationsSafe(allocations);
        expect(result.success).toBe(false);
      });
    });

    describe("validateAllocationsWithSumSafe", () => {
      it("returns success when allocations sum correctly", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        const result = validateAllocationsWithSumSafe(250000, allocations);
        expect(result.success).toBe(true);
      });

      it("returns error when allocations do not sum correctly", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 140000 }, // Sum = 240000
        ];
        const result = validateAllocationsWithSumSafe(250000, allocations);
        expect(result.success).toBe(false);
      });
    });

    describe("validateWizardDataSafe", () => {
      it("returns success for valid wizard data", () => {
        const data = {
          paycheckAmountCents: 250000,
          selectedStrategy: "smart",
          allocations: [
            { envelopeId: "env_1", amountCents: 100000 },
            { envelopeId: "env_2", amountCents: 150000 },
          ],
        };
        const result = validateWizardDataSafe(data);
        expect(result.success).toBe(true);
      });

      it("returns error for invalid wizard data", () => {
        const data = {
          paycheckAmountCents: -100,
          selectedStrategy: "smart",
          allocations: [],
        };
        const result = validateWizardDataSafe(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Throwing Validation Helpers", () => {
    describe("validatePaycheckAmount", () => {
      it("returns data for valid amount", () => {
        const result = validatePaycheckAmount(250000);
        expect(result.amountCents).toBe(250000);
      });

      it("throws for invalid amount", () => {
        expect(() => validatePaycheckAmount(-100)).toThrow();
      });
    });

    describe("validateAllocations", () => {
      it("returns data for valid allocations", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        const result = validateAllocations(allocations);
        expect(result).toEqual(allocations);
      });

      it("throws for invalid allocations", () => {
        const allocations = [{ envelopeId: "env_1", amountCents: -100 }];
        expect(() => validateAllocations(allocations)).toThrow();
      });
    });

    describe("validateWizardData", () => {
      it("returns data for valid wizard data", () => {
        const data = {
          paycheckAmountCents: 250000,
          selectedStrategy: "smart" as const,
          allocations: [
            { envelopeId: "env_1", amountCents: 100000 },
            { envelopeId: "env_2", amountCents: 150000 },
          ],
        };
        const result = validateWizardData(data);
        expect(result).toEqual(data);
      });

      it("throws for invalid wizard data", () => {
        const data = {
          paycheckAmountCents: -100,
          selectedStrategy: "smart",
          allocations: [],
        };
        expect(() => validateWizardData(data)).toThrow();
      });
    });
  });

  describe("createPaycheckTransaction", () => {
    it("creates valid transaction from wizard data", () => {
      const wizardData = {
        paycheckAmountCents: 250000,
        selectedStrategy: "smart" as const,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ],
      };

      const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck");

      expect(transaction.type).toBe("income");
      expect(transaction.amount).toBe(250000);
      expect(transaction.envelopeId).toBe("env_paycheck");
      expect(transaction.category).toBe("Paycheck");
      expect(transaction.allocations).toEqual({
        env_1: 100000,
        env_2: 150000,
      });
    });

    it("includes optional fields when provided", () => {
      const wizardData = {
        paycheckAmountCents: 250000,
        selectedStrategy: "smart" as const,
        allocations: [{ envelopeId: "env_1", amountCents: 250000 }],
      };

      const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck", {
        recurrenceRule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR",
        payerName: "Acme Corp",
        description: "Biweekly paycheck",
      });

      expect(transaction.recurrenceRule).toBe("FREQ=WEEKLY;INTERVAL=2;BYDAY=FR");
      expect(transaction.payerName).toBe("Acme Corp");
      expect(transaction.description).toBe("Biweekly paycheck");
    });

    it("validates transaction against TransactionSchema", () => {
      const wizardData = {
        paycheckAmountCents: 250000,
        selectedStrategy: "even" as const,
        allocations: [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ],
      };

      // Should not throw if TransactionSchema validation passes
      expect(() => createPaycheckTransaction(wizardData, "user_123", "env_paycheck")).not.toThrow();
    });

    it("sets correct transaction type and amount sign", () => {
      const wizardData = {
        paycheckAmountCents: 250000,
        selectedStrategy: "manual" as const,
        allocations: [{ envelopeId: "env_1", amountCents: 250000 }],
      };

      const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck");

      expect(transaction.type).toBe("income");
      expect(transaction.amount).toBeGreaterThan(0); // Income is positive
    });
  });

  describe("formatValidationError", () => {
    it("returns first error message", () => {
      const result = validatePaycheckAmountSafe(-100);
      if (!result.success) {
        const message = formatValidationError(result.error);
        expect(message).toContain("Amount must be positive");
      }
    });

    it("handles empty error issues", () => {
      const result = validatePaycheckAmountSafe(-100);
      if (!result.success) {
        // Manually create error with no issues
        const emptyError = { ...result.error, issues: [] };
        const message = formatValidationError(emptyError as any);
        expect(message).toBe("Validation failed");
      }
    });
  });

  describe("Utility Helpers", () => {
    describe("doAllocationsSumToPaycheck", () => {
      it("returns true when allocations sum correctly", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        expect(doAllocationsSumToPaycheck(250000, allocations)).toBe(true);
      });

      it("returns false when allocations sum incorrectly", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 140000 },
        ];
        expect(doAllocationsSumToPaycheck(250000, allocations)).toBe(false);
      });

      it("handles empty allocations", () => {
        expect(doAllocationsSumToPaycheck(250000, [])).toBe(false);
      });

      it("handles single allocation", () => {
        const allocations = [{ envelopeId: "env_1", amountCents: 250000 }];
        expect(doAllocationsSumToPaycheck(250000, allocations)).toBe(true);
      });
    });

    describe("calculateRemainingAmount", () => {
      it("calculates remaining amount correctly", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        expect(calculateRemainingAmount(300000, allocations)).toBe(50000);
      });

      it("returns zero when fully allocated", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 150000 },
        ];
        expect(calculateRemainingAmount(250000, allocations)).toBe(0);
      });

      it("returns negative when over-allocated", () => {
        const allocations = [
          { envelopeId: "env_1", amountCents: 100000 },
          { envelopeId: "env_2", amountCents: 200000 },
        ];
        expect(calculateRemainingAmount(250000, allocations)).toBe(-50000);
      });

      it("handles empty allocations", () => {
        expect(calculateRemainingAmount(250000, [])).toBe(250000);
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles minimum paycheck ($1.00) allocation", () => {
      const wizardData = {
        paycheckAmountCents: 100,
        selectedStrategy: "manual" as const,
        allocations: [{ envelopeId: "env_1", amountCents: 100 }],
      };

      expect(() => validateWizardData(wizardData)).not.toThrow();

      const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck");
      expect(transaction.amount).toBe(100);
    });

    it("handles maximum paycheck ($1,000,000) allocation", () => {
      const wizardData = {
        paycheckAmountCents: 100_000_000,
        selectedStrategy: "manual" as const,
        allocations: [{ envelopeId: "env_1", amountCents: 100_000_000 }],
      };

      expect(() => validateWizardData(wizardData)).not.toThrow();

      const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck");
      expect(transaction.amount).toBe(100_000_000);
    });

    it("handles allocation with dust (prime number)", () => {
      const wizardData = {
        paycheckAmountCents: 100003, // Prime number
        selectedStrategy: "manual" as const,
        allocations: [
          { envelopeId: "env_1", amountCents: 33334 },
          { envelopeId: "env_2", amountCents: 33334 },
          { envelopeId: "env_3", amountCents: 33335 }, // Largest remainder gets dust
        ],
      };

      const result = validateAllocationsWithSumSafe(100003, wizardData.allocations);
      expect(result.success).toBe(true);
    });
  });
});
