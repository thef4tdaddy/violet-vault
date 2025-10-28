import { describe, it, expect } from "vitest";
import {
  validatePaycheckForm,
  getPayerPrediction,
  getUniquePayers,
  calculateEnvelopeAllocations,
  createPaycheckTransaction,
  validateAllocations,
  formatPaycheckAmount,
  getPaycheckStatistics,
} from "../paycheckUtils";
import { ENVELOPE_TYPES } from "../../../constants/categories";

// Type for test data
type PaycheckRecord = { payerName: string; amount: number; processedAt?: string };
type AllocationResult = {
  allocations: Array<{ 
    envelopeId: string; 
    envelopeName: string;
    amount: number; 
    monthlyAmount: number;
    envelopeType: string;
    priority: string;
  }>;
  totalAllocated: number;
  remainingAmount: number;
  allocationRate: number;
};

describe("paycheckUtils", () => {
  describe("validatePaycheckForm", () => {
    const validFormData = {
      amount: "1000",
      payerName: "John Doe",
      allocationMode: "allocate",
    };

    it("should validate a valid form", () => {
      const result = validatePaycheckForm(validFormData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should require paycheck amount", () => {
      const formData = { ...validFormData, amount: "" };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe("Paycheck amount is required");
    });

    it("should validate amount is positive", () => {
      const formData = { ...validFormData, amount: "-100" };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe("Paycheck amount must be a positive number");
    });

    it("should validate amount maximum", () => {
      const formData = { ...validFormData, amount: "1000001" };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe("Paycheck amount cannot exceed $1,000,000");
    });

    it("should require payer name", () => {
      const formData = { ...validFormData, payerName: "   " };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.payerName).toBe("Payer name is required");
    });

    it("should validate payer name length", () => {
      const formData = { ...validFormData, payerName: "x".repeat(101) };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.payerName).toBe("Payer name must be less than 100 characters");
    });

    it("should validate allocation mode", () => {
      const formData = { ...validFormData, allocationMode: "invalid" };
      const result = validatePaycheckForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.allocationMode).toBe("Invalid allocation mode");
    });
  });

  describe("getPayerPrediction", () => {
    const paycheckHistory = [
      { payerName: "John Doe", amount: 1000, date: "2024-01-01" },
      { payerName: "John Doe", amount: 1100, date: "2024-01-15" },
      { payerName: "John Doe", amount: 1050, date: "2024-02-01" },
      { payerName: "Jane Smith", amount: 2000, date: "2024-01-01" },
    ];

    it("should calculate prediction for existing payer", () => {
      const result = getPayerPrediction("John Doe", paycheckHistory);

      expect(result).toMatchObject({
        amount: 1050, // Average of 1000, 1100, 1050
        confidence: expect.any(Number),
        sampleSize: 3,
        range: {
          min: 1000,
          max: 1100,
        },
      });
    });

    it("should return null for unknown payer", () => {
      const result = getPayerPrediction("Unknown", paycheckHistory);
      expect(result).toBeNull();
    });

    it("should return null for empty history", () => {
      const result = getPayerPrediction("John Doe", []);
      expect(result).toBeNull();
    });

    it("should limit to last 5 paychecks", () => {
      const largeHistory = Array.from({ length: 10 }, (_, i) => ({
        payerName: "John Doe",
        amount: 1000 + i * 10,
        date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      }));

      const result = getPayerPrediction("John Doe", largeHistory);
      expect(result.sampleSize).toBe(5);
    });
  });

  describe("getUniquePayers", () => {
    const paycheckHistory: PaycheckRecord[] = [
      { payerName: "John Doe", amount: 1000 },
      { payerName: "Jane Smith", amount: 1500 },
      { payerName: "John Doe", amount: 1200 }, // Duplicate
      { payerName: "   ", amount: 500 }, // Empty/whitespace
    ];

    it("should return unique sorted payers", () => {
      const result = getUniquePayers(paycheckHistory);
      expect(result).toEqual(["Jane Smith", "John Doe"]);
    });

    it("should include temporary payers", () => {
      const tempPayers = ["Alice Johnson", "John Doe"]; // John Doe is duplicate
      const result = getUniquePayers(paycheckHistory, tempPayers);
      expect(result).toEqual(["Alice Johnson", "Jane Smith", "John Doe"]);
    });

    it("should handle empty arrays", () => {
      const result = getUniquePayers([], []);
      expect(result).toEqual([]);
    });
  });

  describe("calculateEnvelopeAllocations", () => {
    const mockEnvelopes = [
      {
        id: "env1",
        name: "Groceries",
        autoAllocate: true,
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        monthlyAmount: 400,
        priority: "high",
      },
      {
        id: "env2",
        name: "Utilities",
        autoAllocate: true,
        envelopeType: ENVELOPE_TYPES.BILL,
        monthlyAmount: 200,
        priority: "critical",
      },
      {
        id: "env3",
        name: "Savings",
        autoAllocate: false, // Should be excluded
        envelopeType: ENVELOPE_TYPES.SAVINGS,
        monthlyAmount: 300,
        priority: "low",
      },
    ];

    it("should calculate standard allocations", () => {
      const result = calculateEnvelopeAllocations(1000, mockEnvelopes, "allocate");

      expect(result.allocations).toHaveLength(2);
      expect(result.totalAllocated).toBeCloseTo(276.92, 1); // ~184.62 + ~92.31
      expect(result.remainingAmount).toBeCloseTo(723.08, 1); // 1000 - 276.92
      expect(result.allocationRate).toBeGreaterThan(0);
    });

    it("should calculate leftover distribution", () => {
      const result = calculateEnvelopeAllocations(1000, mockEnvelopes, "leftover");

      expect(result.allocations).toHaveLength(2);
      expect(result.totalAllocated).toBe(1000); // Full amount distributed
      expect(result.remainingAmount).toBe(0);
      expect(result.allocationRate).toBe(100);
    });

    it("should handle zero amount", () => {
      const result = calculateEnvelopeAllocations(0, mockEnvelopes, "allocate");

      expect(result.allocations).toHaveLength(0);
      expect(result.totalAllocated).toBe(0);
      expect(result.remainingAmount).toBe(0);
      expect(result.allocationRate).toBe(0);
    });

    it("should filter out non-auto-allocate envelopes", () => {
      const result = calculateEnvelopeAllocations(1000, mockEnvelopes, "allocate");

      const savingsAllocation = result.allocations.find((a) => a.envelopeId === "env3");
      expect(savingsAllocation).toBeUndefined();
    });

    it("should sort allocations by priority", () => {
      const result = calculateEnvelopeAllocations(1000, mockEnvelopes, "allocate");

      // Should be sorted by priority: critical > high > medium > low
      expect(result.allocations[0].priority).toBe("critical");
    });
  });

  describe("createPaycheckTransaction", () => {
    const formData = {
      amount: "1000",
      payerName: "John Doe",
      allocationMode: "allocate",
    };

    const allocations: AllocationResult = {
      allocations: [
        {
          envelopeId: "env1",
          envelopeName: "Envelope 1",
          amount: 400,
          monthlyAmount: 400,
          envelopeType: ENVELOPE_TYPES.EXPENSE,
          priority: "high",
        },
        {
          envelopeId: "env2",
          envelopeName: "Envelope 2",
          amount: 200,
          monthlyAmount: 200,
          envelopeType: ENVELOPE_TYPES.EXPENSE,
          priority: "medium",
        },
      ],
      totalAllocated: 600,
      remainingAmount: 400,
    };

    const currentUser = { userName: "Test User" };

    it("should create paycheck transaction object", () => {
      const result = createPaycheckTransaction(formData, allocations, currentUser);

      expect(result).toMatchObject({
        amount: 1000,
        payerName: "John Doe",
        allocationMode: "allocate",
        allocations: allocations.allocations,
        totalAllocated: 600,
        remainingAmount: 400,
        processedBy: "Test User",
        date: expect.any(String),
      });

      expect(result.id).toBeDefined();
      expect(result.processedAt).toBeDefined();
    });

    it("should handle missing user info", () => {
      const result = createPaycheckTransaction(formData, allocations, null);
      expect(result.processedBy).toBe("Unknown User");
    });
  });

  describe("validateAllocations", () => {
    it("should validate correct allocations", () => {
      const allocations = [
        { envelopeId: "1", envelopeName: "Groceries", amount: 400, monthlyAmount: 400, envelopeType: "expense", priority: "high" },
        { envelopeId: "2", envelopeName: "Rent", amount: 300, monthlyAmount: 300, envelopeType: "expense", priority: "high" }
      ];

      const result = validateAllocations(allocations, 1000);

      expect(result.isValid).toBe(true);
      expect(result.message).toBe("Allocations are valid");
    });

    it("should detect overage", () => {
      const allocations = [
        { envelopeId: "1", envelopeName: "Groceries", amount: 600, monthlyAmount: 600, envelopeType: "expense", priority: "high" },
        { envelopeId: "2", envelopeName: "Rent", amount: 500, monthlyAmount: 500, envelopeType: "expense", priority: "high" }
      ];

      const result = validateAllocations(allocations, 1000);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain("exceed paycheck amount");
      expect(result.overage).toBe(100);
    });

    it("should detect negative allocations", () => {
      const allocations = [
        { envelopeId: "1", envelopeName: "Groceries", amount: -100, monthlyAmount: -100, envelopeType: "expense", priority: "high" }
      ];

      const result = validateAllocations(allocations, 1000);

      expect(result.isValid).toBe(false);
      expect(result.message).toBe("Allocations cannot be negative");
    });
  });

  describe("formatPaycheckAmount", () => {
    it("should format valid numbers", () => {
      expect(formatPaycheckAmount(1000)).toBe("$1000.00");
      expect(formatPaycheckAmount(1000.5)).toBe("$1000.50");
    });

    it("should handle invalid inputs", () => {
      expect(formatPaycheckAmount("invalid" as unknown as number)).toBe("$0.00");
      expect(formatPaycheckAmount(null as unknown as number)).toBe("$0.00");
      expect(formatPaycheckAmount(NaN)).toBe("$0.00");
    });
  });

  describe("getPaycheckStatistics", () => {
    const paycheckHistory = [
      { payerName: "John Doe", amount: 1000, processedAt: "2024-01-01" },
      { payerName: "John Doe", amount: 1200, processedAt: "2024-01-15" },
      { payerName: "Jane Smith", amount: 2000, processedAt: "2024-01-01" },
    ];

    it("should calculate overall statistics", () => {
      const result = getPaycheckStatistics(paycheckHistory);

      expect(result).toMatchObject({
        count: 3,
        totalAmount: 4200,
        averageAmount: 1400,
        minAmount: 1000,
        maxAmount: 2000,
        lastPaycheckDate: "2024-01-01",
      });
    });

    it("should filter by payer", () => {
      const result = getPaycheckStatistics(paycheckHistory, "John Doe");

      expect(result).toMatchObject({
        count: 2,
        totalAmount: 2200,
        averageAmount: 1100,
        minAmount: 1000,
        maxAmount: 1200,
      });
    });

    it("should handle empty history", () => {
      const result = getPaycheckStatistics([]);

      expect(result).toMatchObject({
        count: 0,
        totalAmount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        lastPaycheckDate: null,
      });
    });
  });
});
