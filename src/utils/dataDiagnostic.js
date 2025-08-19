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

    // Check all other tables
    const tables = ["envelopes", "transactions", "bills", "debts"];
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

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runDataDiagnostic = runDataDiagnostic;
  console.log("🔧 Data diagnostic tool loaded! Run: runDataDiagnostic()");
}
