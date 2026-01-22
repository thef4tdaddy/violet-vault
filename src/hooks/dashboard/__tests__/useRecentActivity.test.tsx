/**
 * useRecentActivity Hook Tests
 *
 * Tests for the useRecentActivity custom hook.
 * Covers data aggregation, filtering, and transformation logic.
 */

import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock dependencies
vi.mock("@/hooks/budgeting/transactions/useTransactionQuery", () => ({
  useTransactionQuery: vi.fn(),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  useBillsQuery: vi.fn(),
}));

vi.mock("@/hooks/budgeting/core/useBudgetData/queries", () => ({
  useBudgetQueries: vi.fn(),
}));

// Import the hook and mocked dependencies
import { useRecentActivity } from "../useRecentActivity";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useBillsQuery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useBudgetQueries } from "@/hooks/budgeting/core/useBudgetData/queries";

describe("useRecentActivity", () => {
  let queryClient: QueryClient;

  // Sample transaction data
  const mockTransactions = [
    {
      id: "txn-1",
      date: new Date("2025-01-20"),
      description: "Coffee Shop",
      amount: -4.5,
      category: "Food & Drink",
      type: "expense",
      isScheduled: false,
      lastModified: Date.now(),
      envelopeId: "env-1",
    },
    {
      id: "txn-2",
      date: new Date("2025-01-19"),
      description: "Grocery Store",
      amount: -75,
      category: "Groceries",
      type: "expense",
      isScheduled: false,
      lastModified: Date.now(),
      envelopeId: "env-2",
    },
    {
      id: "txn-3",
      date: new Date("2025-01-18"),
      description: "Freelance Payment",
      amount: 500,
      category: "Income",
      type: "income",
      isScheduled: false,
      lastModified: Date.now(),
      envelopeId: "env-3",
    },
  ];

  // Sample bill data (scheduled transactions) - dates within 7 days from now
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  const mockBills = [
    {
      id: "bill-1",
      date: nextWeek,
      description: "Electric Bill",
      amount: -150,
      category: "Utilities",
      type: "expense",
      isScheduled: true,
      isPaid: false,
      lastModified: Date.now(),
      envelopeId: "env-bills",
    },
    {
      id: "bill-2",
      date: tomorrow,
      description: "Internet",
      amount: -80,
      category: "Utilities",
      type: "expense",
      isScheduled: true,
      isPaid: false,
      lastModified: Date.now(),
      envelopeId: "env-bills",
    },
  ];

  // Sample paycheck data
  const mockPaychecks = [
    {
      id: "paycheck-1",
      date: new Date("2025-01-15"),
      description: "Monthly Salary",
      payerName: "Acme Corp",
      amount: 2500,
      category: "Income",
      type: "income",
      allocations: { "env-1": 500, "env-2": 1000, "env-3": 1000 },
      lastModified: Date.now(),
      envelopeId: "unassigned",
    },
    {
      id: "paycheck-2",
      date: new Date("2025-01-01"),
      description: "Bonus",
      payerName: "Acme Corp",
      amount: 500,
      category: "Income",
      type: "income",
      allocations: { "env-1": 250 },
      lastModified: Date.now(),
      envelopeId: "unassigned",
    },
  ];

  const defaultTransactionQueryReturn = {
    transactions: mockTransactions,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  const defaultBillsQueryReturn = {
    data: mockBills,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };

  const defaultBudgetQueriesReturn = {
    paycheckHistoryQuery: {
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    },
    paycheckHistory: mockPaychecks,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    (useTransactionQuery as Mock).mockReturnValue(defaultTransactionQueryReturn);
    (useBillsQuery as Mock).mockReturnValue(defaultBillsQueryReturn);
    (useBudgetQueries as Mock).mockReturnValue(defaultBudgetQueriesReturn);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // ========================================================================
  // Basic Hook Behavior Tests
  // ========================================================================
  describe("Basic Hook Behavior", () => {
    it("should return activity data when loaded", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.recentTransactions).toBeDefined();
      expect(result.current.upcomingBills).toBeDefined();
      expect(result.current.recentPaychecks).toBeDefined();
      expect(result.current.allActivity).toBeDefined();
    });

    it("should return loading state", () => {
      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        isLoading: true,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });
      expect(result.current.isLoading).toBe(true);
    });

    it("should return error state", () => {
      const testError = new Error("Test error");
      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        isError: true,
        error: testError,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(testError);
    });

    it("should provide refetch function", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });
      expect(typeof result.current.refetch).toBe("function");
    });
  });

  // ========================================================================
  // Transaction Processing Tests
  // ========================================================================
  describe("Transaction Processing", () => {
    it("should transform transactions to activity items", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.recentTransactions.length).toBeGreaterThan(0);
      const firstTransaction = result.current.recentTransactions[0];
      expect(firstTransaction.type).toBe("transaction");
      expect(firstTransaction.title).toBe("Coffee Shop");
      expect(firstTransaction.amount).toBe(-4.5);
    });

    it("should filter out scheduled transactions", () => {
      const transactionsWithScheduled = [
        ...mockTransactions,
        {
          id: "txn-scheduled",
          date: new Date(),
          description: "Scheduled",
          amount: -100,
          isScheduled: true,
          lastModified: Date.now(),
          envelopeId: "env-1",
        },
      ];

      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        transactions: transactionsWithScheduled,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const scheduledItem = result.current.recentTransactions.find((t) => t.id === "txn-scheduled");
      expect(scheduledItem).toBeUndefined();
    });

    it("should filter out paycheck transactions", () => {
      const transactionsWithPaycheck = [
        ...mockTransactions,
        {
          id: "txn-paycheck",
          date: new Date(),
          description: "Paycheck",
          amount: 1000,
          allocations: { "env-1": 500 },
          isScheduled: false,
          lastModified: Date.now(),
          envelopeId: "unassigned",
        },
      ];

      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        transactions: transactionsWithPaycheck,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const paycheckItem = result.current.recentTransactions.find((t) => t.id === "txn-paycheck");
      expect(paycheckItem).toBeUndefined();
    });

    it("should respect transaction limit", () => {
      const { result } = renderHook(() => useRecentActivity({ transactionLimit: 2 }), { wrapper });

      expect(result.current.recentTransactions.length).toBeLessThanOrEqual(2);
    });

    it("should correctly identify income transactions", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const incomeTransaction = result.current.recentTransactions.find((t) => t.id === "txn-3");
      expect(incomeTransaction?.isIncome).toBe(true);
    });

    it("should correctly identify expense transactions", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const expenseTransaction = result.current.recentTransactions.find((t) => t.id === "txn-1");
      expect(expenseTransaction?.isIncome).toBe(false);
    });
  });

  // ========================================================================
  // Bill Processing Tests
  // ========================================================================
  describe("Bill Processing", () => {
    it("should transform bills to activity items", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.upcomingBills.length).toBeGreaterThan(0);
      const firstBill = result.current.upcomingBills[0];
      expect(firstBill.type).toBe("bill");
    });

    it("should set bill status correctly", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const bills = result.current.upcomingBills;
      expect(bills.every((b) => b.billStatus !== undefined)).toBe(true);
    });

    it("should use absolute value for bill amounts", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const firstBill = result.current.upcomingBills[0];
      expect(firstBill.amount).toBeGreaterThan(0);
    });

    it("should pass billDaysAhead to useBillsQuery for filtering", () => {
      renderHook(() => useRecentActivity({ billDaysAhead: 14 }), { wrapper });

      expect(useBillsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "upcoming",
          daysAhead: 14,
        })
      );
    });
  });

  // ========================================================================
  // Paycheck Processing Tests
  // ========================================================================
  describe("Paycheck Processing", () => {
    it("should transform paychecks to activity items", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.recentPaychecks.length).toBeGreaterThan(0);
      const firstPaycheck = result.current.recentPaychecks[0];
      expect(firstPaycheck.type).toBe("paycheck");
    });

    it("should use payerName for paycheck title when available", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const firstPaycheck = result.current.recentPaychecks[0];
      expect(firstPaycheck.title).toBe("Acme Corp");
    });

    it("should respect paycheck limit", () => {
      const { result } = renderHook(() => useRecentActivity({ paycheckLimit: 1 }), { wrapper });

      expect(result.current.recentPaychecks.length).toBeLessThanOrEqual(1);
    });

    it("should calculate allocated status correctly", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const allocatedPaycheck = result.current.recentPaychecks.find((p) => p.id === "paycheck-1");
      expect(allocatedPaycheck?.allocationStatus).toBe("allocated");
    });

    it("should calculate partial allocation status correctly", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const partialPaycheck = result.current.recentPaychecks.find((p) => p.id === "paycheck-2");
      expect(partialPaycheck?.allocationStatus).toBe("partial");
    });

    it("should handle paycheck with no allocations", () => {
      const paychecksWithoutAllocations = [
        {
          id: "paycheck-no-alloc",
          date: new Date(),
          description: "No Allocations",
          amount: 1000,
          type: "income",
          lastModified: Date.now(),
          envelopeId: "unassigned",
        },
      ];

      (useBudgetQueries as Mock).mockReturnValue({
        ...defaultBudgetQueriesReturn,
        paycheckHistory: paychecksWithoutAllocations,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const paycheck = result.current.recentPaychecks[0];
      expect(paycheck?.allocationStatus).toBe("unallocated");
    });
  });

  // ========================================================================
  // All Activity Tests
  // ========================================================================
  describe("All Activity Aggregation", () => {
    it("should combine all activity types", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const hasTransactions = result.current.allActivity.some((a) => a.type === "transaction");
      const hasBills = result.current.allActivity.some((a) => a.type === "bill");
      const hasPaychecks = result.current.allActivity.some((a) => a.type === "paycheck");

      expect(hasTransactions || hasBills || hasPaychecks).toBe(true);
    });

    it("should sort all activity by date (newest first)", () => {
      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      const dates = result.current.allActivity.map((a) => a.date.getTime());
      const sortedDates = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sortedDates);
    });
  });

  // ========================================================================
  // Options Tests
  // ========================================================================
  describe("Hook Options", () => {
    it("should use default options when not provided", () => {
      renderHook(() => useRecentActivity(), { wrapper });

      expect(useTransactionQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10, // transactionLimit * 2 = 5 * 2 = 10
          sortOrder: "desc",
          enabled: true,
        })
      );

      expect(useBillsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "upcoming",
          daysAhead: 7,
        })
      );
    });

    it("should pass custom transaction limit", () => {
      renderHook(() => useRecentActivity({ transactionLimit: 10 }), { wrapper });

      expect(useTransactionQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 20, // 10 * 2
        })
      );
    });

    it("should pass custom bill days ahead", () => {
      renderHook(() => useRecentActivity({ billDaysAhead: 14 }), { wrapper });

      expect(useBillsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          daysAhead: 14,
        })
      );
    });

    it("should respect enabled option", () => {
      renderHook(() => useRecentActivity({ enabled: false }), { wrapper });

      expect(useTransactionQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });
  });

  // ========================================================================
  // Edge Cases Tests
  // ========================================================================
  describe("Edge Cases", () => {
    it("should handle empty data gracefully", () => {
      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        transactions: [],
      });
      (useBillsQuery as Mock).mockReturnValue({
        ...defaultBillsQueryReturn,
        data: [],
      });
      (useBudgetQueries as Mock).mockReturnValue({
        ...defaultBudgetQueriesReturn,
        paycheckHistory: [],
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.recentTransactions).toEqual([]);
      expect(result.current.upcomingBills).toEqual([]);
      expect(result.current.recentPaychecks).toEqual([]);
      expect(result.current.allActivity).toEqual([]);
    });

    it("should handle undefined data gracefully", () => {
      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        transactions: undefined,
      });
      (useBillsQuery as Mock).mockReturnValue({
        ...defaultBillsQueryReturn,
        data: undefined,
      });
      (useBudgetQueries as Mock).mockReturnValue({
        ...defaultBudgetQueriesReturn,
        paycheckHistory: undefined,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });

      expect(result.current.recentTransactions).toEqual([]);
      expect(result.current.upcomingBills).toEqual([]);
      expect(result.current.recentPaychecks).toEqual([]);
    });

    it("should combine loading states from all queries", () => {
      (useTransactionQuery as Mock).mockReturnValue({
        ...defaultTransactionQueryReturn,
        isLoading: false,
      });
      (useBillsQuery as Mock).mockReturnValue({
        ...defaultBillsQueryReturn,
        isLoading: true,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });
      expect(result.current.isLoading).toBe(true);
    });

    it("should combine error states from all queries", () => {
      const billError = new Error("Bill error");
      (useBillsQuery as Mock).mockReturnValue({
        ...defaultBillsQueryReturn,
        isError: true,
        error: billError,
      });

      const { result } = renderHook(() => useRecentActivity(), { wrapper });
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(billError);
    });
  });
});
