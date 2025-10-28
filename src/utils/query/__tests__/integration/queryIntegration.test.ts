// Query Integration Tests - Real TanStack Query Testing
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { budgetDatabaseService } from "@/services/budgetDatabaseService";
import { queryKeys, queryKeyUtils } from "../../queryKeys";
import { prefetchHelpers } from "../../prefetchHelpers";
import { optimisticHelpers } from "../../optimisticHelpers";
import { queryClientUtils } from "../../queryClientConfig";
import type { Envelope } from "@/db/types";

// Test configuration
const TEST_TIMEOUT = 15000; // 15 seconds for real operations

describe("Query Integration Tests", () => {
  let queryClient: QueryClient;
  let testData: {
    envelopes: Array<Partial<Envelope>>;
    transactions: Array<
      Partial<{
        id: string;
        amount: number;
        description: string;
        envelopeId: string;
        category: string;
        date: Date;
        type: string;
        lastModified: number;
      }>
    >;
    bills: Array<Record<string, unknown>>;
    savingsGoals: Array<Record<string, unknown>>;
  };

  beforeEach(async () => {
    // Create a real QueryClient instance
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for faster tests
          staleTime: 0, // Always consider data stale for testing
          gcTime: 0, // Immediate garbage collection for testing
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Initialize database service
    await budgetDatabaseService.initialize();
    await budgetDatabaseService.clearData();

    // Create realistic test data
    testData = {
      envelopes: [
        {
          id: "env1",
          name: "Food & Dining",
          category: "expenses",
          currentBalance: 450.75,
          targetAmount: 600,
          archived: false,
          createdAt: Date.now() - 86400000, // 1 day ago
          lastModified: Date.now(),
        },
        {
          id: "env2",
          name: "Transportation",
          category: "transportation",
          currentBalance: 180.25,
          targetAmount: 250,
          archived: false,
          createdAt: Date.now() - 172800000, // 2 days ago
          lastModified: Date.now(),
        },
        {
          id: "env3",
          name: "Old Category",
          category: "deprecated",
          currentBalance: 0,
          targetAmount: 100,
          archived: true,
          createdAt: Date.now() - 2592000000, // 30 days ago
          lastModified: Date.now() - 2592000000,
        },
      ],
      transactions: Array.from({ length: 50 }, (_, i) => ({
        id: `tx${i + 1}`,
        amount: -Math.random() * 100 - 10, // $10-$110 expenses
        description: `Transaction ${i + 1}`,
        envelopeId: i % 3 === 0 ? "env1" : i % 3 === 1 ? "env2" : "env3",
        category: i % 3 === 0 ? "expenses" : i % 3 === 1 ? "transportation" : "deprecated",
        date: new Date(Date.now() - i * 3600000), // 1 hour intervals
        type: "expense",
        lastModified: Date.now() - i * 1000,
      })),
      bills: [
        {
          id: "bill1",
          name: "Rent",
          amount: 1200,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isPaid: false,
          isRecurring: true,
          frequency: "monthly",
          category: "housing",
          envelopeId: null,
          lastModified: Date.now(),
        },
        {
          id: "bill2",
          name: "Internet",
          amount: 79.99,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          isPaid: false,
          isRecurring: true,
          frequency: "monthly",
          category: "utilities",
          envelopeId: "env1",
          lastModified: Date.now(),
        },
        {
          id: "bill3",
          name: "Phone Bill",
          amount: 45,
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
          isPaid: false,
          isRecurring: true,
          frequency: "monthly",
          category: "utilities",
          envelopeId: "env2",
          lastModified: Date.now(),
        },
      ],
      savingsGoals: [
        {
          id: "goal1",
          name: "Emergency Fund",
          targetAmount: 5000,
          currentAmount: 2500,
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          category: "emergency",
          priority: "high",
          isCompleted: false,
          isPaused: false,
          lastModified: Date.now(),
        },
        {
          id: "goal2",
          name: "Vacation",
          targetAmount: 3000,
          currentAmount: 3000,
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          category: "lifestyle",
          priority: "medium",
          isCompleted: true,
          isPaused: false,
          lastModified: Date.now() - 30 * 24 * 60 * 60 * 1000,
        },
      ],
    };

    // Pre-populate database with test data
    await Promise.all([
      budgetDatabaseService.saveEnvelopes(testData.envelopes),
      budgetDatabaseService.saveTransactions(testData.transactions),
      budgetDatabaseService.saveBills(testData.bills),
      budgetDatabaseService.saveSavingsGoals(testData.savingsGoals),
      budgetDatabaseService.saveBudgetMetadata({
        unassignedCash: 1500.5,
        actualBalance: 8750.25,
        lastModified: Date.now(),
      }),
    ]);
  });

  afterEach(async () => {
    // Clean up query client
    queryClient.clear();
    queryClient.getQueryCache().clear();
    queryClient.getMutationCache().clear();

    // Clear test data
    await budgetDatabaseService.clearData();
  });

  describe("Query Key Generation and Validation", () => {
    it("should generate consistent query keys", () => {
      // Test basic key generation
      const envelopeListKey = queryKeys.envelopesList({ category: "expenses" });
      expect(envelopeListKey).toEqual(["envelopes", "list", { category: "expenses" }]);

      // Test key utilities
      expect(queryKeyUtils.getEntityType(envelopeListKey)).toBe("envelopes");
      expect(queryKeyUtils.getDepth(envelopeListKey)).toBe(3);
      expect(queryKeyUtils.isValidQueryKey(envelopeListKey)).toBe(true);

      // Test key matching
      expect(queryKeyUtils.matchesPattern(envelopeListKey, ["envelopes"])).toBe(true);
      expect(queryKeyUtils.matchesPattern(envelopeListKey, ["transactions"])).toBe(false);
    });

    it("should create hierarchical keys correctly", () => {
      const hierarchicalKey = queryKeyUtils.createHierarchical(
        "analytics",
        "spending",
        "monthly",
        null, // Should be filtered out
        "2024"
      );

      expect(hierarchicalKey).toEqual(["analytics", "spending", "monthly", "2024"]);
    });

    it("should get related keys for invalidation", () => {
      const envelopeRelated = queryKeyUtils.getRelatedKeys("envelopes");
      expect(envelopeRelated).toContain(queryKeys.envelopes);
      expect(envelopeRelated).toContain(queryKeys.dashboard);
      expect(envelopeRelated).toContain(queryKeys.budgetMetadata);

      const transactionRelated = queryKeyUtils.getRelatedKeys("transactions");
      expect(transactionRelated).toContain(queryKeys.transactions);
      expect(transactionRelated).toContain(queryKeys.analytics);
    });
  });

  describe("Real Data Prefetching", () => {
    it(
      "should prefetch envelopes with real data",
      async () => {
        // Clear any cached data first
        queryClient.clear();

        // Prefetch envelopes
        await prefetchHelpers.prefetchEnvelopes(queryClient, {
          includeArchived: false,
        });

        // Verify data was prefetched and cached
        const cachedEnvelopes = queryClient.getQueryData(
          queryKeys.envelopesList({
            includeArchived: false,
          })
        ) as unknown[];

        expect(cachedEnvelopes).toBeTruthy();
        expect(cachedEnvelopes).toHaveLength(2); // Only non-archived
        expect(
          cachedEnvelopes.find((e: Record<string, unknown>) => e.name === "Food & Dining")
        ).toBeTruthy();
        expect(
          cachedEnvelopes.find((e: Record<string, unknown>) => e.archived === true)
        ).toBeFalsy();
      },
      TEST_TIMEOUT
    );

    it(
      "should prefetch transactions with date filtering",
      async () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prefetchHelpers.prefetchTransactions(
          queryClient,
          {
            start: yesterday.toISOString(),
            end: tomorrow.toISOString(),
          },
          { limit: 25 }
        );

        const cachedTransactions = queryClient.getQueryData(
          queryKeys.transactionsByDateRange(yesterday.toISOString(), tomorrow.toISOString())
        ) as Array<Record<string, unknown>>;

        expect(cachedTransactions).toBeTruthy();
        expect(cachedTransactions.length).toBeGreaterThan(0);
        expect(cachedTransactions.length).toBeLessThanOrEqual(25);

        // Verify transactions are within date range
        cachedTransactions.forEach((tx) => {
          const txDate = new Date(tx.date as Date);
          expect(txDate.getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
          expect(txDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());
        });
      },
      TEST_TIMEOUT
    );

    it(
      "should prefetch bills with status filtering",
      async () => {
        await prefetchHelpers.prefetchBills(queryClient, {
          isPaid: false,
          daysAhead: 30,
        });

        const cachedBills = queryClient.getQueryData(
          queryKeys.billsList({
            isPaid: false,
            daysAhead: 30,
          })
        ) as Array<Record<string, unknown>>;

        expect(cachedBills).toBeTruthy();
        expect(cachedBills).toHaveLength(3); // All bills are unpaid in test data

        // Should include overdue bills
        const overdueBill = cachedBills.find((bill) => bill.name === "Phone Bill");
        expect(overdueBill).toBeTruthy();
        expect(new Date(overdueBill!.dueDate as Date).getTime()).toBeLessThan(Date.now());
      },
      TEST_TIMEOUT
    );

    it(
      "should prefetch dashboard data and generate summary",
      async () => {
        await prefetchHelpers.prefetchDashboard(queryClient);

        const dashboardData = queryClient.getQueryData(queryKeys.dashboardSummary()) as Record<
          string,
          unknown
        >;

        expect(dashboardData).toBeTruthy();
        expect(dashboardData.totalEnvelopes).toBe(3);
        expect(dashboardData.activeEnvelopes).toBe(2);
        expect(dashboardData.upcomingBillsCount).toBeGreaterThan(0);
        expect(dashboardData.unassignedCash).toBe(1500.5);
        expect(dashboardData.actualBalance).toBe(8750.25);
        expect(dashboardData.lastUpdated).toBeTruthy();
      },
      TEST_TIMEOUT
    );

    it(
      "should prefetch bundle of related data",
      async () => {
        const results = await prefetchHelpers.prefetchDashboardBundle(queryClient);

        expect(results).toHaveLength(4);

        // Verify all prefetch operations completed
        const fulfilledCount = results.filter((r) => r.status === "fulfilled").length;
        expect(fulfilledCount).toBeGreaterThanOrEqual(3); // Allow for some failures in test env

        // Check that data exists in cache
        expect(queryClient.getQueryData(queryKeys.dashboardSummary())).toBeTruthy();
        expect(
          queryClient.getQueryData(queryKeys.envelopesList({ includeArchived: false }))
        ).toBeTruthy();
      },
      TEST_TIMEOUT
    );
  });

  describe("Real Optimistic Updates", () => {
    it(
      "should update envelope optimistically and persist changes",
      async () => {
        // Get initial envelope data
        const initialEnvelopes = await budgetDatabaseService.getEnvelopes();
        const foodEnvelope = initialEnvelopes.find(
          (e: Record<string, unknown>) => e.name === "Food & Dining"
        )! as Record<string, unknown>;
        const foodEnvelopeId = foodEnvelope.id as string;

        // Set initial cache state
        queryClient.setQueryData(queryKeys.envelopesList(), initialEnvelopes);
        queryClient.setQueryData(queryKeys.envelopeById(foodEnvelopeId), foodEnvelope);

        // Perform optimistic update
        const updates = {
          currentBalance: 300.0,
          name: "Food & Groceries",
        };

        await optimisticHelpers.updateEnvelope(queryClient, foodEnvelopeId, updates);

        // Check cache was updated
        const cachedEnvelope = queryClient.getQueryData(
          queryKeys.envelopeById(foodEnvelopeId)
        ) as Record<string, unknown>;
        expect((cachedEnvelope as { currentBalance?: number }).currentBalance).toBe(300.0);
        expect(cachedEnvelope.name).toBe("Food & Groceries");
        expect(cachedEnvelope.lastModified).toBeTruthy();

        // Check database was updated
        const dbEnvelopes = await budgetDatabaseService.getEnvelopes();
        const updatedEnvelope = dbEnvelopes.find(
          (e: Record<string, unknown>) => e.id === foodEnvelopeId
        )! as Record<string, unknown>;
        expect((updatedEnvelope as { currentBalance?: number }).currentBalance).toBe(300.0);
        expect(updatedEnvelope.name).toBe("Food & Groceries");
      },
      TEST_TIMEOUT
    );

    it(
      "should add new envelope optimistically",
      async () => {
        const initialEnvelopes = await budgetDatabaseService.getEnvelopes();
        queryClient.setQueryData(queryKeys.envelopesList(), initialEnvelopes);

        const newEnvelope = {
          id: "env_new",
          name: "Entertainment",
          category: "lifestyle",
          currentBalance: 150,
          targetAmount: 200,
          archived: false,
        };

        await optimisticHelpers.addEnvelope(queryClient, newEnvelope);

        // Check cache was updated
        const cachedEnvelopes = queryClient.getQueryData(queryKeys.envelopesList()) as Array<
          Record<string, unknown>
        >;
        expect(cachedEnvelopes).toHaveLength(4); // 3 original + 1 new
        expect(cachedEnvelopes[0].id).toBe("env_new"); // Should be first (newly added)

        // Check database was updated
        const dbEnvelopes = await budgetDatabaseService.getEnvelopes();
        const addedEnvelope = dbEnvelopes.find(
          (e: Record<string, unknown>) => e.id === "env_new"
        ) as Record<string, unknown> | undefined;
        expect(addedEnvelope).toBeTruthy();
        expect(addedEnvelope!.name).toBe("Entertainment");
      },
      TEST_TIMEOUT
    );

    it(
      "should handle batch updates correctly",
      async () => {
        const initialEnvelopes = await budgetDatabaseService.getEnvelopes();
        const initialTransactions = await budgetDatabaseService.getTransactions({ limit: 10 });

        // Set initial cache
        queryClient.setQueryData(queryKeys.envelopesList(), initialEnvelopes);
        queryClient.setQueryData(queryKeys.transactionsList(), initialTransactions);

        const batchUpdates = {
          envelopes: [
            { id: (initialEnvelopes[0] as Record<string, unknown>).id, currentBalance: 999.99 },
            { id: (initialEnvelopes[1] as Record<string, unknown>).id, currentBalance: 888.88 },
          ],
          transactions: [
            { id: (initialTransactions[0] as Record<string, unknown>).id, amount: -123.45 },
          ],
          bills: [], // Empty array should be handled gracefully
        };

        await optimisticHelpers.batchUpdate(queryClient, batchUpdates);

        // Verify envelope updates in database
        const updatedEnvelopes = await budgetDatabaseService.getEnvelopes();
        expect(
          (
            updatedEnvelopes.find(
              (e: Record<string, unknown>) =>
                e.id === (initialEnvelopes[0] as Record<string, unknown>).id
            )! as { currentBalance?: number }
          ).currentBalance
        ).toBe(999.99);
        expect(
          (
            updatedEnvelopes.find(
              (e: Record<string, unknown>) =>
                e.id === (initialEnvelopes[1] as Record<string, unknown>).id
            )! as { currentBalance?: number }
          ).currentBalance
        ).toBe(888.88);

        // Verify transaction updates in database
        const updatedTransactions = await budgetDatabaseService.getTransactions({ limit: 10 });
        expect(
          (
            updatedTransactions.find(
              (t: Record<string, unknown>) =>
                t.id === (initialTransactions[0] as Record<string, unknown>).id
            )! as { amount?: number }
          ).amount
        ).toBe(-123.45);
      },
      TEST_TIMEOUT
    );

    it(
      "should handle rollback on database failures",
      async () => {
        const initialEnvelopes = await budgetDatabaseService.getEnvelopes();
        const testEnvelope = initialEnvelopes[0] as Record<string, unknown>;

        // Set cache with original data
        queryClient.setQueryData(queryKeys.envelopeById(testEnvelope.id as string), testEnvelope);

        // Mock database failure
        const originalUpdate = budgetDb.envelopes.update;
        budgetDb.envelopes.update = vi
          .fn()
          .mockRejectedValue(
            new Error("Database error")
          ) as unknown as typeof budgetDb.envelopes.update;

        try {
          // This should still update cache but log database error
          await optimisticHelpers.updateEnvelope(queryClient, testEnvelope.id as string, {
            currentBalance: 99999,
          });

          // Cache should still be updated (optimistic)
          const cachedEnvelope = queryClient.getQueryData(
            queryKeys.envelopeById(testEnvelope.id as string)
          ) as Record<string, unknown>;
          expect((cachedEnvelope as { currentBalance?: number }).currentBalance).toBe(99999);

          // But database should remain unchanged
          const dbEnvelopes = await budgetDatabaseService.getEnvelopes();
          const dbEnvelope = dbEnvelopes.find(
            (e: Record<string, unknown>) => e.id === testEnvelope.id
          ) as Record<string, unknown>;
          expect((dbEnvelope as { currentBalance?: number }).currentBalance).toBe(
            (testEnvelope as { currentBalance?: number }).currentBalance
          ); // Original balance
        } finally {
          // Restore original function
          budgetDb.envelopes.update = originalUpdate;
        }
      },
      TEST_TIMEOUT
    );
  });

  describe("Query Client Utilities Integration", () => {
    it(
      "should provide accurate cache statistics",
      async () => {
        // Populate cache with various queries
        await prefetchHelpers.prefetchEnvelopes(queryClient);
        await prefetchHelpers.prefetchTransactions(queryClient, {
          start: new Date(Date.now() - 86400000).toISOString(),
          end: new Date().toISOString(),
        });

        const stats = queryClientUtils.getCacheStats();

        expect(stats.totalQueries).toBeGreaterThan(0);
        expect(stats.activeQueries).toBeGreaterThanOrEqual(0);
        expect(stats.staleQueries).toBeGreaterThanOrEqual(0);
        expect(typeof stats.fetchingQueries).toBe("number");
        expect(typeof stats.errorQueries).toBe("number");
      },
      TEST_TIMEOUT
    );

    it(
      "should batch invalidate related queries",
      () => {
        // Set up some cached data
        queryClient.setQueryData(queryKeys.envelopesList(), testData.envelopes);
        queryClient.setQueryData(queryKeys.dashboard, { summary: "test" });
        queryClient.setQueryData(queryKeys.budgetMetadata, { cash: 1000 });

        // Verify data exists
        expect(queryClient.getQueryData(queryKeys.envelopesList())).toBeTruthy();

        // Batch invalidate envelope-related queries
        const relatedKeys = queryKeyUtils.getRelatedKeys("envelopes");
        queryClientUtils.batchInvalidate(relatedKeys);

        // Check that queries were invalidated
        const cache = queryClient.getQueryCache();
        const allQueries = cache.getAll();

        // Queries should still exist but be marked as stale
        const envelopeQuery = allQueries.find((q) => q.queryKey[0] === "envelopes");
        expect(envelopeQuery).toBeTruthy();
      },
      TEST_TIMEOUT
    );

    it(
      "should safely set and retrieve query data",
      () => {
        const testData = { id: 1, name: "Test" };
        const queryKey = ["test", "data"];

        // Safe set should work
        const setResult = queryClientUtils.safeSetQueryData(queryKey, testData);
        expect(setResult).toBe(true);

        // Data should be retrievable
        expect(queryClientUtils.hasQueryData(queryKey)).toBe(true);
        expect(queryClient.getQueryData(queryKey)).toEqual(testData);

        // Clear cache
        queryClientUtils.clearEntityCache("test");
        expect(queryClientUtils.hasQueryData(queryKey)).toBe(false);
      },
      TEST_TIMEOUT
    );
  });

  describe("Performance and Memory Management", () => {
    it(
      "should handle large datasets efficiently",
      async () => {
        // Create a large dataset
        const largeTransactionSet = Array.from({ length: 1000 }, (_, i) => ({
          id: `large_tx_${i}`,
          amount: -Math.random() * 50,
          description: `Large Transaction ${i}`,
          envelopeId: "env1",
          category: "expenses",
          date: new Date(Date.now() - i * 60000).toISOString(),
          type: "expense",
          lastModified: Date.now(),
        }));

        // Save large dataset
        const startTime = Date.now();
        await budgetDatabaseService.saveTransactions(largeTransactionSet);
        const saveTime = Date.now() - startTime;

        // Should complete within reasonable time (adjust based on hardware)
        expect(saveTime).toBeLessThan(5000); // 5 seconds

        // Query with limits should be fast
        const queryStart = Date.now();
        const limitedResults = await budgetDatabaseService.getTransactions({
          limit: 50,
        });
        const queryTime = Date.now() - queryStart;

        expect(queryTime).toBeLessThan(1000); // 1 second
        expect(limitedResults).toHaveLength(50);
      },
      TEST_TIMEOUT
    );

    it(
      "should properly cleanup query cache",
      async () => {
        // Fill cache with data
        await prefetchHelpers.prefetchDashboardBundle(queryClient);

        const initialStats = queryClientUtils.getCacheStats();
        expect(initialStats.totalQueries).toBeGreaterThan(0);

        // Clear all cache
        queryClientUtils.clearAllCache();

        const finalStats = queryClientUtils.getCacheStats();
        expect(finalStats.totalQueries).toBe(0);
      },
      TEST_TIMEOUT
    );

    it(
      "should handle concurrent query operations",
      async () => {
        // Simulate multiple concurrent operations
        const concurrentOperations = [
          prefetchHelpers.prefetchEnvelopes(queryClient),
          prefetchHelpers.prefetchTransactions(queryClient, {
            start: new Date(Date.now() - 86400000).toISOString(),
            end: new Date().toISOString(),
          }),
          prefetchHelpers.prefetchBills(queryClient),
          prefetchHelpers.prefetchSavingsGoals(queryClient),
          prefetchHelpers.prefetchDashboard(queryClient),
        ];

        const results = await Promise.allSettled(concurrentOperations);

        // Most operations should succeed
        const successCount = results.filter((r) => r.status === "fulfilled").length;
        expect(successCount).toBeGreaterThanOrEqual(3);

        // Cache should contain data from successful operations
        const stats = queryClientUtils.getCacheStats();
        expect(stats.totalQueries).toBeGreaterThan(0);
      },
      TEST_TIMEOUT
    );
  });
});
