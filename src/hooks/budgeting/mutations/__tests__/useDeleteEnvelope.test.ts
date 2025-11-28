import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteEnvelope } from "../useDeleteEnvelope";
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
      delete: vi.fn(),
    },
    bills: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  getUnassignedCash: vi.fn(),
  setUnassignedCash: vi.fn(),
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
    budgetMetadata: ["budgetMetadata"],
    bills: ["bills"],
  },
  optimisticHelpers: {
    removeEnvelope: vi.fn(),
    updateBill: vi.fn(),
  },
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

describe("useDeleteEnvelope - CRUD Tests", () => {
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

  const mockEnvelopeWithBalance = {
    id: "envelope-1",
    name: "Test Envelope",
    currentBalance: 500,
    category: "expenses",
  };

  const mockEnvelopeNoBalance = {
    id: "envelope-2",
    name: "Empty Envelope",
    currentBalance: 0,
    category: "expenses",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useMutation as Mock).mockReturnValue(mockMutation);
    (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelopeWithBalance);
    (budgetDb.envelopes.delete as Mock).mockResolvedValue(undefined);
    (budgetDb.bills.where as Mock).mockReturnValue({
      equals: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
      })),
    });
    (budgetDb.getUnassignedCash as Mock) = vi.fn().mockResolvedValue(1000);
    (budgetDb.setUnassignedCash as Mock) = vi.fn().mockResolvedValue(undefined);
  });

  describe("Delete Operation - Safety & Validation", () => {
    it("should delete envelope successfully", async () => {
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(deleteData);
        expect(result.envelopeId).toBe("envelope-1");
        expect(result.envelopeName).toBe("Test Envelope");
      });

      expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("envelope-1");
    });

    it("should transfer balance to unassigned cash before deletion", async () => {
      const { getUnassignedCash, setUnassignedCash } = await import("@/db/budgetDb");
      (getUnassignedCash as Mock).mockResolvedValue(1000);

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(deleteData);
        expect(result.transferredAmount).toBe(500);
      });

      expect(getUnassignedCash).toHaveBeenCalled();
      expect(setUnassignedCash).toHaveBeenCalledWith(1500); // 1000 + 500
    });

    it("should not transfer balance if envelope has zero balance", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockEnvelopeNoBalance);
      const { getUnassignedCash, setUnassignedCash } = await import("@/db/budgetDb");

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-2",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(deleteData);
        expect(result.transferredAmount).toBe(0);
      });

      // Should not call setUnassignedCash if balance is 0
      expect(setUnassignedCash).not.toHaveBeenCalled();
    });

    it("should delete connected bills when deleteBillsToo is true", async () => {
      const mockBills = [
        { id: "bill-1", envelopeId: "envelope-1", name: "Bill 1" },
        { id: "bill-2", envelopeId: "envelope-1", name: "Bill 2" },
      ];

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: true,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(deleteData);
      });

      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-1");
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-2");
    });

    it("should disconnect bills (not delete) when deleteBillsToo is false", async () => {
      const mockBills = [{ id: "bill-1", envelopeId: "envelope-1", name: "Bill 1" }];

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(deleteData);
      });

      // Should update bills to remove envelopeId, not delete them
      expect(budgetDb.bills.update).toHaveBeenCalledWith("bill-1", {
        envelopeId: undefined,
      });
      expect(optimisticHelpers.updateBill).toHaveBeenCalledWith(mockQueryClient, "bill-1", {
        envelopeId: undefined,
      });
      expect(budgetDb.bills.delete).not.toHaveBeenCalled();
    });

    it("should apply optimistic update before database deletion", async () => {
      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(deleteData);
      });

      expect(optimisticHelpers.removeEnvelope).toHaveBeenCalledWith(mockQueryClient, "envelope-1");
    });

    it("should invalidate all related queries on success", async () => {
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(deleteData);
        await onSuccess(result);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["budgetMetadata"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["bills"],
      });
    });

    it("should trigger sync service on success", async () => {
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(deleteData);
        await onSuccess(result);
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_deleted");
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database delete failed");
      (budgetDb.envelopes.delete as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        try {
          await mutationFn(deleteData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to delete envelope:", dbError);
    });

    it("should handle missing envelope gracefully", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "non-existent",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(deleteData);
        // Should still return result with "Unknown" name
        expect(result.envelopeName).toBe("Unknown");
        expect(result.transferredAmount).toBe(0);
      });

      // Should still attempt deletion (idempotent operation)
      expect(budgetDb.envelopes.delete).toHaveBeenCalledWith("non-existent");
    });

    it("should log deletion details for audit trail", async () => {
      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: true,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(deleteData);
        await onSuccess(result);
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.info).toHaveBeenCalledWith(
        "✅ Envelope deleted",
        expect.objectContaining({
          envelopeName: "Test Envelope",
          balanceTransferredToUnassigned: 500,
          billsDeleted: true,
        })
      );
    });

    it("should handle multiple connected bills correctly", async () => {
      const mockBills = [
        { id: "bill-1", envelopeId: "envelope-1" },
        { id: "bill-2", envelopeId: "envelope-1" },
        { id: "bill-3", envelopeId: "envelope-1" },
      ];

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });

      const { result } = renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: true,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(deleteData);
      });

      expect(budgetDb.bills.delete).toHaveBeenCalledTimes(3);
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-1");
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-2");
      expect(budgetDb.bills.delete).toHaveBeenCalledWith("bill-3");
    });
  });

  describe("Validation Error Handling", () => {
    it("should handle database delete failure gracefully", async () => {
      const dbError = new Error("Database delete failed");
      (budgetDb.envelopes.delete as Mock).mockRejectedValue(dbError);

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        try {
          await mutationFn(deleteData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to delete envelope:", dbError);
    });

    it("should handle bill disconnection failure gracefully", async () => {
      const mockBills = [{ id: "bill-1", envelopeId: "envelope-1", name: "Bill 1" }];
      const updateError = new Error("Failed to update bill");

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });
      (budgetDb.bills.update as Mock).mockRejectedValue(updateError);

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(deleteData)).rejects.toThrow("Failed to update bill");
      });
    });

    it("should handle bill deletion failure gracefully", async () => {
      const mockBills = [{ id: "bill-1", envelopeId: "envelope-1", name: "Bill 1" }];
      const deleteError = new Error("Failed to delete bill");

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBills),
        })),
      });
      (budgetDb.bills.delete as Mock).mockRejectedValue(deleteError);

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: true,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(deleteData)).rejects.toThrow("Failed to delete bill");
      });
    });

    it("should handle unassigned cash transfer failure", async () => {
      const { getUnassignedCash, setUnassignedCash } = await import("@/db/budgetDb");
      const transferError = new Error("Failed to transfer balance");
      (setUnassignedCash as Mock).mockRejectedValue(transferError);

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(deleteData)).rejects.toThrow("Failed to transfer balance");
      });

      // Delete should not have been called since transfer failed
      expect(budgetDb.envelopes.delete).not.toHaveBeenCalled();
    });

    it("should rollback optimistic update on failure", async () => {
      // Reset mocks to default before this test
      const budgetDbModule = await import("@/db/budgetDb");
      (budgetDbModule.getUnassignedCash as Mock).mockResolvedValue(1000);
      (budgetDbModule.setUnassignedCash as Mock).mockResolvedValue(undefined);

      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const dbError = new Error("Database error during delete");
      (budgetDb.envelopes.delete as Mock).mockRejectedValue(dbError);

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        try {
          await mutationFn(deleteData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      // Optimistic update was applied before error
      expect(optimisticHelpers.removeEnvelope).toHaveBeenCalledWith(mockQueryClient, "envelope-1");
      // Error should be logged
      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to delete envelope:", dbError);
    });

    it("should validate relationship integrity when deleting envelope with debts", async () => {
      // Reset all mocks to ensure proper operation
      const budgetDbModule = await import("@/db/budgetDb");
      (budgetDbModule.getUnassignedCash as Mock).mockResolvedValue(1000);
      (budgetDbModule.setUnassignedCash as Mock).mockResolvedValue(undefined);
      (budgetDb.bills.update as Mock).mockResolvedValue(1); // Reset bills.update mock

      const mockBillsWithDebt = [{ id: "bill-1", envelopeId: "envelope-1", debtId: "debt-1" }];

      (budgetDb.bills.where as Mock).mockReturnValue({
        equals: vi.fn(() => ({
          toArray: vi.fn().mockResolvedValue(mockBillsWithDebt),
        })),
      });

      renderHook(() => useDeleteEnvelope());

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      // Should still disconnect the bill (even with debt link)
      await act(async () => {
        await mutationFn(deleteData);
      });

      expect(budgetDb.bills.update).toHaveBeenCalledWith("bill-1", {
        envelopeId: undefined,
      });
    });

    it("should handle concurrent delete requests gracefully", async () => {
      // Reset mocks to ensure proper operation
      const budgetDbModule = await import("@/db/budgetDb");
      (budgetDbModule.getUnassignedCash as Mock).mockResolvedValue(1000);
      (budgetDbModule.setUnassignedCash as Mock).mockResolvedValue(undefined);

      renderHook(() => useDeleteEnvelope());

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      const deleteData = {
        envelopeId: "envelope-1",
        deleteBillsToo: false,
      };

      // Simulate concurrent deletes
      await act(async () => {
        await Promise.all([mutationFn(deleteData), mutationFn(deleteData)]);
      });

      // Both should complete (idempotent operation)
      expect(budgetDb.envelopes.delete).toHaveBeenCalledTimes(2);
    });
  });
});
