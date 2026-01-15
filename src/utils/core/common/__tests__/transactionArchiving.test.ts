import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  TransactionArchiver,
  ARCHIVE_CONFIG,
  createArchiver,
  getArchivingRecommendations,
  archiveTransactions,
  type ArchiveConfig,
  type ArchivingStats,
  type ArchiveResult,
  type ArchivingInfo,
} from "../transactionArchiving";
import { budgetDb } from "@/db/budgetDb";
import logger from "../logger";

// Mock logger
vi.mock("../logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    transactions: {
      where: vi.fn(),
      count: vi.fn(),
      put: vi.fn(),
    },
    cache: {
      put: vi.fn(),
      get: vi.fn(),
      where: vi.fn(),
    },
    close: vi.fn(),
    open: vi.fn(),
  },
}));

describe("transactionArchiving", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("ARCHIVE_CONFIG", () => {
    it("should have correct default configuration", () => {
      expect(ARCHIVE_CONFIG.DEFAULT_ARCHIVE_AGE_MONTHS).toBe(6);
      expect(ARCHIVE_CONFIG.BATCH_SIZE).toBe(100);
      expect(ARCHIVE_CONFIG.AGGREGATION_PERIODS).toEqual({
        MONTHLY: "monthly",
        QUARTERLY: "quarterly",
        YEARLY: "yearly",
      });
      expect(ARCHIVE_CONFIG.PRESERVE_CATEGORIES).toEqual([
        "income",
        "fixed-expenses",
        "variable-expenses",
        "savings",
        "transfers",
      ]);
    });
  });

  describe("TransactionArchiver", () => {
    let archiver: TransactionArchiver;

    beforeEach(() => {
      archiver = new TransactionArchiver();
    });

    describe("constructor", () => {
      it("should initialize with default config", () => {
        expect(archiver.config).toEqual(ARCHIVE_CONFIG);
        expect(archiver.stats).toEqual({
          processed: 0,
          archived: 0,
          aggregated: 0,
          errors: 0,
        });
      });

      it("should merge custom config with defaults", () => {
        const customConfig: Partial<ArchiveConfig> = {
          DEFAULT_ARCHIVE_AGE_MONTHS: 12,
          BATCH_SIZE: 50,
        };
        const customArchiver = new TransactionArchiver(customConfig as ArchiveConfig);

        expect(customArchiver.config.DEFAULT_ARCHIVE_AGE_MONTHS).toBe(12);
        expect(customArchiver.config.BATCH_SIZE).toBe(50);
        expect(customArchiver.config.AGGREGATION_PERIODS).toEqual(
          ARCHIVE_CONFIG.AGGREGATION_PERIODS
        );
      });
    });

    describe("calculateCutoffDate", () => {
      it("should calculate cutoff date for 6 months", () => {
        const cutoffDate = archiver.calculateCutoffDate(6);
        const date = new Date(cutoffDate);

        expect(cutoffDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(date.getUTCDate()).toBe(1); // Should be first day of month
      });

      it("should calculate cutoff date for 12 months", () => {
        const cutoffDate = archiver.calculateCutoffDate(12);
        const date = new Date(cutoffDate);

        expect(cutoffDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(date.getUTCDate()).toBe(1);
      });

      it("should handle 0 months", () => {
        const cutoffDate = archiver.calculateCutoffDate(0);
        expect(cutoffDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it("should handle negative months (future date)", () => {
        const cutoffDate = archiver.calculateCutoffDate(-3);
        const date = new Date(cutoffDate);
        const now = new Date();

        expect(date.getTime()).toBeGreaterThan(now.getTime());
      });
    });

    describe("getTransactionsForArchiving", () => {
      it("should get transactions before cutoff date", async () => {
        const mockTransactions = [
          { id: "1", date: "2023-01-15", amount: 100 },
          { id: "2", date: "2023-02-20", amount: 200 },
        ];

        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockTransactions),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getTransactionsForArchiving("2023-06-01");

        expect(budgetDb.transactions.where).toHaveBeenCalledWith("date");
        expect(mockQuery.below).toHaveBeenCalledWith("2023-06-01");
        expect(result).toHaveLength(2);
        expect(result[0].date).toBe("2023-01-15");
      });

      it("should handle Date objects in transactions", async () => {
        const mockTransactions = [{ id: "1", date: new Date("2023-01-15"), amount: 100 }];

        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockTransactions),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getTransactionsForArchiving("2023-06-01");

        expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });

      it("should handle empty results", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getTransactionsForArchiving("2023-06-01");

        expect(result).toEqual([]);
      });
    });

    describe("createAnalyticsAggregations", () => {
      it("should create aggregations for all periods", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            category: "groceries",
            envelopeId: "env1",
            type: "expense",
          },
          {
            id: "2",
            date: "2023-01-20",
            amount: 50,
            category: "groceries",
            envelopeId: "env1",
            type: "expense",
          },
        ];

        await archiver.createAnalyticsAggregations(transactions);

        // Should store aggregations for monthly, quarterly, and yearly
        const putCalls = vi.mocked(budgetDb.cache.put).mock.calls.length;
        expect(putCalls).toBeGreaterThan(0);
        expect(archiver.stats.aggregated).toBeGreaterThan(0);
      });

      it("should handle transactions with different categories", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            category: "groceries",
            envelopeId: "env1",
          },
          {
            id: "2",
            date: "2023-01-20",
            amount: 50,
            category: "utilities",
            envelopeId: "env2",
          },
        ];

        await archiver.createAnalyticsAggregations(transactions);

        expect(budgetDb.cache.put).toHaveBeenCalled();
        expect(archiver.stats.aggregated).toBeGreaterThan(0);
      });

      it("should handle uncategorized transactions", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            envelopeId: "env1",
          },
        ];

        await archiver.createAnalyticsAggregations(transactions);

        expect(budgetDb.cache.put).toHaveBeenCalled();
      });

      it("should serialize Set to Array for storage", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            category: "groceries",
            envelopeId: "env1",
          },
          {
            id: "2",
            date: "2023-01-16",
            amount: 50,
            category: "groceries",
            envelopeId: "env2",
          },
        ];

        await archiver.createAnalyticsAggregations(transactions);

        const putCalls = vi.mocked(budgetDb.cache.put).mock.calls;
        putCalls.forEach((call: any) => {
          const value = call[0].value;
          expect(Array.isArray(value.envelopes)).toBe(true);
        });
      });
    });

    describe("createTransactionArchives", () => {
      it("should create archives in batches", async () => {
        const transactions = Array.from({ length: 150 }, (_, i) => ({
          id: `tx-${i}`,
          date: "2023-01-15",
          amount: 100 + i,
          category: "groceries",
          envelopeId: "env1",
          type: "expense",
          description: `Transaction ${i}`,
        }));

        await archiver.createTransactionArchives(transactions);

        // With BATCH_SIZE of 100, should create 2 archives
        const putCalls = vi.mocked(budgetDb.cache.put).mock.calls;
        expect(putCalls.length).toBe(2);
        expect(archiver.stats.archived).toBe(150);
      });

      it("should create archive with correct structure", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            category: "groceries",
            envelopeId: "env1",
            type: "expense",
            description: "Test transaction",
          },
        ];

        await archiver.createTransactionArchives(transactions);

        const putCall = vi.mocked(budgetDb.cache.put).mock.calls[0];
        const archive = putCall[0].value;

        expect(archive).toHaveProperty("id");
        expect(archive).toHaveProperty("createdAt");
        expect(archive).toHaveProperty("dateRange");
        expect(archive).toHaveProperty("transactionCount");
        expect(archive).toHaveProperty("totalAmount");
        expect(archive).toHaveProperty("categories");
        expect(archive).toHaveProperty("envelopes");
        expect(archive).toHaveProperty("transactions");
      });

      it("should handle missing optional fields", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
          },
        ];

        await archiver.createTransactionArchives(transactions);

        const putCall = vi.mocked(budgetDb.cache.put).mock.calls[0];
        const archive = putCall[0].value;

        expect(archive.transactions[0].amount).toBe(0);
        expect(archive.transactions[0].category).toBe("uncategorized");
        expect(archive.transactions[0].description).toBe("");
      });

      it("should set expiresAt to null for permanent storage", async () => {
        const transactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
          },
        ];

        await archiver.createTransactionArchives(transactions);

        const putCall = vi.mocked(budgetDb.cache.put).mock.calls[0];
        expect(putCall[0].expiresAt).toBe(null);
        expect(putCall[0].category).toBe("transaction_archive");
      });
    });

    describe("removeArchivedTransactions", () => {
      it("should delete transactions in batches", async () => {
        const transactions = Array.from({ length: 150 }, (_, i) => ({
          id: `tx-${i}`,
          date: "2023-01-15",
          amount: 100,
        }));

        const mockQuery = {
          anyOf: vi.fn().mockReturnThis(),
          delete: vi.fn().mockResolvedValue(undefined),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        await archiver.removeArchivedTransactions(transactions);

        // With BATCH_SIZE of 100, should call delete 2 times
        expect(mockQuery.delete).toHaveBeenCalledTimes(2);
        expect(archiver.stats.processed).toBe(150);
      });

      it("should handle empty transaction list", async () => {
        const mockQuery = {
          anyOf: vi.fn().mockReturnThis(),
          delete: vi.fn().mockResolvedValue(undefined),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        await archiver.removeArchivedTransactions([]);

        expect(mockQuery.delete).not.toHaveBeenCalled();
        expect(archiver.stats.processed).toBe(0);
      });
    });

    describe("optimizeDatabase", () => {
      it("should close and reopen database", async () => {
        await archiver.optimizeDatabase();

        expect(budgetDb.close).toHaveBeenCalled();
        expect(budgetDb.open).toHaveBeenCalled();
      });

      it("should handle errors gracefully", async () => {
        vi.mocked(budgetDb.close).mockRejectedValue(new Error("Close failed"));

        await archiver.optimizeDatabase();

        expect(logger.warn).toHaveBeenCalled();
      });
    });

    describe("getArchivingInfo", () => {
      beforeEach(() => {
        const mockBelowQuery = {
          below: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(50),
        };

        const mockEqualsQuery = {
          equals: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(5),
        };

        vi.mocked(budgetDb.transactions.count).mockResolvedValue(100);
        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockBelowQuery as never);
        vi.mocked(budgetDb.cache.where).mockReturnValue(mockEqualsQuery as never);
      });

      it("should return archiving info with default periods", async () => {
        const info = await archiver.getArchivingInfo();

        expect(info).toHaveProperty("current");
        expect(info).toHaveProperty("archived");
        expect(info).toHaveProperty("recommendations");
        expect(info.current).toHaveProperty("totalTransactions");
        expect(info.current).toHaveProperty("periodBreakdown");
      });

      it("should calculate recommendations based on transaction volume", async () => {
        const info = await archiver.getArchivingInfo();

        expect(info.recommendations).toHaveProperty("canArchive");
        expect(info.recommendations).toHaveProperty("potentialSavings");
        expect(info.recommendations).toHaveProperty("suggestedPeriod");
        expect(info.recommendations).toHaveProperty("suggestedAction");
      });

      it("should handle custom periods", async () => {
        const customPeriods = [
          { name: "2 weeks", months: 0.5, cutoffDate: "", count: 0 },
          { name: "1 month", months: 1, cutoffDate: "", count: 0 },
        ];

        const info = await archiver.getArchivingInfo(customPeriods);

        expect(info.current.periodBreakdown).toHaveLength(2);
      });

      it("should recommend archiving when transactions exist", async () => {
        const mockBelowQuery = {
          below: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(75),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockBelowQuery as never);

        const info = await archiver.getArchivingInfo();

        expect(info.recommendations.canArchive).toBe(true);
        expect(info.recommendations.potentialSavings).toBeGreaterThan(0);
      });

      it("should not recommend archiving when no old transactions", async () => {
        const mockBelowQuery = {
          below: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(0),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockBelowQuery as never);

        const info = await archiver.getArchivingInfo();

        expect(info.recommendations.canArchive).toBe(false);
        expect(info.recommendations.suggestedAction).toContain("No archiving needed");
      });
    });

    describe("getArchivedAnalytics", () => {
      it("should retrieve yearly analytics for all categories", async () => {
        const mockAnalytics = [
          { key: "analytics_yearly_2023_groceries", value: { totalAmount: 1000 } },
          { key: "analytics_yearly_2023_utilities", value: { totalAmount: 500 } },
        ];

        const mockQuery = {
          startsWith: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockAnalytics),
        };

        vi.mocked(budgetDb.cache.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getArchivedAnalytics("yearly");

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty("totalAmount");
      });

      it("should retrieve analytics for specific category", async () => {
        const mockAnalytics = [
          { key: "analytics_monthly_2023-01_groceries", value: { totalAmount: 200 } },
        ];

        const mockQuery = {
          startsWith: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockAnalytics),
        };

        vi.mocked(budgetDb.cache.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getArchivedAnalytics("monthly", "groceries");

        expect(budgetDb.cache.where).toHaveBeenCalledWith("key");
        expect(result).toHaveLength(1);
      });

      it("should handle empty results", async () => {
        const mockQuery = {
          startsWith: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        };

        vi.mocked(budgetDb.cache.where).mockReturnValue(mockQuery as never);

        const result = await archiver.getArchivedAnalytics("yearly");

        expect(result).toEqual([]);
      });
    });

    describe("restoreArchivedTransactions", () => {
      it("should restore transactions from archive", async () => {
        const mockArchive = {
          key: "transaction_archive_123",
          value: {
            transactions: [
              {
                id: "1",
                date: "2023-01-15",
                amount: 100,
                category: "groceries",
                envelopeId: "env1",
                type: "expense",
                description: "Test",
              },
            ],
          },
          category: "transaction_archive",
          expiresAt: null,
        };

        vi.mocked(budgetDb.cache.get).mockResolvedValue(mockArchive as never);
        vi.mocked(budgetDb.transactions.put).mockResolvedValue("1" as never);

        const count = await archiver.restoreArchivedTransactions("123");

        expect(count).toBe(1);
        expect(logger.info).toHaveBeenCalledWith(
          "Restored transactions from archive",
          expect.objectContaining({ archiveId: "123" })
        );
      });

      it("should throw error when archive not found", async () => {
        vi.mocked(budgetDb.cache.get).mockResolvedValue(undefined);

        await expect(archiver.restoreArchivedTransactions("nonexistent")).rejects.toThrow(
          "Archive nonexistent not found"
        );
      });

      it("should handle missing optional fields in restored transactions", async () => {
        const mockArchive = {
          value: {
            transactions: [
              {
                id: "1",
                date: "2023-01-15",
                amount: 100,
              },
            ],
          },
        };

        vi.mocked(budgetDb.cache.get).mockResolvedValue(mockArchive as never);
        vi.mocked(budgetDb.transactions.put).mockResolvedValue("1" as never);

        const count = await archiver.restoreArchivedTransactions("123");

        expect(count).toBe(1);
      });
    });

    describe("archiveOldTransactions", () => {
      it("should execute complete archiving workflow", async () => {
        const mockTransactions = [
          {
            id: "1",
            date: "2023-01-15",
            amount: 100,
            category: "groceries",
            envelopeId: "env1",
            type: "expense",
          },
        ];

        const mockBelowQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue(mockTransactions),
        };

        const mockDeleteQuery = {
          anyOf: vi.fn().mockReturnThis(),
          delete: vi.fn().mockResolvedValue(undefined),
        };

        // First call returns the query for getting transactions
        vi.mocked(budgetDb.transactions.where)
          .mockReturnValueOnce(mockBelowQuery as never)
          .mockReturnValue(mockDeleteQuery as never);

        const result = await archiver.archiveOldTransactions(6);

        expect(result.success).toBe(true);
        expect(result.stats.archived).toBeGreaterThan(0);
        expect(result.message).toContain("Successfully archived");
      });

      it("should handle no transactions to archive", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiver.archiveOldTransactions(6);

        expect(result.success).toBe(true);
        expect(result.message).toBe("No transactions to archive");
        expect(result.stats.archived).toBe(0);
      });

      it("should handle errors during archiving", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockRejectedValue(new Error("Database error")),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        await expect(archiver.archiveOldTransactions(6)).rejects.toThrow("Archiving failed");
        expect(logger.error).toHaveBeenCalled();
      });

      it("should use default age when not specified", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiver.archiveOldTransactions();

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Utility Functions", () => {
    describe("createArchiver", () => {
      it("should create archiver with default config", () => {
        const archiver = createArchiver();

        expect(archiver).toBeInstanceOf(TransactionArchiver);
        expect(archiver.config).toEqual(ARCHIVE_CONFIG);
      });

      it("should create archiver with custom config", () => {
        const customConfig: Partial<ArchiveConfig> = {
          DEFAULT_ARCHIVE_AGE_MONTHS: 12,
        };

        const archiver = createArchiver(customConfig as ArchiveConfig);

        expect(archiver).toBeInstanceOf(TransactionArchiver);
        expect(archiver.config.DEFAULT_ARCHIVE_AGE_MONTHS).toBe(12);
      });
    });

    describe("getArchivingRecommendations", () => {
      beforeEach(() => {
        const mockBelowQuery = {
          below: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(50),
        };

        const mockEqualsQuery = {
          equals: vi.fn().mockReturnThis(),
          count: vi.fn().mockResolvedValue(5),
        };

        vi.mocked(budgetDb.transactions.count).mockResolvedValue(100);
        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockBelowQuery as never);
        vi.mocked(budgetDb.cache.where).mockReturnValue(mockEqualsQuery as never);
      });

      it("should return archiving recommendations", async () => {
        const info = await getArchivingRecommendations();

        expect(info).toHaveProperty("current");
        expect(info).toHaveProperty("archived");
        expect(info).toHaveProperty("recommendations");
      });
    });

    describe("archiveTransactions", () => {
      it("should archive transactions with specified age", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockResolvedValue([]),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        const result = await archiveTransactions(12);

        expect(result.success).toBe(true);
        expect(result).toHaveProperty("stats");
      });

      it("should handle archiving errors", async () => {
        const mockQuery = {
          below: vi.fn().mockReturnThis(),
          toArray: vi.fn().mockRejectedValue(new Error("Test error")),
        };

        vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

        await expect(archiveTransactions(6)).rejects.toThrow();
      });
    });
  });

  describe("Edge Cases", () => {
    let archiver: TransactionArchiver;

    beforeEach(() => {
      archiver = new TransactionArchiver();
    });

    it("should handle transactions with null/undefined values", async () => {
      const transactions = [
        {
          id: "1",
          date: "2023-01-15",
          amount: undefined,
          category: null,
          envelopeId: undefined,
        },
      ];

      await archiver.createTransactionArchives(transactions as any);

      expect(archiver.stats.archived).toBe(1);
    });

    it("should handle very large batches", async () => {
      const largeTransactions = Array.from({ length: 1000 }, (_, i) => ({
        id: `tx-${i}`,
        date: "2023-01-15",
        amount: i,
        category: "test",
        envelopeId: "env1",
      }));

      await archiver.createTransactionArchives(largeTransactions);

      expect(archiver.stats.archived).toBe(1000);
    });

    it("should handle transactions with different date formats", async () => {
      const transactions = [
        { id: "1", date: "2023-01-15T10:30:00Z", amount: 100 },
        { id: "2", date: new Date("2023-01-16"), amount: 200 },
        { id: "3", date: "2023-01-17", amount: 300 },
      ];

      const mockQuery = {
        below: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockResolvedValue(transactions),
      };

      vi.mocked(budgetDb.transactions.where).mockReturnValue(mockQuery as never);

      const result = await archiver.getTransactionsForArchiving("2023-06-01");

      expect(result).toHaveLength(3);
      result.forEach((tx) => {
        expect(typeof tx.date).toBe("string");
      });
    });

    it("should handle negative transaction amounts", async () => {
      const transactions = [
        {
          id: "1",
          date: "2023-01-15",
          amount: -100,
          category: "expense",
          envelopeId: "env1",
        },
      ];

      await archiver.createAnalyticsAggregations(transactions);

      expect(archiver.stats.aggregated).toBeGreaterThan(0);
    });

    it("should handle transactions with special characters in category", async () => {
      const transactions = [
        {
          id: "1",
          date: "2023-01-15",
          amount: 100,
          category: "Café & Restaurant's",
          envelopeId: "env1",
        },
      ];

      await archiver.createTransactionArchives(transactions);

      expect(archiver.stats.archived).toBe(1);
    });

    it("should handle empty category strings", async () => {
      const transactions = [
        {
          id: "1",
          date: "2023-01-15",
          amount: 100,
          category: "",
          envelopeId: "env1",
        },
        {
          id: "2",
          date: "2023-01-16",
          amount: 200,
          category: "   ",
          envelopeId: "env1",
        },
      ];

      await archiver.createAnalyticsAggregations(transactions);

      expect(archiver.stats.aggregated).toBeGreaterThan(0);
    });
  });
});
