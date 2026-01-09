import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  convertPaymentFrequency,
  createSpecialTerms,
  enrichDebt,
  getUpcomingPayments,
  calculateDebtToIncomeRatio,
  calculateNextPaymentDate,
  calculatePayoffProjection,
  calculateInterestPortion,
} from "../debtCalculations";
import { DEBT_TYPES, DEBT_STATUS, PAYMENT_FREQUENCIES } from "@/constants/debts";
import type { DebtAccount } from "@/types/debt";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock the calculation functions
vi.mock("../calculations/nextPaymentDate", () => ({
  calculateNextPaymentDate: vi.fn((debt, relatedBill) => {
    if (relatedBill?.dueDate) return relatedBill.dueDate;
    if (debt.nextPaymentDate) return debt.nextPaymentDate;
    return null;
  }),
}));

vi.mock("../calculations/payoffProjection", () => ({
  calculatePayoffProjection: vi.fn((debt) => ({
    totalMonths: 12,
    totalInterest: 500,
    payoffDate: "2025-01-09T00:00:00.000Z",
    monthlyBreakdown: [],
  })),
}));

vi.mock("../calculations/interestCalculation", () => ({
  calculateInterestPortion: vi.fn((debt, payment) => {
    if (!debt.interestRate || !debt.currentBalance) return 0;
    const monthlyRate = debt.interestRate / 100 / 12;
    return Math.min(debt.currentBalance * monthlyRate, payment);
  }),
}));

describe("debtCalculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("convertPaymentFrequency", () => {
    it("should convert WEEKLY to weekly", () => {
      expect(convertPaymentFrequency(PAYMENT_FREQUENCIES.WEEKLY)).toBe("weekly");
    });

    it("should convert BIWEEKLY to biweekly", () => {
      expect(convertPaymentFrequency(PAYMENT_FREQUENCIES.BIWEEKLY)).toBe("biweekly");
    });

    it("should convert QUARTERLY to quarterly", () => {
      expect(convertPaymentFrequency(PAYMENT_FREQUENCIES.QUARTERLY)).toBe("quarterly");
    });

    it("should convert ANNUALLY to yearly", () => {
      expect(convertPaymentFrequency(PAYMENT_FREQUENCIES.ANNUALLY)).toBe("yearly");
    });

    it("should convert MONTHLY to monthly (default)", () => {
      expect(convertPaymentFrequency(PAYMENT_FREQUENCIES.MONTHLY)).toBe("monthly");
    });

    it("should handle unknown frequency as monthly (default)", () => {
      expect(
        convertPaymentFrequency("unknown" as unknown as typeof PAYMENT_FREQUENCIES.MONTHLY)
      ).toBe("monthly");
    });
  });

  describe("createSpecialTerms", () => {
    it("should create mortgage special terms with defaults", () => {
      const terms = createSpecialTerms(DEBT_TYPES.MORTGAGE);
      expect(terms).toEqual({
        pmi: 0,
        escrowPayment: 0,
      });
    });

    it("should create mortgage special terms with provided values", () => {
      const providedTerms = { pmi: 150, escrowPayment: 300 };
      const terms = createSpecialTerms(DEBT_TYPES.MORTGAGE, providedTerms);
      expect(terms).toEqual({
        pmi: 150,
        escrowPayment: 300,
      });
    });

    it("should merge mortgage special terms with provided values", () => {
      const providedTerms = { pmi: 150, customField: "value" };
      const terms = createSpecialTerms(DEBT_TYPES.MORTGAGE, providedTerms);
      expect(terms).toEqual({
        pmi: 150,
        escrowPayment: 0,
        customField: "value",
      });
    });

    it("should create credit card special terms with defaults", () => {
      const terms = createSpecialTerms(DEBT_TYPES.CREDIT_CARD);
      expect(terms).toEqual({
        creditLimit: 0,
        cashAdvanceLimit: 0,
      });
    });

    it("should create credit card special terms with provided values", () => {
      const providedTerms = { creditLimit: 5000, cashAdvanceLimit: 1000 };
      const terms = createSpecialTerms(DEBT_TYPES.CREDIT_CARD, providedTerms);
      expect(terms).toEqual({
        creditLimit: 5000,
        cashAdvanceLimit: 1000,
      });
    });

    it("should create chapter13 special terms with defaults", () => {
      const terms = createSpecialTerms(DEBT_TYPES.CHAPTER13);
      expect(terms).toEqual({
        planDuration: 60,
        trusteePayment: 0,
        priorityAmount: 0,
      });
    });

    it("should create chapter13 special terms with provided values", () => {
      const providedTerms = { planDuration: 36, trusteePayment: 500, priorityAmount: 10000 };
      const terms = createSpecialTerms(DEBT_TYPES.CHAPTER13, providedTerms);
      expect(terms).toEqual({
        planDuration: 36,
        trusteePayment: 500,
        priorityAmount: 10000,
      });
    });

    it("should return provided terms for other debt types", () => {
      const providedTerms = { customField: "value", amount: 123 };
      expect(createSpecialTerms(DEBT_TYPES.AUTO, providedTerms)).toEqual(providedTerms);
      expect(createSpecialTerms(DEBT_TYPES.STUDENT, providedTerms)).toEqual(providedTerms);
      expect(createSpecialTerms(DEBT_TYPES.PERSONAL, providedTerms)).toEqual(providedTerms);
      expect(createSpecialTerms(DEBT_TYPES.BUSINESS, providedTerms)).toEqual(providedTerms);
      expect(createSpecialTerms(DEBT_TYPES.OTHER, providedTerms)).toEqual(providedTerms);
    });

    it("should return empty object for other debt types without provided terms", () => {
      expect(createSpecialTerms(DEBT_TYPES.AUTO)).toEqual({});
      expect(createSpecialTerms(DEBT_TYPES.STUDENT)).toEqual({});
    });
  });

  describe("enrichDebt", () => {
    const baseDebt: DebtAccount = {
      id: "debt-1",
      name: "Test Debt",
      creditor: "Test Creditor",
      balance: 10000,
      interestRate: 5,
      minimumPayment: 200,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    };

    it("should enrich debt with calculated properties", () => {
      const enriched = enrichDebt(baseDebt);

      expect(enriched).toEqual({
        ...baseDebt,
        relatedBill: null,
        relatedEnvelope: null,
        relatedTransactions: [],
        nextPaymentDate: undefined, // null converted to undefined
        payoffInfo: {
          totalMonths: 12,
          totalInterest: 500,
          payoffDate: "2025-01-09T00:00:00.000Z",
          monthlyBreakdown: [],
        },
      });
    });

    it("should enrich debt with related bill", () => {
      const relatedBill = { id: "bill-1", dueDate: "2024-02-01", amount: 200 };
      const enriched = enrichDebt(baseDebt, relatedBill);

      expect(enriched.relatedBill).toEqual(relatedBill);
    });

    it("should enrich debt with related envelope", () => {
      const relatedEnvelope = { id: "env-1", name: "Debt Payment", currentBalance: 500 };
      const enriched = enrichDebt(baseDebt, null, relatedEnvelope);

      expect(enriched.relatedEnvelope).toEqual(relatedEnvelope);
    });

    it("should enrich debt with related transactions", () => {
      const relatedTransactions = [
        { id: "tx-1", amount: 200, date: new Date("2024-01-15") },
        { id: "tx-2", amount: 200, date: new Date("2024-02-15") },
      ];
      const enriched = enrichDebt(baseDebt, null, null, relatedTransactions);

      expect(enriched.relatedTransactions).toEqual(relatedTransactions);
    });

    it("should enrich debt with all related entities", () => {
      const relatedBill = { id: "bill-1", dueDate: "2024-02-01", amount: 200 };
      const relatedEnvelope = { id: "env-1", name: "Debt Payment" };
      const relatedTransactions = [{ id: "tx-1", amount: 200 }];

      const enriched = enrichDebt(baseDebt, relatedBill, relatedEnvelope, relatedTransactions);

      expect(enriched.relatedBill).toEqual(relatedBill);
      expect(enriched.relatedEnvelope).toEqual(relatedEnvelope);
      expect(enriched.relatedTransactions).toEqual(relatedTransactions);
    });

    it("should handle debt with existing nextPaymentDate", () => {
      const debtWithDate = {
        ...baseDebt,
        nextPaymentDate: "2024-03-01",
      };
      const enriched = enrichDebt(debtWithDate);

      expect(enriched.nextPaymentDate).toBe("2024-03-01");
    });
  });

  describe("getUpcomingPayments", () => {
    const today = new Date("2024-01-15T00:00:00.000Z");

    // Mock Date.now() to return a fixed date
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(today);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const createDebt = (id: string, nextPaymentDate: string | undefined): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance: 10000,
      interestRate: 5,
      minimumPayment: 200,
      type: DEBT_TYPES.PERSONAL,
      status: DEBT_STATUS.ACTIVE,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
      nextPaymentDate,
    });

    it("should return debts with payments within 30 days (default)", () => {
      const debts = [
        createDebt("1", "2024-01-20T00:00:00.000Z"), // 5 days ahead
        createDebt("2", "2024-02-10T00:00:00.000Z"), // 26 days ahead
        createDebt("3", "2024-02-20T00:00:00.000Z"), // 36 days ahead - outside range
        createDebt("4", "2024-01-10T00:00:00.000Z"), // Past date
      ];

      const upcoming = getUpcomingPayments(debts);
      expect(upcoming).toHaveLength(2);
      expect(upcoming.map((d) => d.id)).toEqual(["1", "2"]);
    });

    it("should return debts with payments within custom days ahead", () => {
      const debts = [
        createDebt("1", "2024-01-20T00:00:00.000Z"), // 5 days ahead
        createDebt("2", "2024-01-25T00:00:00.000Z"), // 10 days ahead
        createDebt("3", "2024-01-30T00:00:00.000Z"), // 15 days ahead
      ];

      const upcoming = getUpcomingPayments(debts, 7);
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].id).toBe("1");
    });

    it("should exclude debts without nextPaymentDate", () => {
      const debts = [
        createDebt("1", "2024-01-20T00:00:00.000Z"),
        createDebt("2", undefined),
        createDebt("3", "2024-01-25T00:00:00.000Z"),
      ];

      const upcoming = getUpcomingPayments(debts);
      expect(upcoming).toHaveLength(2);
      expect(upcoming.map((d) => d.id)).toEqual(["1", "3"]);
    });

    it("should exclude past payments", () => {
      const debts = [
        createDebt("1", "2024-01-10T00:00:00.000Z"), // Past
        createDebt("2", "2024-01-01T00:00:00.000Z"), // Past
        createDebt("3", "2024-01-20T00:00:00.000Z"), // Future
      ];

      const upcoming = getUpcomingPayments(debts);
      expect(upcoming).toHaveLength(1);
      expect(upcoming[0].id).toBe("3");
    });

    it("should handle payments on the current date", () => {
      const debts = [
        createDebt("1", "2024-01-15T00:00:00.000Z"), // Today
        createDebt("2", "2024-01-20T00:00:00.000Z"), // Future
      ];

      const upcoming = getUpcomingPayments(debts);
      expect(upcoming).toHaveLength(2);
      expect(upcoming.map((d) => d.id)).toEqual(["1", "2"]);
    });

    it("should handle empty debts array", () => {
      const upcoming = getUpcomingPayments([]);
      expect(upcoming).toEqual([]);
    });

    it("should handle debts with Date objects for nextPaymentDate", () => {
      const debts = [
        {
          ...createDebt("1", undefined),
          nextPaymentDate: new Date("2024-01-20T00:00:00.000Z"),
        } as DebtAccount,
      ];

      const upcoming = getUpcomingPayments(debts);
      expect(upcoming).toHaveLength(1);
    });
  });

  describe("calculateDebtToIncomeRatio", () => {
    const createDebt = (
      id: string,
      minimumPayment: number,
      status: typeof DEBT_STATUS.ACTIVE | typeof DEBT_STATUS.PAID_OFF = DEBT_STATUS.ACTIVE
    ): DebtAccount => ({
      id,
      name: `Debt ${id}`,
      creditor: "Test Creditor",
      balance: 10000,
      interestRate: 5,
      minimumPayment,
      type: DEBT_TYPES.PERSONAL,
      status,
      paymentFrequency: PAYMENT_FREQUENCIES.MONTHLY,
      compoundFrequency: "monthly",
    });

    it("should calculate debt-to-income ratio correctly", () => {
      const debts = [
        createDebt("1", 500), // Active
        createDebt("2", 300), // Active
        createDebt("3", 200), // Active
      ];

      const ratio = calculateDebtToIncomeRatio(debts, 5000);
      expect(ratio).toBe(20); // (500 + 300 + 200) / 5000 * 100 = 20%
    });

    it("should only include active debts", () => {
      const debts = [
        createDebt("1", 500, DEBT_STATUS.ACTIVE),
        createDebt("2", 300, DEBT_STATUS.PAID_OFF),
        createDebt("3", 200, DEBT_STATUS.ACTIVE),
      ];

      const ratio = calculateDebtToIncomeRatio(debts, 5000);
      expect(ratio).toBeCloseTo(14, 1); // (500 + 200) / 5000 * 100 = 14%
    });

    it("should return 0 for zero monthly income", () => {
      const debts = [createDebt("1", 500)];
      const ratio = calculateDebtToIncomeRatio(debts, 0);
      expect(ratio).toBe(0);
    });

    it("should return 0 for negative monthly income", () => {
      const debts = [createDebt("1", 500)];
      const ratio = calculateDebtToIncomeRatio(debts, -1000);
      expect(ratio).toBe(0);
    });

    it("should handle empty debts array", () => {
      const ratio = calculateDebtToIncomeRatio([], 5000);
      expect(ratio).toBe(0);
    });

    it("should handle debts with no minimum payments", () => {
      const debts = [createDebt("1", 0), createDebt("2", 0)];

      const ratio = calculateDebtToIncomeRatio(debts, 5000);
      expect(ratio).toBe(0);
    });

    it("should calculate ratio correctly with mixed payments", () => {
      const debts = [
        createDebt("1", 1500), // High payment
        createDebt("2", 50), // Low payment
        createDebt("3", 200),
      ];

      const ratio = calculateDebtToIncomeRatio(debts, 3500);
      expect(ratio).toBe(50); // 1750 / 3500 * 100 = 50%
    });

    it("should handle ratio over 100%", () => {
      const debts = [createDebt("1", 3000), createDebt("2", 2000)];

      const ratio = calculateDebtToIncomeRatio(debts, 4000);
      expect(ratio).toBe(125); // 5000 / 4000 * 100 = 125%
    });
  });

  describe("re-exported functions", () => {
    it("should export calculateNextPaymentDate", () => {
      expect(calculateNextPaymentDate).toBeDefined();
      expect(typeof calculateNextPaymentDate).toBe("function");
    });

    it("should export calculatePayoffProjection", () => {
      expect(calculatePayoffProjection).toBeDefined();
      expect(typeof calculatePayoffProjection).toBe("function");
    });

    it("should export calculateInterestPortion", () => {
      expect(calculateInterestPortion).toBeDefined();
      expect(typeof calculateInterestPortion).toBe("function");
    });
  });
});
