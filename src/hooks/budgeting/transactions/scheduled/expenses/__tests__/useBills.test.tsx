import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useBills, { useBillQueryFunction, useUpcomingBillsQuery } from "../useBills";
import { budgetDb } from "@/db/budgetDb";
import { queryClient } from "@/test/setup"; // Assuming setup provides a query client or use a local one
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      aboveOrEqual: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    },
    envelopes: {
      get: vi.fn(),
    },
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    putTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to wrap with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useBills", () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const mockBills = [
    {
      id: "bill-1",
      description: "Internet",
      amount: -100,
      date: nextWeekStr,
      isScheduled: true,
      type: "expense",
      category: "Bills",
    },
    {
      id: "bill-2",
      description: "Rent",
      amount: -1000,
      date: todayStr,
      isScheduled: true,
      type: "expense",
      category: "Bills",
    },
  ];

  const mockPayments = [
    {
      id: "pay-1",
      amount: -1000,
      date: todayStr,
      isScheduled: false,
      notes: `Scheduled Bill ID: bill-2`,
      type: "expense",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (budgetDb.transactions.toArray as any).mockImplementation(async function () {
      // Identify which query is running based on previous mock calls if needed
      // But for simplicity, we'll return based on context
      return [];
    });
  });

  describe("useBillQueryFunction", () => {
    it("should fetch and map bills correctly", async () => {
      (budgetDb.transactions.toArray as any)
        .mockResolvedValueOnce(mockBills) // first call for scheduled
        .mockResolvedValueOnce(mockPayments); // second call for actual

      const { result } = renderHook(() => useBillQueryFunction());
      const bills = await result.current();

      expect(bills).toHaveLength(2);
      expect(bills.find((b) => b.id === "bill-2")?.isPaid).toBe(true);
      expect(bills.find((b) => b.id === "bill-1")?.isPaid).toBe(false);
    });

    it("should filter bills by status", async () => {
      (budgetDb.transactions.toArray as any)
        .mockResolvedValueOnce(mockBills)
        .mockResolvedValueOnce(mockPayments);

      const { result } = renderHook(() => useBillQueryFunction({ status: "paid" }));
      const bills = await result.current();

      expect(bills).toHaveLength(1);
      expect(bills[0].id).toBe("bill-2");
    });

    it("should sort bills by amount", async () => {
      (budgetDb.transactions.toArray as any)
        .mockResolvedValueOnce(mockBills)
        .mockResolvedValueOnce([]);

      const { result } = renderHook(() =>
        useBillQueryFunction({ sortBy: "amount", sortOrder: "desc" })
      );
      const bills = await result.current();

      expect(bills[0].id).toBe("bill-2"); // 1000 > 100
      expect(bills[1].id).toBe("bill-1");
    });

    it("should use heuristic matching if notes match fails", async () => {
      const heuristicPayment = {
        id: "pay-heuristic",
        description: "Internet", // matches mockBills[0]
        amount: -100,
        date: nextWeekStr, // Matches mockBills[0].date
        isScheduled: false,
        type: "expense",
      };

      (budgetDb.transactions.toArray as any)
        .mockResolvedValueOnce(mockBills)
        .mockResolvedValueOnce([heuristicPayment]);

      const { result } = renderHook(() => useBillQueryFunction());
      const bills = await result.current();

      expect(bills.find((b) => b.id === "bill-1")?.isPaid).toBe(true);
    });

    it("should sort bills by description", async () => {
      (budgetDb.transactions.toArray as any)
        .mockResolvedValueOnce(mockBills)
        .mockResolvedValueOnce([]);

      const { result } = renderHook(() =>
        useBillQueryFunction({ sortBy: "description", sortOrder: "asc" })
      );
      const bills = await result.current();

      expect(bills[0].description).toBe("Internet");
      expect(bills[1].description).toBe("Rent");
    });
  });

  describe("useUpcomingBillsQuery", () => {
    it("should filter upcoming bills within daysAhead", async () => {
      const { result } = renderHook(() => useUpcomingBillsQuery(30, mockBills as any), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.length).toBeGreaterThan(0);
    });
  });

  describe("Mutations", () => {
    it("should add a bill successfully", async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBills(), { wrapper });

      const newBillData = {
        name: "New Bill",
        amount: 50,
        dueDate: "2024-02-01",
        envelopeId: "env-1",
      };

      await act(async () => {
        await result.current.addBillAsync(newBillData);
      });

      expect(budgetDb.addTransaction).toHaveBeenCalled();
      const addedBill = (budgetDb.addTransaction as any).mock.calls[0][0];
      expect(addedBill.description).toBe("New Bill");
      expect(addedBill.amount).toBe(-50);
      expect(addedBill.isScheduled).toBe(true);
    });

    it("should delete a bill and its payments", async () => {
      const wrapper = createWrapper();
      (budgetDb.transactions.toArray as any).mockResolvedValue(mockPayments);

      const { result } = renderHook(() => useBills(), { wrapper });

      await act(async () => {
        await result.current.deleteBillAsync("bill-2");
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("bill-2");
      // Should also delete associated payment found in toArray
      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("pay-1");
    });

    it("should mark a bill as paid", async () => {
      const wrapper = createWrapper();
      (budgetDb.transactions.get as any).mockResolvedValue(mockBills[1]); // Rent
      (budgetDb.envelopes.get as any).mockResolvedValue({ id: "env-1", name: "Rent" });

      const { result } = renderHook(() => useBills(), { wrapper });

      await act(async () => {
        await result.current.markBillPaidAsync({
          billId: "bill-2",
          paidAmount: 1000,
          envelopeId: "env-1",
        });
      });

      expect(budgetDb.putTransaction).toHaveBeenCalled();
      const paymentTxn = (budgetDb.putTransaction as any).mock.calls[0][0];
      expect(paymentTxn.isScheduled).toBe(false);
      expect(paymentTxn.notes).toContain("Scheduled Bill ID: bill-2");
    });

    it("should fail to mark as paid if envelope is missing", async () => {
      const wrapper = createWrapper();
      (budgetDb.transactions.get as any).mockResolvedValue(mockBills[1]);
      (budgetDb.envelopes.get as any).mockResolvedValue(null);

      const { result } = renderHook(() => useBills(), { wrapper });

      await expect(
        result.current.markBillPaidAsync({
          billId: "bill-2",
          paidAmount: 1000,
          envelopeId: "missing",
        })
      ).rejects.toThrow('Cannot pay bill: Envelope "missing" does not exist.');
    });

    it("should fail to mark as paid if bill is missing", async () => {
      const wrapper = createWrapper();
      (budgetDb.transactions.get as any).mockResolvedValue(null);

      const { result } = renderHook(() => useBills(), { wrapper });

      await expect(
        result.current.markBillPaidAsync({
          billId: "invalid",
          paidAmount: 1000,
        })
      ).rejects.toThrow("Bill with ID invalid not found");
    });

    it("should update a bill successfully", async () => {
      const wrapper = createWrapper();
      (budgetDb.transactions.get as any).mockResolvedValue(mockBills[1]);
      const { result } = renderHook(() => useBills(), { wrapper });

      await act(async () => {
        await result.current.updateBillAsync({
          billId: "bill-2",
          updates: { name: "New Rent", amount: 1100 },
        });
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalled();
      const updates = (budgetDb.updateTransaction as any).mock.calls[0][1];
      expect(updates.description).toBe("New Rent");
      expect(updates.amount).toBe(-1100);
    });
  });
});
