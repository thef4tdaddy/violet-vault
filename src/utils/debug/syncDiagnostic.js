/**
 * Sync Diagnostic Tool - Run in browser console to debug sync issues
 * Usage: Copy and paste this into browser developer console
 */

export const runSyncDiagnostic = async () => {
  console.log("🔍 VioletVault Sync Diagnostic Tool");
  console.log("=".repeat(50));

  const results = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    url: window.location.href,
    errors: [],
    warnings: [],
    info: [],
  };

  // Check 1: IndexedDB Structure
  console.log("📱 Checking IndexedDB...");
  try {
    const dbRequest = indexedDB.open("VioletVault");
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const storeNames = Array.from(db.objectStoreNames);
      results.indexedDB = {
        version: db.version,
        stores: storeNames,
      };
      console.log("✅ IndexedDB stores:", storeNames);
    };
    dbRequest.onerror = (error) => {
      results.errors.push("IndexedDB connection failed: " + error);
      console.error("❌ IndexedDB failed:", error);
    };
  } catch (error) {
    results.errors.push("IndexedDB error: " + error.message);
    console.error("❌ IndexedDB error:", error);
  }

  // Check 2: Budget Metadata
  console.log("💰 Checking Budget Metadata...");
  try {
    if (window.budgetDb) {
      const metadata = await window.budgetDb.budget.get("metadata");
      results.budgetMetadata = {
        exists: !!metadata,
        unassignedCash: metadata?.unassignedCash || "missing",
        actualBalance: metadata?.actualBalance || "missing",
        lastModified: metadata?.lastModified || "missing",
      };

      if (metadata) {
        console.log("✅ Budget metadata found:", metadata);
      } else {
        console.warn("⚠️ No budget metadata record found");
        results.warnings.push("Budget metadata record missing");
      }
    } else {
      results.errors.push("budgetDb not available on window");
      console.error("❌ budgetDb not available");
    }
  } catch (error) {
    results.errors.push("Budget metadata check failed: " + error.message);
    console.error("❌ Budget metadata error:", error);
  }

  // Check 3: Data Counts
  console.log("📊 Checking Data Counts...");
  try {
    if (window.budgetDb) {
      const counts = {};
      const tables = [
        "envelopes",
        "transactions",
        "bills",
        "debts",
        "budgetCommits",
        "budgetChanges",
      ];

      for (const table of tables) {
        try {
          counts[table] = await window.budgetDb[table].count();
        } catch (err) {
          counts[table] = "error: " + err.message;
        }
      }

      results.dataCounts = counts;
      console.log("📊 Data counts:", counts);

      // Flag empty databases
      const totalRecords = Object.values(counts).reduce(
        (sum, count) => (typeof count === "number" ? sum + count : sum),
        0
      );

      if (totalRecords === 0) {
        results.warnings.push("All data tables are empty - possible sync issue");
        console.warn("⚠️ All data tables are empty");
      }
    }
  } catch (error) {
    results.errors.push("Data count check failed: " + error.message);
    console.error("❌ Data count error:", error);
  }

  // Check 4: Cloud Sync Service
  console.log("☁️ Checking Cloud Sync Service...");
  try {
    if (window.cloudSyncService) {
      results.cloudSync = {
        isRunning: window.cloudSyncService.isRunning,
        config: !!window.cloudSyncService.config,
        lastSyncTime: window.cloudSyncService.lastSyncTime,
      };

      console.log("✅ Cloud sync service found:", results.cloudSync);

      if (!window.cloudSyncService.isRunning) {
        results.warnings.push("Cloud sync service not running");
        console.warn("⚠️ Cloud sync service not running");
      }
    } else {
      results.errors.push("cloudSyncService not available");
      console.error("❌ cloudSyncService not available on window");
    }
  } catch (error) {
    results.errors.push("Cloud sync check failed: " + error.message);
    console.error("❌ Cloud sync error:", error);
  }

  // Check 5: Firebase Auth
  console.log("🔐 Checking Firebase Auth...");
  try {
    if (window.firebase && window.firebase.auth) {
      const user = window.firebase.auth().currentUser;
      results.firebaseAuth = {
        isSignedIn: !!user,
        userId: user?.uid || null,
        email: user?.email || null,
        isAnonymous: user?.isAnonymous || null,
      };

      if (user) {
        console.log("✅ Firebase authenticated:", {
          uid: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
        });
      } else {
        results.warnings.push("Not authenticated with Firebase");
        console.warn("⚠️ Not signed in to Firebase");
      }
    } else {
      results.errors.push("Firebase not available");
      console.error("❌ Firebase not available on window");
    }
  } catch (error) {
    results.errors.push("Firebase auth check failed: " + error.message);
    console.error("❌ Firebase auth error:", error);
  }

  // Check 6: Network Status
  console.log("🌐 Checking Network...");
  results.network = {
    online: navigator.onLine,
    connection: navigator.connection
      ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
        }
      : "not available",
  };

  if (navigator.onLine) {
    console.log("✅ Network online:", results.network);
  } else {
    results.errors.push("Device is offline");
    console.error("❌ Device is offline");
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(50));

  if (results.errors.length > 0) {
    console.error("❌ ERRORS:", results.errors);
  }

  if (results.warnings.length > 0) {
    console.warn("⚠️ WARNINGS:", results.warnings);
  }

  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log("✅ No critical issues detected");
  }

  console.log("\n💾 Full diagnostic results:");
  console.log(results);

  return results;
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runSyncDiagnostic = runSyncDiagnostic;
  // Sync diagnostic tool available via sync health dropdown
  // Console command: runSyncDiagnostic()
}
