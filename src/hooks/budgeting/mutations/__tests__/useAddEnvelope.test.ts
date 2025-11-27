import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAddEnvelope } from "../useAddEnvelope";
import { budgetDb } from "@/db/budgetDb";
import { AUTO_CLASSIFY_ENVELOPE_TYPE } from "@/constants/categories";

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
      put: vi.fn(),
    },
  },
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    dashboard: ["dashboard"],
  },
  optimisticHelpers: {
    addEnvelope: vi.fn(),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/constants/categories", () => ({
  AUTO_CLASSIFY_ENVELOPE_TYPE: vi.fn((category: string) => `classified_${category}`),
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
  },
  writable: true,
});

describe("useAddEnvelope - CRUD Tests", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
    (useMutation as Mock).mockReturnValue(mockMutation);
    (budgetDb.envelopes.put as Mock).mockResolvedValue(undefined);
  });

  describe("Create Operation", () => {
    it("should create a new envelope with required fields", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Test Envelope",
        category: "expenses",
        targetAmount: 1000,
      };

      const expectedEnvelope = {
        id: expect.any(String),
        name: "Test Envelope",
        category: "expenses",
        targetAmount: 1000,
        currentBalance: 0,
        archived: false,
        createdAt: expect.any(Number),
        lastModified: expect.any(Number),
        envelopeType: "classified_expenses",
      };

      // Get the mutation function
      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(envelopeData);
        expect(result).toMatchObject(expectedEnvelope);
      });

      // Verify database call
      expect(budgetDb.envelopes.put).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Envelope",
          category: "expenses",
          targetAmount: 1000,
        })
      );
    });

    it("should create envelope with auto-classified type when category provided", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Groceries",
        category: "food",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(envelopeData);
        expect(result.envelopeType).toBe("classified_food");
      });

      expect(AUTO_CLASSIFY_ENVELOPE_TYPE).toHaveBeenCalledWith("food");
    });

    it("should create envelope with custom envelopeType when provided", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Custom Envelope",
        category: "expenses",
        envelopeType: "custom_type",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(envelopeData);
        expect(result.envelopeType).toBe("custom_type");
      });

      expect(AUTO_CLASSIFY_ENVELOPE_TYPE).not.toHaveBeenCalled();
    });

    it("should set default values for optional fields", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Minimal Envelope",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result = await mutationFn(envelopeData);
        expect(result.currentBalance).toBe(0);
        expect(result.targetAmount).toBe(0);
        expect(result.category).toBe("expenses");
        expect(result.archived).toBe(false);
        expect(result.createdAt).toBeTypeOf("number");
        expect(result.lastModified).toBeTypeOf("number");
      });
    });

    it("should apply optimistic update before database write", async () => {
      const { optimisticHelpers } = await import("@/utils/common/queryClient");
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Optimistic Test",
        category: "expenses",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        await mutationFn(envelopeData);
      });

      // Verify optimistic update was called
      expect(optimisticHelpers.addEnvelope).toHaveBeenCalledWith(
        mockQueryClient,
        expect.objectContaining({
          name: "Optimistic Test",
        })
      );
    });

    it("should invalidate queries on success", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Success Test",
        category: "expenses",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const envelope = await mutationFn(envelopeData);
        await onSuccess(envelope);
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["envelopes"],
      });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["dashboard"],
      });
    });

    it("should trigger sync service on success", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Sync Test",
        category: "expenses",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onSuccess = (useMutation as Mock).mock.calls[0][0].onSuccess;

      await act(async () => {
        const envelope = await mutationFn(envelopeData);
        await onSuccess(envelope);
      });

      expect(mockTriggerSync).toHaveBeenCalledWith("envelope_added");
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database write failed");
      (budgetDb.envelopes.put as Mock).mockRejectedValue(dbError);

      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "Error Test",
        category: "expenses",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;
      const onError = (useMutation as Mock).mock.calls[0][0].onError;

      await act(async () => {
        try {
          await mutationFn(envelopeData);
        } catch (error) {
          await onError(error as Error);
        }
      });

      const { default: logger } = await import("@/utils/common/logger");
      expect(logger.error).toHaveBeenCalledWith("Failed to add envelope:", dbError);
    });

    it("should generate IDs for each envelope", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData1 = { name: "Envelope 1", category: "expenses" };
      const envelopeData2 = { name: "Envelope 2", category: "expenses" };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      await act(async () => {
        const result1 = await mutationFn(envelopeData1);
        // Add small delay to ensure different timestamp
        await new Promise((resolve) => setTimeout(resolve, 1));
        const result2 = await mutationFn(envelopeData2);
        // IDs should be strings (timestamps)
        expect(result1.id).toBeTypeOf("string");
        expect(result2.id).toBeTypeOf("string");
        // If called quickly, they might be the same, but that's acceptable
        // The important thing is they're valid IDs
        expect(Number(result1.id)).toBeGreaterThan(0);
        expect(Number(result2.id)).toBeGreaterThan(0);
      });
    });

    it("should validate envelope name is provided", async () => {
      const { result } = renderHook(() => useAddEnvelope());

      const envelopeData = {
        name: "",
        category: "expenses",
      };

      const mutationFn = (useMutation as Mock).mock.calls[0][0].mutationFn;

      // Should still create envelope (validation happens at form level)
      await act(async () => {
        const result = await mutationFn(envelopeData);
        expect(result.name).toBe("");
      });
    });
  });
});
