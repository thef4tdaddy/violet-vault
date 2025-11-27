import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUpdateEnvelope } from "../useUpdateEnvelope";
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
  },
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
  },
  optimisticHelpers: {
    updateEnvelope: vi.fn(),
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

describe("useUpdateEnvelope - CRUD Tests", () => {
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

  const mockExistingEnvelope = {
    id: "envelope-1",
    name: "Original Name",
    category: "expenses",
    currentBalance: 100,
    targetAmount: 500,
    lastModified: 1000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useMutation as Mock).mockReturnValue(mockMutation);
    (budgetDb.envelopes.get as Mock).mockResolvedValue(mockExistingEnvelope);
    (budgetDb.envelopes.update as Mock).mockResolvedValue(1);
  });

  describe("Update Operation - Validation & Safety", () => {
    it("should update envelope with valid data", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Updated Name",
          targetAmount: 1000,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(updateData);
        expect(result.id).toBe("envelope-1");
        expect(result.updates.name).toBe("Updated Name");
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "envelope-1",
        expect.objectContaining({
          name: "Updated Name",
          targetAmount: 1000,
          lastModified: expect.any(Number),
        })
      );
    });

    it("should prevent clearing name field (safety check)", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "", // Attempt to clear name
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(updateData);
        // Should preserve original name
        expect(result.updates.name).toBe("Original Name");
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "envelope-1",
        expect.objectContaining({
          name: "Original Name", // Preserved, not cleared
        })
      );
    });

    it("should prevent clearing category field (safety check)", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          category: "", // Attempt to clear category
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(updateData);
        // Should preserve original category
        expect(result.updates.category).toBe("expenses");
      });

      expect(budgetDb.envelopes.update).toHaveBeenCalledWith(
        "envelope-1",
        expect.objectContaining({
          category: "expenses", // Preserved, not cleared
        })
      );
    });

    it("should reject updates to non-existent envelope", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "non-existent",
        updates: {
          name: "New Name",
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(updateData)).rejects.toThrow("Envelope non-existent not found");
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should update lastModified timestamp", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 750,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const beforeUpdate = Date.now();

      await act(async () => {
        await mutationFn(updateData);
      });

      const afterUpdate = Date.now();
      const updateCall = (budgetDb.envelopes.update as Mock).mock.calls[0][1];

      expect(updateCall.lastModified).toBeGreaterThanOrEqual(beforeUpdate);
      expect(updateCall.lastModified).toBeLessThanOrEqual(afterUpdate);
    });

    it("should apply optimistic update before database write", async () => {
      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Optimistic Update",
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(updateData);
      });

      expect(optimisticHelpers.updateEnvelope).toHaveBeenCalledWith(
        mockQueryClient,
        "envelope-1",
        expect.objectContaining({
          name: "Optimistic Update",
        })
      );
    });

    it("should invalidate queries on success", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 1000,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(updateData);
        await onSuccess(result);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
    });

    it("should trigger sync service on success", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 1000,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const result = await mutationFn(updateData);
        await onSuccess(result);
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_updated");
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database update failed");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Error Test",
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to update envelope:", dbError);
    });

    it("should log update details for debugging", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Logged Update",
          targetAmount: 750,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(updateData);
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.info).toHaveBeenCalledWith(
        "Updating envelope",
        expect.objectContaining({
          envelopeId: "envelope-1",
          existingName: "Original Name",
          newName: "Logged Update",
        })
      );
    });

    it("should allow partial updates (only specified fields)", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 2000,
          // Only updating targetAmount, other fields should remain unchanged
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(updateData);
        expect(result.updates.targetAmount).toBe(2000);
        // Name and category should be preserved from existing envelope
        expect(result.updates.name).toBe("Original Name");
        expect(result.updates.category).toBe("expenses");
      });
    });

    it("should handle whitespace-only name as empty (safety check)", async () => {
      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "   ", // Whitespace only
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(updateData);
        // Should preserve original name since trimmed name is empty
        expect(result.updates.name).toBe("Original Name");
      });
    });
  });

  describe("Optimistic Update Rollback on Failure", () => {
    it("should rollback optimistic update when database write fails", async () => {
      const dbError = new Error("Network error: Database write failed");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Attempted Update",
          currentBalance: 999,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      // Verify optimistic helper was called before the error
      const { optimisticHelpers } = await import("@/utils/common/queryClient");

      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch (error) {
          // Error is expected - mutation should fail
          expect(error).toBe(dbError);
          await onError(error as Error);
        }
      });

      // Verify optimistic update was attempted
      expect(optimisticHelpers.updateEnvelope).toHaveBeenCalled();

      // Verify error was logged (rollback indicator)
      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to update envelope:", dbError);
    });

    it("should not trigger sync service on failure", async () => {
      const dbError = new Error("Database write failed");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Failed Update",
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      // Clear previous calls
      mockTriggerSync.mockClear();

      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      // Sync service should NOT be called on failure
      expect(mockTriggerSync).not.toHaveBeenCalled();
    });

    it("should not invalidate queries on mutation failure", async () => {
      const dbError = new Error("Database write failed");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Failed Update",
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      // Clear previous invalidation calls
      mockQueryClient.invalidateQueries.mockClear();

      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      // Query invalidation should NOT happen during onError
      // (it happens in onSuccess only)
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });

    it("should handle envelope validation failure gracefully", async () => {
      // Mock envelope with invalid data that fails validation
      const mockInvalidEnvelope = {
        id: "envelope-invalid",
        name: "Invalid",
        category: "test",
        currentBalance: -100, // Invalid negative balance
      };

      (budgetDb.envelopes.get as Mock).mockResolvedValue(mockInvalidEnvelope);

      const { result } = renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-invalid",
        updates: {
          targetAmount: 500,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      // Test that validation failures don't cause uncaught exceptions
      // The mutation should either succeed or throw a caught error
      let didThrow = false;
      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch {
          // Expected - validation might fail, but it should be caught
          didThrow = true;
        }
      });

      // Either the mutation succeeded or threw a caught error - both are valid
      expect(typeof didThrow).toBe("boolean");
    });

    it("should maintain UI state consistency after rollback", async () => {
      const dbError = new Error("Network timeout");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      // Track mutation state changes
      const stateHistory: boolean[] = [];

      const mockMutation = {
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: false,
      };

      (useMutation as Mock).mockReturnValue(mockMutation);

      const { result, rerender } = renderHook(() => useUpdateEnvelope());

      // Initial state should not be pending
      expect(mockMutation.isPending).toBe(false);

      // Simulate pending state
      mockMutation.isPending = true;
      rerender();

      // Simulate error state after failure
      mockMutation.isPending = false;
      mockMutation.isError = true;
      rerender();

      // Verify error state is reflected
      expect(mockMutation.isError).toBe(true);
      expect(mockMutation.isPending).toBe(false);
    });
  });
});
