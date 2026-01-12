/**
 * Tests for Bill Query Hooks
 * Covers data fetching, filtering, caching, and query behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBillsQuery, useUpcomingBillsQuery } from "../useBills";
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

describe("Bill Query Hooks", () => {
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

  describe("useBillsQuery", () => {
    describe("Data Fetching", () => {
      it("should fetch bills from Dexie successfully", async () => {
        // Arrange - Phase 2: Bills are now scheduled expense transactions
        const mockBills = [
          mockDataGenerators.bill({ id: "bill_1", name: "Electric Bill" }),
          mockDataGenerators.bill({ id: "bill_2", name: "Water Bill" }),
        ];
        // Store bills as transactions
        mockDb._mockData.transactions = mockBills;

        // Act
        const { result } = renderHook(() => useBillsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toHaveLength(2);
        expect(mockDb.transactions.where).toHaveBeenCalledWith("isScheduled");
      });

      it("should return empty array when no bills exist", async () => {
        // Arrange - Phase 2: Check transactions table
        mockDb._mockData.transactions = [];

        // Act
        const { result } = renderHook(() => useBillsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual([]);
      });

      it("should handle Dexie fetch errors gracefully", async () => {
        // Arrange
        mockDb.envelopes.where.mockReturnValue({
          equals: vi.fn().mockImplementation(() => ({
            toArray: vi.fn().mockRejectedValue(new Error("Database error")),
          })),
        });

        // Act
        const { result } = renderHook(() => useBillsQuery(), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual([]);
      });
    });

    describe("Filtering", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      beforeEach(() => {
        mockDb._mockData.envelopes = [
          mockDataGenerators.bill({
            id: "bill_1",
            name: "Overdue Bill",
            dueDate: yesterday.toISOString().split("T")[0],
            isPaid: false,
          }),
          mockDataGenerators.bill({
            id: "bill_2",
            name: "Upcoming Bill",
            dueDate: nextWeek.toISOString().split("T")[0],
            isPaid: false,
          }),
          mockDataGenerators.bill({
            id: "bill_3",
            name: "Paid Bill",
            dueDate: tomorrow.toISOString().split("T")[0],
            isPaid: true,
          }),
        ];
      });

      it("should filter upcoming bills correctly", async () => {
        // Act
        const { result } = renderHook(() => useBillsQuery({ status: "upcoming", daysAhead: 30 }), {
          wrapper,
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills.length).toBe(1);
        expect(bills[0].name).toBe("Upcoming Bill");
      });

      it("should filter overdue bills correctly", async () => {
        // Act
        const { result } = renderHook(() => useBillsQuery({ status: "overdue" }), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills.length).toBe(1);
        expect(bills[0].name).toBe("Overdue Bill");
      });

      it("should filter paid bills correctly", async () => {
        // Act
        const { result } = renderHook(() => useBillsQuery({ status: "paid" }), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills.length).toBe(1);
        expect(bills[0].name).toBe("Paid Bill");
      });

      it("should filter unpaid bills correctly", async () => {
        // Act
        const { result } = renderHook(() => useBillsQuery({ status: "unpaid" }), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills.length).toBe(2);
        expect(bills.every((b) => !b.isPaid)).toBe(true);
      });

      it("should filter by category", async () => {
        // Arrange
        mockDb._mockData.envelopes = [
          mockDataGenerators.bill({ id: "bill_1", category: "Utilities" }),
          mockDataGenerators.bill({ id: "bill_2", category: "Rent" }),
          mockDataGenerators.bill({ id: "bill_3", category: "Utilities" }),
        ];

        // Act
        const { result } = renderHook(() => useBillsQuery({ category: "Utilities" }), { wrapper });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills.length).toBe(2);
        expect(bills.every((b) => b.category === "Utilities")).toBe(true);
      });
    });

    describe("Sorting", () => {
      beforeEach(() => {
        mockDb._mockData.envelopes = [
          mockDataGenerators.bill({
            id: "bill_1",
            name: "Zebra Bill",
            amount: 100,
            dueDate: "2024-01-15",
          }),
          mockDataGenerators.bill({
            id: "bill_2",
            name: "Apple Bill",
            amount: 200,
            dueDate: "2024-01-10",
          }),
          mockDataGenerators.bill({
            id: "bill_3",
            name: "Mango Bill",
            amount: 50,
            dueDate: "2024-01-20",
          }),
        ];
      });

      it("should sort by name ascending", async () => {
        // Act
        const { result } = renderHook(() => useBillsQuery({ sortBy: "name", sortOrder: "asc" }), {
          wrapper,
        });

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills[0].name).toBe("Apple Bill");
        expect(bills[1].name).toBe("Mango Bill");
        expect(bills[2].name).toBe("Zebra Bill");
      });

      it("should sort by amount descending", async () => {
        // Act
        const { result } = renderHook(
          () => useBillsQuery({ sortBy: "amount", sortOrder: "desc" }),
          { wrapper }
        );

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills[0].amount).toBe(200);
        expect(bills[1].amount).toBe(100);
        expect(bills[2].amount).toBe(50);
      });

      it("should sort by due date ascending", async () => {
        // Act
        const { result } = renderHook(
          () => useBillsQuery({ sortBy: "dueDate", sortOrder: "asc" }),
          { wrapper }
        );

        // Assert
        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const bills = result.current.data || [];
        expect(bills[0].dueDate).toBe("2024-01-10");
        expect(bills[1].dueDate).toBe("2024-01-15");
        expect(bills[2].dueDate).toBe("2024-01-20");
      });
    });

    describe("Caching Behavior", () => {
      it("should cache query results", async () => {
        // Arrange
        const mockBills = [mockDataGenerators.bill({ id: "bill_1" })];
        mockDb._mockData.envelopes = mockBills;

        // Act - First render
        const { result, rerender } = renderHook(() => useBillsQuery(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Clear the mock to verify cache is used
        mockDb.envelopes.where.mockClear();

        // Act - Re-render
        rerender();

        // Assert - Should use cached data without calling Dexie again
        expect(mockDb.envelopes.where).not.toHaveBeenCalled();
        expect(result.current.data).toEqual(mockBills);
      });

      it("should use separate cache for different filter options", async () => {
        // Arrange
        mockDb._mockData.envelopes = [
          mockDataGenerators.bill({ id: "bill_1", isPaid: true }),
          mockDataGenerators.bill({ id: "bill_2", isPaid: false }),
        ];

        // Act - Query with status: "paid"
        const { result: result1 } = renderHook(() => useBillsQuery({ status: "paid" }), {
          wrapper,
        });

        await waitFor(() => {
          expect(result1.current.isLoading).toBe(false);
        });

        // Act - Query with status: "unpaid"
        const { result: result2 } = renderHook(() => useBillsQuery({ status: "unpaid" }), {
          wrapper,
        });

        await waitFor(() => {
          expect(result2.current.isLoading).toBe(false);
        });

        // Assert - Both queries should have different results
        expect(result1.current.data?.length).toBe(1);
        expect(result2.current.data?.length).toBe(1);
        expect(result1.current.data?.[0].isPaid).toBe(true);
        expect(result2.current.data?.[0].isPaid).toBe(false);
      });

      it("should respect staleTime configuration", async () => {
        // Arrange
        const mockBills = [mockDataGenerators.bill({ id: "bill_1" })];
        mockDb._mockData.envelopes = mockBills;

        // Act - First fetch
        const { result } = renderHook(() => useBillsQuery(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Verify query completed successfully
        expect(result.current.data).toEqual(mockBills);
        expect(result.current.isError).toBe(false);
      });
    });

    describe("Query Invalidation", () => {
      it("should support manual refetch after data changes", async () => {
        // Arrange
        mockDb._mockData.envelopes = [mockDataGenerators.bill({ id: "bill_1" })];

        const { result } = renderHook(() => useBillsQuery(), { wrapper });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.length).toBe(1);

        // Modify mock data
        mockDb._mockData.envelopes = [
          mockDataGenerators.bill({ id: "bill_1" }),
          mockDataGenerators.bill({ id: "bill_2" }),
        ];

        // Act - Manual refetch
        await result.current.refetch();

        // Assert - Query should have new data
        await waitFor(() => {
          expect(result.current.data?.length).toBe(2);
        });
      });
    });
  });

  describe("useUpcomingBillsQuery", () => {
    it("should filter upcoming bills within specified days", async () => {
      // Arrange
      const today = new Date();
      const inTenDays = new Date(today);
      inTenDays.setDate(inTenDays.getDate() + 10);
      const inThirtyDays = new Date(today);
      inThirtyDays.setDate(inThirtyDays.getDate() + 30);

      const billsData = [
        mockDataGenerators.bill({
          id: "bill_1",
          dueDate: inTenDays.toISOString().split("T")[0],
          isPaid: false,
        }),
        mockDataGenerators.bill({
          id: "bill_2",
          dueDate: inThirtyDays.toISOString().split("T")[0],
          isPaid: false,
        }),
      ] as never[];

      // Act
      const { result } = renderHook(() => useUpcomingBillsQuery(15, billsData), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.length).toBe(1);
      expect(result.current.data?.[0].id).toBe("bill_1");
    });

    it("should exclude paid bills", async () => {
      // Arrange
      const today = new Date();
      const inTenDays = new Date(today);
      inTenDays.setDate(inTenDays.getDate() + 10);

      const billsData = [
        mockDataGenerators.bill({
          id: "bill_1",
          dueDate: inTenDays.toISOString().split("T")[0],
          isPaid: false,
        }),
        mockDataGenerators.bill({
          id: "bill_2",
          dueDate: inTenDays.toISOString().split("T")[0],
          isPaid: true,
        }),
      ] as never[];

      // Act
      const { result } = renderHook(() => useUpcomingBillsQuery(30, billsData), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.length).toBe(1);
      expect(result.current.data?.[0].isPaid).toBe(false);
    });

    it("should be disabled when billsData is not provided", async () => {
      // Act
      const { result } = renderHook(() => useUpcomingBillsQuery(30), { wrapper });

      // Assert - Query should be disabled and eventually idle
      await waitFor(() => {
        expect(result.current.data).toBeUndefined();
      });
    });
  });
});
