/**
 * Automatic Backup Service - Safety net before cloud operations
 * Consolidated for Data Unification v2.0
 */

import logger from "@/utils/core/common/logger";
import { budgetDb } from "@/db/budgetDb";
import type { BudgetRecord } from "@/db/types";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import { validateTransactionSafe } from "@/domain/schemas/transaction";
import { trackBackup } from "@/utils/platform/monitoring/performanceMonitor";
import type { Envelope, Transaction, AuditLogEntry, AutoBackup } from "@/db/types";

/**
 * Validation result for restore items
 */
interface RestoreValidationResult<T> {
  validItems: T[];
  skippedCount: number;
}

/**
 * Helper function to validate items during restore and log warnings for invalid items
 */
const validateRestoreItems = <T>(
  items: unknown[] | undefined,
  validator: (item: unknown) => { success: boolean; error?: { issues?: unknown[] } },
  itemType: string
): RestoreValidationResult<T> => {
  const validItems: T[] = [];
  let skippedCount = 0;

  if (!items?.length) return { validItems, skippedCount };

  for (const item of items) {
    const result = validator(item);
    if (result.success) {
      validItems.push(item as T);
    } else {
      skippedCount++;
      logger.warn(`⚠️ Skipping invalid ${itemType} during restore`, {
        [`${itemType}Id`]: (item as { id?: string })?.id ?? "unknown",
        errors: result.error?.issues,
      });
    }
  }

  return { validItems, skippedCount };
};

/**
 * Backup data structure for v2.0 data model
 */
interface BackupData {
  envelopes: Envelope[];
  transactions: Transaction[];
  auditLog: AuditLogEntry[];
  metadata: unknown;
  timestamp: number;
  // Deprecated fields kept empty for transition if needed
  bills?: unknown[];
  debts?: unknown[];
  paycheckHistory?: unknown[];
}

interface BackupMetadata {
  totalRecords: number;
  sizeEstimate: number;
  duration?: number;
  version: string;
}

interface Backup {
  id: string;
  type: "manual" | "scheduled" | "sync_triggered";
  syncType?: "firebase" | "export" | "import";
  timestamp: number;
  data?: BackupData;
  metadata?: BackupMetadata;
  size?: number;
  checksum?: string;
}

class AutoBackupService {
  private maxBackups: number;
  private backupPrefix: string;
  private isEnabled: boolean;

  constructor() {
    this.maxBackups = 5;
    this.backupPrefix = "auto_backup_";
    this.isEnabled = true;
  }

  /**
   * Create automatic backup before sync operation
   */
  async createPreSyncBackup(syncType = "unknown"): Promise<string | null> {
    if (!this.isEnabled) {
      logger.debug("Auto backup disabled, skipping");
      return null;
    }

    const backupId = `${this.backupPrefix}${syncType}_${Date.now()}`;

    try {
      logger.debug("📦 Creating automatic pre-sync backup", { backupId, syncType });

      const backupResult = await trackBackup(
        "create",
        async () => {
          const backupData = await this.collectAllData();
          const totalRecords = this.countRecords(backupData);
          const sizeEstimate = JSON.stringify(backupData).length;

          const backup: Backup = {
            id: backupId,
            type: "sync_triggered",
            syncType: syncType as "firebase" | "export" | "import" | undefined,
            timestamp: Date.now(),
            data: backupData,
            metadata: {
              totalRecords,
              sizeEstimate,
              version: "2.0",
            },
          };

          await this.storeBackup(backup);
          await this.cleanupOldBackups();

          return { backup, totalRecords, sizeEstimate };
        },
        { backup_type: "pre_sync", sync_type: syncType }
      );

      logger.production("📦 Auto backup created successfully", {
        backupId,
        records: backupResult.totalRecords,
        size: this.formatSize(backupResult.sizeEstimate),
      });

      return backupId;
    } catch (error) {
      logger.error("❌ Failed to create automatic backup", {
        backupId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Collect all data for backup (v2.0 data model)
   */
  async collectAllData(): Promise<BackupData> {
    const [envelopes, transactions, auditLog, metadata] = await Promise.all([
      budgetDb.envelopes.toArray(),
      budgetDb.transactions.toArray(),
      budgetDb.auditLog.toArray(),
      budgetDb.budget.get("metadata"),
    ]);

    return {
      envelopes: envelopes || [],
      transactions: transactions || [],
      auditLog: auditLog || [],
      metadata: metadata || {},
      timestamp: Date.now(),
      bills: [],
      debts: [],
      paycheckHistory: [],
    };
  }

  /**
   * Store backup in IndexedDB
   */
  async storeBackup(backup: Backup): Promise<void> {
    try {
      await budgetDb.autoBackups.put(backup as unknown as AutoBackup);
    } catch (error) {
      logger.error("Failed to store backup in IndexedDB", error);
      throw error;
    }
  }

  /**
   * Get all stored backups
   */
  async getBackups(): Promise<Backup[]> {
    try {
      const backups = await budgetDb.autoBackups.orderBy("timestamp").reverse().toArray();
      return backups as unknown as Backup[];
    } catch {
      return [];
    }
  }

  /**
   * Restore data from backup (v2.0 data model)
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      logger.warn("🔄 Restoring from automatic backup", { backupId });

      const backup = await budgetDb.autoBackups.get(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      const data = (backup as unknown as Backup).data;

      await trackBackup(
        "restore",
        async () => {
          const envelopeResult = validateRestoreItems<Envelope>(
            data?.envelopes,
            validateEnvelopeSafe,
            "envelope"
          );
          const transactionResult = validateRestoreItems<Transaction>(
            data?.transactions,
            validateTransactionSafe,
            "transaction"
          );

          await budgetDb.transaction(
            "rw",
            [budgetDb.envelopes, budgetDb.transactions, budgetDb.auditLog, budgetDb.budget],
            async () => {
              await budgetDb.envelopes.clear();
              await budgetDb.transactions.clear();
              await budgetDb.auditLog.clear();

              if (envelopeResult.validItems.length)
                await budgetDb.envelopes.bulkAdd(envelopeResult.validItems);
              if (transactionResult.validItems.length)
                await budgetDb.transactions.bulkAdd(transactionResult.validItems);

              if (data?.metadata) {
                await budgetDb.budget.put({
                  id: "metadata",
                  ...(data.metadata as Record<string, unknown>),
                  lastModified: Date.now(),
                } as BudgetRecord);
              }
            }
          );

          return {
            envelopesRestored: envelopeResult.validItems.length,
            transactionsRestored: transactionResult.validItems.length,
          };
        },
        { backup_id: backupId }
      );

      return true;
    } catch (error) {
      logger.error("❌ Failed to restore from backup", {
        backupId,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await budgetDb.autoBackups.orderBy("timestamp").reverse().toArray();
      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups).map((b) => b.id);
        await budgetDb.autoBackups.bulkDelete(toDelete);
      }
    } catch (error) {
      logger.error("Failed to cleanup old backups", error);
    }
  }

  /**
   * Helper: Count total records
   */
  countRecords(data: BackupData): number {
    return (data.envelopes?.length || 0) + (data.transactions?.length || 0);
  }

  /**
   * Helper: Format byte size
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const autoBackupService = new AutoBackupService();
export default autoBackupService;
