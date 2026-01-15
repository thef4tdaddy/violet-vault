/**
 * Data Diagnostic Tool - Check current state of data and metadata
 * Usage: Copy and paste this into browser console to check data state
 */
import logger from "@/utils/core/common/logger";
import type { VioletVaultDB } from "@/db/budgetDb";
import type { BudgetRecord } from "@/db/types";

// Extend window type for diagnostic tools
declare global {
  interface Window {
    budgetDb?: VioletVaultDB;
    runDataDiagnostic?: () => Promise<DataDiagnosticResults>;
  }
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Failed to create metadata: ${errorMessage}`);
      }
    }

    // Check all other tables
    const tableNames = [
      "envelopes",
      "transactions",
      "budgetCommits",
      "budgetChanges",
      "offlineRequestQueue",
    ] as const;
    const counts: Record<string, { count: number; sample: unknown } | { error: string }> = {};

    for (const tableName of tableNames) {
      try {
        const tableRef = (
          window.budgetDb as unknown as Record<
            string,
            {
              count: () => Promise<number>;
              limit: (n: number) => { toArray: () => Promise<unknown[]> };
            }
          >
        )[tableName];
        const count = await tableRef.count();
        const sample = await tableRef.limit(1).toArray();
        counts[tableName] = {
          count,
          sample: sample[0] || null,
        };
        logger.info(`📊 ${tableName}: ${count} records`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        counts[tableName] = { error: errorMessage };
        logger.error(`❌ Error checking ${tableName}:`, err);
      }
    }

    results.data.tableCounts = counts;

    // Check budget table specifically
    logger.info("📋 Checking budget table contents...");
    const budgetRecords = await window.budgetDb.budget.toArray();
    results.data.budgetTable = {
      totalRecords: budgetRecords.length,
      records: budgetRecords,
    };

    logger.info("📋 Budget table records:", budgetRecords as unknown as Record<string, unknown>);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.errors.push(`Diagnostic failed: ${errorMessage}`);
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

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runDataDiagnostic = runDataDiagnostic;
  // Console command: runDataDiagnostic()
}
