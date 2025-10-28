import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactionBalanceUpdater } from "../useTransactionBalanceUpdater";

// Mock dependencies
vi.mock("../../../services/budgetDatabaseService", () => ({
  default: {
    updateBudgetBalance: vi.fn(),
    getBudgetMetadata: vi.fn(),
  },
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockBudgetDatabaseService = vi.hoisted(() => ({
  updateBudgetBalance: vi.fn(),
  getBudgetMetadata: vi.fn(),
}));

describe("useTransactionBalanceUpdater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBudgetDatabaseService.getBudgetMetadata.mockResolvedValue({
      totalBalance: 1000,
      unassignedCash: 200,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTransactionBalanceUpdater());

    expect(result.current.isUpdating).toBe(false);
    expect(result.current.updateError).toBe(null);
    expect(typeof result.current.updateBalanceForTransaction).toBe("function");
    expect(typeof result.current.updateBalanceForMultipleTransactions).toBe("function");
  });

  describe("updateBalanceForTransaction", () => {
    it("should successfully update balance for a single transaction", async () => {
      const mockTransaction = {
        id: "1",
        amount: -50.25,
        category: "Food",
        date: "2024-01-15",
      };

      mockBudgetDatabaseService.updateBudgetBalance.mockResolvedValue({
        success: true,
        newBalance: 949.75,
      });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.newBalance).toBe(949.75);
      expect(mockBudgetDatabaseService.updateBudgetBalance).toHaveBeenCalledWith({
        transactionAmount: -50.25,
        category: "Food",
        transactionId: "1",
      });
    });

    it("should handle balance update errors", async () => {
      const mockTransaction = {
        id: "1",
        amount: 100,
        category: "Income",
      };

      const mockError = new Error("Database update failed");
      mockBudgetDatabaseService.updateBudgetBalance.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe(mockError);
      expect(result.current.updateError).toBe(mockError);
    });

    it("should handle missing transaction data", async () => {
      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForTransaction(null);
      });

      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBeInstanceOf(Error);
      expect(updateResult.error.message).toContain("Transaction data is required");
    });

    it("should set loading state during update", async () => {
      const mockTransaction = {
        id: "1",
        amount: 100,
        category: "Income",
      };

      mockBudgetDatabaseService.updateBudgetBalance.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      const updatePromise = act(async () => {
        result.current.updateBalanceForTransaction(mockTransaction);
      });

      // Check loading state during the operation
      expect(result.current.isUpdating).toBe(true);

      await updatePromise;

      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe("updateBalanceForMultipleTransactions", () => {
    it("should successfully update balances for multiple transactions", async () => {
      const mockTransactions = [
        { id: "1", amount: -25.5, category: "Food" },
        { id: "2", amount: -15.75, category: "Transportation" },
        { id: "3", amount: 100.0, category: "Income" },
      ];

      mockBudgetDatabaseService.updateBudgetBalance
        .mockResolvedValueOnce({ success: true, newBalance: 974.5 })
        .mockResolvedValueOnce({ success: true, newBalance: 958.75 })
        .mockResolvedValueOnce({ success: true, newBalance: 1058.75 });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForMultipleTransactions(mockTransactions);
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.successCount).toBe(3);
      expect(updateResult.failureCount).toBe(0);
      expect(updateResult.finalBalance).toBe(1058.75);
      expect(mockBudgetDatabaseService.updateBudgetBalance).toHaveBeenCalledTimes(3);
    });

    it("should handle partial failures in batch updates", async () => {
      const mockTransactions = [
        { id: "1", amount: -25.5, category: "Food" },
        { id: "2", amount: -15.75, category: "Transportation" },
        { id: "3", amount: 100.0, category: "Income" },
      ];

      mockBudgetDatabaseService.updateBudgetBalance
        .mockResolvedValueOnce({ success: true, newBalance: 974.5 })
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ success: true, newBalance: 1074.5 });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForMultipleTransactions(mockTransactions);
      });

      expect(updateResult.success).toBe(false); // Overall failure due to partial failures
      expect(updateResult.successCount).toBe(2);
      expect(updateResult.failureCount).toBe(1);
      expect(updateResult.errors).toHaveLength(1);
      expect(updateResult.errors[0].transactionId).toBe("2");
    });

    it("should handle empty transaction array", async () => {
      const { result } = renderHook(() => useTransactionBalanceUpdater());

      let updateResult;
      await act(async () => {
        updateResult = await result.current.updateBalanceForMultipleTransactions([]);
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.successCount).toBe(0);
      expect(updateResult.failureCount).toBe(0);
      expect(mockBudgetDatabaseService.updateBudgetBalance).not.toHaveBeenCalled();
    });
  });

  describe("balance calculation logic", () => {
    it("should correctly calculate balance changes for expenses", async () => {
      const mockTransaction = {
        id: "1",
        amount: -75.25,
        category: "Food",
      };

      mockBudgetDatabaseService.updateBudgetBalance.mockResolvedValue({
        success: true,
        newBalance: 924.75,
      });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(mockBudgetDatabaseService.updateBudgetBalance).toHaveBeenCalledWith({
        transactionAmount: -75.25,
        category: "Food",
        transactionId: "1",
      });
    });

    it("should correctly calculate balance changes for income", async () => {
      const mockTransaction = {
        id: "1",
        amount: 500.0,
        category: "Income",
      };

      mockBudgetDatabaseService.updateBudgetBalance.mockResolvedValue({
        success: true,
        newBalance: 1500.0,
      });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(mockBudgetDatabaseService.updateBudgetBalance).toHaveBeenCalledWith({
        transactionAmount: 500.0,
        category: "Income",
        transactionId: "1",
      });
    });
  });

  describe("error recovery", () => {
    it("should clear previous errors on successful update", async () => {
      const mockTransaction = {
        id: "1",
        amount: 100,
        category: "Income",
      };

      // First call fails
      mockBudgetDatabaseService.updateBudgetBalance.mockRejectedValueOnce(new Error("First error"));

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      // First update fails
      await act(async () => {
        await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(result.current.updateError).toBeInstanceOf(Error);

      // Second call succeeds
      mockBudgetDatabaseService.updateBudgetBalance.mockResolvedValueOnce({
        success: true,
        newBalance: 1100,
      });

      // Second update succeeds
      await act(async () => {
        await result.current.updateBalanceForTransaction(mockTransaction);
      });

      expect(result.current.updateError).toBe(null);
    });
  });

  describe("optimization and performance", () => {
    it("should debounce multiple rapid updates", async () => {
      const mockTransaction1 = { id: "1", amount: -10, category: "Food" };
      const mockTransaction2 = { id: "2", amount: -20, category: "Food" };

      mockBudgetDatabaseService.updateBudgetBalance.mockResolvedValue({
        success: true,
        newBalance: 970,
      });

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      // Fire multiple updates rapidly
      await act(async () => {
        const promises = [
          result.current.updateBalanceForTransaction(mockTransaction1),
          result.current.updateBalanceForTransaction(mockTransaction2),
        ];

        await Promise.all(promises);
      });

      // Both updates should have been processed
      expect(mockBudgetDatabaseService.updateBudgetBalance).toHaveBeenCalledTimes(2);
    });
  });
});
