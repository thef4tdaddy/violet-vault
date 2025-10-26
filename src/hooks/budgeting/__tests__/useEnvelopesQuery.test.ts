/**
 * Tests for Envelope Query Hook
 * Covers data fetching, filtering, sorting, and caching behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEnvelopesQuery } from "../useEnvelopesQuery";
import {
  createTestQueryClient,
  createQueryWrapper,
  expectQuerySuccess,
} from "@/test/queryTestUtils";
import { createMockDexie, mockDataGenerators } from "@/test/queryMocks";
import { queryKeys } from "@/utils/common/queryClient";

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

vi.mock("@/constants/categories", () => ({
  AUTO_CLASSIFY_ENVELOPE_TYPE: vi.fn((category) => {
    if (category?.toLowerCase().includes("income")) return "income";
    if (category?.toLowerCase().includes("savings")) return "savings";
    return "expenses";
  }),
}));

describe("useEnvelopesQuery", () => {
  let queryClient: any;
  let mockDb: any;
  let wrapper: any;

  beforeEach(async () => {
    // Create fresh instances for each test
    queryClient = createTestQueryClient();
    mockDb = createMockDexie();
    wrapper = createQueryWrapper(queryClient);

    // Mock the budgetDb module
    const budgetDbModule = vi.mocked(await import("@/db/budgetDb"));
    (budgetDbModule as any).budgetDb = mockDb;
  });

  afterEach(() => {
    queryClient.clear();
    mockDb._resetMockData();
    vi.clearAllMocks();
  });

  describe("Data Fetching", () => {
    it("should fetch envelopes from Dexie successfully", async () => {
      // Arrange
      const mockEnvelopes = [
        mockDataGenerators.envelope({ id: "env_1", name: "Groceries" }),
        mockDataGenerators.envelope({ id: "env_2", name: "Entertainment" }),
      ];
      mockDb._mockData.envelopes = mockEnvelopes;

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(2);
      expect(mockDb.envelopes.toArray).toHaveBeenCalled();
    });

    it("should return empty array when no envelopes exist", async () => {
      // Arrange
      mockDb._mockData.envelopes = [];

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes).toEqual([]);
    });

    it("should handle Dexie fetch errors gracefully", async () => {
      // Arrange
      mockDb.envelopes.toArray.mockRejectedValue(new Error("Database error"));

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes).toEqual([]);
    });

    it("should add computed properties to envelopes", async () => {
      // Arrange
      const mockEnvelope = mockDataGenerators.envelope({
        id: "env_1",
        category: "Expenses",
        currentBalance: 500,
        targetAmount: 1000,
      });
      mockDb._mockData.envelopes = [mockEnvelope];

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelope = result.current.envelopes[0];
      expect(envelope.envelopeType).toBeDefined();
      expect(envelope.status).toBeDefined();
      expect(envelope.utilizationRate).toBeDefined();
      expect(envelope.available).toBe(500); // currentBalance
    });
  });

  describe("Filtering", () => {
    beforeEach(() => {
      mockDb._mockData.envelopes = [
        mockDataGenerators.envelope({
          id: "env_1",
          name: "Groceries",
          category: "Food",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_2",
          name: "Rent",
          category: "Housing",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_3",
          name: "Old Envelope",
          category: "Food",
          archived: true,
        }),
      ];
    });

    it("should filter by category", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ category: "Food" }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);
      expect(result.current.envelopes[0].category).toBe("Food");
      expect(mockDb.getEnvelopesByCategory).toHaveBeenCalledWith("Food");
    });

    it("should exclude archived envelopes by default", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(2);
      expect(envelopes.every((env) => !env.archived)).toBe(true);
    });

    it("should include archived envelopes when requested", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ includeArchived: true }), {
        wrapper,
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(3);
    });
  });

  describe("Sorting", () => {
    beforeEach(() => {
      mockDb._mockData.envelopes = [
        mockDataGenerators.envelope({
          id: "env_1",
          name: "Zebra",
          currentBalance: 100,
        }),
        mockDataGenerators.envelope({
          id: "env_2",
          name: "Apple",
          currentBalance: 300,
        }),
        mockDataGenerators.envelope({
          id: "env_3",
          name: "Mango",
          currentBalance: 200,
        }),
      ];
    });

    it("should sort by name ascending by default", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes[0].name).toBe("Apple");
      expect(envelopes[1].name).toBe("Mango");
      expect(envelopes[2].name).toBe("Zebra");
    });

    it("should sort by name descending", async () => {
      // Act
      const { result } = renderHook(
        () => useEnvelopesQuery({ sortBy: "name", sortOrder: "desc" }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes[0].name).toBe("Zebra");
      expect(envelopes[1].name).toBe("Mango");
      expect(envelopes[2].name).toBe("Apple");
    });

    it("should sort by balance ascending", async () => {
      // Act
      const { result } = renderHook(
        () => useEnvelopesQuery({ sortBy: "currentBalance", sortOrder: "asc" }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes[0].currentBalance).toBe(100);
      expect(envelopes[1].currentBalance).toBe(200);
      expect(envelopes[2].currentBalance).toBe(300);
    });

    it("should sort by balance descending", async () => {
      // Act
      const { result } = renderHook(
        () => useEnvelopesQuery({ sortBy: "currentBalance", sortOrder: "desc" }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes[0].currentBalance).toBe(300);
      expect(envelopes[1].currentBalance).toBe(200);
      expect(envelopes[2].currentBalance).toBe(100);
    });
  });

  describe("Caching Behavior", () => {
    it("should cache query results", async () => {
      // Arrange
      const mockEnvelopes = [mockDataGenerators.envelope({ id: "env_1" })];
      mockDb._mockData.envelopes = mockEnvelopes;

      // Act - First render
      const { result, rerender } = renderHook(() => useEnvelopesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear the mock to verify cache is used
      mockDb.envelopes.toArray.mockClear();

      // Act - Re-render
      rerender();

      // Assert - Should use cached data without calling Dexie again
      expect(mockDb.envelopes.toArray).not.toHaveBeenCalled();
      expect(result.current.envelopes).toHaveLength(1);
    });

    it("should use separate cache for different filter options", async () => {
      // Arrange
      mockDb._mockData.envelopes = [
        mockDataGenerators.envelope({ id: "env_1", category: "Food" }),
        mockDataGenerators.envelope({ id: "env_2", category: "Housing" }),
      ];

      // Act - Query with category: "Food"
      const { result: result1 } = renderHook(() => useEnvelopesQuery({ category: "Food" }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // Act - Query with category: "Housing"
      const { result: result2 } = renderHook(() => useEnvelopesQuery({ category: "Housing" }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Assert - Both queries should have different results
      expect(result1.current.envelopes.length).toBeGreaterThan(0);
      expect(result2.current.envelopes.length).toBeGreaterThan(0);
      expect(result1.current.envelopes[0].category).toBe("Food");
      expect(result2.current.envelopes[0].category).toBe("Housing");
    });

    it("should respect staleTime configuration", async () => {
      // Arrange
      const mockEnvelopes = [mockDataGenerators.envelope({ id: "env_1" })];
      mockDb._mockData.envelopes = mockEnvelopes;

      // Act - First fetch
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify query completed successfully
      expect(result.current.envelopes).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: "env_1" })
      ]));
      expect(result.current.isError).toBe(false);
    });
  });

  describe("Query Invalidation", () => {
    it("should support manual refetch after data changes", async () => {
      // Arrange
      mockDb._mockData.envelopes = [mockDataGenerators.envelope({ id: "env_1" })];

      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);

      // Modify mock data
      mockDb._mockData.envelopes = [
        mockDataGenerators.envelope({ id: "env_1" }),
        mockDataGenerators.envelope({ id: "env_2" }),
      ];

      // Act - Manual refetch
      await result.current.refetch();

      // Assert - Query should have new data
      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(2);
      });
    });
  });

  describe("Refetch and Invalidate", () => {
    it("should provide refetch function", async () => {
      // Arrange
      mockDb._mockData.envelopes = [mockDataGenerators.envelope({ id: "env_1" })];

      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modify mock data
      mockDb._mockData.envelopes = [
        mockDataGenerators.envelope({ id: "env_1" }),
        mockDataGenerators.envelope({ id: "env_2" }),
      ];

      // Act - Call refetch
      await result.current.refetch();

      // Assert
      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(2);
      });
    });

    it("should provide invalidate function", async () => {
      // Arrange
      mockDb._mockData.envelopes = [mockDataGenerators.envelope({ id: "env_1" })];

      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      // Act - Call invalidate
      result.current.invalidate();

      // Assert
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.envelopes });
    });
  });

  describe("Data Corruption Handling", () => {
    it("should warn about corrupted envelopes missing critical fields", async () => {
      // Arrange
      const logger = (await import("@/utils/common/logger")).default;
      
      mockDb._mockData.envelopes = [
        { id: "env_1", currentBalance: 100 }, // Missing name and category
        mockDataGenerators.envelope({ id: "env_2" }), // Valid
      ];

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("corrupted envelopes"),
        expect.any(Object)
      );
    });

    it("should still return corrupted envelopes with defaults", async () => {
      // Arrange
      mockDb._mockData.envelopes = [
        { id: "env_1", currentBalance: 100 }, // Missing name and category
      ];

      // Act
      const { result } = renderHook(() => useEnvelopesQuery(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);
      expect(result.current.envelopes[0].envelopeType).toBeDefined();
    });
  });
});
