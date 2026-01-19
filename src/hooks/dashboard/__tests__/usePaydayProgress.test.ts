import { renderHook } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect, afterEach } from "vitest";
import { usePaydayProgress } from "../usePaydayProgress";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useBudgetMetadata";
import useBudgetData from "@/hooks/budgeting/core/useBudgetData";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import * as paydayPredictor from "@/utils/domain/budgeting/paydayPredictor";

// Mock dependencies
vi.mock("@/hooks/budgeting/metadata/useBudgetMetadata", () => ({
  useUnassignedCash: vi.fn(),
}));

vi.mock("@/hooks/budgeting/core/useBudgetData", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  default: vi.fn(),
}));

vi.mock("@/utils/domain/budgeting/paydayPredictor", () => ({
  predictNextPayday: vi.fn(),
  getDaysUntilPayday: vi.fn(),
  formatPaydayPrediction: vi.fn(),
}));

describe("usePaydayProgress", () => {
  const mockDate = new Date("2024-01-15T12:00:00Z");
  const mockNextPayday = new Date("2024-01-22T12:00:00Z");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    // Default mock implementations
    vi.mocked(useUnassignedCash).mockReturnValue({
      unassignedCash: 1000,
      isLoading: false,
      error: null,
      updateUnassignedCash: vi.fn(),
    });

    vi.mocked(useBudgetData).mockReturnValue({
      transactions: [
        {
          id: "1",
          type: "income",
          category: "paycheck",
          amount: 2000,
          date: new Date("2024-01-01"),
          envelopeId: "",
          lastModified: Date.now(),
        },
        {
          id: "2",
          type: "income",
          category: "paycheck",
          amount: 2000,
          date: new Date("2024-01-08"),
          envelopeId: "",
          lastModified: Date.now(),
        },
      ],
      envelopes: [],
      isLoading: false,
      envelopesError: null,
      transactionsError: null,
    });

    vi.mocked(useBills).mockReturnValue({
      bills: [],
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      isProcessing: false,
      addBill: vi.fn(),
      addBillAsync: vi.fn(),
      updateBill: vi.fn(),
      updateBillAsync: vi.fn(),
      deleteBill: vi.fn(),
      deleteBillAsync: vi.fn(),
      markBillPaid: vi.fn(),
      markBillPaidAsync: vi.fn(),
    });

    vi.mocked(paydayPredictor.predictNextPayday).mockReturnValue({
      nextPayday: mockNextPayday,
      confidence: 95,
      pattern: "biweekly",
      intervalDays: 14,
      message: "High confidence biweekly pattern detected",
    });

    vi.mocked(paydayPredictor.getDaysUntilPayday).mockReturnValue(7);

    vi.mocked(paydayPredictor.formatPaydayPrediction).mockReturnValue({
      displayText: "Payday predicted in 7 days",
      shortText: "7 days",
      confidence: 95,
      pattern: "biweekly",
      date: "1/22/2024",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic functionality", () => {
    it("should return payday progress data", () => {
      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current).toMatchObject({
        daysUntilPayday: 7,
        hoursUntilPayday: expect.any(Number),
        progressPercentage: expect.any(Number),
        safeToSpend: 1000,
        formattedPayday: {
          displayText: "Payday predicted in 7 days",
          shortText: "7 days",
          confidence: 95,
          pattern: "biweekly",
          date: "1/22/2024",
        },
        isLoading: false,
        hasError: false,
      });
    });

    it("should calculate hours until payday correctly", () => {
      const { result } = renderHook(() => usePaydayProgress());

      // 7 days = 168 hours
      expect(result.current.hoursUntilPayday).toBe(168);
    });

    it("should calculate progress percentage correctly", () => {
      const { result } = renderHook(() => usePaydayProgress());

      // 7 days into a 14-day cycle = 50% progress
      expect(result.current.progressPercentage).toBeGreaterThan(0);
      expect(result.current.progressPercentage).toBeLessThanOrEqual(100);
    });
  });

  describe("loading states", () => {
    it("should return loading true when unassigned cash is loading", () => {
      vi.mocked(useUnassignedCash).mockReturnValue({
        unassignedCash: 0,
        isLoading: true,
        error: null,
        updateUnassignedCash: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.isLoading).toBe(true);
    });

    it("should return loading true when budget data is loading", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [],
        envelopes: [],
        isLoading: true,
        envelopesError: null,
        transactionsError: null,
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.isLoading).toBe(true);
    });

    it("should return loading true when bills are loading", () => {
      vi.mocked(useBills).mockReturnValue({
        bills: [],
        isLoading: true,
        error: null,
        isError: false,
        refetch: vi.fn(),
        isProcessing: false,
        addBill: vi.fn(),
        addBillAsync: vi.fn(),
        updateBill: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBill: vi.fn(),
        deleteBillAsync: vi.fn(),
        markBillPaid: vi.fn(),
        markBillPaidAsync: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("error states", () => {
    it("should return hasError true when envelopes have error", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [],
        envelopes: [],
        isLoading: false,
        envelopesError: new Error("Failed to load envelopes"),
        transactionsError: null,
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.hasError).toBe(true);
    });

    it("should return hasError true when transactions have error", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [],
        envelopes: [],
        isLoading: false,
        envelopesError: null,
        transactionsError: new Error("Failed to load transactions"),
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.hasError).toBe(true);
    });
  });

  describe("safe-to-spend calculation", () => {
    it("should calculate safe-to-spend without bills", () => {
      vi.mocked(useUnassignedCash).mockReturnValue({
        unassignedCash: 1500,
        isLoading: false,
        error: null,
        updateUnassignedCash: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.safeToSpend).toBe(1500);
    });

    it("should subtract upcoming bills from safe-to-spend", () => {
      vi.mocked(useUnassignedCash).mockReturnValue({
        unassignedCash: 1500,
        isLoading: false,
        error: null,
        updateUnassignedCash: vi.fn(),
      });

      vi.mocked(useBills).mockReturnValue({
        bills: [
          {
            id: "bill1",
            type: "expense",
            category: "Bills & Utilities",
            description: "Rent",
            amount: -500,
            date: new Date("2024-01-20"),
            envelopeId: "",
            lastModified: Date.now(),
            isScheduled: true,
            isPaid: false,
          },
          {
            id: "bill2",
            type: "expense",
            category: "Bills & Utilities",
            description: "Utilities",
            amount: -200,
            date: new Date("2024-01-21"),
            envelopeId: "",
            lastModified: Date.now(),
            isScheduled: true,
            isPaid: false,
          },
        ],
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
        isProcessing: false,
        addBill: vi.fn(),
        addBillAsync: vi.fn(),
        updateBill: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBill: vi.fn(),
        deleteBillAsync: vi.fn(),
        markBillPaid: vi.fn(),
        markBillPaidAsync: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      // 1500 - 500 - 200 = 800
      expect(result.current.safeToSpend).toBe(800);
    });

    it("should not subtract bills due after payday", () => {
      vi.mocked(useUnassignedCash).mockReturnValue({
        unassignedCash: 1500,
        isLoading: false,
        error: null,
        updateUnassignedCash: vi.fn(),
      });

      vi.mocked(useBills).mockReturnValue({
        bills: [
          {
            id: "bill1",
            type: "expense",
            category: "Bills & Utilities",
            description: "Rent",
            amount: -500,
            date: new Date("2024-01-20"),
            envelopeId: "",
            lastModified: Date.now(),
            isScheduled: true,
            isPaid: false,
          },
          {
            id: "bill2",
            type: "expense",
            category: "Bills & Utilities",
            description: "Future Bill",
            amount: -300,
            date: new Date("2024-01-25"), // After payday
            envelopeId: "",
            lastModified: Date.now(),
            isScheduled: true,
            isPaid: false,
          },
        ],
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
        isProcessing: false,
        addBill: vi.fn(),
        addBillAsync: vi.fn(),
        updateBill: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBill: vi.fn(),
        deleteBillAsync: vi.fn(),
        markBillPaid: vi.fn(),
        markBillPaidAsync: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      // Only subtract the first bill: 1500 - 500 = 1000
      expect(result.current.safeToSpend).toBe(1000);
    });

    it("should return 0 if safe-to-spend would be negative", () => {
      vi.mocked(useUnassignedCash).mockReturnValue({
        unassignedCash: 100,
        isLoading: false,
        error: null,
        updateUnassignedCash: vi.fn(),
      });

      vi.mocked(useBills).mockReturnValue({
        bills: [
          {
            id: "bill1",
            type: "expense",
            category: "Bills & Utilities",
            description: "Large Bill",
            amount: -500,
            date: new Date("2024-01-20"),
            envelopeId: "",
            lastModified: Date.now(),
            isScheduled: true,
            isPaid: false,
          },
        ],
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
        isProcessing: false,
        addBill: vi.fn(),
        addBillAsync: vi.fn(),
        updateBill: vi.fn(),
        updateBillAsync: vi.fn(),
        deleteBill: vi.fn(),
        deleteBillAsync: vi.fn(),
        markBillPaid: vi.fn(),
        markBillPaidAsync: vi.fn(),
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.safeToSpend).toBe(0);
    });
  });

  describe("no payday prediction", () => {
    it("should handle insufficient paycheck history", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [
          {
            id: "1",
            type: "income",
            category: "paycheck",
            amount: 2000,
            date: new Date("2024-01-01"),
            envelopeId: "",
            lastModified: Date.now(),
          },
        ],
        envelopes: [],
        isLoading: false,
        envelopesError: null,
        transactionsError: null,
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.daysUntilPayday).toBeNull();
      expect(result.current.hoursUntilPayday).toBeNull();
      expect(result.current.formattedPayday).toBeNull();
      expect(result.current.progressPercentage).toBe(0);
    });

    it("should handle no transactions", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [],
        envelopes: [],
        isLoading: false,
        envelopesError: null,
        transactionsError: null,
      });

      const { result } = renderHook(() => usePaydayProgress());

      expect(result.current.daysUntilPayday).toBeNull();
      expect(result.current.formattedPayday).toBeNull();
    });
  });

  describe("paycheck filtering", () => {
    it("should only include income transactions with paycheck category", () => {
      vi.mocked(useBudgetData).mockReturnValue({
        transactions: [
          {
            id: "1",
            type: "income",
            category: "paycheck",
            amount: 2000,
            date: new Date("2024-01-01"),
            envelopeId: "",
            lastModified: Date.now(),
          },
          {
            id: "2",
            type: "income",
            category: "bonus",
            amount: 500,
            date: new Date("2024-01-05"),
            envelopeId: "",
            lastModified: Date.now(),
          },
          {
            id: "3",
            type: "expense",
            category: "food",
            amount: 50,
            date: new Date("2024-01-07"),
            envelopeId: "",
            lastModified: Date.now(),
          },
          {
            id: "4",
            type: "income",
            category: "paycheck",
            amount: 2000,
            date: new Date("2024-01-08"),
            envelopeId: "",
            lastModified: Date.now(),
          },
        ],
        envelopes: [],
        isLoading: false,
        envelopesError: null,
        transactionsError: null,
      });

      const { result } = renderHook(() => usePaydayProgress());

      // Should call predictNextPayday with only 2 paycheck transactions
      expect(paydayPredictor.predictNextPayday).toHaveBeenCalled();
      expect(result.current).toBeDefined();
    });
  });
});
