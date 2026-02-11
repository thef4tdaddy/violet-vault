import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReceipts } from "../useReceipts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";

// Mock TanStack Query with function constructors to satisfy 'new' keyword
vi.mock("@tanstack/react-query", () => {
  return {
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
    QueryClient: function () {
      return { invalidateQueries: vi.fn() };
    },
    QueryCache: function () {
      return {};
    },
    MutationCache: function () {
      return {};
    },
  };
});

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    receipts: {
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
      put: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock logger globally
vi.mock("@/utils/core/common/logger.ts", () => ({
  default: {
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    auth: vi.fn(),
    production: vi.fn(),
  },
}));

describe("useReceipts.ts", () => {
  const queryClientMock = {
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as any).mockReturnValue(queryClientMock);

    // Mock useQuery implementation
    (useQuery as any).mockReturnValue({
      data: [
        { id: "r1", merchant: "Store A", date: "2026-01-20", transactionId: "t1" },
        { id: "r2", merchant: "Store B", date: "2026-01-21" },
      ],
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    // Mock useMutation implementation
    (useMutation as any).mockImplementation(({ mutationFn, onSuccess }: any) => ({
      mutate: async (vars: any) => {
        const result = await mutationFn(vars);
        if (onSuccess) onSuccess(result, vars);
        return result;
      },
      mutateAsync: async (vars: any) => {
        const result = await mutationFn(vars);
        if (onSuccess) onSuccess(result, vars);
        return result;
      },
    }));
  });

  it("should fetch receipts", async () => {
    const { result } = renderHook(() => useReceipts());
    expect(result.current.receipts).toHaveLength(2);
    expect(result.current.receipts[0].merchant).toBe("Store A");
  });

  it("should add a receipt", async () => {
    const { result } = renderHook(() => useReceipts());
    const newReceipt = { merchant: "Store C", amount: 10 };

    await result.current.addReceiptAsync(newReceipt);

    expect(budgetDb.receipts.put).toHaveBeenCalledWith(
      expect.objectContaining({
        merchant: "Store C",
        processingStatus: "completed",
      })
    );
    expect(queryClientMock.invalidateQueries).toHaveBeenCalled();
  });

  it("should update a receipt", async () => {
    const { result } = renderHook(() => useReceipts());
    await result.current.updateReceiptAsync({ id: "r1", updates: { merchant: "Updated Store" } });

    expect(budgetDb.receipts.update).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({
        merchant: "Updated Store",
      })
    );
  });

  it("should delete a receipt and revoke object URL", async () => {
    const revokeMock = vi.fn();
    global.URL.revokeObjectURL = revokeMock;

    (budgetDb.receipts.get as any).mockResolvedValue({
      id: "r1",
      imageData: { url: "blob:test" },
    });

    const { result } = renderHook(() => useReceipts());
    await result.current.deleteReceiptAsync("r1");

    expect(budgetDb.receipts.delete).toHaveBeenCalledWith("r1");
    expect(revokeMock).toHaveBeenCalledWith("blob:test");
  });

  it("should link receipt to transaction", async () => {
    const { result } = renderHook(() => useReceipts());
    await result.current.linkReceiptToTransactionAsync({ receiptId: "r1", transactionId: "t2" });

    expect(budgetDb.receipts.update).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({
        transactionId: "t2",
      })
    );
  });

  describe("Utility Filters", () => {
    it("getReceiptById should return correct receipt", () => {
      const { result } = renderHook(() => useReceipts());
      const receipt = result.current.getReceiptById("r1");
      expect(receipt?.merchant).toBe("Store A");
    });

    it("getUnlinkedReceipts should return receipts without transactionId", () => {
      const { result } = renderHook(() => useReceipts());
      const unlinked = result.current.getUnlinkedReceipts();
      expect(unlinked).toHaveLength(1);
      expect(unlinked[0].id).toBe("r2");
    });

    it("getReceiptsByMerchant should filter by name", () => {
      const { result } = renderHook(() => useReceipts());
      const filtered = result.current.getReceiptsByMerchant("Store B");
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("r2");
    });
  });

  describe("Event Listeners", () => {
    it("should invalidate queries on importCompleted event", () => {
      renderHook(() => useReceipts());
      window.dispatchEvent(new Event("importCompleted"));
      expect(queryClientMock.invalidateQueries).toHaveBeenCalled();
    });

    it("should invalidate all queries on invalidateAllQueries event", () => {
      renderHook(() => useReceipts());
      window.dispatchEvent(new Event("invalidateAllQueries"));
      expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith();
    });
  });

  describe("Utility Actions", () => {
    it("invalidate should call invalidateQueries", () => {
      const { result } = renderHook(() => useReceipts());
      result.current.invalidate();
      expect(queryClientMock.invalidateQueries).toHaveBeenCalled();
    });
  });
});
