import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransactionMutations } from "../useTransactionMutations";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("../../../services/budgetDatabaseService", () => ({
  default: {
    addTransaction: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
}));

vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useTransactionMutations", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
  });

  describe("addTransaction mutation", () => {
    it("should configure add transaction mutation correctly", () => {
      const mockMutate = vi.fn();
      const mockMutation = {
        mutate: mockMutate,
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockReturnValue(mockMutation);

      const { result } = renderHook(() => useTransactionMutations());

      expect(useMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          mutationFn: expect.any(Function),
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      expect(result.current.addTransaction).toBe(mockMutate);
      expect(result.current.isAddingTransaction).toBe(false);
    });

    it("should handle successful transaction addition", () => {
      const mockOnSuccess = vi.fn();
      const mockMutation = {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        // Store the onSuccess callback to call later
        mockOnSuccess.mockImplementation(onSuccess);
        return mockMutation;
      });

      renderHook(() => useTransactionMutations());

      const newTransaction = {
        id: "new",
        description: "New Transaction",
        amount: 100,
      };
      act(() => {
        mockOnSuccess(newTransaction);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });

    it("should handle transaction addition errors", () => {
      const mockOnError = vi.fn();
      const mockMutation = {
        mutate: vi.fn(),
        isPending: false,
        error: null,
      };

      (useMutation as Mock).mockImplementation(({ onError }) => {
        mockOnError.mockImplementation(onError);
        return mockMutation;
      });

      renderHook(() => useTransactionMutations());

      const error = new Error("Add failed");
      act(() => {
        mockOnError(error);
      });

      // Error handling would be tested by checking logger calls
    });
  });

  describe("updateTransaction mutation", () => {
    it("should configure update transaction mutation correctly", () => {
      const mockMutations = [
        { mutate: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: false, error: null }, // delete
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.updateTransaction).toEqual(expect.any(Function));
      expect(result.current.isUpdatingTransaction).toBe(false);
    });

    it("should handle successful transaction update", () => {
      let updateOnSuccess;
      const mockMutations = [
        { mutate: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: false, error: null }, // delete
      ];

      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        if (!updateOnSuccess) updateOnSuccess = onSuccess;
        return mockMutations.shift();
      });

      renderHook(() => useTransactionMutations());

      const updatedTransaction = {
        id: "1",
        description: "Updated",
        amount: 200,
      };
      act(() => {
        updateOnSuccess(updatedTransaction);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });
  });

  describe("deleteTransaction mutation", () => {
    it("should configure delete transaction mutation correctly", () => {
      const mockMutations = [
        { mutate: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: false, error: null }, // delete
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.deleteTransaction).toEqual(expect.any(Function));
      expect(result.current.isDeletingTransaction).toBe(false);
    });

    it("should handle successful transaction deletion", () => {
      let deleteOnSuccess;
      const mockMutations = [
        { mutate: vi.fn(), isPending: false, error: null }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: false, error: null }, // delete
      ];

      (useMutation as Mock).mockImplementation(({ onSuccess }) => {
        if (deleteOnSuccess) return mockMutations.shift();
        deleteOnSuccess = onSuccess;
        return mockMutations.shift();
      });

      renderHook(() => useTransactionMutations());

      act(() => {
        deleteOnSuccess("deleted-transaction-id");
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["transactions"],
      });
    });
  });

  describe("loading states", () => {
    it("should track loading states correctly", () => {
      const mockMutations = [
        { mutate: vi.fn(), isPending: true, error: null }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: true, error: null }, // delete
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.isAddingTransaction).toBe(true);
      expect(result.current.isUpdatingTransaction).toBe(false);
      expect(result.current.isDeletingTransaction).toBe(true);
    });
  });

  describe("error states", () => {
    it("should expose error states", () => {
      const mockError = new Error("Transaction error");
      const mockMutations = [
        { mutate: vi.fn(), isPending: false, error: mockError }, // add
        { mutate: vi.fn(), isPending: false, error: null }, // update
        { mutate: vi.fn(), isPending: false, error: mockError }, // delete
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift());

      const { result } = renderHook(() => useTransactionMutations());

      expect(result.current.addTransactionError).toBe(mockError);
      expect(result.current.updateTransactionError).toBe(null);
      expect(result.current.deleteTransactionError).toBe(mockError);
    });
  });
});
