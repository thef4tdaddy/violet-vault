import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import offlineDataValidator from "../offlineDataValidator";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";

// Mock dependencies
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(),
    },
    transactions: {
      orderBy: vi.fn(() => ({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => ({
            toArray: vi.fn(),
          })),
        })),
      })),
      toArray: vi.fn(),
    },
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/domain/schemas/envelope", () => ({
  validateEnvelopeSafe: vi.fn((data) => {
    if (data && typeof data === "object" && "id" in data && "name" in data) {
      return { success: true, data };
    }
    return { success: false };
  }),
}));

vi.mock("@/domain/schemas/transaction", () => ({
  validateTransactionSafe: vi.fn((data) => {
    if (data && typeof data === "object" && "id" in data && "amount" in data) {
      return { success: true, data };
    }
    return { success: false };
  }),
}));

describe("OfflineDataValidator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateOfflineReadiness", () => {
    it("should validate offline readiness with valid data", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { id: "2", name: "Gas", balance: 50 },
      ];
      const mockTransactions = [
        { id: "1", amount: 25, date: "2024-01-01" },
        { id: "2", amount: 30, date: "2024-01-02" },
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(mockTransactions);

      const result = await offlineDataValidator.validateOfflineReadiness();

      expect(result.isReady).toBe(true);
      expect(result.hasData).toBe(true);
      expect(result.totalRecords).toBe(4);
      expect(result.totalValidRecords).toBe(4);
      expect(result.totalInvalidRecords).toBe(0);
      expect(result.criticalDataAvailable.envelopes.count).toBe(2);
      expect(result.criticalDataAvailable.transactions.count).toBe(2);
      expect(result.recommendations).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });

    it("should report not ready when no envelopes exist", async () => {
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      const result = await offlineDataValidator.validateOfflineReadiness();

      expect(result.isReady).toBe(false);
      expect(result.hasData).toBe(false);
      expect(result.totalRecords).toBe(0);
      expect(result.recommendations).toHaveLength(1);
      expect(result.recommendations[0].type).toBe("warning");
      expect(result.recommendations[0].message).toContain("No envelopes found");
    });

    it("should detect invalid records and report warnings", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { invalid: "data" }, // Invalid envelope
      ];
      const mockTransactions = [{ id: "1", amount: 25, date: "2024-01-01" }];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(mockTransactions);

      const result = await offlineDataValidator.validateOfflineReadiness();

      expect(result.isReady).toBe(false); // Not ready because of invalid records
      expect(result.totalInvalidRecords).toBe(1);
      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "warning",
            message: expect.stringContaining("invalid record"),
          }),
        ])
      );
    });

    it("should handle database errors gracefully", async () => {
      const dbError = new Error("Database connection failed");
      vi.mocked(budgetDb.envelopes.toArray).mockRejectedValue(dbError);

      const result = await offlineDataValidator.validateOfflineReadiness();

      expect(result.isReady).toBe(false);
      expect(result.error).toBeUndefined();
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should include lastValidated timestamp", async () => {
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      const beforeValidation = new Date().toISOString();
      const result = await offlineDataValidator.validateOfflineReadiness();
      const afterValidation = new Date().toISOString();

      expect(result.lastValidated).toBeDefined();
      expect(result.lastValidated >= beforeValidation).toBe(true);
      expect(result.lastValidated <= afterValidation).toBe(true);
    });
  });

  describe("getTableCountWithValidation", () => {
    it("should count valid envelopes correctly", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { id: "2", name: "Gas", balance: 50 },
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);

      const result = await offlineDataValidator.getTableCountWithValidation("envelopes");

      expect(result.count).toBe(2);
      expect(result.validCount).toBe(2);
      expect(result.invalidCount).toBe(0);
    });

    it("should count valid transactions correctly", async () => {
      const mockTransactions = [
        { id: "1", amount: 25, date: "2024-01-01" },
        { id: "2", amount: 30, date: "2024-01-02" },
      ];

      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(mockTransactions);

      const result = await offlineDataValidator.getTableCountWithValidation("transactions");

      expect(result.count).toBe(2);
      expect(result.validCount).toBe(2);
      expect(result.invalidCount).toBe(0);
    });

    it("should separate valid and invalid records", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { invalid: "envelope" },
        { id: "2", name: "Gas", balance: 50 },
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);

      const result = await offlineDataValidator.getTableCountWithValidation("envelopes");

      expect(result.count).toBe(3);
      expect(result.validCount).toBe(2);
      expect(result.invalidCount).toBe(1);
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(budgetDb.envelopes.toArray).mockRejectedValue(new Error("DB Error"));

      const result = await offlineDataValidator.getTableCountWithValidation("envelopes");

      expect(result.count).toBe(0);
      expect(result.validCount).toBe(0);
      expect(result.invalidCount).toBe(0);
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should handle validation errors for individual records", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { throwError: true }, // Will throw during validation
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);

      const result = await offlineDataValidator.getTableCountWithValidation("envelopes");

      expect(result.count).toBe(2);
      expect(result.validCount).toBe(1);
      expect(result.invalidCount).toBe(1);
    });
  });

  describe("validateDataBeforeStorage", () => {
    it("should validate all data as valid", async () => {
      const data = {
        envelopes: [
          { id: "1", name: "Groceries", balance: 100 },
          { id: "2", name: "Gas", balance: 50 },
        ],
        transactions: [{ id: "1", amount: 25, date: "2024-01-01" }],
      };

      const result = await offlineDataValidator.validateDataBeforeStorage(data);

      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(2);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.invalidCounts.envelopes).toBe(0);
      expect(result.invalidCounts.transactions).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid envelopes", async () => {
      const data = {
        envelopes: [{ id: "1", name: "Groceries", balance: 100 }, { invalid: "envelope" }],
      };

      const result = await offlineDataValidator.validateDataBeforeStorage(data);

      expect(result.isValid).toBe(false);
      expect(result.validCounts.envelopes).toBe(1);
      expect(result.invalidCounts.envelopes).toBe(1);
    });

    it("should detect invalid transactions", async () => {
      const data = {
        transactions: [{ id: "1", amount: 25, date: "2024-01-01" }, { invalid: "transaction" }],
      };

      const result = await offlineDataValidator.validateDataBeforeStorage(data);

      expect(result.isValid).toBe(false);
      expect(result.validCounts.transactions).toBe(1);
      expect(result.invalidCounts.transactions).toBe(1);
    });

    it("should handle empty data gracefully", async () => {
      const result = await offlineDataValidator.validateDataBeforeStorage({});

      expect(result.isValid).toBe(true);
      expect(result.validCounts.envelopes).toBe(0);
      expect(result.validCounts.transactions).toBe(0);
    });

    it("should accumulate all validation errors", async () => {
      const data = {
        envelopes: [{ invalid: "envelope1" }, { invalid: "envelope2" }],
        transactions: [{ invalid: "transaction1" }],
      };

      const result = await offlineDataValidator.validateDataBeforeStorage(data);

      expect(result.isValid).toBe(false);
      expect(result.invalidCounts.envelopes).toBe(2);
      expect(result.invalidCounts.transactions).toBe(1);
    });
  });

  describe("preCacheCriticalData", () => {
    it("should successfully pre-cache critical data", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 100 },
        { id: "2", name: "Gas", balance: 50 },
      ];
      const mockTransactions = [{ id: "1", amount: 25, date: "2024-01-01" }];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      const mockTransactionChain = {
        toArray: vi.fn().mockResolvedValue(mockTransactions),
      };
      vi.mocked(budgetDb.transactions.orderBy).mockReturnValue({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => mockTransactionChain),
        })),
      } as never);

      const result = await offlineDataValidator.preCacheCriticalData();

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        "📦 Critical data pre-cached for offline use",
        expect.objectContaining({
          validEnvelopes: 2,
          validTransactions: 1,
        })
      );
    });

    it("should handle database errors during pre-caching", async () => {
      const dbError = new Error("Database error");
      vi.mocked(budgetDb.envelopes.toArray).mockRejectedValue(dbError);

      const result = await offlineDataValidator.preCacheCriticalData();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
      expect(logger.error).toHaveBeenCalledWith("❌ Failed to pre-cache critical data", dbError);
    });

    it("should limit transactions to 100 most recent", async () => {
      const mockEnvelopes = [{ id: "1", name: "Test", balance: 100 }];
      const mockTransactions = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        amount: 10,
        date: `2024-01-${(i % 30) + 1}`,
      }));

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      const mockLimit = vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue(mockTransactions),
      }));
      const mockReverse = vi.fn(() => ({ limit: mockLimit }));
      vi.mocked(budgetDb.transactions.orderBy).mockReturnValue({
        reverse: mockReverse,
      } as never);

      const result = await offlineDataValidator.preCacheCriticalData();

      expect(budgetDb.transactions.orderBy).toHaveBeenCalledWith("date");
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(result.success).toBe(true);
    });

    it("should measure and log cache time", async () => {
      const mockEnvelopes = [{ id: "1", name: "Test", balance: 100 }];
      const mockTransactions = [{ id: "1", amount: 25, date: "2024-01-01" }];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      const mockTransactionChain = {
        toArray: vi.fn().mockResolvedValue(mockTransactions),
      };
      vi.mocked(budgetDb.transactions.orderBy).mockReturnValue({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => mockTransactionChain),
        })),
      } as never);

      await offlineDataValidator.preCacheCriticalData();

      expect(logger.info).toHaveBeenCalledWith(
        "📦 Critical data pre-cached for offline use",
        expect.objectContaining({
          cacheTimeMs: expect.any(Number),
        })
      );
    });

    it("should filter out invalid envelopes and transactions", async () => {
      const mockEnvelopes = [{ id: "1", name: "Valid", balance: 100 }, { invalid: "envelope" }];
      const mockTransactions = [
        { id: "1", amount: 25, date: "2024-01-01" },
        { invalid: "transaction" },
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      const mockTransactionChain = {
        toArray: vi.fn().mockResolvedValue(mockTransactions),
      };
      vi.mocked(budgetDb.transactions.orderBy).mockReturnValue({
        reverse: vi.fn(() => ({
          limit: vi.fn(() => mockTransactionChain),
        })),
      } as never);

      const result = await offlineDataValidator.preCacheCriticalData();

      expect(result.success).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(
        "📦 Critical data pre-cached for offline use",
        expect.objectContaining({
          validEnvelopes: 1,
          validTransactions: 1,
        })
      );
    });
  });

  describe("data integrity during offline/online transitions", () => {
    it("should maintain data consistency when validating multiple times", async () => {
      const mockEnvelopes = [{ id: "1", name: "Groceries", balance: 100 }];
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      const result1 = await offlineDataValidator.validateOfflineReadiness();
      const result2 = await offlineDataValidator.validateOfflineReadiness();

      expect(result1.totalRecords).toBe(result2.totalRecords);
      expect(result1.totalValidRecords).toBe(result2.totalValidRecords);
      expect(result1.isReady).toBe(result2.isReady);
    });

    it("should detect data changes between validations", async () => {
      const mockEnvelopes1 = [{ id: "1", name: "Groceries", balance: 100 }];
      const mockEnvelopes2 = [
        { id: "1", name: "Groceries", balance: 100 },
        { id: "2", name: "Gas", balance: 50 },
      ];

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValueOnce(mockEnvelopes1);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);

      const result1 = await offlineDataValidator.validateOfflineReadiness();

      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValueOnce(mockEnvelopes2);
      const result2 = await offlineDataValidator.validateOfflineReadiness();

      expect(result1.totalRecords).toBe(1);
      expect(result2.totalRecords).toBe(2);
    });
  });
});
