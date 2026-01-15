import {
  normalizeBillDate,
  calculateDaysUntilDue,
  calculateBillUrgency,
  processBillCalculations,
  categorizeBills,
  calculateBillTotals,
  filterBills,
} from "../billCalculations";
import logger from "@/utils/core/common/logger";

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    warn: vi.fn(),
  },
}));

describe("billCalculations", () => {
  const referenceDate = new Date("2023-09-08");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeBillDate", () => {
    it("should handle YYYY-MM-DD format", () => {
      expect(normalizeBillDate("2023-09-15")).toBe("2023-09-15");
    });

    it("should handle Date objects", () => {
      const date = new Date("2023-09-15T10:30:00Z");
      expect(normalizeBillDate(date)).toBe("2023-09-15");
    });

    it("should handle ISO date strings", () => {
      expect(normalizeBillDate("2023-09-15T10:30:00Z")).toBe("2023-09-15");
      expect(normalizeBillDate("2023-09-15T00:00:00.000Z")).toBe("2023-09-15");
    });

    it("should handle MM/DD/YYYY format", () => {
      expect(normalizeBillDate("09/15/2023")).toBe("2023-09-15");
      expect(normalizeBillDate("9/5/2023")).toBe("2023-09-05");
    });

    it("should handle MM-DD-YYYY format", () => {
      expect(normalizeBillDate("09-15-2023")).toBe("2023-09-15");
      expect(normalizeBillDate("9-5-2023")).toBe("2023-09-05");
    });

    it("should handle MM/DD/YY format with 2-digit years", () => {
      expect(normalizeBillDate("09/15/25")).toBe("2025-09-15"); // 25 -> 2025
      expect(normalizeBillDate("09/15/95")).toBe("1995-09-15"); // 95 -> 1995
    });

    it("should handle MM-DD-YY format with 2-digit years", () => {
      expect(normalizeBillDate("09-15-25")).toBe("2025-09-15");
      expect(normalizeBillDate("09-15-95")).toBe("1995-09-15");
    });

    it("should handle empty or null input", () => {
      expect(normalizeBillDate("")).toBe("");
      expect(normalizeBillDate(null)).toBe("");
      expect(normalizeBillDate(undefined)).toBe("");
    });

    it("should handle invalid dates", () => {
      expect(normalizeBillDate("invalid-date")).toBe("");
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle edge cases with different separators", () => {
      expect(normalizeBillDate("2023/09/15")).toBe("2023-09-15");
    });

    it("should handle malformed input gracefully", () => {
      // JavaScript Date constructor auto-corrects invalid dates
      // "2023-13-45" becomes a valid date (rolls over to next valid date)
      const result = normalizeBillDate("2023-13-45");
      expect(result).toBeTruthy(); // Should return some valid date
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Should be in YYYY-MM-DD format
    });
  });

  describe("calculateDaysUntilDue", () => {
    it("should calculate positive days for future dates", () => {
      const days = calculateDaysUntilDue("2023-09-15", referenceDate);
      expect(days).toBe(7);
    });

    it("should calculate negative days for past dates", () => {
      const days = calculateDaysUntilDue("2023-09-05", referenceDate);
      expect(days).toBe(-3);
    });

    it("should return 0 for same day", () => {
      const days = calculateDaysUntilDue("2023-09-08", referenceDate);
      expect(days).toBe(0);
    });

    it("should handle Date objects", () => {
      const dueDate = new Date("2023-09-15");
      const days = calculateDaysUntilDue(dueDate, referenceDate);
      expect(days).toBe(7);
    });

    it("should use current date when fromDate not provided", () => {
      // This test is time-dependent, so we just verify it returns a number
      const days = calculateDaysUntilDue("2025-01-01");
      expect(typeof days).toBe("number");
    });

    it("should return null for invalid dates", () => {
      expect(calculateDaysUntilDue("invalid-date", referenceDate)).toBe(null);
      expect(calculateDaysUntilDue("", referenceDate)).toBe(null);
      expect(calculateDaysUntilDue(null, referenceDate)).toBe(null);
    });

    it("should handle different date formats", () => {
      expect(calculateDaysUntilDue("09/15/2023", referenceDate)).toBe(7);
      expect(calculateDaysUntilDue("09-15-2023", referenceDate)).toBe(7);
    });
  });

  describe("calculateBillUrgency", () => {
    it("should return 'overdue' for negative days", () => {
      expect(calculateBillUrgency(-1)).toBe("overdue");
      expect(calculateBillUrgency(-10)).toBe("overdue");
    });

    it("should return 'urgent' for 0-2 days", () => {
      expect(calculateBillUrgency(0)).toBe("urgent");
      expect(calculateBillUrgency(1)).toBe("urgent");
      expect(calculateBillUrgency(2)).toBe("urgent");
    });

    it("should return 'soon' for 3-7 days", () => {
      expect(calculateBillUrgency(3)).toBe("soon");
      expect(calculateBillUrgency(5)).toBe("soon");
      expect(calculateBillUrgency(7)).toBe("soon");
    });

    it("should return 'normal' for more than 7 days", () => {
      expect(calculateBillUrgency(8)).toBe("normal");
      expect(calculateBillUrgency(30)).toBe("normal");
    });

    it("should handle null/undefined input", () => {
      expect(calculateBillUrgency(null)).toBe("normal");
      expect(calculateBillUrgency(undefined)).toBe("normal");
    });
  });

  describe("processBillCalculations", () => {
    it("should add calculated fields to bill", () => {
      const bill = {
        id: "1",
        description: "Test Bill",
        amount: 100,
        dueDate: "2023-09-15",
        isPaid: false,
      };

      const processed = processBillCalculations(bill, referenceDate);

      expect(processed).toEqual({
        ...bill,
        daysUntilDue: 7,
        urgency: "soon",
      });
    });

    it("should handle missing amount", () => {
      const bill = {
        id: "1",
        description: "Test Bill",
        dueDate: "2023-09-15",
      };

      const processed = processBillCalculations(bill, referenceDate);
      expect(processed.amount).toBe(0);
    });

    it("should handle missing description", () => {
      const bill = {
        id: "1",
        amount: 100,
        dueDate: "2023-09-15",
        provider: "Test Provider",
      };

      const processed = processBillCalculations(bill, referenceDate);
      expect(processed.description).toBe("Test Provider");
    });

    it("should fallback to bill ID for description", () => {
      const bill = {
        id: "test-123",
        amount: 100,
        dueDate: "2023-09-15",
      };

      const processed = processBillCalculations(bill, referenceDate);
      expect(processed.description).toBe("Bill test-123");
    });

    it("should normalize isPaid to boolean", () => {
      const bill1 = { id: "1", dueDate: "2023-09-15", isPaid: "true" } as any;
      const bill2 = { id: "2", dueDate: "2023-09-15", isPaid: 1 } as any;
      const bill3 = { id: "3", dueDate: "2023-09-15" } as any;

      expect(processBillCalculations(bill1, referenceDate).isPaid).toBe(true);
      expect(processBillCalculations(bill2, referenceDate).isPaid).toBe(true);
      expect(processBillCalculations(bill3, referenceDate).isPaid).toBe(false);
    });
  });

  describe("categorizeBills", () => {
    const processedBills = [
      { id: "1", isPaid: false, daysUntilDue: 7, amount: 100 },
      { id: "2", isPaid: false, daysUntilDue: -3, amount: 50 },
      {
        id: "3",
        isPaid: true,
        daysUntilDue: -10,
        amount: 75,
        paidDate: "2023-08-28",
      },
      { id: "4", isPaid: false, daysUntilDue: 1, amount: 25 },
      { id: "5", isPaid: false, daysUntilDue: 0, amount: 200 },
    ];

    it("should categorize bills correctly", () => {
      const categorized = categorizeBills(processedBills);

      expect(categorized.upcoming).toHaveLength(3);
      expect(categorized.upcoming.map((b) => b.id)).toEqual(["5", "4", "1"]);

      expect(categorized.overdue).toHaveLength(1);
      expect(categorized.overdue[0].id).toBe("2");

      expect(categorized.paid).toHaveLength(1);
      expect(categorized.paid[0].id).toBe("3");

      expect(categorized.all).toEqual(processedBills);
    });

    it("should sort upcoming bills by days until due", () => {
      const categorized = categorizeBills(processedBills);
      const upcomingDays = categorized.upcoming.map((b) => b.daysUntilDue);
      expect(upcomingDays).toEqual([0, 1, 7]);
    });

    it("should sort overdue bills by most overdue first", () => {
      const overdueProcessed = [
        { id: "1", isPaid: false, daysUntilDue: -1 },
        { id: "2", isPaid: false, daysUntilDue: -5 },
        { id: "3", isPaid: false, daysUntilDue: -3 },
      ];

      const categorized = categorizeBills(overdueProcessed);
      const overdueDays = categorized.overdue.map((b) => b.daysUntilDue);
      expect(overdueDays).toEqual([-5, -3, -1]);
    });

    it("should handle bills with null daysUntilDue", () => {
      const billsWithNull = [
        { id: "1", isPaid: false, daysUntilDue: null },
        { id: "2", isPaid: false, daysUntilDue: 5 },
      ];

      const categorized = categorizeBills(billsWithNull);
      expect(categorized.upcoming).toHaveLength(2);
    });

    it("should handle empty bills array", () => {
      const categorized = categorizeBills([]);
      expect(categorized.upcoming).toEqual([]);
      expect(categorized.overdue).toEqual([]);
      expect(categorized.paid).toEqual([]);
      expect(categorized.all).toEqual([]);
    });
  });

  describe("calculateBillTotals", () => {
    const categorizedBills = {
      upcoming: [
        { amount: 100 },
        { amount: 50 },
        { monthlyAmount: 25 }, // Should fallback to monthlyAmount
      ],
      overdue: [
        { amount: 200 },
        { amount: -75 }, // Negative amounts should be abs()
      ],
      paid: [{ amount: 150 }, { amount: 80 }],
      all: [
        { amount: 100 },
        { amount: 50 },
        { amount: 25 },
        { amount: 200 },
        { amount: 75 },
        { amount: 150 },
        { amount: 80 },
      ],
    } as any;

    it("should calculate totals correctly", () => {
      const totals = calculateBillTotals(categorizedBills);

      expect(totals.upcoming).toBe(175); // 100 + 50 + 25
      expect(totals.overdue).toBe(275); // 200 + 75 (abs)
      expect(totals.paid).toBe(230); // 150 + 80
      expect(totals.total).toBe(680); // Sum of all amounts
    });

    it("should calculate counts correctly", () => {
      const totals = calculateBillTotals(categorizedBills);

      expect(totals.upcomingCount).toBe(3);
      expect(totals.overdueCount).toBe(2);
      expect(totals.paidCount).toBe(2);
      expect(totals.totalCount).toBe(7);
    });

    it("should handle missing categories", () => {
      const partialCategorized = {
        upcoming: [{ amount: 100 }],
        // Missing overdue and paid categories
        overdue: [],
        paid: [],
        all: [{ amount: 100 }],
      } as any;

      const totals = calculateBillTotals(partialCategorized);

      expect(totals.upcoming).toBe(100);
      expect(totals.overdue).toBe(0);
      expect(totals.paid).toBe(0);
      expect(totals.overdueCount).toBe(0);
      expect(totals.paidCount).toBe(0);
    });

    it("should handle bills with no amount", () => {
      const billsWithNoAmount = {
        upcoming: [
          { amount: 100 },
          {}, // No amount
          { amount: null },
          { monthlyAmount: 50 },
        ],
        overdue: [],
        paid: [],
        all: [{ amount: 100 }, {}, { amount: null }, { monthlyAmount: 50 }],
      } as any;

      const totals = calculateBillTotals(billsWithNoAmount);
      expect(totals.upcoming).toBe(150); // 100 + 0 + 0 + 50
      expect(totals.total).toBe(150);
    });
  });

  describe("filterBills", () => {
    const bills = [
      {
        id: "1",
        description: "Electricity Bill",
        provider: "Electric Company",
        name: "Power Bill",
        amount: 120,
        urgency: "soon",
        envelopeId: "env1",
      },
      {
        id: "2",
        description: "Internet Service",
        provider: "ISP Corp",
        name: "Internet",
        amount: 60,
        urgency: "urgent",
        envelopeId: "env2",
      },
      {
        id: "3",
        description: "Water Utility",
        provider: "Water Co",
        name: "Water",
        amount: 45,
        urgency: "normal",
        envelopeId: "env1",
      },
    ];

    it("should filter by search term in description", () => {
      const filtered = filterBills(bills, { search: "electricity" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should filter by search term in provider", () => {
      const filtered = filterBills(bills, { search: "isp" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should filter by search term in name", () => {
      const filtered = filterBills(bills, { search: "water" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("3");
    });

    it("should be case insensitive for search", () => {
      const filtered = filterBills(bills, { search: "ELECTRICITY" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should filter by urgency", () => {
      const urgent = filterBills(bills, { urgency: "urgent" });
      expect(urgent).toHaveLength(1);
      expect(urgent[0].id).toBe("2");

      const soon = filterBills(bills, { urgency: "soon" });
      expect(soon).toHaveLength(1);
      expect(soon[0].id).toBe("1");
    });

    it("should not filter when urgency is 'all'", () => {
      const filtered = filterBills(bills, { urgency: "all" });
      expect(filtered).toHaveLength(3);
    });

    it("should filter by envelope", () => {
      const filtered = filterBills(bills, { envelope: "env1" });
      expect(filtered).toHaveLength(2);
      expect(filtered.map((b) => b.id)).toEqual(["1", "3"]);
    });

    it("should filter by minimum amount", () => {
      const filtered = filterBills(bills, { amountMin: 100 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should filter by maximum amount", () => {
      const filtered = filterBills(bills, { amountMax: 50 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("3");
    });

    it("should filter by amount range", () => {
      const filtered = filterBills(bills, { amountMin: 50, amountMax: 100 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should apply multiple filters", () => {
      const filtered = filterBills(bills, {
        search: "electric",
        urgency: "soon",
        envelope: "env1",
        amountMin: 100,
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should handle empty filter options", () => {
      const filtered = filterBills(bills, {});
      expect(filtered).toEqual(bills);
    });

    it("should handle invalid amount filters", () => {
      const filtered = filterBills(bills, {
        amountMin: "invalid",
        amountMax: "invalid",
      });
      expect(filtered).toEqual(bills); // Should ignore invalid amounts
    });

    it("should handle bills with missing fields", () => {
      const incompleteBills = [
        { id: "1", amount: 100 },
        { id: "2", description: "Test", amount: 50 },
      ];

      const filtered = filterBills(incompleteBills, { search: "test" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should not mutate original bills array", () => {
      const original = [...bills];
      filterBills(bills, { search: "electricity" });
      expect(bills).toEqual(original);
    });
  });
});
