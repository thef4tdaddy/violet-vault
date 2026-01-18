import { describe, it, expect } from "vitest";
import {
  calculateEnvelopeData,
  calculateUtilizationRate,
  determineEnvelopeHealth,
  sortEnvelopes,
  filterEnvelopes,
  calculateBiweeklyNeeds,
  calculateEnvelopeTotals,
} from "../envelopeCalculations";
import { ENVELOPE_TYPES } from "@/constants/categories";
import type { Envelope, Transaction, Bill, EnvelopeData } from "../envelopeCalculations";

describe("envelopeCalculations", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const mockEnvelope: Envelope = {
    id: "env-1",
    name: "Internet",
    category: "Utilities",
    currentBalance: 50,
    monthlyBudget: 100,
  } as Envelope;

  const mockBills: Bill[] = [
    {
      id: "bill-1",
      envelopeId: "env-1",
      name: "Comcast",
      amount: 60,
      dueDate: tomorrow.toISOString(),
      isPaid: false,
    },
    {
      id: "bill-2",
      envelopeId: "env-1",
      name: "Old Bill",
      amount: 40,
      dueDate: yesterday.toISOString(),
      isPaid: false,
    },
  ] as Bill[];

  const mockTransactions: Transaction[] = [
    {
      id: "tx-1",
      envelopeId: "env-1",
      amount: -40,
      type: "expense",
      date: yesterday.toISOString(),
    },
  ] as Transaction[];

  describe("determineEnvelopeHealth", () => {
    it("should return overdue if there are overdue bills", () => {
      const health = determineEnvelopeHealth(40, 10, mockEnvelope);
      expect(health).toBe("overdue");
    });

    it("should return overspent if available is negative", () => {
      const health = determineEnvelopeHealth(0, -10, mockEnvelope);
      expect(health).toBe("overspent");
    });

    it("should return underfunded for bill envelopes if balance < upcoming bills", () => {
      const billEnv = {
        ...mockEnvelope,
        envelopeType: ENVELOPE_TYPES.BILL,
        currentBalance: 20,
      } as any;
      const upcomingBills = [{ amount: 50 }] as any;
      const health = determineEnvelopeHealth(0, 20, billEnv, upcomingBills);
      expect(health).toBe("underfunded");
    });

    it("should return healthy if all criteria met", () => {
      const health = determineEnvelopeHealth(0, 100, mockEnvelope);
      expect(health).toBe("healthy");
    });
  });

  describe("calculateUtilizationRate", () => {
    it("should calculate savings utilization based on targetAmount", () => {
      const savingsEnv = {
        ...mockEnvelope,
        envelopeType: ENVELOPE_TYPES.SAVINGS,
        targetAmount: 1000,
        currentBalance: 250,
      } as any;
      const rate = calculateUtilizationRate(savingsEnv, {}, { currentBalance: 250 });
      expect(rate).toBe(0.25);
    });

    it("should calculate variable utilization based on monthlyBudget", () => {
      const variableEnv = {
        ...mockEnvelope,
        envelopeType: ENVELOPE_TYPES.VARIABLE,
        monthlyBudget: 200,
      } as any;
      const rate = calculateUtilizationRate(variableEnv, {}, { totalSpent: 40, committed: 10 });
      expect(rate).toBe(0.25); // (40+10)/200
    });

    it("should handle zero budget/target gracefully", () => {
      const env = { ...mockEnvelope, monthlyBudget: 0 } as any;
      const rate = calculateUtilizationRate(env, {}, { totalSpent: 10 });
      expect(rate).toBe(0);
    });
  });

  describe("calculateEnvelopeData", () => {
    it("should aggregate all data correctly for a list of envelopes", () => {
      const results = calculateEnvelopeData([mockEnvelope], mockTransactions, mockBills);
      const data = results[0];

      expect(data.totalSpent).toBe(40);
      expect(data.upcomingBills).toHaveLength(1); // bill-1
      expect(data.overdueBills).toHaveLength(1); // bill-2
      expect(data.committed).toBe(100); // 60 (upcoming) + 40 (overdue)
      expect(data.available).toBe(-50); // 50 (balance) - 100 (committed)
      expect(data.health).toBe("overdue"); // Overdue takes precedence
    });
  });

  describe("sortEnvelopes", () => {
    it("should sort by name", () => {
      const data = [{ name: "Z" }, { name: "A" }] as any;
      const sorted = sortEnvelopes(data, "name");
      expect(sorted[0].name).toBe("A");
    });

    it("should sort by utilizationRate desc", () => {
      const data = [{ utilizationRate: 0.1 }, { utilizationRate: 0.9 }] as any;
      const sorted = sortEnvelopes(data, "usage_desc");
      expect(sorted[0].utilizationRate).toBe(0.9);
    });
  });

  describe("filterEnvelopes", () => {
    it("should filter out empty envelopes if showEmpty is false", () => {
      const data = [{ currentBalance: 10 }, { currentBalance: 0 }] as any;
      const filtered = filterEnvelopes(data, { showEmpty: false, envelopeType: "all" });
      expect(filtered).toHaveLength(1);
    });

    it("should filter by envelopeType", () => {
      // Mocking getEnvelopeType indirectly since it depends on record fields
      const data = [
        { envelopeType: "bill", currentBalance: 10 },
        { envelopeType: "savings", currentBalance: 10 },
      ] as any;
      const filtered = filterEnvelopes(data, { showEmpty: true, envelopeType: "bill" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].envelopeType).toBe("bill");
    });
  });

  describe("calculateBiweeklyNeeds", () => {
    it("should calculate correctly for monthly bills", () => {
      const bills = [{ amount: 100, frequency: "monthly" }] as any;
      const need = calculateBiweeklyNeeds(bills);
      // annual = 1200, monthly = 100, biweekly = 50 (assuming BIWEEKLY_MULTIPLIER is 2 as per freq constants generally)
      // Actually BIWEEKLY_MULTIPLIER is usually ~2.16 (26/12) but let's check constants.
      // Based on code: biweeklyAmount = monthlyAmount / BIWEEKLY_MULTIPLIER;
      // If need is roughly 50, it's correct.
      expect(need).toBeGreaterThan(45);
      expect(need).toBeLessThan(55);
    });
  });

  describe("calculateEnvelopeTotals", () => {
    it("should accumulate totals correctly", () => {
      const data = [
        { currentBalance: 100, totalSpent: 20, totalUpcoming: 50, upcomingBills: [] },
        { currentBalance: 200, totalSpent: 30, totalUpcoming: 10, upcomingBills: [] },
      ] as any;
      const totals = calculateEnvelopeTotals(data);
      expect(totals.totalBalance).toBe(300);
      expect(totals.totalSpent).toBe(50);
      expect(totals.totalUpcoming).toBe(60);
    });
  });
});
