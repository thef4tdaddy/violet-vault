/**
 * Bill Calculations Utility Tests
 * Tests for the extracted bill calculation utilities
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  normalizeBillDate,
  calculateDaysUntilDue,
  determineBillUrgency,
  processBillCalculations,
  categorizeBills,
  calculateBillTotals,
  filterBills,
} from "../../../utils/bills/billCalculations";

// Mock console to avoid warnings in tests
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("Bill Calculations Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeBillDate", () => {
    it("should handle ISO date strings", () => {
      const result = normalizeBillDate("2024-01-15T00:00:00Z");
      expect(result).toBe("2024-01-15");
    });

    it("should handle YYYY-MM-DD format", () => {
      const result = normalizeBillDate("2024-01-15");
      expect(result).toBe("2024-01-15");
    });

    it("should handle MM/DD/YYYY format", () => {
      const result = normalizeBillDate("01/15/2024");
      expect(result).toBe("2024-01-15");
    });

    it("should handle MM-DD-YYYY format", () => {
      const result = normalizeBillDate("01-15-2024");
      expect(result).toBe("2024-01-15");
    });

    it("should handle two-digit years", () => {
      const result = normalizeBillDate("01/15/24");
      expect(result).toBe("2024-01-15");
    });

    it("should return empty string for invalid dates", () => {
      const result = normalizeBillDate("invalid-date");
      expect(result).toBe("");
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it("should return empty string for null/undefined", () => {
      expect(normalizeBillDate(null)).toBe("");
      expect(normalizeBillDate(undefined)).toBe("");
      expect(normalizeBillDate("")).toBe("");
    });
  });

  describe("calculateDaysUntilDue", () => {
    const testDate = new Date("2024-01-10T12:00:00Z");

    it("should calculate positive days for future dates", () => {
      const result = calculateDaysUntilDue("2024-01-15", testDate);
      expect(result).toBe(5);
    });

    it("should calculate negative days for past dates", () => {
      const result = calculateDaysUntilDue("2024-01-05", testDate);
      expect(result).toBe(-5);
    });

    it("should return 0 for same day", () => {
      const result = calculateDaysUntilDue("2024-01-10", testDate);
      expect(result).toBe(0);
    });

    it("should return null for invalid dates", () => {
      const result = calculateDaysUntilDue("invalid-date", testDate);
      expect(result).toBe(null);
    });

    it("should return null for empty dates", () => {
      expect(calculateDaysUntilDue("", testDate)).toBe(null);
      expect(calculateDaysUntilDue(null, testDate)).toBe(null);
      expect(calculateDaysUntilDue(undefined, testDate)).toBe(null);
    });

    it("should use current date by default", () => {
      const result = calculateDaysUntilDue("2030-01-01");
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("determineBillUrgency", () => {
    it("should return 'overdue' for negative days", () => {
      expect(determineBillUrgency(-1)).toBe("overdue");
      expect(determineBillUrgency(-30)).toBe("overdue");
    });

    it("should return 'urgent' for 0-2 days", () => {
      expect(determineBillUrgency(0)).toBe("urgent");
      expect(determineBillUrgency(1)).toBe("urgent");
      expect(determineBillUrgency(2)).toBe("urgent");
    });

    it("should return 'soon' for 3-7 days", () => {
      expect(determineBillUrgency(3)).toBe("soon");
      expect(determineBillUrgency(5)).toBe("soon");
      expect(determineBillUrgency(7)).toBe("soon");
    });

    it("should return 'normal' for more than 7 days", () => {
      expect(determineBillUrgency(8)).toBe("normal");
      expect(determineBillUrgency(30)).toBe("normal");
    });

    it("should return 'normal' for null days", () => {
      expect(determineBillUrgency(null)).toBe("normal");
    });
  });

  describe("processBillCalculations", () => {
    it("should add calculated fields to bill", () => {
      const testDate = new Date("2024-01-10T12:00:00Z");
      const bill = {
        id: "bill-1",
        name: "Test Bill",
        dueDate: "2024-01-15",
        amount: 100,
      };

      const result = processBillCalculations(bill, testDate);

      expect(result).toEqual(
        expect.objectContaining({
          id: "bill-1",
          name: "Test Bill",
          dueDate: "2024-01-15",
          amount: 100,
          daysUntilDue: 5,
          urgency: "soon",
        }),
      );
    });

    it("should handle bills without due dates", () => {
      const bill = {
        id: "bill-1",
        name: "Test Bill",
        amount: 100,
      };

      const result = processBillCalculations(bill);

      expect(result.daysUntilDue).toBe(null);
      expect(result.urgency).toBe("normal");
    });

    it("should preserve existing bill properties", () => {
      const bill = {
        id: "bill-1",
        name: "Test Bill",
        category: "Utilities",
        notes: "Electric bill",
        isPaid: false,
      };

      const result = processBillCalculations(bill);

      expect(result.category).toBe("Utilities");
      expect(result.notes).toBe("Electric bill");
      expect(result.isPaid).toBe(false);
    });
  });

  describe("categorizeBills", () => {
    const testBills = [
      {
        id: "bill-1",
        name: "Overdue Bill",
        daysUntilDue: -5,
        isPaid: false,
        amount: 100,
      },
      {
        id: "bill-2",
        name: "Upcoming Bill",
        daysUntilDue: 10,
        isPaid: false,
        amount: 150,
      },
      {
        id: "bill-3",
        name: "Paid Bill",
        daysUntilDue: 5,
        isPaid: true,
        amount: 75,
        paidDate: "2024-01-05",
      },
      {
        id: "bill-4",
        name: "Another Upcoming",
        daysUntilDue: 3,
        isPaid: false,
        amount: 200,
      },
    ];

    it("should categorize bills correctly", () => {
      const result = categorizeBills(testBills);

      expect(result.overdue).toHaveLength(1);
      expect(result.overdue[0].id).toBe("bill-1");

      expect(result.upcoming).toHaveLength(2);
      expect(result.upcoming.map((b) => b.id)).toContain("bill-2");
      expect(result.upcoming.map((b) => b.id)).toContain("bill-4");

      expect(result.paid).toHaveLength(1);
      expect(result.paid[0].id).toBe("bill-3");

      expect(result.all).toHaveLength(4);
    });

    it("should sort upcoming bills by days until due", () => {
      const result = categorizeBills(testBills);

      expect(result.upcoming[0].daysUntilDue).toBe(3);
      expect(result.upcoming[1].daysUntilDue).toBe(10);
    });

    it("should sort overdue bills by days overdue (most overdue first)", () => {
      const overdueBills = [
        { id: "bill-1", daysUntilDue: -2, isPaid: false },
        { id: "bill-2", daysUntilDue: -10, isPaid: false },
        { id: "bill-3", daysUntilDue: -5, isPaid: false },
      ];

      const result = categorizeBills(overdueBills);

      expect(result.overdue[0].daysUntilDue).toBe(-10); // Most overdue first
      expect(result.overdue[1].daysUntilDue).toBe(-5);
      expect(result.overdue[2].daysUntilDue).toBe(-2);
    });

    it("should handle empty bills array", () => {
      const result = categorizeBills([]);

      expect(result.upcoming).toEqual([]);
      expect(result.overdue).toEqual([]);
      expect(result.paid).toEqual([]);
      expect(result.all).toEqual([]);
    });
  });

  describe("calculateBillTotals", () => {
    const categorizedBills = {
      upcoming: [
        { amount: 100, monthlyAmount: 100 },
        { amount: 150, monthlyAmount: 150 },
      ],
      overdue: [{ amount: 75, monthlyAmount: 75 }],
      paid: [
        { amount: 200, monthlyAmount: 200 },
        { amount: 50, monthlyAmount: 50 },
      ],
      all: [
        { amount: 100, monthlyAmount: 100 },
        { amount: 150, monthlyAmount: 150 },
        { amount: 75, monthlyAmount: 75 },
        { amount: 200, monthlyAmount: 200 },
        { amount: 50, monthlyAmount: 50 },
      ],
    };

    it("should calculate totals correctly", () => {
      const result = calculateBillTotals(categorizedBills);

      expect(result.upcoming).toBe(250); // 100 + 150
      expect(result.overdue).toBe(75);
      expect(result.paid).toBe(250); // 200 + 50
      expect(result.total).toBe(575); // 100 + 150 + 75 + 200 + 50
    });

    it("should handle missing categories", () => {
      const incomplete = {
        upcoming: [{ amount: 100, monthlyAmount: 100 }],
      };

      const result = calculateBillTotals(incomplete);

      expect(result.upcoming).toBe(100);
      expect(result.overdue).toBe(0);
      expect(result.paid).toBe(0);
      expect(result.total).toBe(0);
    });

    it("should handle bills without monthlyAmount", () => {
      const billsWithoutMonthly = {
        upcoming: [{ amount: 100 }, { amount: 150 }],
        overdue: [],
        paid: [],
        all: [{ amount: 100 }, { amount: 150 }],
      };

      const result = calculateBillTotals(billsWithoutMonthly);

      expect(result.upcoming).toBe(250);
      expect(result.total).toBe(250);
    });
  });

  describe("filterBills", () => {
    const testBills = [
      {
        id: "bill-1",
        name: "Electric Bill",
        category: "Utilities",
        urgency: "overdue",
        amount: 120.5,
      },
      {
        id: "bill-2",
        name: "Internet Service",
        category: "Utilities",
        urgency: "soon",
        amount: 75.0,
      },
      {
        id: "bill-3",
        name: "Car Insurance",
        category: "Insurance",
        urgency: "normal",
        amount: 85.25,
      },
    ];

    it("should filter by search term", () => {
      const filters = { search: "electric" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Electric Bill");
    });

    it("should filter by urgency", () => {
      const filters = { urgency: "overdue" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(1);
      expect(result[0].urgency).toBe("overdue");
    });

    it("should filter by amount range", () => {
      const filters = { amountMin: "80", amountMax: "100" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(85.25);
    });

    it("should apply multiple filters", () => {
      const filters = {
        search: "service",
        urgency: "soon",
        amountMin: "70",
      };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Internet Service");
    });

    it("should return all bills with empty filters", () => {
      const filters = {};
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(3);
    });

    it("should handle case-insensitive search", () => {
      const filters = { search: "ELECTRIC" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Electric Bill");
    });

    it("should return empty array when no bills match", () => {
      const filters = { search: "nonexistent" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(0);
    });

    it("should handle invalid amount filters gracefully", () => {
      const filters = { amountMin: "invalid", amountMax: "also invalid" };
      const result = filterBills(testBills, filters);

      expect(result).toHaveLength(3); // Should return all bills
    });
  });
});
