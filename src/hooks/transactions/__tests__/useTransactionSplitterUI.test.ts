import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactionSplitterUI } from "../useTransactionSplitterUI";

// Mock dependencies
vi.mock("../../../services/transactions/transactionSplitterService", () => ({
  default: {
    splitTransaction: vi.fn(),
    validateSplitData: vi.fn(),
    calculateSplitTotals: vi.fn(),
  },
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showWarning: vi.fn(),
  },
}));

const mockTransactionSplitterService = vi.hoisted(() => ({
  splitTransaction: vi.fn(),
  validateSplitData: vi.fn(),
  calculateSplitTotals: vi.fn(),
}));

describe("useTransactionSplitterUI", () => {
  const mockTransaction = {
    id: "1",
    description: "Grocery Store",
    amount: -120.5,
    date: "2024-01-15",
    category: "Food",
  };

  const mockOnSplitComplete = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    transaction: mockTransaction,
    onSplitComplete: mockOnSplitComplete,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockTransactionSplitterService.validateSplitData.mockReturnValue({
      isValid: true,
      errors: {},
    });

    mockTransactionSplitterService.calculateSplitTotals.mockReturnValue({
      totalAmount: 120.5,
      remainingAmount: 0,
      splitCount: 2,
    });
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      expect(result.current.splits).toHaveLength(2); // Default to 2 splits
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.errors).toEqual({});
      expect(result.current.totals.totalAmount).toBe(120.5);
    });

    it("should initialize splits with equal amounts", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      expect(result.current.splits[0].amount).toBe("60.25");
      expect(result.current.splits[1].amount).toBe("60.25");
      expect(result.current.splits[0].category).toBe("Food");
      expect(result.current.splits[1].category).toBe("Food");
    });

    it("should handle custom initial split count", () => {
      const propsWithSplitCount = {
        ...defaultProps,
        initialSplitCount: 3,
      };

      const { result } = renderHook(() => useTransactionSplitterUI(propsWithSplitCount));

      expect(result.current.splits).toHaveLength(3);
      expect(result.current.splits[0].amount).toBe("40.17");
      expect(result.current.splits[1].amount).toBe("40.17");
      expect(result.current.splits[2].amount).toBe("40.16"); // Handles rounding
    });
  });

  describe("split management", () => {
    it("should add a new split", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.addSplit();
      });

      expect(result.current.splits).toHaveLength(3);
      expect(result.current.splits[2].amount).toBe("0.00");
      expect(result.current.splits[2].category).toBe("Food");
    });

    it("should remove a split", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.addSplit(); // Add third split
      });

      expect(result.current.splits).toHaveLength(3);

      act(() => {
        result.current.removeSplit(1);
      });

      expect(result.current.splits).toHaveLength(2);
    });

    it("should not remove split if only 2 remain", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.removeSplit(0);
      });

      expect(result.current.splits).toHaveLength(2); // Should remain 2
    });

    it("should update split field", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.updateSplitField(0, "description", "Vegetables");
      });

      expect(result.current.splits[0].description).toBe("Vegetables");
    });

    it("should update split amount and recalculate totals", () => {
      mockTransactionSplitterService.calculateSplitTotals.mockReturnValue({
        totalAmount: 100.0,
        remainingAmount: -20.5,
        splitCount: 2,
      });

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.updateSplitField(0, "amount", "100.00");
      });

      expect(result.current.splits[0].amount).toBe("100.00");
      expect(result.current.totals.remainingAmount).toBe(-20.5);
    });
  });

  describe("split distribution", () => {
    it("should distribute amount evenly across splits", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.addSplit();
        result.current.distributeEvenly();
      });

      expect(result.current.splits[0].amount).toBe("40.17");
      expect(result.current.splits[1].amount).toBe("40.17");
      expect(result.current.splits[2].amount).toBe("40.16");
    });

    it("should distribute amount by percentage", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      const percentages = [70, 30]; // 70% and 30%

      act(() => {
        result.current.distributeByPercentage(percentages);
      });

      expect(result.current.splits[0].amount).toBe("84.35");
      expect(result.current.splits[1].amount).toBe("36.15");
    });

    it("should clear all split amounts", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.clearAllAmounts();
      });

      expect(result.current.splits[0].amount).toBe("0.00");
      expect(result.current.splits[1].amount).toBe("0.00");
    });
  });

  describe("validation", () => {
    it("should validate splits correctly", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      let isValid;
      act(() => {
        isValid = result.current.validateSplits();
      });

      expect(isValid).toBe(true);
      expect(mockTransactionSplitterService.validateSplitData).toHaveBeenCalledWith(
        result.current.splits,
        mockTransaction.amount
      );
    });

    it("should handle validation errors", () => {
      mockTransactionSplitterService.validateSplitData.mockReturnValue({
        isValid: false,
        errors: {
          totalMismatch: "Split totals must equal original amount",
          split0: "Amount is required",
        },
      });

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      let isValid;
      act(() => {
        isValid = result.current.validateSplits();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.totalMismatch).toBeDefined();
      expect(result.current.errors.split0).toBeDefined();
    });
  });

  describe("form submission", () => {
    it("should handle successful split submission", async () => {
      mockTransactionSplitterService.splitTransaction.mockResolvedValue({
        success: true,
        transactions: [
          { id: "1a", description: "Split 1", amount: -60.25 },
          { id: "1b", description: "Split 2", amount: -60.25 },
        ],
      });

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockTransactionSplitterService.splitTransaction).toHaveBeenCalledWith(
        mockTransaction,
        result.current.splits
      );
      expect(mockOnSplitComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          transactions: expect.any(Array),
        })
      );
    });

    it("should handle split submission errors", async () => {
      const mockError = new Error("Split failed");
      mockTransactionSplitterService.splitTransaction.mockRejectedValue(mockError);

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.submitError).toBe(mockError);
      expect(result.current.isProcessing).toBe(false);
    });

    it("should prevent submission if validation fails", async () => {
      mockTransactionSplitterService.validateSplitData.mockReturnValue({
        isValid: false,
        errors: { totalMismatch: "Amounts don't match" },
      });

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockTransactionSplitterService.splitTransaction).not.toHaveBeenCalled();
      expect(mockOnSplitComplete).not.toHaveBeenCalled();
    });

    it("should set processing state during submission", async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockTransactionSplitterService.splitTransaction.mockReturnValue(promise);

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      const submitPromise = act(async () => {
        result.current.handleSubmit();
      });

      expect(result.current.isProcessing).toBe(true);

      resolvePromise({ success: true, transactions: [] });
      await submitPromise;

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe("form reset and cancellation", () => {
    it("should reset form to initial state", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      // Modify form state
      act(() => {
        result.current.updateSplitField(0, "description", "Modified");
        result.current.addSplit();
      });

      expect(result.current.splits).toHaveLength(3);
      expect(result.current.splits[0].description).toBe("Modified");

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.splits).toHaveLength(2);
      expect(result.current.splits[0].description).toBe("");
      expect(result.current.errors).toEqual({});
    });

    it("should handle cancel action", () => {
      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      act(() => {
        result.current.handleCancel();
      });

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("should clear errors when form is modified", () => {
      mockTransactionSplitterService.validateSplitData.mockReturnValue({
        isValid: false,
        errors: { split0: "Error message" },
      });

      const { result } = renderHook(() => useTransactionSplitterUI(defaultProps));

      // Trigger validation error
      act(() => {
        result.current.validateSplits();
      });

      expect(result.current.errors.split0).toBeDefined();

      // Modify form - should clear errors
      act(() => {
        result.current.updateSplitField(0, "amount", "50.00");
      });

      expect(result.current.errors.split0).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle transaction with zero amount", () => {
      const zeroAmountTransaction = {
        ...mockTransaction,
        amount: 0,
      };

      const propsWithZeroAmount = {
        ...defaultProps,
        transaction: zeroAmountTransaction,
      };

      const { result } = renderHook(() => useTransactionSplitterUI(propsWithZeroAmount));

      expect(result.current.splits[0].amount).toBe("0.00");
      expect(result.current.splits[1].amount).toBe("0.00");
    });

    it("should handle very small amounts with proper rounding", () => {
      const smallAmountTransaction = {
        ...mockTransaction,
        amount: -0.03,
      };

      const propsWithSmallAmount = {
        ...defaultProps,
        transaction: smallAmountTransaction,
      };

      const { result } = renderHook(() => useTransactionSplitterUI(propsWithSmallAmount));

      expect(result.current.splits[0].amount).toBe("0.02");
      expect(result.current.splits[1].amount).toBe("0.01");
    });

    it("should handle missing transaction gracefully", () => {
      const propsWithoutTransaction = {
        ...defaultProps,
        transaction: null,
      };

      expect(() => {
        renderHook(() => useTransactionSplitterUI(propsWithoutTransaction));
      }).not.toThrow();
    });
  });
});
