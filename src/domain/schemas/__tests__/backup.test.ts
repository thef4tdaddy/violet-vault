/**
 * Backup Schema Tests
 * Tests for backup validation schemas including BackupDataSchema
 * Part of Issue #1342: Backup/Restore Validation Enhancement
 */

import { describe, it, expect } from "vitest";
import {
  BackupTypeSchema,
  SyncTypeSchema,
  BackupMetadataSchema,
  BackupDataSchema,
  AutoBackupSchema,
  validateBackupData,
  validateBackupDataSafe,
  validateAutoBackup,
  validateAutoBackupSafe,
} from "../backup";

describe("Backup Schema Tests", () => {
  describe("BackupTypeSchema", () => {
    it("should validate valid backup types", () => {
      expect(BackupTypeSchema.parse("manual")).toBe("manual");
      expect(BackupTypeSchema.parse("scheduled")).toBe("scheduled");
      expect(BackupTypeSchema.parse("sync_triggered")).toBe("sync_triggered");
    });

    it("should reject invalid backup types", () => {
      expect(() => BackupTypeSchema.parse("invalid")).toThrow();
    });
  });

  describe("SyncTypeSchema", () => {
    it("should validate valid sync types", () => {
      expect(SyncTypeSchema.parse("firebase")).toBe("firebase");
      expect(SyncTypeSchema.parse("export")).toBe("export");
      expect(SyncTypeSchema.parse("import")).toBe("import");
    });

    it("should accept undefined", () => {
      expect(SyncTypeSchema.parse(undefined)).toBeUndefined();
    });

    it("should reject invalid sync types", () => {
      expect(() => SyncTypeSchema.parse("invalid")).toThrow();
    });
  });

  describe("BackupMetadataSchema", () => {
    it("should validate valid backup metadata", () => {
      const validMetadata = {
        totalRecords: 100,
        sizeEstimate: 50000,
        duration: 1500,
        version: "2.0",
      };

      const result = BackupMetadataSchema.safeParse(validMetadata);
      expect(result.success).toBe(true);
    });

    it("should reject negative values", () => {
      const invalidMetadata = {
        totalRecords: -1,
        sizeEstimate: 50000,
        duration: 1500,
        version: "2.0",
      };

      const result = BackupMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidMetadata = {
        totalRecords: 100,
        sizeEstimate: 50000,
      };

      const result = BackupMetadataSchema.safeParse(invalidMetadata);
      expect(result.success).toBe(false);
    });
  });

  describe("BackupDataSchema", () => {
    const validEnvelope = {
      id: "env-1",
      name: "Groceries",
      category: "Food",
      archived: false,
      lastModified: Date.now(),
    };

    const validTransaction = {
      id: "txn-1",
      date: new Date().toISOString(),
      amount: -50,
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: Date.now(),
    };

    const validBill = {
      id: "bill-1",
      name: "Electric",
      dueDate: new Date().toISOString(),
      amount: 100,
      category: "Utilities",
      isPaid: false,
      isRecurring: true,
      lastModified: Date.now(),
    };

    const validDebt = {
      id: "debt-1",
      name: "Credit Card",
      creditor: "Bank",
      type: "credit_card",
      status: "active",
      currentBalance: 1000,
      minimumPayment: 50,
      lastModified: Date.now(),
    };

    const validPaycheckHistory = {
      id: "paycheck-1",
      processedAt: new Date().toISOString(),
      amount: 2000,
      payerName: "Employer",
      lastModified: Date.now(),
    };

    it("should validate complete backup data", () => {
      const validBackupData = {
        envelopes: [validEnvelope],
        transactions: [validTransaction],
        bills: [validBill],
        debts: [validDebt],
        paycheckHistory: [validPaycheckHistory],
        metadata: { someKey: "someValue" },
        timestamp: Date.now(),
      };

      const result = BackupDataSchema.safeParse(validBackupData);
      expect(result.success).toBe(true);
    });

    it("should validate backup data with empty arrays", () => {
      const emptyBackupData = {
        envelopes: [],
        transactions: [],
        bills: [],
        debts: [],
        paycheckHistory: [],
        timestamp: Date.now(),
      };

      const result = BackupDataSchema.safeParse(emptyBackupData);
      expect(result.success).toBe(true);
    });

    it("should apply default empty arrays", () => {
      const minimalBackupData = {
        timestamp: Date.now(),
      };

      const result = BackupDataSchema.safeParse(minimalBackupData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.envelopes).toEqual([]);
        expect(result.data.transactions).toEqual([]);
        expect(result.data.bills).toEqual([]);
        expect(result.data.debts).toEqual([]);
        expect(result.data.paycheckHistory).toEqual([]);
      }
    });

    it("should reject invalid timestamp", () => {
      const invalidBackupData = {
        envelopes: [],
        transactions: [],
        bills: [],
        debts: [],
        paycheckHistory: [],
        timestamp: -1,
      };

      const result = BackupDataSchema.safeParse(invalidBackupData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid envelope in array", () => {
      const invalidBackupData = {
        envelopes: [{ id: "", name: "" }], // Invalid envelope
        transactions: [],
        bills: [],
        debts: [],
        paycheckHistory: [],
        timestamp: Date.now(),
      };

      const result = BackupDataSchema.safeParse(invalidBackupData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid transaction in array", () => {
      const invalidBackupData = {
        envelopes: [],
        transactions: [{ id: "", amount: "not-a-number" }], // Invalid transaction
        bills: [],
        debts: [],
        paycheckHistory: [],
        timestamp: Date.now(),
      };

      const result = BackupDataSchema.safeParse(invalidBackupData);
      expect(result.success).toBe(false);
    });
  });

  describe("AutoBackupSchema", () => {
    const validAutoBackup = {
      id: "backup-123",
      timestamp: Date.now(),
      type: "sync_triggered" as const,
      syncType: "firebase" as const,
    };

    it("should validate a basic auto backup", () => {
      const result = AutoBackupSchema.safeParse(validAutoBackup);
      expect(result.success).toBe(true);
    });

    it("should validate auto backup with all optional fields", () => {
      const fullAutoBackup = {
        ...validAutoBackup,
        size: 50000,
        checksum: "abc123",
        metadata: { key: "value" },
      };

      const result = AutoBackupSchema.safeParse(fullAutoBackup);
      expect(result.success).toBe(true);
    });

    it("should reject empty backup id", () => {
      const invalidAutoBackup = { ...validAutoBackup, id: "" };
      const result = AutoBackupSchema.safeParse(invalidAutoBackup);
      expect(result.success).toBe(false);
    });

    it("should reject negative timestamp", () => {
      const invalidAutoBackup = { ...validAutoBackup, timestamp: -1 };
      const result = AutoBackupSchema.safeParse(invalidAutoBackup);
      expect(result.success).toBe(false);
    });

    it("should reject invalid backup type", () => {
      const invalidAutoBackup = { ...validAutoBackup, type: "invalid" };
      const result = AutoBackupSchema.safeParse(invalidAutoBackup);
      expect(result.success).toBe(false);
    });
  });

  describe("validateBackupData", () => {
    it("should return validated backup data for valid input", () => {
      const validData = {
        envelopes: [],
        transactions: [],
        bills: [],
        debts: [],
        paycheckHistory: [],
        timestamp: Date.now(),
      };

      const result = validateBackupData(validData);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it("should throw error for invalid backup data", () => {
      const invalidData = { timestamp: -1 };
      expect(() => validateBackupData(invalidData)).toThrow();
    });
  });

  describe("validateBackupDataSafe", () => {
    it("should return success for valid backup data", () => {
      const validData = {
        timestamp: Date.now(),
      };

      const result = validateBackupDataSafe(validData);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid backup data", () => {
      const invalidData = { timestamp: -1 };
      const result = validateBackupDataSafe(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("validateAutoBackup", () => {
    it("should return validated auto backup for valid input", () => {
      const validData = {
        id: "backup-1",
        timestamp: Date.now(),
        type: "manual",
      };

      const result = validateAutoBackup(validData);
      expect(result.id).toBe("backup-1");
    });

    it("should throw error for invalid auto backup", () => {
      const invalidData = { id: "", timestamp: -1 };
      expect(() => validateAutoBackup(invalidData)).toThrow();
    });
  });

  describe("validateAutoBackupSafe", () => {
    it("should return success for valid auto backup", () => {
      const validData = {
        id: "backup-1",
        timestamp: Date.now(),
        type: "scheduled",
      };

      const result = validateAutoBackupSafe(validData);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid auto backup", () => {
      const invalidData = { id: "" };
      const result = validateAutoBackupSafe(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
