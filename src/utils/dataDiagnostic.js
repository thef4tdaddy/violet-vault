/**
 * Data Diagnostic Tool - Check current state of data and metadata
 * Usage: Copy and paste this into browser console to check data state
 */

export const runDataDiagnostic = async () => {
  console.log("🔍 VioletVault Data Diagnostic Tool");
  console.log("=".repeat(50));

  const results = {
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
      console.error("❌ budgetDb not available");
      return results;
    }

    console.log("📊 Checking all data tables...");

    // Check metadata specifically
    console.log("💰 Checking Budget Metadata...");
    const metadata = await window.budgetDb.budget.get("metadata");
    results.data.metadata = {
      exists: !!metadata,
      record: metadata || null,
      unassignedCash: metadata?.unassignedCash || "missing",
      actualBalance: metadata?.actualBalance || "missing",
      lastModified: metadata?.lastModified || "missing",
    };

    if (metadata) {
      console.log("✅ Budget metadata found:", metadata);
    } else {
      console.warn("⚠️ No budget metadata record found");
      console.log("🔧 Attempting to create metadata record...");

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
        console.log("✅ Created metadata record:", defaultMetadata);
        results.data.metadata.created = true;
        results.data.metadata.record = defaultMetadata;
      } catch (error) {
        console.error("❌ Failed to create metadata:", error);
        results.errors.push(`Failed to create metadata: ${error.message}`);
      }
    }

    // Check all other tables (including paycheckHistory)
    const tables = [
      "envelopes",
      "transactions",
      "bills",
      "debts",
      "paycheckHistory",
    ];
    const counts = {};

    for (const table of tables) {
      try {
        const count = await window.budgetDb[table].count();
        const sample = await window.budgetDb[table].limit(1).toArray();
        counts[table] = {
          count,
          sample: sample[0] || null,
        };
        console.log(`📊 ${table}: ${count} records`);
      } catch (err) {
        counts[table] = { error: err.message };
        console.error(`❌ Error checking ${table}:`, err);
      }
    }

    results.data.tableCounts = counts;

    // Check budget table specifically
    console.log("📋 Checking budget table contents...");
    const budgetRecords = await window.budgetDb.budget.toArray();
    results.data.budgetTable = {
      totalRecords: budgetRecords.length,
      records: budgetRecords,
    };

    console.log("📋 Budget table records:", budgetRecords);
  } catch (error) {
    results.errors.push(`Diagnostic failed: ${error.message}`);
    console.error("❌ Diagnostic error:", error);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(50));

  if (results.errors.length > 0) {
    console.error("❌ ERRORS:", results.errors);
  } else {
    console.log("✅ Diagnostic completed successfully");
  }

  console.log("\n💾 Full diagnostic results:");
  console.log(results);

  return results;
};

// Paycheck Data Cleanup Utility
export const cleanupCorruptedPaychecks = async () => {
  console.log("🧹 VioletVault Paycheck Cleanup Tool");
  console.log("=".repeat(50));

  if (!window.budgetDb) {
    console.error("❌ budgetDb not available");
    return { success: false, error: "budgetDb not available" };
  }

  try {
    // Get all paycheck history
    const allPaychecks = await window.budgetDb.paycheckHistory.toArray();
    console.log(`📊 Found ${allPaychecks.length} paycheck records`);

    // Identify corrupted paychecks (missing required fields)
    const corruptedPaychecks = allPaychecks.filter((paycheck) => {
      return (
        !paycheck.id ||
        !paycheck.amount ||
        !paycheck.date ||
        typeof paycheck.amount !== "number" ||
        paycheck.id === null ||
        paycheck.id === undefined
      );
    });

    console.log(
      `🔍 Found ${corruptedPaychecks.length} corrupted paycheck records`,
    );

    if (corruptedPaychecks.length > 0) {
      console.log("💀 Corrupted paychecks:", corruptedPaychecks);

      const confirmed = confirm(
        `Found ${corruptedPaychecks.length} corrupted paycheck records. Do you want to delete them? This action cannot be undone.`,
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
              .and(
                (p) =>
                  p.amount === paycheck.amount && p.source === paycheck.source,
              )
              .delete();
          }
        });

        await Promise.all(deletePromises);
        console.log(
          `✅ Successfully deleted ${corruptedPaychecks.length} corrupted paycheck records`,
        );

        // Verify cleanup
        const remainingPaychecks =
          await window.budgetDb.paycheckHistory.toArray();
        console.log(
          `📊 Remaining paycheck records: ${remainingPaychecks.length}`,
        );

        return {
          success: true,
          deleted: corruptedPaychecks.length,
          remaining: remainingPaychecks.length,
        };
      } else {
        console.log("❌ Cleanup cancelled by user");
        return { success: false, error: "Cancelled by user" };
      }
    } else {
      console.log("✅ No corrupted paycheck records found");
      return { success: true, deleted: 0, remaining: allPaychecks.length };
    }
  } catch (error) {
    console.error("❌ Paycheck cleanup failed:", error);
    return { success: false, error: error.message };
  }
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runDataDiagnostic = runDataDiagnostic;
  window.cleanupCorruptedPaychecks = cleanupCorruptedPaychecks;
  console.log("🔧 Data diagnostic tool loaded! Run: runDataDiagnostic()");
  console.log(
    "🧹 Paycheck cleanup tool loaded! Run: cleanupCorruptedPaychecks()",
  );
}
