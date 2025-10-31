import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePaycheckOperations } from "../usePaycheckOperations";

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock paycheck deletion utils
vi.mock("@/utils/layout/paycheckDeletionUtils", () => ({
  validatePaycheckDeletion: vi.fn(),
  calculateReversedBalances: vi.fn(),
  deletePaycheckRecord: vi.fn(),
  invalidatePaycheckCaches: vi.fn(),
}));

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(),
    },
  },
  getBudgetMetadata: vi.fn(),
  setBudgetMetadata: vi.fn(),
}));

// Mock queryClient
vi.mock("@/utils/common/queryClient", () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
  queryKeys: {
    paycheckHistory: "paycheckHistory",
    budgetMetadata: "budgetMetadata",
  },
}));

describe("usePaycheckOperations", () => {
  let mockValidatePaycheckDeletion: ReturnType<typeof vi.fn>;
  let mockCalculateReversedBalances: ReturnType<typeof vi.fn>;
  let mockDeletePaycheckRecord: ReturnType<typeof vi.fn>;
  let mockInvalidatePaycheckCaches: ReturnType<typeof vi.fn>;
  let mockSetBudgetMetadata: ReturnType<typeof vi.fn>;
  let mockGetBudgetMetadata: ReturnType<typeof vi.fn>;
  let mockBudgetDb: { envelopes: { toArray: ReturnType<typeof vi.fn> } };

  const mockPaycheck = {
    id: "paycheck-1",
    amount: 1000,
    date: "2024-01-01",
    envelopes: [
      { envelopeId: "env-1", amount: 500 },
      { envelopeId: "env-2", amount: 500 },
    ],
  };

  const mockPaycheckHistory = [mockPaycheck];

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    const paycheckUtils = await import("@/utils/layout/paycheckDeletionUtils");
    const budgetDb = await import("@/db/budgetDb");
    const queryClient = await import("@/utils/common/queryClient");

    mockValidatePaycheckDeletion = paycheckUtils.validatePaycheckDeletion as ReturnType<
      typeof vi.fn
    >;
    mockCalculateReversedBalances = paycheckUtils.calculateReversedBalances as ReturnType<
      typeof vi.fn
    >;
    mockDeletePaycheckRecord = paycheckUtils.deletePaycheckRecord as ReturnType<typeof vi.fn>;
    mockInvalidatePaycheckCaches = paycheckUtils.invalidatePaycheckCaches as ReturnType<
      typeof vi.fn
    >;

    mockSetBudgetMetadata = budgetDb.setBudgetMetadata as ReturnType<typeof vi.fn>;
    mockGetBudgetMetadata = budgetDb.getBudgetMetadata as ReturnType<typeof vi.fn>;
    mockBudgetDb = budgetDb.budgetDb as { envelopes: { toArray: ReturnType<typeof vi.fn> } };

    mockValidatePaycheckDeletion.mockReturnValue(mockPaycheck);
    mockCalculateReversedBalances.mockResolvedValue({
      currentActualBalance: 5000,
      newActualBalance: 4000,
      currentUnassignedCash: 500,
      newUnassignedCash: 0,
    });
    mockSetBudgetMetadata.mockResolvedValue(undefined);
    mockDeletePaycheckRecord.mockResolvedValue(undefined);
    mockInvalidatePaycheckCaches.mockResolvedValue(undefined);
  });

  it("should provide handleDeletePaycheck function", () => {
    const { result } = renderHook(() => usePaycheckOperations());

    expect(result.current.handleDeletePaycheck).toBeDefined();
    expect(typeof result.current.handleDeletePaycheck).toBe("function");
  });

  it("should successfully delete a paycheck with proper balance reversal", async () => {
    const { result } = renderHook(() => usePaycheckOperations());

    const queryClient = await import("@/utils/common/queryClient");

    await act(async () => {
      await result.current.handleDeletePaycheck("paycheck-1", mockPaycheckHistory);
    });

    expect(mockValidatePaycheckDeletion).toHaveBeenCalledWith("paycheck-1", mockPaycheckHistory);
    expect(mockCalculateReversedBalances).toHaveBeenCalledWith(
      mockPaycheck,
      mockBudgetDb,
      mockGetBudgetMetadata
    );
    expect(mockSetBudgetMetadata).toHaveBeenCalledWith({
      actualBalance: 4000,
      unassignedCash: 0,
    });
    expect(mockDeletePaycheckRecord).toHaveBeenCalledWith("paycheck-1", mockBudgetDb);
    expect(mockInvalidatePaycheckCaches).toHaveBeenCalledWith(
      queryClient.queryClient,
      queryClient.queryKeys
    );
  });

  it("should throw error when validation fails", async () => {
    mockValidatePaycheckDeletion.mockImplementation(() => {
      throw new Error("Paycheck not found");
    });

    const { result } = renderHook(() => usePaycheckOperations());

    await expect(
      act(async () => {
        await result.current.handleDeletePaycheck("invalid-id", mockPaycheckHistory);
      })
    ).rejects.toThrow("Paycheck not found");

    expect(mockCalculateReversedBalances).not.toHaveBeenCalled();
    expect(mockSetBudgetMetadata).not.toHaveBeenCalled();
  });

  it("should throw error when balance calculation fails", async () => {
    mockCalculateReversedBalances.mockRejectedValue(new Error("Balance calculation failed"));

    const { result } = renderHook(() => usePaycheckOperations());

    await expect(
      act(async () => {
        await result.current.handleDeletePaycheck("paycheck-1", mockPaycheckHistory);
      })
    ).rejects.toThrow("Balance calculation failed");

    expect(mockSetBudgetMetadata).not.toHaveBeenCalled();
    expect(mockDeletePaycheckRecord).not.toHaveBeenCalled();
  });

  it("should throw error when metadata update fails", async () => {
    mockSetBudgetMetadata.mockRejectedValue(new Error("Metadata update failed"));

    const { result } = renderHook(() => usePaycheckOperations());

    await expect(
      act(async () => {
        await result.current.handleDeletePaycheck("paycheck-1", mockPaycheckHistory);
      })
    ).rejects.toThrow("Metadata update failed");

    expect(mockDeletePaycheckRecord).not.toHaveBeenCalled();
    expect(mockInvalidatePaycheckCaches).not.toHaveBeenCalled();
  });

  it("should throw error when paycheck deletion fails", async () => {
    mockDeletePaycheckRecord.mockRejectedValue(new Error("Deletion failed"));

    const { result } = renderHook(() => usePaycheckOperations());

    await expect(
      act(async () => {
        await result.current.handleDeletePaycheck("paycheck-1", mockPaycheckHistory);
      })
    ).rejects.toThrow("Deletion failed");

    expect(mockInvalidatePaycheckCaches).not.toHaveBeenCalled();
  });

  it("should handle numeric paycheck IDs", async () => {
    const { result } = renderHook(() => usePaycheckOperations());

    await act(async () => {
      await result.current.handleDeletePaycheck(12345, mockPaycheckHistory);
    });

    expect(mockValidatePaycheckDeletion).toHaveBeenCalledWith(12345, mockPaycheckHistory);
  });

  it("should calculate balance changes correctly", async () => {
    mockCalculateReversedBalances.mockResolvedValue({
      currentActualBalance: 10000,
      newActualBalance: 8500,
      currentUnassignedCash: 1000,
      newUnassignedCash: 500,
    });

    const { result } = renderHook(() => usePaycheckOperations());

    await act(async () => {
      await result.current.handleDeletePaycheck("paycheck-1", mockPaycheckHistory);
    });

    expect(mockSetBudgetMetadata).toHaveBeenCalledWith({
      actualBalance: 8500,
      unassignedCash: 500,
    });
  });

  it("should maintain stable handleDeletePaycheck reference", () => {
    const { result, rerender } = renderHook(() => usePaycheckOperations());

    const firstReference = result.current.handleDeletePaycheck;

    rerender();

    const secondReference = result.current.handleDeletePaycheck;

    expect(firstReference).toBe(secondReference);
  });
});
