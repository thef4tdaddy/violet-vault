/**
 * Auto Backup Domain Schema
 * Runtime validation for automatic backup entries
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 * Enhanced for Issue #1342: Backup/Restore Validation Enhancement
 */

import { z } from "zod";
import { EnvelopeSchema } from "./envelope";
import { TransactionSchema } from "./transaction";
import { BillSchema } from "./bill";
import { DebtSchema } from "./debt";
import { PaycheckHistorySchema } from "./paycheck-history";

/**
 * Backup type enum
 */
export const BackupTypeSchema = z.enum(["manual", "scheduled", "sync_triggered"]);
export type BackupType = z.infer<typeof BackupTypeSchema>;

/**
 * Sync type enum
 */
export const SyncTypeSchema = z.enum(["firebase", "export", "import"]).optional();
export type SyncType = z.infer<typeof SyncTypeSchema>;

/**
 * Backup metadata schema for tracking backup statistics
 */
export const BackupMetadataSchema = z.object({
  totalRecords: z.number().int().min(0),
  sizeEstimate: z.number().int().min(0),
  duration: z.number().int().min(0),
  version: z.string(),
});
export type BackupMetadata = z.infer<typeof BackupMetadataSchema>;

/**
 * BackupDataSchema - Validates complete backup data structure
 * All savings goals and supplemental accounts are stored as envelopes with envelopeType
 * Part of Issue #1342: Backup/Restore Validation Enhancement
 */
export const BackupDataSchema = z.object({
  envelopes: z.array(EnvelopeSchema).default([]),
  transactions: z.array(TransactionSchema).default([]),
  bills: z.array(BillSchema).default([]),
  debts: z.array(DebtSchema).default([]),
  paycheckHistory: z.array(PaycheckHistorySchema).default([]),
  metadata: z.unknown().optional(),
  timestamp: z.number().int().positive("Timestamp must be a positive number"),
});
export type BackupData = z.infer<typeof BackupDataSchema>;

/**
 * Safe validation helper for BackupData - returns result with error details
 */
export const validateBackupDataSafe = (data: unknown) => {
  return BackupDataSchema.safeParse(data);
};

/**
 * Validation helper for BackupData - throws on invalid data
 */
export const validateBackupData = (data: unknown): BackupData => {
  return BackupDataSchema.parse(data);
};

/**
 * Zod schema for AutoBackup validation
 * Represents a backup snapshot of budget data
 */
export const AutoBackupSchema = z.object({
  id: z.string().min(1, "Backup ID is required"),
  timestamp: z.number().int().positive("Timestamp must be a positive number"),
  type: BackupTypeSchema,
  syncType: SyncTypeSchema,
  size: z.number().int().min(0).optional(),
  checksum: z.string().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Type inference from schema
 */
export type AutoBackup = z.infer<typeof AutoBackupSchema>;

/**
 * Partial backup schema for updates
 */
export const AutoBackupPartialSchema = AutoBackupSchema.partial();
export type AutoBackupPartial = z.infer<typeof AutoBackupPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateAutoBackup = (data: unknown): AutoBackup => {
  return AutoBackupSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateAutoBackupSafe = (data: unknown) => {
  return AutoBackupSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateAutoBackupPartial = (data: unknown): AutoBackupPartial => {
  return AutoBackupPartialSchema.parse(data);
};
