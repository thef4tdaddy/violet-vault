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

  describe("Validation Error Handling", () => {
    it("should reject update with name exceeding max length (Zod schema validation)", async () => {
      renderHook(() => useUpdateEnvelope());

      const longName = "a".repeat(101); // Max is 100 characters
      const updateData = {
        id: "envelope-1",
        updates: {
          name: longName,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(updateData)).rejects.toThrow("Invalid envelope update data");
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should reject update with negative currentBalance (Zod schema validation)", async () => {
      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          currentBalance: -100,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(updateData)).rejects.toThrow("Invalid envelope update data");
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should reject update with negative targetAmount (Zod schema validation)", async () => {
      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: -500,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(updateData)).rejects.toThrow("Invalid envelope update data");
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should reject update with description exceeding max length", async () => {
      renderHook(() => useUpdateEnvelope());

      const longDescription = "a".repeat(501); // Max is 500 characters
      const updateData = {
        id: "envelope-1",
        updates: {
          description: longDescription,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await expect(mutationFn(updateData)).rejects.toThrow("Invalid envelope update data");
      });

      expect(budgetDb.envelopes.update).not.toHaveBeenCalled();
    });

    it("should log validation errors for debugging", async () => {
      const { default: logger } = await import("@/utils/common/logger");
      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          currentBalance: -100, // Invalid negative balance
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        try {
          await mutationFn(updateData);
        } catch {
          // Expected to throw
        }
      });

      expect(logger.error).toHaveBeenCalledWith(
        "Envelope update validation failed",
        expect.objectContaining({
          envelopeId: "envelope-1",
          errors: expect.any(Array),
        })
      );
    });

    it("should rollback optimistic update on database constraint violation", async () => {
      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const dbError = new Error("Database constraint violation");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          name: "Updated Name",
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

      // Optimistic update was applied before error
      expect(optimisticHelpers.updateEnvelope).toHaveBeenCalled();
      // Error is logged
      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to update envelope:", dbError);
    });

    it("should handle concurrent modification with lastModified timestamp", async () => {
      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 2000,
        },
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const beforeUpdate = Date.now();

      await act(async () => {
        await mutationFn(updateData);
      });

      const afterUpdate = Date.now();
      const updateCall = (budgetDb.envelopes.update as Mock).mock.calls[0][1];

      // lastModified should be updated to current timestamp
      expect(updateCall.lastModified).toBeGreaterThanOrEqual(beforeUpdate);
      expect(updateCall.lastModified).toBeLessThanOrEqual(afterUpdate);
    });

    it("should validate envelope exists before applying update", async () => {
      (budgetDb.envelopes.get as Mock).mockResolvedValue(undefined);

      renderHook(() => useUpdateEnvelope());

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

    it("should handle database update failure and trigger onError", async () => {
      const dbError = new Error("Database connection lost");
      (budgetDb.envelopes.update as Mock).mockRejectedValue(dbError);

      renderHook(() => useUpdateEnvelope());

      const updateData = {
        id: "envelope-1",
        updates: {
          targetAmount: 1500,
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
  });
});
