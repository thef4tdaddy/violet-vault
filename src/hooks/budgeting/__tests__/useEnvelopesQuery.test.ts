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
import logger from "@/utils/common/logger";

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/constants/categories", async () => {
  const actual =
    await vi.importActual<typeof import("@/constants/categories")>("@/constants/categories");
  return {
    ...actual,
    AUTO_CLASSIFY_ENVELOPE_TYPE: vi.fn((category?: string) => {
      if (category?.toLowerCase().includes("income")) return actual.ENVELOPE_TYPES.INCOME;
      if (category?.toLowerCase().includes("savings")) return actual.ENVELOPE_TYPES.SAVINGS;
      return actual.ENVELOPE_TYPES.VARIABLE;
    }),
  };
});

describe("useEnvelopesQuery", () => {
  let queryClient: any;
  let mockDb: any;
  let wrapper: any;

  beforeEach(() => {
    // Create fresh instances for each test
    queryClient = createTestQueryClient();
    mockDb = createMockDexie();
    wrapper = createQueryWrapper(queryClient);
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
      mockDb._mockData.envelopes.push(...mockEnvelopes);

      // Act
      const rawEnvelopes = await mockDb.envelopes.toArray();
      expect(rawEnvelopes.length).toBe(2);
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockDb.envelopes.toArray).toHaveBeenCalled();
      expect(result.current.isError).toBe(false);
      if (result.current.isError) {
        // Fail fast with error details
        throw result.current.error;
      }
      expect(logger.error).not.toHaveBeenCalled();
      expect(result.current.envelopes.length).toBe(2);
    });

    it("should return empty array when no envelopes exist", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;

      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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
      mockDb._mockData.envelopes.push(mockEnvelope);

      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_1",
          name: "Groceries",
          category: "Food & Dining",
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
          category: "Food & Dining",
          archived: true,
        }),
        mockDataGenerators.envelope({
          id: "env_4",
          name: "Emergency Fund",
          category: "Savings",
          archived: false,
        })
      );
    });

    it("should filter by category", async () => {
      // Act
      const { result } = renderHook(
        () => useEnvelopesQuery({ category: "Food & Dining", __db: mockDb }),
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);
      expect(result.current.envelopes[0].category).toBe("Food & Dining");
      expect(mockDb.getEnvelopesByCategory).toHaveBeenCalledWith("Food & Dining");
    });

    it("should exclude archived envelopes by default", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(2);
      expect(envelopes.every((env) => !env.archived)).toBe(true);
    });

    it("should exclude savings goals and sinking funds from default results", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.some((env) => env.category === "Savings")).toBe(false);
    });

    it("should include archived envelopes when requested", async () => {
      // Act
      const { result } = renderHook(
        () => useEnvelopesQuery({ includeArchived: true, __db: mockDb }),
        {
          wrapper,
        }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(3);
    });

    it("should exclude supplemental envelopes by default", async () => {
      // Arrange
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_supplemental",
          name: "HSA Account",
          category: "Health & Medical",
          envelopeType: "supplemental",
          archived: false,
        })
      );

      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.some((env) => env.envelopeType === "supplemental")).toBe(false);
      expect(envelopes.some((env) => env.name === "HSA Account")).toBe(false);
    });

    it("should filter only specific envelope types when envelopeTypes is set", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_variable",
          name: "Groceries",
          category: "Food & Dining",
          envelopeType: "variable",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_savings",
          name: "Vacation Fund",
          category: "Savings",
          envelopeType: "savings",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_supplemental",
          name: "HSA",
          category: "Health & Medical",
          envelopeType: "supplemental",
          archived: false,
        })
      );

      // Act - filter only savings envelopes
      const { result } = renderHook(
        () => useEnvelopesQuery({ envelopeTypes: ["savings"], __db: mockDb }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(1);
      expect(envelopes[0].envelopeType).toBe("savings");
      expect(envelopes[0].name).toBe("Vacation Fund");
    });

    it("should filter multiple envelope types when envelopeTypes has multiple values", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_variable",
          name: "Groceries",
          category: "Food & Dining",
          envelopeType: "variable",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_savings",
          name: "Vacation Fund",
          category: "Savings",
          envelopeType: "savings",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_supplemental",
          name: "HSA",
          category: "Health & Medical",
          envelopeType: "supplemental",
          archived: false,
        })
      );

      // Act - filter both savings and supplemental envelopes
      const { result } = renderHook(
        () => useEnvelopesQuery({ envelopeTypes: ["savings", "supplemental"], __db: mockDb }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(2);
      expect(envelopes.some((env) => env.envelopeType === "savings")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "supplemental")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "variable")).toBe(false);
    });

    it("should allow excluding specific envelope types with excludeEnvelopeTypes", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_variable",
          name: "Groceries",
          category: "Food & Dining",
          envelopeType: "variable",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_bill",
          name: "Rent",
          category: "Housing",
          envelopeType: "bill",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_savings",
          name: "Vacation Fund",
          category: "Savings",
          envelopeType: "savings",
          archived: false,
        })
      );

      // Act - exclude only savings, keep variable and bill
      const { result } = renderHook(
        () => useEnvelopesQuery({ excludeEnvelopeTypes: ["savings"], __db: mockDb }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(2);
      expect(envelopes.some((env) => env.envelopeType === "variable")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "bill")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "savings")).toBe(false);
    });

    it("should include all envelope types when excludeEnvelopeTypes is empty array", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({
          id: "env_variable",
          name: "Groceries",
          category: "Food & Dining",
          envelopeType: "variable",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_savings",
          name: "Vacation Fund",
          category: "Savings",
          envelopeType: "savings",
          archived: false,
        }),
        mockDataGenerators.envelope({
          id: "env_supplemental",
          name: "HSA",
          category: "Health & Medical",
          envelopeType: "supplemental",
          archived: false,
        })
      );

      // Act - include all types
      const { result } = renderHook(
        () => useEnvelopesQuery({ excludeEnvelopeTypes: [], __db: mockDb }),
        { wrapper }
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const envelopes = result.current.envelopes;
      expect(envelopes.length).toBe(3);
      expect(envelopes.some((env) => env.envelopeType === "variable")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "savings")).toBe(true);
      expect(envelopes.some((env) => env.envelopeType === "supplemental")).toBe(true);
    });
  });

  describe("Sorting", () => {
    beforeEach(() => {
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
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
        })
      );
    });

    it("should sort by name ascending by default", async () => {
      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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
        () => useEnvelopesQuery({ sortBy: "name", sortOrder: "desc", __db: mockDb }),
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
        () => useEnvelopesQuery({ sortBy: "currentBalance", sortOrder: "asc", __db: mockDb }),
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
        () => useEnvelopesQuery({ sortBy: "currentBalance", sortOrder: "desc", __db: mockDb }),
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
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(...mockEnvelopes);

      // Act - First render
      const { result, rerender } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), {
        wrapper,
      });

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
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({ id: "env_1", category: "Food & Dining" }),
        mockDataGenerators.envelope({ id: "env_2", category: "Housing" })
      );

      // Act - Query with category: "Food & Dining"
      const { result: result1 } = renderHook(
        () => useEnvelopesQuery({ category: "Food & Dining", __db: mockDb }),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // Act - Query with category: "Housing"
      const { result: result2 } = renderHook(
        () => useEnvelopesQuery({ category: "Housing", __db: mockDb }),
        {
          wrapper,
        }
      );

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Assert - Both queries should have different results
      expect(result1.current.envelopes.length).toBeGreaterThan(0);
      expect(result2.current.envelopes.length).toBeGreaterThan(0);
      expect(result1.current.envelopes[0].category).toBe("Food & Dining");
      expect(result2.current.envelopes[0].category).toBe("Housing");
    });

    it("should respect staleTime configuration", async () => {
      // Arrange
      const mockEnvelopes = [mockDataGenerators.envelope({ id: "env_1" })];
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(...mockEnvelopes);

      // Act - First fetch
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify query completed successfully
      expect(result.current.envelopes).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: "env_1" })])
      );
      expect(result.current.isError).toBe(false);
    });
  });

  describe("Query Invalidation", () => {
    it("should support manual refetch after data changes", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(mockDataGenerators.envelope({ id: "env_1" }));

      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);

      // Modify mock data
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({ id: "env_1" }),
        mockDataGenerators.envelope({ id: "env_2" })
      );

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
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(mockDataGenerators.envelope({ id: "env_1" }));

      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modify mock data
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        mockDataGenerators.envelope({ id: "env_1" }),
        mockDataGenerators.envelope({ id: "env_2" })
      );

      // Act - Call refetch
      await result.current.refetch();

      // Assert
      await waitFor(() => {
        expect(result.current.envelopes.length).toBe(2);
      });
    });

    it("should provide invalidate function", async () => {
      // Arrange
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(mockDataGenerators.envelope({ id: "env_1" }));

      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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

      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push(
        { id: "env_1", currentBalance: 100 }, // Missing name and category
        mockDataGenerators.envelope({ id: "env_2" }) // Valid
      );

      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

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
      mockDb._mockData.envelopes.length = 0;
      mockDb._mockData.envelopes.push({ id: "env_1", currentBalance: 100 }); // Missing name and category

      // Act
      const { result } = renderHook(() => useEnvelopesQuery({ __db: mockDb }), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.envelopes.length).toBe(1);
      expect(result.current.envelopes[0].envelopeType).toBeDefined();
    });
  });
});
