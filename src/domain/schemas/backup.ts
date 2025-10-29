/**
 * Auto Backup Domain Schema
 * Runtime validation for automatic backup entries
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

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
