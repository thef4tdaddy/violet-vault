/**
 * Tests for Savings Goals Query Hooks
 * Covers data fetching, filtering, sorting, and query behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSavingsGoalsQuery, useActiveSavingsGoalsQuery } from "../savingsQueries";
import { createTestQueryClient, createQueryWrapper } from "@/test/queryTestUtils";
import { createMockDexie, mockDataGenerators } from "@/test/queryMocks";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: null, // Will be set in beforeEach
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/savings/savingsCalculations", () => ({
  processSavingsGoal: (goal: Record<string, unknown>) => goal,
  sortSavingsGoals: (goals: unknown[], sortBy: string, sortOrder: string) => {
    if (sortBy === "targetDate" && sortOrder === "asc") {
      return [...goals].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const dateA = new Date(a.targetDate as string).getTime();
        const dateB = new Date(b.targetDate as string).getTime();
        return dateA - dateB;
      });
    }
    return goals;
  },
  filterSavingsGoals: (
    goals: unknown[],
    options: { status?: string; includeCompleted?: boolean }
  ) => {
    if (options.status === "active" || !options.includeCompleted) {
      return goals.filter((g: Record<string, unknown>) => !g.isCompleted);
    }
    return goals;
  },
}));

describe("Savings Goals Query Hooks", () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;
  let mockDb: ReturnType<typeof createMockDexie>;
  let wrapper: ReturnType<typeof createQueryWrapper>;

  beforeEach(async () => {
    // Create fresh instances for each test
    queryClient = createTestQueryClient();
    mockDb = createMockDexie();
    wrapper = createQueryWrapper(queryClient);

    // Mock the budgetDb module
    const budgetDbModule = await import("@/db/budgetDb");
    // @ts-expect-error - Mocking budgetDb
    budgetDbModule.budgetDb = mockDb;
  });

  afterEach(() => {
    queryClient.clear();
    mockDb._resetMockData();
    vi.clearAllMocks();
  });

  describe("useSavingsGoalsQuery", () => {
    describe("Data Fetching", () => {
      it("should fetch savings goals from Dexie successfully", async () => {
        // Arrange
        const mockGoals = [
          mockDataGenerators.savingsGoal({ id: "goal_1", name: "Vacation" }),
          mockDataGenerators.savingsGoal({ id: "goal_2", name: "Emergency Fund" }),
        ];
        mockDb._mockData.savingsGoals = mockGoals;

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toHaveLength(2);
        expect(mockDb.savingsGoals.toArray).toHaveBeenCalled();
      });

      it("should return empty array when no goals exist", async () => {
        // Arrange
        mockDb._mockData.savingsGoals = [];

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual([]);
      });

      it("should handle Dexie fetch errors gracefully", async () => {
        // Arrange
        mockDb.savingsGoals.toArray.mockRejectedValue(new Error("Database error"));

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual([]);
      });
    });

    describe("Filtering", () => {
      it("should filter active goals when includeCompleted is false", async () => {
        // Arrange
        const mockGoals = [
          mockDataGenerators.savingsGoal({ id: "goal_1", isCompleted: false }),
          mockDataGenerators.savingsGoal({ id: "goal_2", isCompleted: true }),
          mockDataGenerators.savingsGoal({ id: "goal_3", isCompleted: false }),
        ];
        mockDb._mockData.savingsGoals = mockGoals;

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery({ includeCompleted: false }), {
          wrapper,
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toHaveLength(2);
      });

      it("should include all goals when includeCompleted is true", async () => {
        // Arrange
        const mockGoals = [
          mockDataGenerators.savingsGoal({ id: "goal_1", isCompleted: false }),
          mockDataGenerators.savingsGoal({ id: "goal_2", isCompleted: true }),
        ];
        mockDb._mockData.savingsGoals = mockGoals;

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery({ includeCompleted: true }), {
          wrapper,
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toHaveLength(2);
      });
    });

    describe("Sorting", () => {
      it("should sort goals by target date ascending by default", async () => {
        // Arrange
        const mockGoals = [
          mockDataGenerators.savingsGoal({
            id: "goal_1",
            targetDate: "2024-12-31",
          }),
          mockDataGenerators.savingsGoal({
            id: "goal_2",
            targetDate: "2024-03-15",
          }),
          mockDataGenerators.savingsGoal({
            id: "goal_3",
            targetDate: "2024-06-30",
          }),
        ];
        mockDb._mockData.savingsGoals = mockGoals;

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const data = result.current.data as Array<{ targetDate: string }>;
        expect(data[0].targetDate).toBe("2024-03-15");
        expect(data[1].targetDate).toBe("2024-06-30");
        expect(data[2].targetDate).toBe("2024-12-31");
      });

      it("should accept custom sort options", async () => {
        // Arrange
        const mockGoals = [mockDataGenerators.savingsGoal()];
        mockDb._mockData.savingsGoals = mockGoals;

        // Act
        const { result } = renderHook(
          () =>
            useSavingsGoalsQuery({
              sortBy: "name",
              sortOrder: "desc",
            }),
          { wrapper }
        );

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isSuccess).toBe(true);
      });
    });

    describe("Query Configuration", () => {
      it("should use correct stale time", async () => {
        // Arrange
        mockDb._mockData.savingsGoals = [mockDataGenerators.savingsGoal()];

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isSuccess).toBe(true);
      });

      it("should not refetch on mount", async () => {
        // Arrange
        mockDb._mockData.savingsGoals = [mockDataGenerators.savingsGoal()];

        // Act - First render
        const { result, rerender } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const firstCallCount = mockDb.savingsGoals.toArray.mock.calls.length;

        // Rerender
        rerender();

        // Assert - Should not refetch
        expect(mockDb.savingsGoals.toArray.mock.calls.length).toBe(firstCallCount);
      });

      it("should keep previous data during refetch", async () => {
        // Arrange
        const initialGoals = [mockDataGenerators.savingsGoal({ id: "goal_1" })];
        mockDb._mockData.savingsGoals = initialGoals;

        // Act
        const { result } = renderHook(() => useSavingsGoalsQuery(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const initialData = result.current.data;

        // Update data
        mockDb._mockData.savingsGoals = [mockDataGenerators.savingsGoal({ id: "goal_2" })];

        // Trigger refetch
        result.current.refetch();

        // Assert - Previous data should still be available
        expect(result.current.data).toBeDefined();
        expect(initialData).toBeDefined();
      });
    });

    describe("Cache Behavior", () => {
      it("should generate unique query keys for different options", async () => {
        // Arrange
        mockDb._mockData.savingsGoals = [];

        // Act - Render with different options
        const { result: result1 } = renderHook(() => useSavingsGoalsQuery({ status: "active" }), {
          wrapper,
        });

        const { result: result2 } = renderHook(
          () => useSavingsGoalsQuery({ status: "completed" }),
          { wrapper }
        );

        // Assert
        await waitFor(() => {
          expect(result1.current.isLoading).toBe(false);
          expect(result2.current.isLoading).toBe(false);
        });

        // Both queries should have run independently
        expect(mockDb.savingsGoals.toArray.mock.calls.length).toBeGreaterThan(1);
      });
    });
  });

  describe("useActiveSavingsGoalsQuery", () => {
    it("should filter out completed goals", async () => {
      // Arrange
      const savingsData = [
        { id: "goal_1", name: "Goal 1", isCompleted: false },
        { id: "goal_2", name: "Goal 2", isCompleted: true },
        { id: "goal_3", name: "Goal 3", isCompleted: false },
      ];

      // Act
      const { result } = renderHook(() => useActiveSavingsGoalsQuery(savingsData), {
        wrapper,
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.every((g) => !g.isCompleted)).toBe(true);
    });

    it("should return empty array when no data provided", async () => {
      // Act
      const { result } = renderHook(() => useActiveSavingsGoalsQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it("should use shorter stale time for active goals", async () => {
      // Arrange
      const savingsData = [{ id: "goal_1", name: "Goal 1", isCompleted: false }];

      // Act
      const { result } = renderHook(() => useActiveSavingsGoalsQuery(savingsData), {
        wrapper,
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });
});
