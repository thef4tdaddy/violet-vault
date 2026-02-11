import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectLocalData, hasLocalData } from "../dataDetectionHelper";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    isOpen: vi.fn(),
    open: vi.fn(),
    getDatabaseStats: vi.fn(),
    envelopes: {
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
    transactions: {
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("dataDetectionHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectLocalData", () => {
    it("should return correct status when data exists", async () => {
      vi.mocked(budgetDb.isOpen).mockResolvedValue(true);
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 5,
        transactions: 10,
        bills: 0,
        savingsGoals: 0,
        paychecks: 0,
        cache: 0,
        lastOptimized: 0,
      } as any);
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([{ id: "1" }]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([{ id: "2" }]);

      const result = await detectLocalData();

      expect(result.hasData).toBe(true);
      expect(result.totalItems).toBe(15);
      expect(result.dataTypes).toContain("envelopes");
      expect(result.dataTypes).toContain("transactions");
      expect(result.readyForCloudReset).toBe(false);
      expect(result.recommendation).toContain("safe to proceed");
    });

    it("should return correct status when no data exists", async () => {
      vi.mocked(budgetDb.isOpen).mockResolvedValue(true);
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 0,
        transactions: 0,
        bills: 0,
        savingsGoals: 0,
        paychecks: 0,
        cache: 0,
        lastOptimized: 0,
      } as any);
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      const result = await detectLocalData();

      expect(result.hasData).toBe(false);
      expect(result.totalItems).toBe(0);
      expect(result.readyForCloudReset).toBe(true);
      expect(result.recommendation).toContain("operations should be restricted");
    });

    it("should attempt to open the database if not open", async () => {
      vi.mocked(budgetDb.isOpen).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 0,
        transactions: 0,
      } as any);
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      await detectLocalData();

      expect(budgetDb.open).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("DB Error");
      vi.mocked(budgetDb.isOpen).mockResolvedValue(true);
      vi.mocked(budgetDb.getDatabaseStats).mockRejectedValue(error);

      const result = await detectLocalData();

      expect(result.hasData).toBe(false);
      expect(result.exception).toBe("DB Error");
      expect(result.details.error).toBe("DB Error");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("hasLocalData", () => {
    it("should return true if envelopes exist", async () => {
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 1,
        transactions: 0,
      } as any);
      const result = await hasLocalData();
      expect(result).toBe(true);
    });

    it("should return true if transactions exist", async () => {
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 0,
        transactions: 1,
      } as any);
      const result = await hasLocalData();
      expect(result).toBe(true);
    });

    it("should return false if no data exists", async () => {
      vi.mocked(budgetDb.getDatabaseStats).mockResolvedValue({
        envelopes: 0,
        transactions: 0,
      } as any);
      const result = await hasLocalData();
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      vi.mocked(budgetDb.getDatabaseStats).mockRejectedValue(new Error("Fail"));
      const result = await hasLocalData();
      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
