/**
 * Data Diagnostic Tool - Check current state of data and metadata
 * Usage: Copy and paste this into browser console to check data state
 */
import logger from "@/utils/common/logger";
import type { VioletVaultDB } from "@/db/budgetDb";
import type { BudgetRecord } from "@/db/types";

// Extend window type for diagnostic tools
declare global {
  interface Window {
    budgetDb?: VioletVaultDB;
    runDataDiagnostic?: () => Promise<DataDiagnosticResults>;
    cleanupCorruptedPaychecks?: (confirmCallback?: ConfirmCallback | null) => Promise<CleanupResult>;
    inspectPaycheckRecords?: () => Promise<InspectionResult>;
  }
}

interface CleanupResult {
  success: boolean;
  deleted?: number;
  remaining?: number;
  error?: string;
}

interface InspectionResult {
  success: boolean;
  total?: number;
  records?: unknown[];
  error?: string;
}

interface DataDiagnosticResults {
  timestamp: string;
  browser: string;
  url: string;
  data: {
    metadata?: {
      exists: boolean;
      record: BudgetRecord | null;
      unassignedCash: number | string;
      actualBalance: number | string;
      lastModified: number | string;
      created?: boolean;
    };
    tableCounts?: Record<string, { count: number; sample: unknown } | { error: string }>;
    budgetTable?: {
      totalRecords: number;
      records: BudgetRecord[];
    };
  };
  errors: string[];
}

export const runDataDiagnostic = async (): Promise<DataDiagnosticResults> => {
  logger.info("🔍 VioletVault Data Diagnostic Tool");
  logger.info("=".repeat(50));

  const results: DataDiagnosticResults = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    url: window.location.href,
    data: {},
    errors: [],
  };

  try {
    // Check if budgetDb is available
    if (!window.budgetDb) {
      results.errors.push("budgetDb not available on window");
      logger.error("❌ budgetDb not available");
      return results;
    }

    logger.info("📊 Checking all data tables...");

    // Check metadata specifically
    logger.info("💰 Checking Budget Metadata...");
    const metadata = await window.budgetDb.budget.get("metadata");
    results.data.metadata = {
      exists: !!metadata,
      record: metadata || null,
      unassignedCash: (metadata?.unassignedCash as string | number) || "missing",
      actualBalance: (metadata?.actualBalance as string | number) || "missing",
      lastModified: metadata?.lastModified || "missing",
    };

    if (metadata) {
      logger.info("✅ Budget metadata found:", metadata);
    } else {
      logger.warn("⚠️ No budget metadata record found");
      logger.info("🔧 Attempting to create metadata record...");

      // Try to create metadata record
      try {
        const defaultMetadata = {
          id: "metadata",
          unassignedCash: 0,
          actualBalance: 0,
          isActualBalanceManual: false,
          biweeklyAllocation: 0,
          lastModified: Date.now(),
        };

        await window.budgetDb.budget.put(defaultMetadata);
        logger.info("✅ Created metadata record:", defaultMetadata);
        results.data.metadata.created = true;
        results.data.metadata.record = defaultMetadata;
      } catch (error) {
        logger.error("❌ Failed to create metadata:", error);
        results.errors.push(`Failed to create metadata: ${error.message}`);
      }
    }

    // Check all other tables (including paycheckHistory)
    const tables = ["envelopes", "transactions", "bills", "debts", "paycheckHistory"];
    const counts = {};

    for (const table of tables) {
      try {
        const count = await window.budgetDb[table].count();
        const sample = await window.budgetDb[table].limit(1).toArray();
        counts[table] = {
          count,
          sample: sample[0] || null,
        };
        logger.info(`📊 ${table}: ${count} records`);
      } catch (err) {
        counts[table] = { error: err.message };
        logger.error(`❌ Error checking ${table}:`, err);
      }
    }

    results.data.tableCounts = counts;

    // Check budget table specifically
    logger.info("📋 Checking budget table contents...");
    const budgetRecords = await window.budgetDb.budget.toArray();
    results.data.budgetTable = {
      totalRecords: budgetRecords.length,
      records: budgetRecords as unknown as Record<string, unknown>[],
    };

    logger.info("📋 Budget table records:", budgetRecords);
  } catch (error) {
    results.errors.push(`Diagnostic failed: ${error.message}`);
    logger.error("❌ Diagnostic error:", error);
  }

  // Summary
  logger.info("\n" + "=".repeat(50));
  logger.info("📋 DIAGNOSTIC SUMMARY");
  logger.info("=".repeat(50));

  if (results.errors.length > 0) {
    logger.error("❌ ERRORS:", results.errors);
  } else {
    logger.info("✅ Diagnostic completed successfully");
  }

  logger.info("\n💾 Full diagnostic results:");
  logger.info(JSON.stringify(results, null, 2));

  return results;
};

// Paycheck Data Cleanup Utility
// Detailed Paycheck Inspection Tool
export const inspectPaycheckRecords = async (): Promise<InspectionResult> => {
  logger.info("🔍 VioletVault Paycheck Inspection Tool");
  logger.info("=".repeat(50));

  if (!window.budgetDb) {
    logger.error("❌ budgetDb not available");
    return { success: false, error: "budgetDb not available" };
  }

  try {
    const allPaychecks = await window.budgetDb.paycheckHistory.toArray();
    logger.info(`📊 Found ${allPaychecks.length} total paycheck records`);

    allPaychecks.forEach((paycheck, index) => {
      logger.info(`\n📋 Paycheck Record #${index + 1}:`);
      logger.info("Paycheck details:", {
        id: paycheck.id,
        idType: typeof paycheck.id,
        idValid: !!(paycheck.id && typeof paycheck.id === "string" && paycheck.id !== ""),
        amount: paycheck.amount,
        amountType: typeof paycheck.amount,
        amountValid: !!(typeof paycheck.amount === "number" && !isNaN(paycheck.amount)),
        date: paycheck.date,
        dateType: typeof paycheck.date,
        dateValid: !!paycheck.date,
        source: paycheck.source,
        lastModified: paycheck.lastModified,
        allFields: Object.keys(paycheck),
        fullRecord: paycheck,
      });
    });

    return { success: true, total: allPaychecks.length, records: allPaychecks };
  } catch (error) {
    logger.error("❌ Paycheck inspection failed:", error);
    return { success: false, error: error.message };
  }
};

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
}

type ConfirmCallback = (options: ConfirmDialogOptions) => Promise<boolean>;

export const cleanupCorruptedPaychecks = async (confirmCallback: ConfirmCallback | null = null): Promise<CleanupResult> => {
  logger.info("🧹 VioletVault Paycheck Cleanup Tool");
  logger.info("=".repeat(50));

  if (!window.budgetDb) {
    logger.error("❌ budgetDb not available");
    return { success: false, error: "budgetDb not available" };
  }

  try {
    // Get all paycheck history
    const allPaychecks = await window.budgetDb.paycheckHistory.toArray();
    logger.info(`📊 Found ${allPaychecks.length} paycheck records`);

    // Identify corrupted paychecks (missing required fields or invalid data)
    const corruptedPaychecks = allPaychecks.filter((paycheck) => {
      // Check for missing or invalid ID
      const hasInvalidId =
        !paycheck.id ||
        paycheck.id === null ||
        paycheck.id === undefined ||
        paycheck.id === "" ||
        typeof paycheck.id !== "string";

      // Check for missing or invalid amount
      const hasInvalidAmount =
        paycheck.amount === null ||
        paycheck.amount === undefined ||
        typeof paycheck.amount !== "number" ||
        isNaN(paycheck.amount);

      // Check for missing or invalid date
      const hasInvalidDate =
        !paycheck.date || paycheck.date === null || paycheck.date === undefined;

      // Log details for debugging
      if (hasInvalidId || hasInvalidAmount || hasInvalidDate) {
        logger.info(`🔍 Found potentially corrupted paycheck:`, {
          id: paycheck.id,
          idValid: !hasInvalidId,
          amount: paycheck.amount,
          amountValid: !hasInvalidAmount,
          date: paycheck.date,
          dateValid: !hasInvalidDate,
          paycheck,
        });
      }

      return hasInvalidId || hasInvalidAmount || hasInvalidDate;
    });

    logger.info(`🔍 Found ${corruptedPaychecks.length} corrupted paycheck records`);

    if (corruptedPaychecks.length > 0) {
      logger.info("💀 Corrupted paychecks:", corruptedPaychecks);

      const confirmed = confirmCallback
        ? await confirmCallback({
            title: "Delete Corrupted Records",
            message: `Found ${corruptedPaychecks.length} corrupted paycheck records. Do you want to delete them? This action cannot be undone.`,
            confirmLabel: "Delete Records",
            cancelLabel: "Cancel",
            destructive: true,
          } as unknown as Record<string, unknown>)
        : /* eslint-disable-next-line no-restricted-syntax -- diagnostic tool for browser console */
          window.confirm(
            `Found ${corruptedPaychecks.length} corrupted paycheck records. Do you want to delete them? This action cannot be undone.`
          );

      if (confirmed) {
        // Delete corrupted paychecks
        const deletePromises = corruptedPaychecks.map((paycheck) => {
          if (paycheck.id) {
            return window.budgetDb.paycheckHistory.delete(paycheck.id);
          } else {
            // For paychecks with no ID, we need to delete by a combination of fields
            return window.budgetDb.paycheckHistory
              .where("date")
              .equals(paycheck.date)
              .and((p) => p.amount === paycheck.amount && p.source === paycheck.source)
              .delete();
          }
        });

        await Promise.all(deletePromises);
        logger.info(
          `✅ Successfully deleted ${corruptedPaychecks.length} corrupted paycheck records`
        );

        // Verify cleanup
        const remainingPaychecks = await window.budgetDb.paycheckHistory.toArray();
        logger.info(`📊 Remaining paycheck records: ${remainingPaychecks.length}`);

        return {
          success: true,
          deleted: corruptedPaychecks.length,
          remaining: remainingPaychecks.length,
        };
      } else {
        logger.info("❌ Cleanup cancelled by user");
        return { success: false, error: "Cancelled by user" };
      }
    } else {
      logger.info("✅ No corrupted paycheck records found");
      return { success: true, deleted: 0, remaining: allPaychecks.length };
    }
  } catch (error) {
    logger.error("❌ Paycheck cleanup failed:", error);
    return { success: false, error: error.message };
  }
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runDataDiagnostic = runDataDiagnostic;
  window.cleanupCorruptedPaychecks = cleanupCorruptedPaychecks;
  window.inspectPaycheckRecords = inspectPaycheckRecords;
  // Data diagnostic tools available via sync health dropdown
  // Console commands: runDataDiagnostic(), cleanupCorruptedPaychecks(), inspectPaycheckRecords()
}
