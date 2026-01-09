import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactionBalanceUpdater } from "../useTransactionBalanceUpdater";
import * as budgetDb from "@/db/budgetDb";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  getBudgetMetadata: vi.fn(),
  setBudgetMetadata: vi.fn(),
  budgetDb: {
    envelopes: {
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("useTransactionBalanceUpdater", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(budgetDb.getBudgetMetadata).mockResolvedValue({
      id: "test-budget",
      lastModified: Date.now(),
      actualBalance: 1000,
      unassignedCash: 200,
    });
  });

  it("should initialize with correct function", () => {
    const { result } = renderHook(() => useTransactionBalanceUpdater());

    expect(typeof result.current.updateBalancesForTransaction).toBe("function");
  });

  describe("updateBalancesForTransaction", () => {
    it("should successfully update balance for income transaction to unassigned", async () => {
      const mockTransaction = {
        id: "1",
        amount: 100,
        type: "income",
        envelopeId: "unassigned",
      };

      vi.mocked(budgetDb.setBudgetMetadata).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalancesForTransaction(mockTransaction);
      });

      expect(budgetDb.getBudgetMetadata).toHaveBeenCalled();
      expect(budgetDb.setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 1100,
        unassignedCash: 300,
      });
    });

    it("should successfully update balance for expense transaction to unassigned", async () => {
      const mockTransaction = {
        id: "1",
        amount: 50.25,
        type: "expense",
        envelopeId: "unassigned",
      };

      vi.mocked(budgetDb.setBudgetMetadata).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalancesForTransaction(mockTransaction);
      });

      expect(budgetDb.getBudgetMetadata).toHaveBeenCalled();
      expect(budgetDb.setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 949.75,
        unassignedCash: 149.75,
      });
    });

    it("should successfully update balance for transaction to envelope", async () => {
      const mockTransaction = {
        id: "1",
        amount: 50.25,
        type: "expense",
        envelopeId: "env1",
      };

      const mockEnvelope = {
        id: "env1",
        name: "Food",
        currentBalance: 100,
      };

      vi.mocked(budgetDb.budgetDb.envelopes.get).mockResolvedValue(mockEnvelope);
      vi.mocked(budgetDb.budgetDb.envelopes.update).mockResolvedValue(1);
      vi.mocked(budgetDb.setBudgetMetadata).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalancesForTransaction(mockTransaction);
      });

      expect(budgetDb.budgetDb.envelopes.get).toHaveBeenCalledWith("env1");
      expect(budgetDb.budgetDb.envelopes.update).toHaveBeenCalledWith("env1", {
        currentBalance: 49.75,
        lastModified: expect.any(Number),
      });
      expect(budgetDb.setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 949.75,
      });
    });

    it("should handle removing transaction with isRemoving=true", async () => {
      const mockTransaction = {
        id: "1",
        amount: 100,
        type: "income",
        envelopeId: "unassigned",
      };

      vi.mocked(budgetDb.setBudgetMetadata).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalancesForTransaction(mockTransaction, true);
      });

      // When removing, the balance changes should be reversed
      expect(budgetDb.setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 900,
        unassignedCash: 100,
      });
    });

    it("should handle transaction without envelopeId", async () => {
      const mockTransaction = {
        id: "1",
        amount: 50,
        type: "expense",
      };

      vi.mocked(budgetDb.setBudgetMetadata).mockResolvedValue(undefined);

      const { result } = renderHook(() => useTransactionBalanceUpdater());

      await act(async () => {
        await result.current.updateBalancesForTransaction(mockTransaction);
      });

      expect(budgetDb.setBudgetMetadata).toHaveBeenCalledWith({
        actualBalance: 950,
        unassignedCash: 150,
      });
    });
  });
});
