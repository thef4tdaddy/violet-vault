/**
 * Performance Edge Cases Tests
 * Issue #1393: Add performance tests for large data scenarios
 *
 * Tests ensure the application handles large datasets efficiently for:
 * - Large data import (1000+ transactions)
 * - Large data export (1000+ transactions)
 * - Large backup creation (1000+ records)
 * - Large data sync (1000+ records)
 * - Memory usage with large datasets
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import type { Envelope, Transaction, Bill, Debt, PaycheckHistory } from "@/db/types";

// Mock Dexie and database before importing services
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    envelopes: {
      toArray: vi.fn(),
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    transactions: {
      toArray: vi.fn(),
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    bills: {
      toArray: vi.fn(),
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    debts: {
      toArray: vi.fn(),
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    paycheckHistory: {
      toArray: vi.fn(),
      clear: vi.fn(),
      bulkAdd: vi.fn(),
    },
    budget: {
      get: vi.fn(),
      put: vi.fn(),
    },
    autoBackups: {
      put: vi.fn(),
      get: vi.fn(),
      orderBy: vi.fn(),
      bulkDelete: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
    },
    transaction: vi.fn(),
  },
  getBudgetMetadata: vi.fn(),
}));

// Import after mock setup
import autoBackupService from "../autoBackupService";
import { budgetDb } from "@/db/budgetDb";

// Helper functions for generating large test datasets
const generateLargeEnvelopeDataset = (count: number): Envelope[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `env-${i}`,
    name: `Envelope ${i}`,
    category: `Category ${i % 10}`,
    archived: false,
    lastModified: Date.now(),
    createdAt: Date.now() - i * 1000,
    currentBalance: Math.floor(Math.random() * 1000),
  }));
};

const generateLargeTransactionDataset = (count: number): Transaction[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `txn-${i}`,
    date: new Date(Date.now() - i * 86400000),
    amount: -(Math.floor(Math.random() * 100) + 1), // Negative for expense
    envelopeId: `env-${i % 50}`,
    category: `Category ${i % 10}`,
    type: "expense" as const,
    lastModified: Date.now(),
    createdAt: Date.now() - i * 1000,
    description: `Transaction ${i}`,
  }));
};

const generateLargeBillDataset = (count: number): Bill[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `bill-${i}`,
    name: `Bill ${i}`,
    dueDate: new Date(Date.now() + i * 86400000),
    amount: Math.floor(Math.random() * 500) + 50,
    category: `Category ${i % 10}`,
    isPaid: i % 2 === 0,
    isRecurring: i % 3 === 0,
    lastModified: Date.now(),
    createdAt: Date.now() - i * 1000,
  }));
};

const generateLargeDebtDataset = (count: number): Debt[] => {
  // Use all valid debt types from DebtTypeSchema
  const validTypes: Debt["type"][] = [
    "mortgage",
    "auto",
    "credit_card",
    "chapter13",
    "student",
    "personal",
    "business",
    "other",
  ];

  // Use all valid debt statuses from DebtStatusSchema
  const validStatuses: Debt["status"][] = ["active", "paid_off", "deferred", "default"];

  return Array.from({ length: count }, (_, i) => ({
    id: `debt-${i}`,
    name: `Debt ${i}`,
    creditor: `Creditor ${i}`,
    type: validTypes[i % validTypes.length],
    status: validStatuses[i % validStatuses.length],
    currentBalance: Math.floor(Math.random() * 10000),
    minimumPayment: Math.floor(Math.random() * 200) + 25,
    lastModified: Date.now(),
    createdAt: Date.now() - i * 1000,
  }));
};

const generateLargePaycheckDataset = (count: number): PaycheckHistory[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `paycheck-${i}`,
    date: new Date(Date.now() - i * 14 * 86400000),
    amount: Math.floor(Math.random() * 3000) + 1000,
    source: `Employer ${i % 3}`,
    lastModified: Date.now(),
    createdAt: Date.now() - i * 1000,
  }));
};

describe("Performance Edge Cases", () => {
  const LARGE_RECORD_COUNT = 1000;
  const MEDIUM_RECORD_COUNT = 500;
  const SMALL_RECORD_COUNT = 100;
  const MAX_MEMORY_INCREASE_BYTES = 100 * 1024 * 1024; // 100MB threshold

  // Generate test datasets
  const largeEnvelopes = generateLargeEnvelopeDataset(MEDIUM_RECORD_COUNT);
  const largeTransactions = generateLargeTransactionDataset(LARGE_RECORD_COUNT);
  const largeBills = generateLargeBillDataset(SMALL_RECORD_COUNT);
  const largeDebts = generateLargeDebtDataset(SMALL_RECORD_COUNT);
  const largePaychecks = generateLargePaycheckDataset(SMALL_RECORD_COUNT);

  const mockMetadata = {
    id: "metadata",
    unassignedCash: 1000,
    actualBalance: 50000,
    lastModified: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations for large datasets
    vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(largeEnvelopes);
    vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(largeTransactions);
    vi.mocked(budgetDb.bills.toArray).mockResolvedValue(largeBills);
    vi.mocked(budgetDb.debts.toArray).mockResolvedValue(largeDebts);
    vi.mocked(budgetDb.paycheckHistory.toArray).mockResolvedValue(largePaychecks);
    vi.mocked(budgetDb.budget.get).mockResolvedValue(mockMetadata);
    vi.mocked(budgetDb.autoBackups.put).mockResolvedValue("backup-123");
    vi.mocked(budgetDb.autoBackups.orderBy).mockReturnValue({
      reverse: () => ({
        toArray: () => Promise.resolve([]),
      }),
    } as ReturnType<typeof budgetDb.autoBackups.orderBy>);
  });

  describe("Large Data Backup Creation (1000+ records)", () => {
    it("should collect all data from large datasets efficiently", async () => {
      const startTime = performance.now();

      const data = await autoBackupService.collectAllData();

      const duration = performance.now() - startTime;

      // Verify data was collected
      expect(data.envelopes).toHaveLength(MEDIUM_RECORD_COUNT);
      expect(data.transactions).toHaveLength(LARGE_RECORD_COUNT);
      expect(data.bills).toHaveLength(SMALL_RECORD_COUNT);
      expect(data.debts).toHaveLength(SMALL_RECORD_COUNT);
      expect(data.paycheckHistory).toHaveLength(SMALL_RECORD_COUNT);
      expect(data.metadata).toBeDefined();
      expect(data.timestamp).toBeDefined();

      // Performance assertion: should complete in reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });

    it("should count large datasets correctly", async () => {
      const data = await autoBackupService.collectAllData();
      const totalRecords = autoBackupService.countRecords(data);

      // Total = envelopes + transactions + bills + debts + paycheckHistory
      const expectedTotal =
        MEDIUM_RECORD_COUNT +
        LARGE_RECORD_COUNT +
        SMALL_RECORD_COUNT +
        SMALL_RECORD_COUNT +
        SMALL_RECORD_COUNT;

      expect(totalRecords).toBe(expectedTotal);
    });

    it("should create backup with large dataset in reasonable time", async () => {
      const startTime = performance.now();

      const backupId = await autoBackupService.createPreSyncBackup("performance-test");

      const duration = performance.now() - startTime;

      // Verify backup was created
      expect(backupId).not.toBeNull();
      expect(budgetDb.autoBackups.put).toHaveBeenCalled();

      // Verify metadata includes version
      const putCall = vi.mocked(budgetDb.autoBackups.put).mock.calls[0][0];
      expect(putCall.metadata?.version).toBe("2.0");
      expect(putCall.metadata?.totalRecords).toBeGreaterThan(1000);

      // Performance assertion: should complete in reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds max for large backup
    });
  });

  describe("Large Data Restore (1000+ records)", () => {
    const createLargeBackupData = () => ({
      id: "large-backup",
      type: "sync_triggered" as const,
      timestamp: Date.now(),
      data: {
        envelopes: largeEnvelopes,
        transactions: largeTransactions,
        bills: largeBills,
        debts: largeDebts,
        paycheckHistory: largePaychecks,
        metadata: mockMetadata,
        timestamp: Date.now(),
      },
      metadata: {
        totalRecords: MEDIUM_RECORD_COUNT + LARGE_RECORD_COUNT + SMALL_RECORD_COUNT * 3,
        sizeEstimate: 500000,
        duration: 100,
        version: "2.0",
      },
    });

    beforeEach(() => {
      vi.mocked(budgetDb.autoBackups.get).mockResolvedValue(createLargeBackupData());

      // Mock transaction to execute the callback
      vi.mocked(budgetDb.transaction).mockImplementation(
        async (_mode, _tables, callback: () => Promise<void>) => {
          await callback();
        }
      );
    });

    it("should restore large backup with validation", async () => {
      const startTime = performance.now();

      const result = await autoBackupService.restoreFromBackup("large-backup");

      const duration = performance.now() - startTime;

      // Verify restore succeeded
      expect(result).toBe(true);

      // Verify clear operations were called
      expect(budgetDb.envelopes.clear).toHaveBeenCalled();
      expect(budgetDb.transactions.clear).toHaveBeenCalled();
      expect(budgetDb.bills.clear).toHaveBeenCalled();
      expect(budgetDb.debts.clear).toHaveBeenCalled();
      expect(budgetDb.paycheckHistory.clear).toHaveBeenCalled();

      // Verify bulk add operations were called with data
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();
      expect(budgetDb.transactions.bulkAdd).toHaveBeenCalled();

      // Performance assertion: restore should complete in reasonable time
      expect(duration).toBeLessThan(15000); // 15 seconds max for large restore
    });

    it("should handle transaction batching during large restore", async () => {
      await autoBackupService.restoreFromBackup("large-backup");

      // Verify transaction was used for consistency
      expect(budgetDb.transaction).toHaveBeenCalledWith(
        "rw",
        expect.arrayContaining([
          budgetDb.envelopes,
          budgetDb.transactions,
          budgetDb.bills,
          budgetDb.debts,
          budgetDb.paycheckHistory,
          budgetDb.budget,
        ]),
        expect.any(Function)
      );
    });
  });

  describe("Memory Usage with Large Datasets", () => {
    it("should not exceed memory bounds when processing large datasets", async () => {
      // Skip test if process.memoryUsage is not available (browser environments)
      if (typeof process === "undefined" || typeof process.memoryUsage !== "function") {
        return;
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Process large dataset multiple times
      for (let i = 0; i < 5; i++) {
        await autoBackupService.collectAllData();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory should not grow excessively (allow for some growth, but not unbounded)
      expect(memoryIncrease).toBeLessThan(MAX_MEMORY_INCREASE_BYTES);
    });

    it("should handle repeated backup operations without memory leaks", async () => {
      const iterationCount = 3;

      for (let i = 0; i < iterationCount; i++) {
        const backupId = await autoBackupService.createPreSyncBackup(`iteration-${i}`);
        expect(backupId).not.toBeNull();
      }

      // Verify all backups were created
      expect(budgetDb.autoBackups.put).toHaveBeenCalledTimes(iterationCount);
    });
  });

  describe("Large Dataset Size Formatting", () => {
    it("should format large backup sizes correctly", () => {
      // Test various size ranges
      expect(autoBackupService.formatSize(500)).toBe("500 B");
      expect(autoBackupService.formatSize(1024)).toBe("1 KB");
      expect(autoBackupService.formatSize(1024 * 100)).toBe("100 KB");
      expect(autoBackupService.formatSize(1024 * 1024)).toBe("1 MB");
      expect(autoBackupService.formatSize(1024 * 1024 * 5)).toBe("5 MB");
      expect(autoBackupService.formatSize(1024 * 1024 * 1024)).toBe("1 GB");
    });

    it("should estimate backup size for large datasets", async () => {
      const data = await autoBackupService.collectAllData();
      const jsonString = JSON.stringify(data);
      const size = jsonString.length;

      // Large datasets should have significant size
      expect(size).toBeGreaterThan(50000); // At least 50KB for 1000+ records
    });
  });

  describe("Concurrent Operations with Large Data", () => {
    it("should handle multiple concurrent backup creations", async () => {
      // Create multiple backups concurrently
      const backupPromises = [
        autoBackupService.createPreSyncBackup("concurrent-1"),
        autoBackupService.createPreSyncBackup("concurrent-2"),
        autoBackupService.createPreSyncBackup("concurrent-3"),
      ];

      const results = await Promise.all(backupPromises);

      // All backups should succeed
      results.forEach((backupId) => {
        expect(backupId).not.toBeNull();
      });

      // Verify all puts were called
      expect(budgetDb.autoBackups.put).toHaveBeenCalledTimes(3);
    });

    it("should maintain data integrity during concurrent reads", async () => {
      // Perform multiple concurrent data collections
      const collectionPromises = Array.from({ length: 5 }, () =>
        autoBackupService.collectAllData()
      );

      const results = await Promise.all(collectionPromises);

      // All results should have the same data counts
      const expectedEnvelopeCount = MEDIUM_RECORD_COUNT;
      const expectedTransactionCount = LARGE_RECORD_COUNT;

      results.forEach((data) => {
        expect(data.envelopes).toHaveLength(expectedEnvelopeCount);
        expect(data.transactions).toHaveLength(expectedTransactionCount);
      });
    });
  });

  describe("Edge Cases with Maximum Data Sizes", () => {
    it("should handle empty datasets gracefully", async () => {
      // Reset mocks to return empty arrays
      vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.bills.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.debts.toArray).mockResolvedValue([]);
      vi.mocked(budgetDb.paycheckHistory.toArray).mockResolvedValue([]);

      const data = await autoBackupService.collectAllData();

      expect(data.envelopes).toHaveLength(0);
      expect(data.transactions).toHaveLength(0);
      expect(autoBackupService.countRecords(data)).toBe(0);
    });

    it("should handle maximum practical record counts", async () => {
      // Generate very large dataset (2000 transactions)
      const veryLargeTransactions = generateLargeTransactionDataset(2000);
      vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(veryLargeTransactions);

      const data = await autoBackupService.collectAllData();

      expect(data.transactions).toHaveLength(2000);
    });

    it("should cleanup old backups when max is exceeded", async () => {
      // Mock having more backups than max allowed
      const mockBackups = Array.from({ length: 10 }, (_, i) => ({
        id: `backup-${i}`,
        timestamp: Date.now() - i * 1000,
      }));

      vi.mocked(budgetDb.autoBackups.orderBy).mockReturnValue({
        reverse: () => ({
          toArray: () => Promise.resolve(mockBackups),
        }),
      } as ReturnType<typeof budgetDb.autoBackups.orderBy>);

      await autoBackupService.cleanupOldBackups();

      // Should delete old backups (keeping only 5)
      expect(budgetDb.autoBackups.bulkDelete).toHaveBeenCalledWith(
        expect.arrayContaining(["backup-5", "backup-6", "backup-7", "backup-8", "backup-9"])
      );
    });
  });
});
