/**
 * Tests for AutoBackupService (v2.0 data model)
 * Verifies envelope-based backup/restore functionality
 * Issue #1337: Backup/Restore uses envelope-based model
 */

import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock Dexie and database before importing the service
vi.mock("../../../db/budgetDb", () => ({
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
}));

// Import after mock setup
import autoBackupService from "../autoBackupService";
import { budgetDb } from "../../../db/budgetDb";

describe("AutoBackupService (v2.0 data model)", () => {
  const mockEnvelopes = [
    {
      id: "env-1",
      name: "Groceries",
      category: "Food",
      archived: false,
      lastModified: Date.now(),
      currentBalance: 500,
    },
    {
      id: "env-2",
      name: "Vacation Fund",
      category: "Savings",
      archived: false,
      lastModified: Date.now(),
      envelopeType: "savings",
      targetAmount: 5000,
      currentBalance: 1500,
      priority: "high",
      isPaused: false,
      isCompleted: false,
    },
    {
      id: "env-3",
      name: "FSA Account",
      category: "Health",
      archived: false,
      lastModified: Date.now(),
      envelopeType: "supplemental",
      accountType: "FSA",
      annualContribution: 2850,
      isActive: true,
    },
  ];

  const mockTransactions = [
    {
      id: "txn-1",
      date: new Date(),
      amount: 50,
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: Date.now(),
    },
  ];

  const mockMetadata = {
    id: "metadata",
    unassignedCash: 200,
    actualBalance: 2500,
    lastModified: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    vi.mocked(budgetDb.envelopes.toArray).mockResolvedValue(mockEnvelopes);
    vi.mocked(budgetDb.transactions.toArray).mockResolvedValue(mockTransactions);
    vi.mocked(budgetDb.bills.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.debts.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.paycheckHistory.toArray).mockResolvedValue([]);
    vi.mocked(budgetDb.budget.get).mockResolvedValue(mockMetadata);
    vi.mocked(budgetDb.autoBackups.put).mockResolvedValue("backup-123");
    vi.mocked(budgetDb.autoBackups.orderBy).mockReturnValue({
      reverse: () => ({
        toArray: () => Promise.resolve([]),
      }),
    } as ReturnType<typeof budgetDb.autoBackups.orderBy>);
  });

  describe("collectAllData", () => {
    it("should collect all data including savings and supplemental envelopes", async () => {
      const data = await autoBackupService.collectAllData();

      expect(data.envelopes).toHaveLength(3);
      expect(data.transactions).toHaveLength(1);
      expect(data.bills).toHaveLength(0);
      expect(data.debts).toHaveLength(0);
      expect(data.paycheckHistory).toHaveLength(0);
      expect(data.metadata).toEqual(mockMetadata);
      expect(data.timestamp).toBeDefined();
    });

    it("should include all envelope types in collected data (v2.0 model)", async () => {
      const data = await autoBackupService.collectAllData();

      // Verify standard envelope
      const standardEnvelope = data.envelopes.find((e) => e.id === "env-1");
      expect(standardEnvelope?.name).toBe("Groceries");
      expect(standardEnvelope?.envelopeType).toBeUndefined();

      // Verify savings envelope
      const savingsEnvelope = data.envelopes.find((e) => e.id === "env-2");
      expect(savingsEnvelope?.name).toBe("Vacation Fund");
      expect(savingsEnvelope?.envelopeType).toBe("savings");
      expect(savingsEnvelope?.targetAmount).toBe(5000);

      // Verify supplemental envelope
      const supplementalEnvelope = data.envelopes.find((e) => e.id === "env-3");
      expect(supplementalEnvelope?.name).toBe("FSA Account");
      expect(supplementalEnvelope?.envelopeType).toBe("supplemental");
      expect(supplementalEnvelope?.accountType).toBe("FSA");
    });

    it("should not include savingsGoals in backup data (v2.0 model)", async () => {
      const data = await autoBackupService.collectAllData();

      // Verify savingsGoals property does not exist
      expect("savingsGoals" in data).toBe(false);
    });
  });

  describe("countRecords", () => {
    it("should count all records correctly (v2.0 model without savingsGoals)", () => {
      const backupData = {
        envelopes: mockEnvelopes,
        transactions: mockTransactions,
        bills: [],
        debts: [],
        paycheckHistory: [],
        metadata: mockMetadata,
        timestamp: Date.now(),
      };

      const count = autoBackupService.countRecords(backupData);

      // 3 envelopes + 1 transaction = 4 records
      expect(count).toBe(4);
    });
  });

  describe("createPreSyncBackup", () => {
    it("should create backup with v2.0 metadata version", async () => {
      const backupId = await autoBackupService.createPreSyncBackup("firebase");

      expect(backupId).not.toBeNull();
      expect(budgetDb.autoBackups.put).toHaveBeenCalled();

      // Verify the backup includes version 2.0
      const putCall = vi.mocked(budgetDb.autoBackups.put).mock.calls[0][0];
      expect(putCall.metadata?.version).toBe("2.0");
    });
  });

  describe("restoreFromBackup", () => {
    const mockBackupData = {
      id: "backup-123",
      type: "sync_triggered" as const,
      timestamp: Date.now(),
      data: {
        envelopes: mockEnvelopes,
        transactions: mockTransactions,
        bills: [],
        debts: [],
        paycheckHistory: [],
        metadata: mockMetadata,
        timestamp: Date.now(),
      },
      metadata: {
        totalRecords: 4,
        sizeEstimate: 1000,
        duration: 50,
        version: "2.0",
      },
    };

    beforeEach(() => {
      vi.mocked(budgetDb.autoBackups.get).mockResolvedValue(mockBackupData);

      // Mock transaction to execute the callback
      vi.mocked(budgetDb.transaction).mockImplementation(
        async (_mode, _tables, callback: () => Promise<void>) => {
          await callback();
        }
      );
    });

    it("should restore all envelope types from backup", async () => {
      const result = await autoBackupService.restoreFromBackup("backup-123");

      expect(result).toBe(true);
      expect(budgetDb.envelopes.clear).toHaveBeenCalled();
      expect(budgetDb.envelopes.bulkAdd).toHaveBeenCalled();

      // Verify all envelope types were restored
      const bulkAddCall = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0];
      expect(bulkAddCall).toHaveLength(3);
    });

    it("should validate envelopes with Zod schema during restore", async () => {
      // Add an invalid envelope to test validation
      const backupWithInvalidEnvelope = {
        ...mockBackupData,
        data: {
          ...mockBackupData.data,
          envelopes: [
            ...mockEnvelopes,
            {
              // Invalid: missing required fields
              id: "",
              name: "",
              category: "",
            },
          ],
        },
      };
      vi.mocked(budgetDb.autoBackups.get).mockResolvedValue(backupWithInvalidEnvelope);

      const result = await autoBackupService.restoreFromBackup("backup-123");

      expect(result).toBe(true);

      // Verify only valid envelopes were added (3 valid, 1 invalid skipped)
      const bulkAddCall = vi.mocked(budgetDb.envelopes.bulkAdd).mock.calls[0][0];
      expect(bulkAddCall).toHaveLength(3);
    });

    it("should not restore to savingsGoals table (v2.0 model)", async () => {
      await autoBackupService.restoreFromBackup("backup-123");

      // Verify savingsGoals table was not touched (no clear or bulkAdd)
      // The tables in the transaction should not include savingsGoals
      const transactionCall = vi.mocked(budgetDb.transaction).mock.calls[0];
      const tablesList = transactionCall[1];

      // Ensure savingsGoals is not in the tables list
      const tablesArray = tablesList as unknown[];
      const hassSavingsGoals = tablesArray.some(
        (table) => table && (table as { name?: string }).name === "savingsGoals"
      );
      expect(hassSavingsGoals).toBe(false);
    });
  });

  describe("formatSize", () => {
    it("should format bytes correctly", () => {
      expect(autoBackupService.formatSize(0)).toBe("0 B");
      expect(autoBackupService.formatSize(500)).toBe("500 B");
      expect(autoBackupService.formatSize(1024)).toBe("1 KB");
      expect(autoBackupService.formatSize(1048576)).toBe("1 MB");
    });
  });
});
