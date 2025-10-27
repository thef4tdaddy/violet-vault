// Prefetch Helpers Tests
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { prefetchHelpers } from "../prefetchHelpers";
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys } from "../queryKeys";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    getEnvelopesByCategory: vi.fn(),
    getTransactionsByDateRange: vi.fn(),
    getCachedValue: vi.fn(),
    setCachedValue: vi.fn(),
  },
}));

vi.mock("@/services/budgetDatabaseService", () => ({
  budgetDatabaseService: {
    getEnvelopes: vi.fn(),
    getTransactions: vi.fn(),
    getBills: vi.fn(),
    getSavingsGoals: vi.fn(),
    getBudgetMetadata: vi.fn(),
    getAnalyticsData: vi.fn(),
  },
}));

describe("prefetchHelpers", () => {
  let mockQueryClient: {
    prefetchQuery: Mock;
  };

  beforeEach(() => {
    mockQueryClient = {
      prefetchQuery: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("prefetchEnvelopes", () => {
    it("should prefetch envelopes successfully", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Food", category: "expenses" },
        { id: "2", name: "Gas", category: "expenses" },
      ];

      const filters = { category: "expenses", includeArchived: false };
      (budgetDatabaseService.getEnvelopes as Mock).mockResolvedValue(mockEnvelopes);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockEnvelopes);

      const result = await prefetchHelpers.prefetchEnvelopes(mockQueryClient, filters);

      expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.envelopesList(filters),
        queryFn: expect.any(Function),
        staleTime: 2 * 60 * 1000,
      });

      expect(result).toEqual(mockEnvelopes);
    });

    it("should fall back to direct database query", async () => {
      const mockEnvelopes = [{ id: "1", name: "Food" }];
      const filters = { category: "expenses" };

      (budgetDatabaseService.getEnvelopes as Mock).mockResolvedValue([]);
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue(mockEnvelopes);

      // Execute the queryFn directly to test fallback logic
      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        return await queryFn();
      });

      const result = await prefetchHelpers.prefetchEnvelopes(mockQueryClient, filters);

      expect(budgetDb.getEnvelopesByCategory).toHaveBeenCalledWith(
        filters.category,
        filters.includeArchived
      );
      expect(result).toEqual(mockEnvelopes);
    });

    it("should handle prefetch errors gracefully", async () => {
      const error = new Error("Prefetch failed");
      (mockQueryClient.prefetchQuery as Mock).mockRejectedValue(error);

      const result = await prefetchHelpers.prefetchEnvelopes(mockQueryClient);

      expect(result).toBeNull();
    });

    it("should throw error when no data available", async () => {
      (budgetDatabaseService.getEnvelopes as Mock).mockResolvedValue([]);
      (budgetDb.getEnvelopesByCategory as Mock).mockResolvedValue([]);

      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        await expect(queryFn()).rejects.toThrow("No cached envelope data available");
      });

      await prefetchHelpers.prefetchEnvelopes(mockQueryClient);
    });
  });

  describe("prefetchTransactions", () => {
    it("should prefetch transactions for date range", async () => {
      const mockTransactions = [
        { id: "1", date: "2024-01-01", amount: 100 },
        { id: "2", date: "2024-01-02", amount: 50 },
      ];

      const dateRange = {
        start: "2024-01-01",
        end: "2024-01-31",
      };

      (budgetDatabaseService.getTransactions as Mock).mockResolvedValue(mockTransactions);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockTransactions);

      const result = await prefetchHelpers.prefetchTransactions(mockQueryClient, dateRange, {
        limit: 100,
      });

      expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.transactionsByDateRange(dateRange.start, dateRange.end),
        queryFn: expect.any(Function),
        staleTime: 60 * 1000,
      });

      expect(budgetDatabaseService.getTransactions).toHaveBeenCalledWith({
        dateRange,
        limit: 100,
        useCache: true,
      });

      expect(result).toEqual(mockTransactions);
    });

    it("should apply limit to fallback query results", async () => {
      const mockTransactions = Array.from({ length: 200 }, (_, i) => ({
        id: `${i}`,
        amount: 100,
      }));

      const dateRange = {
        start: "2024-01-01",
        end: "2024-01-31",
      };

      (budgetDatabaseService.getTransactions as Mock).mockResolvedValue([]);
      (budgetDb.getTransactionsByDateRange as Mock).mockResolvedValue(mockTransactions);

      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        return await queryFn();
      });

      const result = await prefetchHelpers.prefetchTransactions(mockQueryClient, dateRange, {
        limit: 50,
      });

      expect(result).toHaveLength(50);
      expect(result).toEqual(mockTransactions.slice(0, 50));
    });
  });

  describe("prefetchBills", () => {
    it("should prefetch bills with options", async () => {
      const mockBills = [{ id: "1", name: "Rent", isPaid: false, dueDate: new Date() }];

      const options = { category: "housing", isPaid: false, daysAhead: 30 };
      (budgetDatabaseService.getBills as Mock).mockResolvedValue(mockBills);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockBills);

      const result = await prefetchHelpers.prefetchBills(mockQueryClient, options);

      expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.billsList(options),
        queryFn: expect.any(Function),
        staleTime: 5 * 60 * 1000,
      });

      expect(budgetDatabaseService.getBills).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockBills);
    });

    it("should handle empty bills array", async () => {
      (budgetDatabaseService.getBills as Mock).mockResolvedValue([]);

      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        return await queryFn();
      });

      const result = await prefetchHelpers.prefetchBills(mockQueryClient);
      expect(result).toEqual([]);
    });
  });

  describe("prefetchSavingsGoals", () => {
    it("should prefetch savings goals", async () => {
      const mockGoals = [{ id: "1", name: "Emergency Fund", targetAmount: 10000 }];

      const options = { isCompleted: false, category: "emergency" };
      (budgetDatabaseService.getSavingsGoals as Mock).mockResolvedValue(mockGoals);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockGoals);

      const result = await prefetchHelpers.prefetchSavingsGoals(mockQueryClient, options);

      expect(budgetDatabaseService.getSavingsGoals).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockGoals);
    });
  });

  describe("prefetchDashboard", () => {
    it("should prefetch dashboard from cache", async () => {
      const mockDashboardData = {
        totalEnvelopes: 10,
        recentTransactionCount: 5,
        unassignedCash: 1000,
      };

      (budgetDb.getCachedValue as Mock).mockResolvedValue(mockDashboardData);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockDashboardData);

      const result = await prefetchHelpers.prefetchDashboard(mockQueryClient);

      expect(budgetDb.getCachedValue).toHaveBeenCalledWith("dashboard_summary");
      expect(result).toEqual(mockDashboardData);
    });

    it("should generate dashboard data when cache is empty", async () => {
      const mockEnvelopes = [{ id: "1", archived: false }];
      const mockTransactions = [{ id: "1", amount: 100 }];
      const mockBills = [{ id: "1", isPaid: false }];
      const mockMetadata = { unassignedCash: 1000, actualBalance: 5000 };

      (budgetDb.getCachedValue as Mock).mockResolvedValue(null);
      (budgetDatabaseService.getEnvelopes as Mock).mockResolvedValue(mockEnvelopes);
      (budgetDatabaseService.getTransactions as Mock).mockResolvedValue(mockTransactions);
      (budgetDatabaseService.getBills as Mock).mockResolvedValue(mockBills);
      (budgetDatabaseService.getBudgetMetadata as Mock).mockResolvedValue(mockMetadata);
      (budgetDb.setCachedValue as Mock).mockResolvedValue(true);

      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        return await queryFn();
      });

      const result = await prefetchHelpers.prefetchDashboard(mockQueryClient);

      expect(result).toEqual({
        totalEnvelopes: 1,
        activeEnvelopes: 1,
        recentTransactionCount: 1,
        upcomingBillsCount: 1,
        unassignedCash: 1000,
        actualBalance: 5000,
        lastUpdated: expect.any(Number),
      });

      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(
        "dashboard_summary",
        expect.any(Object),
        60 * 1000
      );
    });
  });

  describe("prefetchAnalytics", () => {
    it("should prefetch analytics for different periods", async () => {
      const mockAnalyticsData = [{ id: "1", amount: 100, category: "food" }];

      (budgetDatabaseService.getAnalyticsData as Mock).mockResolvedValue(mockAnalyticsData);
      (mockQueryClient.prefetchQuery as Mock).mockResolvedValue(mockAnalyticsData);

      const result = await prefetchHelpers.prefetchAnalytics(mockQueryClient, "week");

      expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.analyticsReport("spending", { period: "week" }),
        queryFn: expect.any(Function),
        staleTime: 5 * 60 * 1000,
      });

      expect(result).toEqual(mockAnalyticsData);
    });

    it("should calculate correct date ranges for different periods", async () => {
      const mockAnalyticsData = [];
      (budgetDatabaseService.getAnalyticsData as Mock).mockResolvedValue(mockAnalyticsData);

      (mockQueryClient.prefetchQuery as Mock).mockImplementation(async ({ queryFn }) => {
        return await queryFn();
      });

      await prefetchHelpers.prefetchAnalytics(mockQueryClient, "month");

      expect(budgetDatabaseService.getAnalyticsData).toHaveBeenCalledWith(
        expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date),
        }),
        { includeTransfers: false, useCache: true }
      );
    });
  });

  describe("prefetchDashboardBundle", () => {
    it("should prefetch multiple dashboard-related queries", async () => {
      // Mock all the individual prefetch functions
      const mockResults = [
        { status: "fulfilled", value: "dashboard" },
        { status: "fulfilled", value: "envelopes" },
        { status: "fulfilled", value: "bills" },
        { status: "fulfilled", value: "transactions" },
      ];

      // Mock the individual prefetch methods
      vi.spyOn(prefetchHelpers, "prefetchDashboard").mockResolvedValue("dashboard");
      vi.spyOn(prefetchHelpers, "prefetchEnvelopes").mockResolvedValue("envelopes");
      vi.spyOn(prefetchHelpers, "prefetchBills").mockResolvedValue("bills");
      vi.spyOn(prefetchHelpers, "prefetchTransactions").mockResolvedValue("transactions");

      const result = await prefetchHelpers.prefetchDashboardBundle(mockQueryClient);

      expect(prefetchHelpers.prefetchDashboard).toHaveBeenCalledWith(mockQueryClient);
      expect(prefetchHelpers.prefetchEnvelopes).toHaveBeenCalledWith(mockQueryClient, {
        includeArchived: false,
      });
      expect(prefetchHelpers.prefetchBills).toHaveBeenCalledWith(mockQueryClient, {
        isPaid: false,
        daysAhead: 7,
      });
      expect(prefetchHelpers.prefetchTransactions).toHaveBeenCalledWith(
        mockQueryClient,
        expect.any(Object),
        { limit: 20 }
      );

      expect(result).toHaveLength(4);
    });
  });

  describe("smartPrefetch", () => {
    it("should prefetch based on current route", async () => {
      // Mock individual prefetch methods
      vi.spyOn(prefetchHelpers, "prefetchDashboard").mockResolvedValue("dashboard");
      vi.spyOn(prefetchHelpers, "prefetchEnvelopes").mockResolvedValue("envelopes");
      vi.spyOn(prefetchHelpers, "prefetchBills").mockResolvedValue("bills");

      await prefetchHelpers.smartPrefetch(mockQueryClient, "/");

      expect(prefetchHelpers.prefetchDashboard).toHaveBeenCalledWith(mockQueryClient);
      expect(prefetchHelpers.prefetchEnvelopes).toHaveBeenCalledWith(mockQueryClient);
      expect(prefetchHelpers.prefetchBills).toHaveBeenCalledWith(mockQueryClient);
    });

    it("should handle unknown routes gracefully", async () => {
      await prefetchHelpers.smartPrefetch(mockQueryClient, "/unknown-route");

      // Should not throw and should handle gracefully
      expect(true).toBe(true); // Test passes if no error is thrown
    });

    it("should prefetch transactions for transaction route", async () => {
      vi.spyOn(prefetchHelpers, "prefetchTransactions").mockResolvedValue("transactions");
      vi.spyOn(prefetchHelpers, "prefetchAnalytics").mockResolvedValue("analytics");

      await prefetchHelpers.smartPrefetch(mockQueryClient, "/transactions");

      expect(prefetchHelpers.prefetchTransactions).toHaveBeenCalledWith(
        mockQueryClient,
        expect.any(Object)
      );
      expect(prefetchHelpers.prefetchAnalytics).toHaveBeenCalledWith(mockQueryClient);
    });
  });
});
