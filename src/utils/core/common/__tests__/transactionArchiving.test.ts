import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionArchiver, ARCHIVE_CONFIG } from "../transactionArchiving";
import { budgetDb } from "@/db/budgetDb";
import logger from "../logger";

// Mock dependencies
vi.mock("@/db/budgetDb", () => {
  const createMockStore = () => ({
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
    above: vi.fn().mockReturnThis(),
    below: vi.fn().mockReturnThis(),
    anyOf: vi.fn().mockReturnThis(),
    startsWith: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    toArray: vi.fn(),
    count: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  });

  return {
    budgetDb: {
      transactions: createMockStore(),
      cache: createMockStore(),
      close: vi.fn(),
      open: vi.fn(),
    },
  };
});

vi.mock("../logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Transaction Archiver", () => {
  let archiver: TransactionArchiver;

  beforeEach(() => {
    vi.clearAllMocks();
    archiver = new TransactionArchiver();
  });

  describe("calculateCutoffDate", () => {
    it("should return a date string X months in the past", () => {
      const cutoff = archiver.calculateCutoffDate(6);
      const expectedDate = new Date();
      expectedDate.setMonth(expectedDate.getMonth() - 6);
      expectedDate.setDate(1);
      const expectedString = expectedDate.toISOString().split("T")[0];

      expect(cutoff).toBe(expectedString);
    });
  });

  describe("archiveOldTransactions", () => {
    it("should process and remove old transactions", async () => {
      const mockTransactions = [
        { id: "1", date: "2023-01-01", amount: -10, category: "Food", type: "expense" },
        { id: "2", date: "2023-01-02", amount: 100, category: "Salary", type: "income" },
      ];

      (budgetDb.transactions.where as any).mockReturnThis();
      (budgetDb.transactions.below as any).mockReturnThis();
      (budgetDb.transactions.toArray as any).mockResolvedValue(mockTransactions);
      (budgetDb.cache.put as any).mockResolvedValue(true);
      (budgetDb.transactions.delete as any).mockResolvedValue(true);

      const result = await archiver.archiveOldTransactions(6);

      expect(result.success).toBe(true);
      expect(result.stats.archived).toBe(2);
      expect(budgetDb.cache.put).toHaveBeenCalled(); // Aggregations
      expect(budgetDb.transactions.delete).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("completed successfully"),
        expect.anything()
      );
    });

    it("should handle the case with no transactions to archive", async () => {
      (budgetDb.transactions.toArray as any).mockResolvedValue([]);
      const result = await archiver.archiveOldTransactions(6);
      expect(result.message).toBe("No transactions to archive");
      expect(budgetDb.cache.put).not.toHaveBeenCalled();
    });
  });

  describe("getArchivingInfo", () => {
    it("should provide stats and recommendations", async () => {
      (budgetDb.transactions.count as any).mockResolvedValue(1000);
      (budgetDb.transactions.where as any).mockReturnThis();
      (budgetDb.transactions.below as any).mockReturnThis();
      (budgetDb.transactions.count as any).mockImplementation(
        (() => {
          let call = 0;
          return async () => {
            call++;
            if (call === 1) return 1000; // Total
            return 200; // Old
          };
        })()
      );

      (budgetDb.cache.where as any).mockReturnThis();
      (budgetDb.cache.equals as any).mockReturnThis();
      (budgetDb.cache.count as any).mockResolvedValue(5);

      const info = await archiver.getArchivingInfo();

      expect(info.current.totalTransactions).toBe(1000);
      expect(info.archived.archiveCount).toBe(5);
      expect(info.recommendations.canArchive).toBe(true);
    });
  });

  describe("restoreArchivedTransactions", () => {
    it("should restore transactions from cache", async () => {
      const mockArchive = {
        value: {
          transactions: [
            { id: "old-1", date: "2022-01-01", amount: -50, category: "Misc", type: "expense" },
          ],
        },
      };

      (budgetDb.cache.get as any).mockResolvedValue(mockArchive);
      (budgetDb.transactions.put as any).mockResolvedValue(true);

      const count = await archiver.restoreArchivedTransactions("arch-id");

      expect(count).toBe(1);
      expect(budgetDb.transactions.put).toHaveBeenCalled();
    });

    it("should throw error if archive not found", async () => {
      (budgetDb.cache.get as any).mockResolvedValue(null);
      await expect(archiver.restoreArchivedTransactions("fake")).rejects.toThrow("not found");
    });
  });
});
