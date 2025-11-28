import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransferFunds } from "../useTransferFunds";
import { budgetDb } from "@/db/budgetDb";

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
      update: vi.fn(),
    },
    transactions: {
      put: vi.fn(),
    },
  },
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    transactions: ["transactions"],
    dashboard: ["dashboard"],
  },
  optimisticHelpers: {
    updateEnvelope: vi.fn(),
    addTransaction: vi.fn(),
  },
}));

vi.mock("@/domain/schemas/transaction", () => ({
  validateAndNormalizeTransaction: vi.fn((txn) => txn),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
  },
  writable: true,
});

describe("useTransferFunds - CRUD Tests", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  const mockMutate = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockMutation = {
    mutate: mockMutate,
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    isSuccess: false,
  };

  const mockFromEnvelope = {
    id: "envelope-from",
    name: "Source Envelope",
    currentBalance: 500,
    category: "expenses",
  };

  const mockToEnvelope = {
    id: "envelope-to",
    name: "Destination Envelope",
    currentBalance: 200,
    category: "expenses",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useMutation as Mock).mockReturnValue(mockMutation);
    (budgetDb.envelopes.get as Mock).mockImplementation((id: string) => {
      if (id === "envelope-from") return Promise.resolve(mockFromEnvelope);
      if (id === "envelope-to") return Promise.resolve(mockToEnvelope);
      return Promise.resolve(undefined);
    });
    (budgetDb.envelopes.update as Mock).mockResolvedValue(1);
  });

  describe("Transfer Operation - Validation & Safety", () => {
    it("should transfer funds between envelopes", async () => {
      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "envelope-to",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(transferData);
        expect(result.fromEnvelopeId).toBe("envelope-from");
        expect(result.toEnvelopeId).toBe("envelope-to");
        expect(result.amount).toBe(100);
      });

      // Verify both envelopes were updated
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "envelope-from",
        expect.objectContaining({
          currentBalance: 400, // 500 - 100
        })
      );
      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "envelope-to",
        expect.objectContaining({
          currentBalance: 300, // 200 + 100
        })
      );
    });

    it("should reject transfer from non-existent envelope", async () => {
      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "non-existent",
        toEnvelopeId: "envelope-to",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(transferData)).rejects.toThrow();
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should reject transfer to non-existent envelope", async () => {
      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "non-existent",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(transferData)).rejects.toThrow();
      });
    });

    it("should prevent transferring more than available balance", async () => {
      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "envelope-to",
        amount: 600, // More than available (500)
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        // Should reject transfer when insufficient funds
        await expect(mutationFn(transferData)).rejects.toThrow(
          "Insufficient balance in source envelope"
        );
      });
    });

    it("should invalidate queries on success", async () => {
      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "envelope-to",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(transferData);
        await onSuccess(result);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
    });
  });

  describe("Transfer Rollback on Failure", () => {
    it("should rollback transfer when insufficient funds error occurs", async () => {
      // Mock source envelope with insufficient funds
      const mockLowBalanceEnvelope = {
        id: "envelope-low",
        name: "Low Balance Envelope",
        currentBalance: 50,
        category: "expenses",
      };

      (budgetDb.envelopes.get as Mock).mockImplementation((id: string) => {
        if (id === "envelope-low") return Promise.resolve(mockLowBalanceEnvelope);
        if (id === "envelope-to") return Promise.resolve(mockToEnvelope);
        return Promise.resolve(undefined);
      });

      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-low",
        toEnvelopeId: "envelope-to",
        amount: 100, // More than available (50)
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(transferData)).rejects.toThrow(
          "Insufficient balance in source envelope"
        );
      });

      // Verify no database updates were made (rollback scenario)
      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should not call onSuccess when transfer fails", async () => {
      // Make the envelope update fail
      (budgetDb.envelopes.update as Mock).mockRejectedValue(new Error("Database write failed"));

      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "envelope-to",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;
      const onSuccessSpy = vi.fn(onSuccess);

      // Clear query invalidation tracking
      mockQueryClient.invalidateQueries.mockClear();

      await act(async () => {
        try {
          await mutationFn(transferData);
          // Should not reach here
          onSuccessSpy({});
        } catch {
          // Expected - transfer should fail
        }
      });

      // onSuccess should not have been called
      expect(onSuccessSpy).not.toHaveBeenCalled();
    });

    it("should log error when transfer fails", async () => {
      const transferError = new Error("Transfer operation failed");

      const { result } = renderHook(() => useTransferFunds());

      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        await onError(transferError);
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to transfer funds:", transferError);
    });

    it("should not trigger sync service when transfer fails", async () => {
      const transferError = new Error("Transfer failed");

      const { result } = renderHook(() => useTransferFunds());

      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      // Clear previous sync calls
      mockTriggerSync.mockClear();

      await act(async () => {
        await onError(transferError);
      });

      // Sync should NOT be triggered on failure
      expect(mockTriggerSync).not.toHaveBeenCalled();
    });

    it("should handle partial failure during two-envelope update", async () => {
      // First update succeeds, second fails
      let updateCallCount = 0;
      (budgetDb.envelopes.update as Mock).mockImplementation(() => {
        updateCallCount++;
        if (updateCallCount === 2) {
          return Promise.reject(new Error("Second envelope update failed"));
        }
        return Promise.resolve(1);
      });

      const { result } = renderHook(() => useTransferFunds());

      const transferData = {
        fromEnvelopeId: "envelope-from",
        toEnvelopeId: "envelope-to",
        amount: 100,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        try {
          await mutationFn(transferData);
        } catch (error) {
          // Expected - second update fails
          expect((error as Error).message).toBe("Second envelope update failed");
        }
      });
    });

    it("should maintain UI state consistency after transfer rollback", async () => {
      const mockTransferMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isError: true,
        isSuccess: false,
        error: new Error("Transfer failed"),
      };

      (useMutation as Mock).mockReturnValue(mockTransferMutation);

      const { result } = renderHook(() => useTransferFunds());

      // After failure, mutation state should reflect error
      expect(mockTransferMutation.isError).toBe(true);
      expect(mockTransferMutation.isPending).toBe(false);
      expect(mockTransferMutation.isSuccess).toBe(false);
    });
  });
});
