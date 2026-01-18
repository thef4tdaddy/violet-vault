/**
 * Backup Schema Tests
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
  const now = Date.now();

  describe("BackupDataSchema", () => {
    const validEnvelope = {
      id: "env-1",
      name: "Groceries",
      category: "Food",
      type: "standard",
      archived: false,
      lastModified: now,
    };

    const validTransaction = {
      id: "txn-1",
      date: new Date().toISOString(),
      amount: -50,
      envelopeId: "env-1",
      category: "Food",
      type: "expense",
      lastModified: now,
    };

    it("should validate complete backup data", () => {
      const validBackupData = {
        envelopes: [validEnvelope],
        transactions: [validTransaction],
        bills: [],
        debts: [],
        paycheckHistory: [],
        metadata: { someKey: "someValue" },
        timestamp: now,
      };

      const result = BackupDataSchema.safeParse(validBackupData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid envelope in array", () => {
      const invalidBackupData = {
        envelopes: [{ id: "", name: "" }], // Missing type and empty id
        transactions: [],
        timestamp: now,
      };

      const result = BackupDataSchema.safeParse(invalidBackupData);
      expect(result.success).toBe(false);
    });
  });

  describe("AutoBackupSchema", () => {
    const validAutoBackup = {
      id: "backup-123",
      timestamp: now,
      type: "sync_triggered" as const,
      syncType: "firebase" as const,
    };

    it("should validate a basic auto backup", () => {
      const result = AutoBackupSchema.safeParse(validAutoBackup);
      expect(result.success).toBe(true);
    });
  });

  describe("validateBackupData", () => {
    it("should return validated backup data for valid input", () => {
      const validData = {
        envelopes: [],
        transactions: [],
        timestamp: now,
      };

      const result = validateBackupData(validData);
      expect(result.timestamp).toBe(now);
    });
  });
});
