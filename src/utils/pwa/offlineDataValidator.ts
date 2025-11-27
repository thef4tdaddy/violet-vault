import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import { validateTransactionSafe } from "@/domain/schemas/transaction";
import { validateBillSafe } from "@/domain/schemas/bill";
import { validateDebtSafe } from "@/domain/schemas/debt";
import { validatePaycheckHistorySafe } from "@/domain/schemas/paycheck-history";

/**
 * Offline Data Validator
 * Ensures critical budget data is available offline via Dexie
 * Enhanced for Issue #1372: Verify and Enhance Offline Handling
 * - Validates data with Zod schemas before storing offline
 * - Ensures data integrity when coming back online
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

type TableName =
  | "envelopes"
  | "transactions"
  | "bills"
  | "savingsGoals"
  | "debts"
  | "paycheckHistory";

class OfflineDataValidator {
  criticalTables: TableName[];

  constructor() {
    this.criticalTables = [
      "envelopes",
      "transactions",
      "bills",
      "savingsGoals",
      "debts",
      "paycheckHistory",
    ];
  }

  /**
   * Validate that all critical data is available offline
   * Enhanced with Zod schema validation (Issue #1372)
   */
  // eslint-disable-next-line complexity, max-statements -- Comprehensive validation across multiple tables requires complexity
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
      // Check each critical table with Zod validation
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

      // Check if we have any meaningful data
      results.hasData = results.totalRecords > 0;

      // Specific validations
      const envelopeCount = results.criticalDataAvailable.envelopes?.count || 0;
      const transactionCount = results.criticalDataAvailable.transactions?.count || 0;
      const envelopeValidCount = results.criticalDataAvailable.envelopes?.validCount || 0;
      const transactionValidCount = results.criticalDataAvailable.transactions?.validCount || 0;

      // Generate recommendations
      if (envelopeCount === 0) {
        results.recommendations.push({
          type: "warning",
          message: "No envelopes found in offline storage",
          action: "Create budget envelopes while online to enable full offline functionality",
        });
      }

      if (transactionCount === 0) {
        results.recommendations.push({
          type: "info",
          message: "No transactions in offline storage",
          action: "Add transactions while online to view transaction history offline",
        });
      }

      // Warn about invalid data
      if (results.totalInvalidRecords > 0) {
        results.recommendations.push({
          type: "warning",
          message: `${results.totalInvalidRecords} invalid record(s) found in offline storage`,
          action: "Review and fix invalid data to ensure offline functionality works correctly",
        });
      }

      if (transactionCount > 0 && envelopeCount > 0 && results.totalInvalidRecords === 0) {
        results.recommendations.push({
          type: "success",
          message: "Budget data is ready for offline use",
          action: "You can view budgets, add transactions, and manage finances offline",
        });
      }

      // Determine overall readiness (need valid envelopes for offline budgeting)
      results.isReady = envelopeValidCount > 0 && results.totalInvalidRecords === 0;

      logger.info("📊 Offline data validation completed", {
        isReady: results.isReady,
        totalRecords: results.totalRecords,
        totalValidRecords: results.totalValidRecords,
        totalInvalidRecords: results.totalInvalidRecords,
        hasEnvelopes: envelopeCount > 0,
        hasTransactions: transactionCount > 0,
        validEnvelopes: envelopeValidCount,
        validTransactions: transactionValidCount,
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
   * Enhanced for Issue #1372
   */
  // eslint-disable-next-line complexity, max-statements -- Validation logic for multiple table types requires complexity
  async getTableCountWithValidation(
    tableName: TableName
  ): Promise<{ count: number; validCount: number; invalidCount: number }> {
    try {
      const db = budgetDb;
      let records: unknown[] = [];

      // Get records from appropriate table
      if (tableName === "envelopes") {
        records = await db.envelopes.toArray();
      } else if (tableName === "transactions") {
        records = await db.transactions.toArray();
      } else if (tableName === "bills") {
        records = await db.bills.toArray();
      } else if (tableName === "savingsGoals") {
        // Note: savingsGoals are now envelopes with envelopeType
        // This table may be deprecated but we check it for backward compatibility
        try {
          records = await db.savingsGoals.toArray();
        } catch {
          records = [];
        }
      } else if (tableName === "debts") {
        records = await db.debts.toArray();
      } else if (tableName === "paycheckHistory") {
        records = await db.paycheckHistory.toArray();
      }

      const count = records.length;
      let validCount = 0;
      let invalidCount = 0;

      // Validate each record with appropriate Zod schema
      for (const record of records) {
        let isValid = false;

        try {
          if (tableName === "envelopes") {
            isValid = validateEnvelopeSafe(record).success;
          } else if (tableName === "transactions") {
            isValid = validateTransactionSafe(record).success;
          } else if (tableName === "bills") {
            isValid = validateBillSafe(record).success;
          } else if (tableName === "debts") {
            isValid = validateDebtSafe(record).success;
          } else if (tableName === "paycheckHistory") {
            isValid = validatePaycheckHistorySafe(record).success;
          } else if (tableName === "savingsGoals") {
            // Savings goals are now envelopes, validate as envelopes
            isValid = validateEnvelopeSafe(record).success;
          }

          if (isValid) {
            validCount++;
          } else {
            invalidCount++;
            logger.warn(`Invalid ${tableName} record found during offline validation`, {
              recordId: (record as { id?: string })?.id ?? "unknown",
            });
          }
        } catch (error) {
          invalidCount++;
          logger.warn(`Error validating ${tableName} record`, {
            recordId: (record as { id?: string })?.id ?? "unknown",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return { count, validCount, invalidCount };
    } catch (error) {
      logger.warn(`Failed to count records in ${tableName}:`, error as Record<string, unknown>);
      return { count: 0, validCount: 0, invalidCount: 0 };
    }
  }

  /**
   * Get count of records in a table (legacy method for backward compatibility)
   */
  async getTableCount(tableName: TableName): Promise<number> {
    const { count } = await this.getTableCountWithValidation(tableName);
    return count;
  }

  /**
   * Validate data before storing offline
   * Enhanced for Issue #1372: Validate with Zod schemas
   */
  // eslint-disable-next-line complexity, max-statements -- Comprehensive validation across all data types requires complexity
  async validateDataBeforeStorage(data: {
    envelopes?: unknown[];
    transactions?: unknown[];
    bills?: unknown[];
    debts?: unknown[];
    paycheckHistory?: unknown[];
  }): Promise<{
    isValid: boolean;
    validCounts: Record<string, number>;
    invalidCounts: Record<string, number>;
    errors: string[];
  }> {
    const result = {
      isValid: true,
      validCounts: {
        envelopes: 0,
        transactions: 0,
        bills: 0,
        debts: 0,
        paycheckHistory: 0,
      },
      invalidCounts: {
        envelopes: 0,
        transactions: 0,
        bills: 0,
        debts: 0,
        paycheckHistory: 0,
      },
      errors: [] as string[],
    };

    // Validate envelopes
    if (data.envelopes) {
      for (const envelope of data.envelopes) {
        const validation = validateEnvelopeSafe(envelope);
        if (validation.success) {
          result.validCounts.envelopes++;
        } else {
          result.invalidCounts.envelopes++;
          result.errors.push(`Invalid envelope: ${(envelope as { id?: string })?.id ?? "unknown"}`);
          result.isValid = false;
        }
      }
    }

    // Validate transactions
    if (data.transactions) {
      for (const transaction of data.transactions) {
        const validation = validateTransactionSafe(transaction);
        if (validation.success) {
          result.validCounts.transactions++;
        } else {
          result.invalidCounts.transactions++;
          result.errors.push(
            `Invalid transaction: ${(transaction as { id?: string })?.id ?? "unknown"}`
          );
          result.isValid = false;
        }
      }
    }

    // Validate bills
    if (data.bills) {
      for (const bill of data.bills) {
        const validation = validateBillSafe(bill);
        if (validation.success) {
          result.validCounts.bills++;
        } else {
          result.invalidCounts.bills++;
          result.errors.push(`Invalid bill: ${(bill as { id?: string })?.id ?? "unknown"}`);
          result.isValid = false;
        }
      }
    }

    // Validate debts
    if (data.debts) {
      for (const debt of data.debts) {
        const validation = validateDebtSafe(debt);
        if (validation.success) {
          result.validCounts.debts++;
        } else {
          result.invalidCounts.debts++;
          result.errors.push(`Invalid debt: ${(debt as { id?: string })?.id ?? "unknown"}`);
          result.isValid = false;
        }
      }
    }

    // Validate paycheck history
    if (data.paycheckHistory) {
      for (const paycheck of data.paycheckHistory) {
        const validation = validatePaycheckHistorySafe(paycheck);
        if (validation.success) {
          result.validCounts.paycheckHistory++;
        } else {
          result.invalidCounts.paycheckHistory++;
          result.errors.push(`Invalid paycheck: ${(paycheck as { id?: string })?.id ?? "unknown"}`);
          result.isValid = false;
        }
      }
    }

    if (!result.isValid) {
      logger.warn("⚠️ Invalid data detected before offline storage", {
        invalidCounts: result.invalidCounts,
        errorCount: result.errors.length,
      });
    }

    return result;
  }

  /**
   * Get recent transactions for offline capability testing
   */
  async getRecentTransactionsPreview() {
    try {
      const recentTransactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .limit(5)
        .toArray();

      // Validate transactions with Zod before returning
      const validTransactions = [];
      for (const tx of recentTransactions) {
        const validation = validateTransactionSafe(tx);
        if (validation.success) {
          validTransactions.push({
            id: tx.id,
            description: tx.description,
            amount: tx.amount,
            date: tx.date,
            envelope: (tx as unknown as Record<string, unknown>).envelope,
          });
        }
      }

      return validTransactions;
    } catch (error) {
      logger.warn("Failed to get recent transactions preview:", error as Record<string, unknown>);
      return [];
    }
  }

  /**
   * Get envelope summary for offline capability testing
   */
  async getEnvelopeSummary() {
    try {
      const envelopes = await budgetDb.envelopes.toArray();

      // Validate envelopes with Zod before processing
      const validEnvelopes = envelopes.filter((env) => validateEnvelopeSafe(env).success);

      return {
        totalEnvelopes: validEnvelopes.length,
        totalAllocated: validEnvelopes.reduce(
          (sum, env) =>
            sum + (((env as unknown as Record<string, unknown>).allocated as number) || 0),
          0
        ),
        totalSpent: validEnvelopes.reduce(
          (sum, env) => sum + (((env as unknown as Record<string, unknown>).spent as number) || 0),
          0
        ),
        envelopeNames: validEnvelopes.slice(0, 5).map((env) => env.name),
      };
    } catch (error) {
      logger.warn("Failed to get envelope summary:", error as Record<string, unknown>);
      return {
        totalEnvelopes: 0,
        totalAllocated: 0,
        totalSpent: 0,
        envelopeNames: [],
      };
    }
  }

  /**
   * Test offline data access performance
   */
  async testOfflinePerformance() {
    const results: {
      envelopeLoadTime: number;
      transactionLoadTime: number;
      validationTime: number;
      totalTime: number;
      success: boolean;
      error?: string;
    } = {
      envelopeLoadTime: 0,
      transactionLoadTime: 0,
      validationTime: 0,
      totalTime: 0,
      success: false,
    };

    try {
      // Test envelope loading
      const envelopeStart = performance.now();
      const envelopes = await budgetDb.envelopes.limit(10).toArray();
      results.envelopeLoadTime = performance.now() - envelopeStart;

      // Test transaction loading
      const transactionStart = performance.now();
      const transactions = await budgetDb.transactions.limit(20).toArray();
      results.transactionLoadTime = performance.now() - transactionStart;

      // Test validation performance
      const validationStart = performance.now();
      for (const env of envelopes) {
        validateEnvelopeSafe(env);
      }
      for (const tx of transactions) {
        validateTransactionSafe(tx);
      }
      results.validationTime = performance.now() - validationStart;

      results.totalTime =
        results.envelopeLoadTime + results.transactionLoadTime + results.validationTime;
      results.success = true;

      logger.info("⚡ Offline data performance test completed", {
        envelopeMs: Math.round(results.envelopeLoadTime * 100) / 100,
        transactionMs: Math.round(results.transactionLoadTime * 100) / 100,
        validationMs: Math.round(results.validationTime * 100) / 100,
        totalMs: Math.round(results.totalTime * 100) / 100,
      });
    } catch (error) {
      logger.error("❌ Offline performance test failed", error);
      results.error = (error as Error).message;
    }

    return results;
  }

  /**
   * Get comprehensive offline readiness report
   */
  async getOfflineReadinessReport() {
    const [validation, envelopeSummary, recentTransactions, performance] = await Promise.allSettled(
      [
        this.validateOfflineReadiness(),
        this.getEnvelopeSummary(),
        this.getRecentTransactionsPreview(),
        this.testOfflinePerformance(),
      ]
    );

    return {
      timestamp: new Date().toISOString(),
      validation:
        validation.status === "fulfilled"
          ? validation.value
          : { error: validation.reason?.message },
      envelopeSummary:
        envelopeSummary.status === "fulfilled"
          ? envelopeSummary.value
          : { error: envelopeSummary.reason?.message },
      recentTransactions: recentTransactions.status === "fulfilled" ? recentTransactions.value : [],
      performance:
        performance.status === "fulfilled"
          ? performance.value
          : { error: performance.reason?.message },
      userAgent: navigator.userAgent,
      online: navigator.onLine,
    };
  }

  /**
   * Pre-cache critical data for offline use
   * Enhanced with Zod validation (Issue #1372)
   */
  async preCacheCriticalData() {
    const results: {
      envelopesCached: boolean;
      transactionsCached: boolean;
      billsCached: boolean;
      validEnvelopes: number;
      validTransactions: number;
      validBills: number;
      invalidEnvelopes: number;
      invalidTransactions: number;
      invalidBills: number;
      success: boolean;
      cacheTime: number;
      error?: string;
    } = {
      envelopesCached: false,
      transactionsCached: false,
      billsCached: false,
      validEnvelopes: 0,
      validTransactions: 0,
      validBills: 0,
      invalidEnvelopes: 0,
      invalidTransactions: 0,
      invalidBills: 0,
      success: false,
      cacheTime: 0,
    };

    try {
      const startTime = performance.now();

      // Trigger loading of critical data to ensure it's in Dexie
      const [envelopes, transactions, bills] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.orderBy("date").reverse().limit(100).toArray(),
        budgetDb.bills.toArray(),
      ]);

      // Validate with Zod schemas
      for (const envelope of envelopes) {
        if (validateEnvelopeSafe(envelope).success) {
          results.validEnvelopes++;
        } else {
          results.invalidEnvelopes++;
        }
      }

      for (const transaction of transactions) {
        if (validateTransactionSafe(transaction).success) {
          results.validTransactions++;
        } else {
          results.invalidTransactions++;
        }
      }

      for (const bill of bills) {
        if (validateBillSafe(bill).success) {
          results.validBills++;
        } else {
          results.invalidBills++;
        }
      }

      results.envelopesCached = results.validEnvelopes > 0;
      results.transactionsCached = results.validTransactions > 0;
      results.billsCached = results.validBills > 0;
      results.cacheTime = performance.now() - startTime;
      results.success = true;

      logger.info("📦 Critical data pre-cached for offline use", {
        validEnvelopes: results.validEnvelopes,
        validTransactions: results.validTransactions,
        validBills: results.validBills,
        invalidEnvelopes: results.invalidEnvelopes,
        invalidTransactions: results.invalidTransactions,
        invalidBills: results.invalidBills,
        cacheTimeMs: Math.round(results.cacheTime * 100) / 100,
      });
    } catch (error) {
      logger.error("❌ Failed to pre-cache critical data", error);
      results.error = (error as Error).message;
    }

    return results;
  }
}

// Create singleton instance
const offlineDataValidator = new OfflineDataValidator();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).offlineDataValidator = offlineDataValidator;
}

export default offlineDataValidator;
