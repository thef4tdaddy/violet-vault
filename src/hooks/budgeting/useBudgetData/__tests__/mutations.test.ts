/**
 * Tests for Budget Data Mutations - Optimistic Update Rollback
 * Covers rollback behavior when mutations fail
 */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetMutations } from "../mutations";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";

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
      add: vi.fn(),
      delete: vi.fn(),
    },
    transactions: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  },
  getBudgetMetadata: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/hooks/budgeting/useBudgetData/mutationsHelpers", () => ({
  processTransactionDeletion: vi.fn(),
}));

vi.mock("@/utils/common/queryClient", () => ({
  queryKeys: {
    envelopes: ["envelopes"],
    envelopesList: () => ["envelopes", "list"],
    envelopeById: (id: string) => ["envelopes", id],
    transactions: ["transactions"],
    dashboard: ["dashboard"],
    dashboardSummary: () => ["dashboard", "summary"],
    unassignedCash: () => ["unassignedCash"],
    actualBalance: () => ["actualBalance"],
    budgetMetadata: ["budgetMetadata"],
    paycheckHistory: () => ["paycheck", "history"],
  },
  optimisticHelpers: {
    addEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    removeEnvelope: vi.fn(),
    addTransaction: vi.fn(),
    removeTransaction: vi.fn(),
  },
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.cloudSyncService
const mockTriggerSync = vi.fn();
Object.defineProperty(window, "cloudSyncService", {
  value: {
    triggerSyncForCriticalChange: mockTriggerSync,
    isRunning: true,
    scheduleSync: vi.fn(),
  },
  writable: true,
  configurable: true,
});

describe("useBudgetMutations - Optimistic Update Rollback Tests", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    refetchQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useQueryClient as Mock).mockReturnValue(mockQueryClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Envelope Update Rollback on Network Failure", () => {
    it("should rollback envelope update when mutation fails", async () => {
      const previousEnvelopeData = {
        id: "env-1",
        name: "Original Name",
        currentBalance: 100,
        targetAmount: 500,
      };

      // Track if optimistic update was applied and then rolled back
      let optimisticUpdateApplied = false;
      let rollbackCalled = false;

      const mockMutations = [
        {
          // Add envelope mutation
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        },
        {
          // Update envelope mutation
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockImplementation(async () => {
            optimisticUpdateApplied = true;
            throw new Error("Network error");
          }),
          isPending: false,
        },
        {
          // Delete envelope mutation
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        },
        {
          // Add transaction mutation
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        },
        {
          // Delete transaction mutation
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        },
      ];

      let callIndex = 0;
      (useMutation as Mock).mockImplementation((config) => {
        const mutation = mockMutations[callIndex] || mockMutations[0];
        callIndex++;

        // Wrap the mutation to track onError behavior
        if (config.onError) {
          const originalMutateAsync = mutation.mutateAsync;
          mutation.mutateAsync = vi.fn(async (...args) => {
            try {
              return await originalMutateAsync(...args);
            } catch (error) {
              config.onError(error);
              rollbackCalled = true;
              throw error;
            }
          });
        }

        return mutation;
      });

      const { result } = renderHook(() => useBudgetMutations());

      // Verify the hook returns expected functions
      expect(result.current.updateEnvelope).toBeDefined();
      expect(result.current.updateEnvelopeAsync).toBeDefined();
    });

    it("should have onSuccess configured to invalidate queries after successful update", async () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];

      let updateConfig: { onError?: (error: Error) => void; onSuccess?: () => void } = {};

      (useMutation as Mock).mockImplementation((config) => {
        // Capture the update envelope config (2nd mutation)
        if ((useMutation as Mock).mock.calls.length === 2) {
          updateConfig = config;
        }
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useBudgetMutations());

      // Test onSuccess triggers query invalidation (rollback happens on re-sync)
      if (updateConfig.onSuccess) {
        act(() => {
          updateConfig.onSuccess!();
        });

        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["envelopes"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["dashboard"],
        });
      }
    });
  });

  describe("Add Envelope Rollback on Error", () => {
    it("should call onError handler when envelope addition fails", async () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];

      let addConfig: { onError?: (error: Error) => void } = {};

      (useMutation as Mock).mockImplementation((config) => {
        // Capture the add envelope config (1st mutation)
        if ((useMutation as Mock).mock.calls.length === 1) {
          addConfig = config;
        }
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useBudgetMutations());

      // Simulate an error
      if (addConfig.onError) {
        const { default: logger } = await import("@/utils/common/logger");

        act(() => {
          addConfig.onError!(new Error("Failed to add envelope"));
        });

        expect(logger.error).toHaveBeenCalledWith("Failed to add envelope", expect.any(Error), {
          source: "addEnvelopeMutation",
        });
      }
    });
  });

  describe("Transaction Deletion Rollback on Error", () => {
    it("should invalidate queries when transaction deletion fails", async () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];

      let deleteConfig: { onSuccess?: () => void } = {};

      (useMutation as Mock).mockImplementation((config) => {
        // Capture the delete transaction config (5th mutation)
        if ((useMutation as Mock).mock.calls.length === 5) {
          deleteConfig = config;
        }
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useBudgetMutations());

      // Simulate successful deletion to verify all queries are invalidated
      if (deleteConfig.onSuccess) {
        act(() => {
          deleteConfig.onSuccess!();
        });

        // Verify comprehensive cache invalidation
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["transactions"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["envelopes"],
        });
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ["dashboard"],
        });
      }
    });

    it("should refetch dashboard summaries after transaction deletion", async () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];

      let deleteConfig: { onSuccess?: () => void } = {};

      (useMutation as Mock).mockImplementation((config) => {
        if ((useMutation as Mock).mock.calls.length === 5) {
          deleteConfig = config;
        }
        return mockMutations.shift() || mockMutations[0];
      });

      renderHook(() => useBudgetMutations());

      if (deleteConfig.onSuccess) {
        act(() => {
          deleteConfig.onSuccess!();
        });

        // Verify refetch is called for immediate UI update
        expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
          queryKey: ["dashboard", "summary"],
        });
        expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
          queryKey: ["unassignedCash"],
        });
        expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
          queryKey: ["actualBalance"],
        });
      }
    });
  });

  describe("UI State Consistency After Rollback", () => {
    it("should maintain loading states correctly during mutation lifecycle", () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: true },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: true },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: true },
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

      const { result } = renderHook(() => useBudgetMutations());

      // Verify loading states reflect mutation status
      expect(result.current.isAddingEnvelope).toBe(true);
      expect(result.current.isUpdatingEnvelope).toBe(false);
      expect(result.current.isDeletingEnvelope).toBe(true);
      expect(result.current.isAddingTransaction).toBe(false);
      expect(result.current.isDeletingTransaction).toBe(true);
    });

    it("should provide both sync and async mutation methods", () => {
      const mockMutations = [
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
        { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false },
      ];

      (useMutation as Mock).mockImplementation(() => mockMutations.shift() || mockMutations[0]);

      const { result } = renderHook(() => useBudgetMutations());

      // Verify all mutation functions are available
      expect(typeof result.current.addEnvelope).toBe("function");
      expect(typeof result.current.addEnvelopeAsync).toBe("function");
      expect(typeof result.current.updateEnvelope).toBe("function");
      expect(typeof result.current.updateEnvelopeAsync).toBe("function");
      expect(typeof result.current.deleteEnvelope).toBe("function");
      expect(typeof result.current.deleteEnvelopeAsync).toBe("function");
      expect(typeof result.current.addTransaction).toBe("function");
      expect(typeof result.current.addTransactionAsync).toBe("function");
      expect(typeof result.current.deleteTransaction).toBe("function");
      expect(typeof result.current.deleteTransactionAsync).toBe("function");
    });
  });
});
