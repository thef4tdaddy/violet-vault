import { renderHook, act } from "@testing-library/react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { useReconciliation } from "../useReconciliation";
import logger from "@/utils/core/common/logger";
import { globalToast } from "@/stores/ui/toastStore";
import type { Envelope, SavingsGoal } from "../types";

// Mock dependencies
vi.mock("@/stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showInfo: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe("useReconciliation", () => {
  let mockReconcileTransaction: ReturnType<typeof vi.fn>;
  let mockEnvelopes: Envelope[];
  let mockSavingsGoals: SavingsGoal[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockReconcileTransaction = vi.fn();
    mockEnvelopes = [
      {
        id: "env1",
        name: "Groceries",
        currentBalance: "0",
        category: "Test",
        budgetAmount: 100,
        progress: 0,
        status: "active",
        icon: "test",
        color: "red",
        lastModified: "2023-01-01",
        createdAt: "2023-01-01",
      },
      {
        id: "env2",
        name: "Entertainment",
        currentBalance: "0",
        category: "Test",
        budgetAmount: 100,
        progress: 0,
        status: "active",
        icon: "test",
        color: "red",
        lastModified: "2023-01-01",
        createdAt: "2023-01-01",
      },
    ];
    mockSavingsGoals = [
      {
        id: "goal1",
        name: "Emergency Fund",
        currentAmount: "0",
        targetAmount: 1000,
        deadline: "2023-12-31",
        icon: "test",
        color: "blue",
        status: "active",
      },
    ];
  });

  it("should handle successful reconciliation", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const mockTransaction = {
      amount: "100",
      description: "Test transaction",
      type: "expense" as const,
    };

    const mockOnSuccess = vi.fn();

    act(() => {
      const success = result.current.handleReconcileTransaction(mockTransaction, mockOnSuccess);
      expect(success).toBe(true);
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -100,
        description: "Test transaction",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("should handle income transactions correctly", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const mockTransaction = {
      amount: "100",
      description: "Income",
      type: "income" as const,
    };

    act(() => {
      result.current.handleReconcileTransaction(mockTransaction, vi.fn());
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100,
      }),
      expect.any(Object)
    );
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    // Test missing amount
    act(() => {
      const success = result.current.handleReconcileTransaction(
        {
          amount: "",
          description: "Test",
          type: "expense",
        },
        undefined
      );
      expect(success).toBe(false);
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "Please enter amount and description",
      "Required Fields",
      8000
    );

    // Test missing description
    act(() => {
      const success = result.current.handleReconcileTransaction(
        {
          amount: "100",
          description: "   ",
          type: "expense",
        },
        undefined
      );
      expect(success).toBe(false);
    });
  });

  it("should handle auto-reconcile positive difference", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    // Auto-reconcile with valid difference
    act(() => {
      result.current.handleAutoReconcileDifference(50.25);
    });

    // Verify logger.warn was NOT called (meaning validation passed)
    expect(vi.mocked(logger.warn)).not.toHaveBeenCalled();

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 50.25,
        description: "Balance reconciliation - added extra funds",
        type: "income",
        envelopeId: "unassigned",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("should handle auto-reconcile negative difference", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    // Auto-reconcile with valid negative difference
    act(() => {
      result.current.handleAutoReconcileDifference(-25.5);
    });

    expect(mockReconcileTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -25.5,
        description: "Balance reconciliation - adjusted for discrepancy",
        type: "expense",
        envelopeId: "unassigned",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("should generate correct envelope options", () => {
    const { result } = renderHook(() =>
      useReconciliation(mockReconcileTransaction, mockEnvelopes, mockSavingsGoals)
    );

    const options = result.current.getEnvelopeOptions();

    expect(options).toEqual([
      { id: "unassigned", name: "Unassigned Cash" },
      { id: "env1", name: "Groceries" },
      { id: "env2", name: "Entertainment" },
      { id: "savings_goal1", name: "💰 Emergency Fund" },
    ]);
  });
});
