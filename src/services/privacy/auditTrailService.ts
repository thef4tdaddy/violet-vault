/**
 * Audit Trail Service - v2.1
 * Manages privacy audit logs for analytics API calls
 * Stores logs in IndexedDB with LRU eviction (max 1000 entries)
 */

import Dexie, { Table } from "dexie";
import type { AuditLogEntry } from "@/types/privacyAudit";
import logger from "@/utils/core/common/logger";

const DB_NAME = "privacy-audit";
const DB_VERSION = 1;
const STORE_NAME = "auditLogs";
const MAX_ENTRIES = 1000;

/**
 * Dexie database for audit logs
 */
class AuditDB extends Dexie {
  auditLogs!: Table<AuditLogEntry, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      auditLogs: "id, timestamp",
    });
  }
}

/**
 * Service for managing audit trail logs
 */
class AuditTrailService {
  private db: AuditDB;
  private initialized = false;

  constructor() {
    this.db = new AuditDB();
  }

  /**
   * Initialize the database
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.db.open();
      this.initialized = true;
      logger.info("✅ Audit trail database initialized");
    } catch (error) {
      logger.error("Failed to initialize audit trail database", error);
      throw error;
    }
  }

  /**
   * Log an API call to the audit trail
   */
  async logApiCall(entry: Omit<AuditLogEntry, "id">): Promise<AuditLogEntry> {
    await this.init();

    const logEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      ...entry,
    };

    try {
      await this.db.auditLogs.add(logEntry);
      logger.debug("📝 Logged API call to audit trail", {
        endpoint: entry.endpoint,
        success: entry.success,
      });

      // Enforce max entries (LRU eviction)
      await this.enforceMaxEntries();

      return logEntry;
    } catch (error) {
      logger.error("Failed to log API call to audit trail", error);
      throw error;
    }
  }

  /**
   * Get all audit logs, sorted by timestamp (newest first)
   */
  async getLogs(): Promise<AuditLogEntry[]> {
    await this.init();

    try {
      const logs = await this.db.auditLogs.orderBy("timestamp").reverse().toArray();
      return logs;
    } catch (error) {
      logger.error("Failed to get audit logs", error);
      return [];
    }
  }

  /**
   * Clear all audit logs
   */
  async clearLogs(): Promise<void> {
    await this.init();

    try {
      await this.db.auditLogs.clear();
      logger.info("🗑️ Cleared all audit logs");
    } catch (error) {
      logger.error("Failed to clear audit logs", error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV format
   */
  async exportLogsCSV(): Promise<string> {
    const logs = await this.getLogs();

    const headers = [
      "Timestamp",
      "Endpoint",
      "Method",
      "Encrypted",
      "Payload Size (bytes)",
      "Response Time (ms)",
      "Success",
      "Error",
    ];

    const rows = logs.map((log) => [
      new Date(log.timestamp).toISOString(),
      log.endpoint,
      log.method,
      log.encrypted ? "Yes" : "No",
      log.encryptedPayloadSize.toString(),
      log.responseTimeMs.toString(),
      log.success ? "Yes" : "No",
      log.errorMessage || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            const value = cell === null || cell === undefined ? "" : String(cell);
            const escaped = value.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(","),
      )
      .join("\n");

    return csv;
  }

  /**
   * Download audit logs as CSV file
   */
  async downloadCSV(): Promise<void> {
    try {
      const csv = await this.exportLogsCSV();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-audit-log-${Date.now()}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      logger.info("📥 Downloaded audit log CSV");
    } catch (error) {
      logger.error("Failed to download audit log CSV", error);
      throw error;
    }
  }

  /**
   * Enforce maximum number of entries (LRU eviction)
   */
  private async enforceMaxEntries(): Promise<void> {
    try {
      const count = await this.db.auditLogs.count();

      if (count > MAX_ENTRIES) {
        // Get oldest entries to delete
        const toDelete = count - MAX_ENTRIES;
        const oldestLogs = await this.db.auditLogs.orderBy("timestamp").limit(toDelete).toArray();

        // Delete oldest entries
        const idsToDelete = oldestLogs.map((log) => log.id);
        await this.db.auditLogs.bulkDelete(idsToDelete);

        logger.debug(`🗑️ Evicted ${toDelete} old audit logs (LRU)`, {
          maxEntries: MAX_ENTRIES,
          currentCount: count,
        });
      }
    } catch (error) {
      logger.error("Failed to enforce max entries", error);
    }
  }

  /**
   * Get count of audit logs
   */
  async getCount(): Promise<number> {
    await this.init();
    try {
      return await this.db.auditLogs.count();
    } catch (error) {
      logger.error("Failed to get audit log count", error);
      return 0;
    }
  }
}

// Export singleton instance
export const auditTrailService = new AuditTrailService();
