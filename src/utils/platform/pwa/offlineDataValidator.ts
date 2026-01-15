import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import { validateTransactionSafe } from "@/domain/schemas/transaction";

/**
 * Offline Data Validator
 * Ensures critical budget data is available offline via Dexie
 */

interface TableDataInfo {
  count: number;
  available: boolean;
  validCount: number;
  invalidCount: number;
}

interface ValidationResults {
  isReady: boolean;
  hasData: boolean;
  criticalDataAvailable: Record<string, TableDataInfo>;
  recommendations: Array<{
    type: string;
    message: string;
    action: string;
  }>;
  lastValidated: string;
  totalRecords: number;
  totalValidRecords: number;
  totalInvalidRecords: number;
  error?: string;
}

type TableName = "envelopes" | "transactions";

class OfflineDataValidator {
  criticalTables: TableName[];

  constructor() {
    this.criticalTables = ["envelopes", "transactions"];
  }

  /**
   * Validate that all critical data is available offline
   */
  async validateOfflineReadiness(): Promise<ValidationResults> {
    const results: ValidationResults = {
      isReady: false,
      hasData: false,
      criticalDataAvailable: {},
      recommendations: [],
      lastValidated: new Date().toISOString(),
      totalRecords: 0,
      totalValidRecords: 0,
      totalInvalidRecords: 0,
    };

    try {
      for (const table of this.criticalTables) {
        const { count, validCount, invalidCount } = await this.getTableCountWithValidation(table);
        results.criticalDataAvailable[table] = {
          count,
          available: count > 0,
          validCount,
          invalidCount,
        };
        results.totalRecords += count;
        results.totalValidRecords += validCount;
        results.totalInvalidRecords += invalidCount;
      }

      results.hasData = results.totalRecords > 0;

      const envelopeCount = results.criticalDataAvailable.envelopes?.count || 0;
      const envelopeValidCount = results.criticalDataAvailable.envelopes?.validCount || 0;

      if (envelopeCount === 0) {
        results.recommendations.push({
          type: "warning",
          message: "No envelopes found in offline storage",
          action: "Create budget envelopes while online to enable full offline functionality",
        });
      }

      if (results.totalInvalidRecords > 0) {
        results.recommendations.push({
          type: "warning",
          message: `${results.totalInvalidRecords} invalid record(s) found in offline storage`,
          action: "Review and fix invalid data to ensure offline functionality works correctly",
        });
      }

      results.isReady = envelopeValidCount > 0 && results.totalInvalidRecords === 0;

      logger.info("📊 Offline data validation completed", {
        isReady: results.isReady,
        totalRecords: results.totalRecords,
        totalValidRecords: results.totalValidRecords,
        totalInvalidRecords: results.totalInvalidRecords,
      });

      return results;
    } catch (error) {
      logger.error("❌ Offline data validation failed", error as Record<string, unknown>);
      results.error = (error as Error).message;
      return results;
    }
  }

  /**
   * Get count of records in a table with Zod validation
   */
  async getTableCountWithValidation(
    tableName: TableName
  ): Promise<{ count: number; validCount: number; invalidCount: number }> {
    try {
      const db = budgetDb;
      let records: unknown[] = [];

      if (tableName === "envelopes") {
        records = await db.envelopes.toArray();
      } else if (tableName === "transactions") {
        records = await db.transactions.toArray();
      }

      const count = records.length;
      let validCount = 0;
      let invalidCount = 0;

      for (const record of records) {
        let isValid = false;

        try {
          if (tableName === "envelopes") {
            isValid = validateEnvelopeSafe(record).success;
          } else if (tableName === "transactions") {
            isValid = validateTransactionSafe(record).success;
          }

          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
          }
        } catch {
          // Ignore validation errors for individual records
          invalidCount++;
        }
      }

      return { count, validCount, invalidCount };
    } catch (error) {
      logger.warn(`Failed to count records in ${tableName}:`, error as Record<string, unknown>);
      return { count: 0, validCount: 0, invalidCount: 0 };
    }
  }

  /**
   * Validate data before storing offline
   */
  async validateDataBeforeStorage(data: {
    envelopes?: unknown[];
    transactions?: unknown[];
  }): Promise<{
    isValid: boolean;
    validCounts: Record<string, number>;
    invalidCounts: Record<string, number>;
    errors: string[];
  }> {
    const result = {
      isValid: true,
      validCounts: { envelopes: 0, transactions: 0 },
      invalidCounts: { envelopes: 0, transactions: 0 },
      errors: [] as string[],
    };

    if (data.envelopes) {
      for (const envelope of data.envelopes) {
        const validation = validateEnvelopeSafe(envelope);
        if (validation.success) {
          result.validCounts.envelopes++;
        } else {
          result.invalidCounts.envelopes++;
          result.isValid = false;
        }
      }
    }

    if (data.transactions) {
      for (const transaction of data.transactions) {
        const validation = validateTransactionSafe(transaction);
        if (validation.success) {
          result.validCounts.transactions++;
        } else {
          result.invalidCounts.transactions++;
          result.isValid = false;
        }
      }
    }

    return result;
  }

  /**
   * Pre-cache critical data for offline use
   */
  async preCacheCriticalData() {
    try {
      const startTime = performance.now();

      const [envelopes, transactions] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.orderBy("date").reverse().limit(100).toArray(),
      ]);

      const validEnvelopes = envelopes.filter((env) => validateEnvelopeSafe(env).success).length;
      const validTransactions = transactions.filter(
        (tx) => validateTransactionSafe(tx).success
      ).length;

      logger.info("📦 Critical data pre-cached for offline use", {
        validEnvelopes,
        validTransactions,
        cacheTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      });

      return { success: true };
    } catch (error) {
      logger.error("❌ Failed to pre-cache critical data", error);
      return { success: false, error: (error as Error).message };
    }
  }
}

const offlineDataValidator = new OfflineDataValidator();

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).offlineDataValidator = offlineDataValidator;
}

export default offlineDataValidator;
