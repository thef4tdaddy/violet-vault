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
// Detailed Paycheck Inspection Tool
export const inspectPaycheckRecords = async () => {
  console.log("🔍 VioletVault Paycheck Inspection Tool");
  console.log("=".repeat(50));

  if (!window.budgetDb) {
    console.error("❌ budgetDb not available");
    return { success: false, error: "budgetDb not available" };
  }

  try {
    const allPaychecks = await window.budgetDb.paycheckHistory.toArray();
    console.log(`📊 Found ${allPaychecks.length} total paycheck records`);

    allPaychecks.forEach((paycheck, index) => {
      console.log(`\n📋 Paycheck Record #${index + 1}:`);
      console.log({
        id: paycheck.id,
        idType: typeof paycheck.id,
        idValid: !!(
          paycheck.id &&
          typeof paycheck.id === "string" &&
          paycheck.id !== ""
        ),
        amount: paycheck.amount,
        amountType: typeof paycheck.amount,
        amountValid: !!(
          typeof paycheck.amount === "number" && !isNaN(paycheck.amount)
        ),
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
    console.error("❌ Paycheck inspection failed:", error);
    return { success: false, error: error.message };
  }
};

export const cleanupCorruptedPaychecks = async (confirmCallback = null) => {
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
        console.log(`🔍 Found potentially corrupted paycheck:`, {
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

    console.log(
      `🔍 Found ${corruptedPaychecks.length} corrupted paycheck records`,
    );

    if (corruptedPaychecks.length > 0) {
      console.log("💀 Corrupted paychecks:", corruptedPaychecks);

      const confirmed = confirmCallback
        ? await confirmCallback({
            title: "Delete Corrupted Records",
            message: `Found ${corruptedPaychecks.length} corrupted paycheck records. Do you want to delete them? This action cannot be undone.`,
            confirmLabel: "Delete Records",
            cancelLabel: "Cancel",
            destructive: true,
          })
        : window.confirm(
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
  window.inspectPaycheckRecords = inspectPaycheckRecords;
  // Data diagnostic tools available via sync health dropdown
  // Console commands: runDataDiagnostic(), cleanupCorruptedPaychecks(), inspectPaycheckRecords()
}
