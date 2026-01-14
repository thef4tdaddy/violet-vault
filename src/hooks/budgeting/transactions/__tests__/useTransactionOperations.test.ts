import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactionOperations } from "../useTransactionOperations";
import { budgetDb } from "@/db/budgetDb";
import { useTransactionBalanceUpdater } from "../useTransactionBalanceUpdater";

// Mock dependencies
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      get: vi.fn(),
    },
    transactions: {
      put: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    putTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    transactions: ["transactions"],
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
  },
  optimisticHelpers: {
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    removeTransaction: vi.fn(),
  },
}));

vi.mock("../useTransactionBalanceUpdater", () => ({
  useTransactionBalanceUpdater: vi.fn(),
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
  },
  writable: true,
});

describe("useTransactionOperations", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  const mockUpdateBalances = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useTransactionBalanceUpdater as Mock).mockReturnValue({
      updateBalancesForTransaction: mockUpdateBalances,
    });

    // Default implementation for useMutation
    (useMutation as Mock).mockImplementation((options) => ({
      mutate: (data: any) => options.mutationFn(data).then(options.onSuccess),
      mutateAsync: (data: any) =>
        options.mutationFn(data).then((res: any) => {
          if (options.onSuccess) options.onSuccess(res);
          return res;
        }),
      isPending: false,
    }));
  });

  describe("addTransaction", () => {
    it("should add a transaction and update balances", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue({ id: "env1", category: "Test" });
      const { result } = renderHook(() => useTransactionOperations());
      const data = { amount: 100, envelopeId: "env1" };

      await act(async () => {
        await result.current.addTransaction(data);
      });

      expect(budgetDb.putTransaction).toHaveBeenCalled();
      expect(mockUpdateBalances).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_added");
    });

    it("should throw error if envelope not found", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(null);
      const { result } = renderHook(() => useTransactionOperations());
      const data = { amount: 100, envelopeId: "env1" };

      await act(async () => {
        await expect(result.current.addTransaction(data)).rejects.toThrow("Envelope not found");
      });
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction", async () => {
      const { result } = renderHook(() => useTransactionOperations());
      const updates = { description: "Updated" };

      await act(async () => {
        await result.current.updateTransaction("1", updates);
      });

      expect(budgetDb.updateTransaction).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ description: "Updated" })
      );
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_updated");
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction and update balances", async () => {
      (budgetDb.transactions.get as Mock).mockResolvedValue({ id: "1", amount: 100 });
      const { result } = renderHook(() => useTransactionOperations());

      await act(async () => {
        await result.current.deleteTransaction("1");
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("1");
      expect(mockUpdateBalances).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }), true);
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_deleted");
    });
  });

  describe("splitTransaction", () => {
    it("should split a transaction into multiple", async () => {
      (budgetDb.transactions.get as Mock).mockResolvedValue({
        id: "1",
        date: new Date(),
        amount: 100,
        envelopeId: "env1",
        category: "Test",
        type: "expense",
      });
      const { result } = renderHook(() => useTransactionOperations());
      const splits = [{ amount: 50 }, { amount: 50 }];

      await act(async () => {
        await result.current.splitTransaction("1", splits);
      });

      expect(budgetDb.transactions.delete).toHaveBeenCalledWith("1");
      expect(mockUpdateBalances).toHaveBeenCalledTimes(3); // 1 delete + 2 creates
      expect(budgetDb.putTransaction).toHaveBeenCalledTimes(2);
      expect(mockTriggerSync).toHaveBeenCalledWith("transaction_split");
    });
  });
});
