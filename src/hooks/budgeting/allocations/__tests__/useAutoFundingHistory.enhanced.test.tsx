import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAutoFundingHistory } from "../useAutoFundingHistory";
import { budgetDb } from "@/db/budgetDb";
import type { ExecutionRecord } from "@/db/types";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    autoFundingHistory: {
      toArray: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    },
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock useUiStore with budget operations
const mockTransferFunds = vi.fn().mockResolvedValue(undefined);
vi.mock("@/stores/ui/uiStore", () => ({
  default: vi.fn((selector) =>
    selector({
      budget: {
        transferFunds: mockTransferFunds,
      },
    })
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAutoFundingHistory - Comprehensive", () => {
  const mockExecution: ExecutionRecord = {
    id: "exec1",
    trigger: "manual",
    executedAt: "2023-01-01T00:00:00.000Z",
    rulesExecuted: 1,
    totalFunded: 100,
    success: true,
    sourceEnvelopeId: "unassigned",
    results: [
      {
        ruleId: "rule1",
        success: true,
        amount: 100,
        targetEnvelopes: ["env1"],
        ruleName: "Test Rule",
        description: "Auto-funding test",
      },
    ],
    timestamp: "2023-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransferFunds.mockResolvedValue(undefined);
  });

  describe("Initialization & Queries", () => {
    it("should fetch history on mount", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.executionHistory).toHaveLength(1);
      expect(result.current.executionHistory[0].totalFunded).toBe(100);
    });

    it("should handle empty history", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.executionHistory).toHaveLength(0);
    });

    it("should respect custom limit parameter", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(budgetDb.autoFundingHistory.limit).toHaveBeenCalledWith(10);
    });

    it("should handle query errors", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockRejectedValue(new Error("DB Error"));

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe("Add to History", () => {
    it("should add execution to history", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("new-id" as never);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newRecord = {
        trigger: "manual",
        executedAt: "2023-01-02T00:00:00.000Z",
        rulesExecuted: 2,
        totalFunded: 200,
        id: "temp",
        timestamp: "2023-01-02T00:00:00.000Z",
      };

      await act(async () => {
        await result.current.addToHistory(newRecord);
      });

      expect(budgetDb.autoFundingHistory.add).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: "manual",
          totalFunded: 200,
        })
      );
    });

    it("should generate UUID for new records", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("new-id" as never);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addToHistory({
          trigger: "test",
          executedAt: new Date().toISOString(),
          id: "ignored",
          timestamp: new Date().toISOString(),
        });
      });

      expect(budgetDb.autoFundingHistory.add).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
        })
      );
    });
  });

  describe("Clear History", () => {
    it("should clear all history", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);
      vi.mocked(budgetDb.autoFundingHistory.clear).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.clearHistory();
      });

      expect(budgetDb.autoFundingHistory.clear).toHaveBeenCalled();
    });
  });

  describe("Delete Execution", () => {
    it("should delete a specific execution", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);
      vi.mocked(budgetDb.autoFundingHistory.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.deleteExecution("exec1");
      });

      expect(budgetDb.autoFundingHistory.delete).toHaveBeenCalledWith("exec1");
    });
  });

  describe("Get Execution By ID", () => {
    it("should retrieve execution by ID", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const execution = result.current.getExecutionById("exec1");
      expect(execution).toBeDefined();
      expect(execution?.id).toBe("exec1");
    });

    it("should return undefined for non-existent ID", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const execution = result.current.getExecutionById("non-existent");
      expect(execution).toBeUndefined();
    });
  });

  describe("Statistics Calculation", () => {
    it("should calculate comprehensive statistics", async () => {
      const multipleExecutions = [
        { ...mockExecution, totalFunded: 100, success: true },
        { ...mockExecution, id: "exec2", totalFunded: 50, success: true },
        { ...mockExecution, id: "exec3", success: false, totalFunded: 0 },
        { ...mockExecution, id: "exec4", totalFunded: 75, isUndo: true },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(multipleExecutions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const stats = result.current.getExecutionStatistics();

      expect(stats.totalExecutions).toBe(4);
      expect(stats.successfulExecutions).toBe(3);
      expect(stats.failedExecutions).toBe(1);
      expect(stats.totalFunded).toBe(225); // 100 + 50 + 0 + 75
      expect(stats.totalReversed).toBe(75);
      expect(stats.netFunded).toBe(150); // 225 - 75
    });

    it("should group by trigger type", async () => {
      const executions = [
        { ...mockExecution, trigger: "manual" },
        { ...mockExecution, id: "exec2", trigger: "manual" },
        { ...mockExecution, id: "exec3", trigger: "automatic" },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const stats = result.current.getExecutionStatistics();

      expect(stats.byTrigger["manual"]).toBe(2);
      expect(stats.byTrigger["automatic"]).toBe(1);
    });

    it("should calculate recent executions (last 30 days)", async () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const old = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000); // 40 days ago

      const executions = [
        { ...mockExecution, executedAt: recent.toISOString() },
        { ...mockExecution, id: "exec2", executedAt: old.toISOString() },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const stats = result.current.getExecutionStatistics();

      expect(stats.recentExecutions).toBe(1);
    });

    it("should calculate average funding per execution", async () => {
      const executions = [
        { ...mockExecution, totalFunded: 100, success: true },
        { ...mockExecution, id: "exec2", totalFunded: 200, success: true },
        { ...mockExecution, id: "exec3", totalFunded: 0, success: false },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const stats = result.current.getExecutionStatistics();

      expect(stats.averageFundingPerExecution).toBe(150); // (100 + 200) / 2
    });

    it("should handle statistics errors gracefully", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([
        { ...mockExecution, totalFunded: null } as unknown as ExecutionRecord,
      ]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const stats = result.current.getExecutionStatistics();

      expect(stats.totalFunded).toBe(0);
    });
  });

  describe("Undo Operations", () => {
    it("should get undoable executions", async () => {
      const executions = [
        { ...mockExecution },
        { ...mockExecution, id: "exec2", isUndo: true },
        { ...mockExecution, id: "exec3", success: false },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const undoable = result.current.getUndoableExecutions();

      expect(undoable).toHaveLength(1);
      expect(undoable[0].id).toBe("exec1");
    });

    it("should undo an execution", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("undo-id" as never);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.undoExecution(mockExecution);
      });

      expect(mockTransferFunds).toHaveBeenCalledWith(
        "env1",
        "unassigned",
        100,
        expect.stringContaining("Undo:")
      );

      expect(budgetDb.autoFundingHistory.add).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: "manual_undo",
          isUndo: true,
          originalExecutionId: "exec1",
        })
      );
    });

    it("should undo last execution", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("undo-id" as never);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.undoLastExecution();
      });

      expect(mockTransferFunds).toHaveBeenCalled();
    });

    it("should throw error when undoing with no budget", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      // Mock useUiStore to return no budget
      const useUiStore = await import("@/stores/ui/uiStore");
      (useUiStore.default as Mock).mockImplementation((selector) =>
        selector({ budget: undefined })
      );

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(result.current.undoExecution(mockExecution)).rejects.toThrow(
          "Budget operations not available"
        );
      });
    });

    it("should throw error when no undoable executions exist", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(result.current.undoLastExecution()).rejects.toThrow("No undoable executions");
      });
    });

    it("should handle multiple target envelopes in undo", async () => {
      const multiTargetExecution: ExecutionRecord = {
        ...mockExecution,
        results: [
          {
            ruleId: "rule1",
            success: true,
            amount: 100,
            targetEnvelopes: ["env1", "env2", "env3"],
            ruleName: "Multi-target",
          },
        ],
      };

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([multiTargetExecution]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("undo-id" as never);

      // Reset mock before test to ensure budget is available
      const useUiStore = await import("@/stores/ui/uiStore");
      (useUiStore.default as Mock).mockImplementation((selector) =>
        selector({ budget: { transferFunds: mockTransferFunds } })
      );

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.undoExecution(multiTargetExecution);
      });

      expect(mockTransferFunds).toHaveBeenCalledTimes(3);
    });

    it("should handle object-style target envelopes", async () => {
      const objectTargetExecution: ExecutionRecord = {
        ...mockExecution,
        results: [
          {
            ruleId: "rule1",
            success: true,
            amount: 100,
            targetEnvelopes: [{ id: "env1" }, { id: "env2" }],
          },
        ],
      };

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([objectTargetExecution]);
      vi.mocked(budgetDb.autoFundingHistory.add).mockResolvedValue("undo-id" as never);

      // Reset mock before test to ensure budget is available
      const useUiStore = await import("@/stores/ui/uiStore");
      (useUiStore.default as Mock).mockImplementation((selector) =>
        selector({ budget: { transferFunds: mockTransferFunds } })
      );

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.undoExecution(objectTargetExecution);
      });

      expect(mockTransferFunds).toHaveBeenCalledTimes(2);
    });
  });

  describe("Export History", () => {
    it("should export history as JSON by default", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const exported = result.current.exportHistory();

      expect(exported.format).toBe("json");
      expect(exported.content).toBeTruthy();
      expect(exported.filename).toContain(".json");
    });

    it("should export history as CSV", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const exported = result.current.exportHistory({ format: "csv" });

      expect(exported.format).toBe("csv");
      expect(exported.content).toContain("Execution ID");
      expect(exported.filename).toContain(".csv");
    });

    it("should filter by date range", async () => {
      const executions = [
        { ...mockExecution, executedAt: "2023-01-01T00:00:00.000Z" },
        { ...mockExecution, id: "exec2", executedAt: "2023-02-01T00:00:00.000Z" },
        { ...mockExecution, id: "exec3", executedAt: "2023-03-01T00:00:00.000Z" },
      ];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const exported = result.current.exportHistory({
        dateFrom: "2023-01-15",
        dateTo: "2023-02-15",
      });

      const data = JSON.parse(exported.content);
      expect(data.executionHistory).toHaveLength(1);
      expect(data.executionHistory[0].id).toBe("exec2");
    });

    it("should include export metadata", async () => {
      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue([mockExecution]);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const exported = result.current.exportHistory();
      const data = JSON.parse(exported.content);

      expect(data.exportedAt).toBeTruthy();
      expect(data.totalExecutions).toBe(1);
      expect(data.dateRange).toBeDefined();
    });
  });

  describe("getHistory Compatibility Helper", () => {
    it("should return limited history", async () => {
      const executions = Array.from({ length: 10 }, (_, i) => ({
        ...mockExecution,
        id: `exec${i}`,
      }));

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const limited = result.current.getHistory(5);
      expect(limited).toHaveLength(5);
    });

    it("should return full history without limit", async () => {
      const executions = [mockExecution, { ...mockExecution, id: "exec2" }];

      vi.mocked(budgetDb.autoFundingHistory.toArray).mockResolvedValue(executions);

      const { result } = renderHook(() => useAutoFundingHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const all = result.current.getHistory();
      expect(all).toHaveLength(2);
    });
  });
});
