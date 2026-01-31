/**
 * Tests for Auto-Fix Suggestion Algorithm
 */

import {
  generateAutoFixSuggestions,
  applyAutoFixSuggestions,
  validateAutoFixSuggestions,
  calculateTotalTransferAmount,
  type EnvelopeWithAllocation,
} from "../autoFixSuggestions";
import type { BillCoverageResult } from "@/services/forecasting/forecastingService";

describe("autoFixSuggestions", () => {
  describe("generateAutoFixSuggestions", () => {
    it("returns empty array when no bills have shortages", () => {
      const bills: BillCoverageResult[] = [
        {
          billId: "bill1",
          envelopeId: "env1",
          currentBalance: 50000,
          allocationAmount: 50000,
          projectedBalance: 100000,
          billAmount: 80000,
          shortage: 0,
          coveragePercent: 125,
          status: "covered",
          daysUntilDue: 5,
        },
      ];

      const envelopes: EnvelopeWithAllocation[] = [];

      const suggestions = generateAutoFixSuggestions(bills, envelopes);
      expect(suggestions).toEqual([]);
    });

    it("returns empty array when no discretionary envelopes have excess", () => {
      const bills: BillCoverageResult[] = [
        {
          billId: "bill1",
          envelopeId: "env_bill",
          currentBalance: 0,
          allocationAmount: 20000,
          projectedBalance: 20000,
          billAmount: 80000,
          shortage: 60000,
          coveragePercent: 25,
          status: "uncovered",
          daysUntilDue: 5,
        },
      ];

      const envelopes: EnvelopeWithAllocation[] = [
        {
          id: "env_bill",
          name: "Rent",
          currentBalance: 0,
          monthlyTarget: 80000,
          isDiscretionary: false,
          category: "Housing",
          allocationAmount: 20000,
        },
      ];

      const suggestions = generateAutoFixSuggestions(bills, envelopes);
      expect(suggestions).toEqual([]);
    });

    it("generates suggestions to cover bill shortage from discretionary excess", () => {
      const bills: BillCoverageResult[] = [
        {
          billId: "bill1",
          envelopeId: "env_rent",
          currentBalance: 20000,
          allocationAmount: 20000,
          projectedBalance: 40000,
          billAmount: 80000,
          shortage: 40000,
          coveragePercent: 50,
          status: "partial",
          daysUntilDue: 5,
        },
      ];

      const envelopes: EnvelopeWithAllocation[] = [
        {
          id: "env_rent",
          name: "Rent",
          currentBalance: 20000,
          monthlyTarget: 80000,
          isDiscretionary: false,
          category: "Housing",
          allocationAmount: 20000,
        },
        {
          id: "env_dining",
          name: "Dining Out",
          currentBalance: 10000,
          monthlyTarget: 30000,
          isDiscretionary: true,
          category: "Food & Dining",
          allocationAmount: 50000, // Excess: 60000 - 30000 = 30000
        },
      ];

      const suggestions = generateAutoFixSuggestions(bills, envelopes);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0]).toMatchObject({
        fromEnvelopeId: "env_dining",
        fromEnvelopeName: "Dining Out",
        toEnvelopeId: "env_rent",
        toEnvelopeName: "Rent",
        amountCents: 30000, // Limited by available excess
      });
    });

    it("distributes from multiple discretionary envelopes to cover full shortage", () => {
      const bills: BillCoverageResult[] = [
        {
          billId: "bill1",
          envelopeId: "env_rent",
          currentBalance: 0,
          allocationAmount: 20000,
          projectedBalance: 20000,
          billAmount: 80000,
          shortage: 60000,
          coveragePercent: 25,
          status: "uncovered",
          daysUntilDue: 3,
        },
      ];

      const envelopes: EnvelopeWithAllocation[] = [
        {
          id: "env_rent",
          name: "Rent",
          currentBalance: 0,
          monthlyTarget: 80000,
          isDiscretionary: false,
          category: "Housing",
          allocationAmount: 20000,
        },
        {
          id: "env_dining",
          name: "Dining",
          currentBalance: 10000,
          monthlyTarget: 30000,
          isDiscretionary: true,
          category: "Food & Dining",
          allocationAmount: 50000, // Excess: 30000
        },
        {
          id: "env_entertainment",
          name: "Entertainment",
          currentBalance: 5000,
          monthlyTarget: 20000,
          isDiscretionary: true,
          category: "Entertainment",
          allocationAmount: 40000, // Excess: 25000
        },
      ];

      const suggestions = generateAutoFixSuggestions(bills, envelopes);

      expect(suggestions).toHaveLength(2);

      // Should transfer from Entertainment first (higher excess)
      expect(suggestions[0]).toMatchObject({
        fromEnvelopeId: "env_entertainment",
        toEnvelopeId: "env_rent",
        amountCents: 25000,
      });

      // Then from Dining
      expect(suggestions[1]).toMatchObject({
        fromEnvelopeId: "env_dining",
        toEnvelopeId: "env_rent",
        amountCents: 30000,
      });

      // Total transfer should be 55000 (still 5000 short)
      const total = suggestions.reduce((sum, s) => sum + s.amountCents, 0);
      expect(total).toBe(55000);
    });

    it("prioritizes bills by shortage amount (largest first)", () => {
      const bills: BillCoverageResult[] = [
        {
          billId: "bill1",
          envelopeId: "env_power",
          currentBalance: 0,
          allocationAmount: 0,
          projectedBalance: 0,
          billAmount: 12000,
          shortage: 12000,
          coveragePercent: 0,
          status: "uncovered",
          daysUntilDue: 5,
        },
        {
          billId: "bill2",
          envelopeId: "env_rent",
          currentBalance: 0,
          allocationAmount: 0,
          projectedBalance: 0,
          billAmount: 80000,
          shortage: 80000,
          coveragePercent: 0,
          status: "uncovered",
          daysUntilDue: 3,
        },
      ];

      const envelopes: EnvelopeWithAllocation[] = [
        {
          id: "env_rent",
          name: "Rent",
          currentBalance: 0,
          monthlyTarget: 80000,
          isDiscretionary: false,
          category: "Housing",
          allocationAmount: 0,
        },
        {
          id: "env_power",
          name: "Power",
          currentBalance: 0,
          monthlyTarget: 12000,
          isDiscretionary: false,
          category: "Bills & Utilities",
          allocationAmount: 0,
        },
        {
          id: "env_dining",
          name: "Dining",
          currentBalance: 0,
          monthlyTarget: 20000,
          isDiscretionary: true,
          category: "Food & Dining",
          allocationAmount: 50000, // Excess: 30000
        },
      ];

      const suggestions = generateAutoFixSuggestions(bills, envelopes);

      // Should cover rent first (larger shortage)
      expect(suggestions[0].toEnvelopeId).toBe("env_rent");
      expect(suggestions[0].amountCents).toBe(30000); // All available excess
    });
  });

  describe("applyAutoFixSuggestions", () => {
    it("applies suggestions to allocations correctly", () => {
      const allocations = [
        { envelopeId: "env_dining", amountCents: 50000 },
        { envelopeId: "env_rent", amountCents: 20000 },
      ];

      const suggestions = [
        {
          fromEnvelopeId: "env_dining",
          fromEnvelopeName: "Dining",
          toEnvelopeId: "env_rent",
          toEnvelopeName: "Rent",
          amountCents: 30000,
          reason: "Cover shortage",
        },
      ];

      const result = applyAutoFixSuggestions(allocations, suggestions);

      expect(result).toContainEqual({ envelopeId: "env_dining", amountCents: 20000 });
      expect(result).toContainEqual({ envelopeId: "env_rent", amountCents: 50000 });
    });

    it("prevents negative allocations", () => {
      const allocations = [{ envelopeId: "env_dining", amountCents: 10000 }];

      const suggestions = [
        {
          fromEnvelopeId: "env_dining",
          fromEnvelopeName: "Dining",
          toEnvelopeId: "env_rent",
          toEnvelopeName: "Rent",
          amountCents: 20000, // More than available
          reason: "Test",
        },
      ];

      const result = applyAutoFixSuggestions(allocations, suggestions);

      const dining = result.find((a) => a.envelopeId === "env_dining");
      expect(dining?.amountCents).toBe(0); // Should be 0, not negative
    });

    it("creates new allocation if envelope not in original allocations", () => {
      const allocations = [{ envelopeId: "env_dining", amountCents: 50000 }];

      const suggestions = [
        {
          fromEnvelopeId: "env_dining",
          fromEnvelopeName: "Dining",
          toEnvelopeId: "env_rent",
          toEnvelopeName: "Rent",
          amountCents: 30000,
          reason: "Cover shortage",
        },
      ];

      const result = applyAutoFixSuggestions(allocations, suggestions);

      expect(result.find((a) => a.envelopeId === "env_rent")).toBeDefined();
      expect(result.find((a) => a.envelopeId === "env_rent")?.amountCents).toBe(30000);
    });
  });

  describe("calculateTotalTransferAmount", () => {
    it("sums up all suggestion amounts", () => {
      const suggestions = [
        {
          fromEnvelopeId: "env1",
          fromEnvelopeName: "Env 1",
          toEnvelopeId: "env2",
          toEnvelopeName: "Env 2",
          amountCents: 10000,
          reason: "Test",
        },
        {
          fromEnvelopeId: "env1",
          fromEnvelopeName: "Env 1",
          toEnvelopeId: "env3",
          toEnvelopeName: "Env 3",
          amountCents: 20000,
          reason: "Test",
        },
      ];

      expect(calculateTotalTransferAmount(suggestions)).toBe(30000);
    });

    it("returns 0 for empty suggestions", () => {
      expect(calculateTotalTransferAmount([])).toBe(0);
    });
  });

  describe("validateAutoFixSuggestions", () => {
    it("validates sufficient funds are available", () => {
      const allocations = [{ envelopeId: "env1", amountCents: 50000 }];

      const suggestions = [
        {
          fromEnvelopeId: "env1",
          fromEnvelopeName: "Envelope 1",
          toEnvelopeId: "env2",
          toEnvelopeName: "Envelope 2",
          amountCents: 30000,
          reason: "Test",
        },
      ];

      const result = validateAutoFixSuggestions(allocations, suggestions);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("detects insufficient funds", () => {
      const allocations = [{ envelopeId: "env1", amountCents: 10000 }];

      const suggestions = [
        {
          fromEnvelopeId: "env1",
          fromEnvelopeName: "Envelope 1",
          toEnvelopeId: "env2",
          toEnvelopeName: "Envelope 2",
          amountCents: 20000,
          reason: "Test",
        },
      ];

      const result = validateAutoFixSuggestions(allocations, suggestions);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("Cannot transfer");
    });

    it("detects invalid transfer amounts", () => {
      const allocations = [{ envelopeId: "env1", amountCents: 50000 }];

      const suggestions = [
        {
          fromEnvelopeId: "env1",
          fromEnvelopeName: "Envelope 1",
          toEnvelopeId: "env2",
          toEnvelopeName: "Envelope 2",
          amountCents: 0,
          reason: "Test",
        },
      ];

      const result = validateAutoFixSuggestions(allocations, suggestions);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid transfer amount");
    });
  });
});
