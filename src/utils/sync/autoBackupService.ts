/**
 * Automatic Backup Service - Safety net before cloud operations
 * GitHub Issue #576 Phase 3: Automatic local backup before cloud ops
 * Updated for Issue #1337: Backup/Restore uses envelope-based model (v2.0)
 * - Savings goals are stored as envelopes with envelopeType: "savings"
 * - Supplemental accounts are stored as envelopes with envelopeType: "supplemental"
 * - No separate savingsGoals array in backup data
 */

import logger from "../common/logger";
import { budgetDb } from "../../db/budgetDb";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import type { Envelope, Transaction, Bill, Debt, PaycheckHistory } from "@/db/types";

/**
 * Backup data structure for v2.0 data model
 * All savings goals and supplemental accounts are stored as envelopes with envelopeType
 */
interface BackupData {
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Bill[];
  debts: Debt[];
  paycheckHistory: PaycheckHistory[];
  metadata: unknown;
  timestamp: number;
}

interface BackupMetadata {
  totalRecords: number;
  sizeEstimate: number;
  duration: number;
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
    this.maxBackups = 5; // Keep last 5 backups
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
      logger.debug("📦 Creating automatic pre-sync backup", {
        backupId,
        syncType,
      });

      const startTime = Date.now();
      const backupData = await this.collectAllData();
      const duration = Date.now() - startTime;

      const backup: Backup = {
        id: backupId,
        type: "sync_triggered",
        syncType: syncType as "firebase" | "export" | "import" | undefined,
        timestamp: Date.now(),
        data: backupData,
        metadata: {
          totalRecords: this.countRecords(backupData),
          sizeEstimate: JSON.stringify(backupData).length,
          duration,
          version: "2.0",
        },
      };

      // Store backup in IndexedDB
      await this.storeBackup(backup);

      // Clean up old backups
      await this.cleanupOldBackups();

      logger.production("📦 Auto backup created successfully", {
        backupId,
        records: backup.metadata?.totalRecords ?? 0,
        size: this.formatSize(backup.metadata?.sizeEstimate ?? 0),
        duration,
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
   * All savings goals and supplemental accounts are stored as envelopes with envelopeType
   */
  async collectAllData(): Promise<BackupData> {
    const [envelopes, transactions, bills, debts, paycheckHistory, metadata] = await Promise.all([
      budgetDb.envelopes.toArray(),
      budgetDb.transactions.toArray(),
      budgetDb.bills.toArray(),
      budgetDb.debts.toArray(),
      budgetDb.paycheckHistory.toArray(),
      budgetDb.budget.get("metadata"),
    ]);

    return {
      envelopes: envelopes || [],
      transactions: transactions || [],
      bills: bills || [],
      debts: debts || [],
      paycheckHistory: paycheckHistory || [],
      metadata: metadata || {},
      timestamp: Date.now(),
    };
  }

  /**
   * Store backup in IndexedDB
   */
  async storeBackup(backup: Backup): Promise<void> {
    try {
      await budgetDb.autoBackups.put(backup as unknown as import("@/db/types").AutoBackup);
      logger.debug("Backup stored in IndexedDB", { backupId: backup.id });
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
    } catch (error) {
      logger.error("Failed to retrieve backups", error);
      return [];
    }
  }

  /**
   * Restore data from backup (v2.0 data model)
   * All savings goals and supplemental accounts are restored as envelopes with envelopeType
   * Validates all restored envelopes with Zod schemas
   */
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      logger.warn("🔄 Restoring from automatic backup", { backupId });

      const backup = await budgetDb.autoBackups.get(backupId);
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }

      const data = (backup as unknown as Backup).data;

      // Validate envelopes with Zod schemas before restore
      const validatedEnvelopes: Envelope[] = [];
      if (data?.envelopes?.length) {
        for (const envelope of data.envelopes) {
          const result = validateEnvelopeSafe(envelope);
          if (result.success) {
            validatedEnvelopes.push(envelope);
          } else {
            logger.warn("⚠️ Skipping invalid envelope during restore", {
              envelopeId: (envelope as { id?: string })?.id ?? "unknown",
              errors: result.error?.issues,
            });
          }
        }
      }

      // Restore data in transaction for consistency
      await budgetDb.transaction(
        "rw",
        [
          budgetDb.envelopes,
          budgetDb.transactions,
          budgetDb.bills,
          budgetDb.debts,
          budgetDb.paycheckHistory,
          budgetDb.budget,
        ],
        async () => {
          // Clear existing data
          await budgetDb.envelopes.clear();
          await budgetDb.transactions.clear();
          await budgetDb.bills.clear();
          await budgetDb.debts.clear();
          await budgetDb.paycheckHistory.clear();

          // Restore validated envelopes (includes savings goals and supplemental accounts)
          if (validatedEnvelopes.length) await budgetDb.envelopes.bulkAdd(validatedEnvelopes);
          if (data?.transactions?.length) await budgetDb.transactions.bulkAdd(data.transactions);
          if (data?.bills?.length) await budgetDb.bills.bulkAdd(data.bills);
          if (data?.debts?.length) await budgetDb.debts.bulkAdd(data.debts);
          if (data?.paycheckHistory?.length)
            await budgetDb.paycheckHistory.bulkAdd(data.paycheckHistory);

          // Restore metadata
          if (data?.metadata) {
            await budgetDb.budget.put({
              id: "metadata",
              ...(data.metadata as Record<string, unknown>),
              lastModified: Date.now(),
            } as import("@/db/types").BudgetRecord);
          }
        }
      );

      logger.production("✅ Successfully restored from backup", {
        backupId,
        timestamp: new Date(backup.timestamp).toISOString(),
        envelopesRestored: validatedEnvelopes.length,
        envelopesSkipped: (data?.envelopes?.length || 0) - validatedEnvelopes.length,
      });

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
   * Clean up old backups (keep only the most recent ones)
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await budgetDb.autoBackups.orderBy("timestamp").reverse().toArray();

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);
        const deleteIds = toDelete.map((b) => b.id);

        await budgetDb.autoBackups.bulkDelete(deleteIds);

        logger.debug("🧹 Cleaned up old auto backups", {
          deleted: deleteIds.length,
          remaining: this.maxBackups,
        });
      }
    } catch (error) {
      logger.error("Failed to cleanup old backups", error);
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    try {
      const backups = await this.getBackups();
      const totalSize = backups.reduce(
        (sum, b) => sum + ((b.metadata?.sizeEstimate as number) || 0),
        0
      );

      return {
        count: backups.length,
        totalSize: this.formatSize(totalSize),
        oldest: backups.length > 0 ? new Date(backups[backups.length - 1].timestamp) : null,
        newest: backups.length > 0 ? new Date(backups[0].timestamp) : null,
      };
    } catch (error) {
      logger.error("Failed to get backup stats", error);
      return {
        count: 0,
        totalSize: "0 B",
        oldest: null,
        newest: null,
      };
    }
  }

  /**
   * Helper: Count total records (v2.0 data model)
   */
  countRecords(data: BackupData): number {
    return (
      (data.envelopes?.length || 0) +
      (data.transactions?.length || 0) +
      (data.bills?.length || 0) +
      (data.debts?.length || 0) +
      (data.paycheckHistory?.length || 0)
    );
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

  /**
   * Enable/disable automatic backups
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    logger.debug(`Auto backup ${enabled ? "enabled" : "disabled"}`);
  }

  /**
   * Delete specific backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      await budgetDb.autoBackups.delete(backupId);
      logger.debug("Deleted backup", { backupId });
      return true;
    } catch (error) {
      logger.error("Failed to delete backup", {
        backupId,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Delete all auto backups
   */
  async deleteAllBackups(): Promise<boolean> {
    try {
      await budgetDb.autoBackups.clear();
      logger.debug("All auto backups deleted");
      return true;
    } catch (error) {
      logger.error("Failed to delete all backups", error);
      return false;
    }
  }
}

// Global instance
export const autoBackupService = new AutoBackupService();

export default autoBackupService;
