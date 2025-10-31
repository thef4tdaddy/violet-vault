/**
 * Tests for Budget Data Query Hooks
 * Covers multi-query data fetching, loading states, and error handling
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBudgetQueries } from "../queries";
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

describe("useBudgetQueries", () => {
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

  describe("Data Fetching", () => {
    it("should fetch all budget data successfully", async () => {
      // Arrange
      const mockEnvelopes = [
        mockDataGenerators.envelope({ id: "env_1", name: "Groceries" }),
        mockDataGenerators.envelope({ id: "env_2", name: "Rent" }),
      ];
      const mockTransactions = [
        mockDataGenerators.transaction({ id: "trans_1", description: "Store purchase" }),
      ];
      const mockBills = [mockDataGenerators.bill({ id: "bill_1", name: "Electric" })];
      const mockSavingsGoals = [mockDataGenerators.savingsGoal({ id: "save_1", name: "Vacation" })];

      mockDb._mockData.envelopes = mockEnvelopes;
      mockDb._mockData.transactions = mockTransactions;
      mockDb._mockData.bills = mockBills;
      mockDb._mockData.savingsGoals = mockSavingsGoals;

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes).toEqual(mockEnvelopes);
      expect(result.current.transactions).toEqual(mockTransactions);
      expect(result.current.bills).toEqual(mockBills);
      expect(result.current.savingsGoals).toEqual(mockSavingsGoals);
    });

    it("should return empty arrays when no data exists", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb._mockData.transactions = [];
      mockDb._mockData.bills = [];
      mockDb._mockData.savingsGoals = [];

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes).toEqual([]);
      expect(result.current.transactions).toEqual([]);
      expect(result.current.bills).toEqual([]);
      expect(result.current.savingsGoals).toEqual([]);
    });
  });

  describe("Loading States", () => {
    it("should show loading state while fetching data", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert - Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should compute loading state from all queries", async () => {
      // Arrange
      mockDb.envelopes.toArray.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );
      mockDb.transactions.orderBy.mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      });
      mockDb.bills.toArray.mockResolvedValue([]);
      mockDb.savingsGoals.toArray.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert - Should be loading initially
      expect(result.current.isLoading).toBe(true);

      // Wait for all queries to complete
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle envelope fetch errors gracefully", async () => {
      // Arrange
      mockDb.envelopes.toArray.mockRejectedValue(new Error("Database error"));
      mockDb.transactions.orderBy.mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      });
      mockDb.bills.toArray.mockResolvedValue([]);
      mockDb.savingsGoals.toArray.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.envelopesQuery.error).toBeTruthy();
    });

    it("should handle transaction fetch errors gracefully", async () => {
      // Arrange
      mockDb.envelopes.toArray.mockResolvedValue([]);
      mockDb.transactions.orderBy.mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockRejectedValue(new Error("Transaction error")),
        }),
      });
      mockDb.bills.toArray.mockResolvedValue([]);
      mockDb.savingsGoals.toArray.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.transactionsQuery.error).toBeTruthy();
    });

    it("should compute error state from failed queries", async () => {
      // Arrange
      const testError = new Error("Test error");
      mockDb.bills.toArray.mockRejectedValue(testError);
      mockDb.envelopes.toArray.mockResolvedValue([]);
      mockDb.transactions.orderBy.mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      });
      mockDb.savingsGoals.toArray.mockResolvedValue([]);

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(testError);
    });
  });

  describe("Query Objects", () => {
    it("should expose individual query objects", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb._mockData.transactions = [];
      mockDb._mockData.bills = [];
      mockDb._mockData.savingsGoals = [];

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopesQuery).toBeDefined();
      expect(result.current.transactionsQuery).toBeDefined();
      expect(result.current.billsQuery).toBeDefined();
      expect(result.current.savingsGoalsQuery).toBeDefined();
      expect(result.current.paycheckHistoryQuery).toBeDefined();
      expect(result.current.dashboardQuery).toBeDefined();
    });

    it("should provide query status for each query", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];
      mockDb._mockData.transactions = [];
      mockDb._mockData.bills = [];
      mockDb._mockData.savingsGoals = [];

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopesQuery.isSuccess).toBe(true);
      expect(result.current.transactionsQuery.isSuccess).toBe(true);
      expect(result.current.billsQuery.isSuccess).toBe(true);
      expect(result.current.savingsGoalsQuery.isSuccess).toBe(true);
    });
  });

  describe("Caching Behavior", () => {
    it("should use stale time for envelopes query", async () => {
      // Arrange
      const mockEnvelopes = [mockDataGenerators.envelope()];
      mockDb._mockData.envelopes = mockEnvelopes;

      // Act - First render
      const { result, rerender } = renderHook(() => useBudgetQueries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstCallCount = mockDb.envelopes.toArray.mock.calls.length;

      // Rerender within stale time
      rerender();

      // Assert - Should not refetch due to stale time
      expect(mockDb.envelopes.toArray.mock.calls.length).toBe(firstCallCount);
    });
  });

  describe("Data Convenience Properties", () => {
    it("should provide direct access to data arrays", async () => {
      // Arrange
      const mockEnvelopes = [mockDataGenerators.envelope()];
      mockDb._mockData.envelopes = mockEnvelopes;
      mockDb._mockData.transactions = [];
      mockDb._mockData.bills = [];
      mockDb._mockData.savingsGoals = [];

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should provide direct array access
      expect(Array.isArray(result.current.envelopes)).toBe(true);
      expect(result.current.envelopes).toEqual(mockEnvelopes);
    });

    it("should provide empty arrays as defaults when data is undefined", async () => {
      // Arrange - Let queries return undefined initially
      mockDb.envelopes.toArray.mockResolvedValue(undefined as never);
      mockDb.transactions.orderBy.mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(undefined),
        }),
      });
      mockDb.bills.toArray.mockResolvedValue(undefined as never);
      mockDb.savingsGoals.toArray.mockResolvedValue(undefined as never);

      // Act
      const { result } = renderHook(() => useBudgetQueries(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes).toEqual([]);
      expect(result.current.transactions).toEqual([]);
      expect(result.current.bills).toEqual([]);
      expect(result.current.savingsGoals).toEqual([]);
    });
  });
});
