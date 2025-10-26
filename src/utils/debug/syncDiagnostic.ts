/**
 * Sync Diagnostic Tool - Run in browser console to debug sync issues
 * Usage: Copy and paste this into browser developer console
 */
import logger from "@/utils/common/logger";

// Extend window type for diagnostic tools
declare global {
  interface Window {
    budgetDb?: any;
    runSyncDiagnostic?: () => Promise<DiagnosticResults>;
    syncEdgeCaseTester?: any;
    runSyncEdgeCaseTests?: () => Promise<any>;
  }
}

export interface DiagnosticResults {
  timestamp: string;
  browser: string;
  url: string;
  errors: string[];
  warnings: string[];
  info: string[];
  indexedDB?: {
    version: number;
    stores: string[];
  };
  budgetMetadata?: {
    exists: boolean;
    unassignedCash: number | string;
    actualBalance: number | string;
    lastModified: number | string;
  };
  dataCounts?: Record<string, number | string>;
  cloudSync?: {
    isRunning: boolean;
    config: boolean;
    lastSyncTime: string | null;
  };
  firebaseAuth?: {
    isSignedIn: boolean;
    userId: string | null;
    email: string | null;
    isAnonymous: boolean | null;
  };
  network?: {
    online: boolean;
    connection: any;
  };
}

export const runSyncDiagnostic = async (): Promise<DiagnosticResults> => {
  logger.info("🔍 VioletVault Sync Diagnostic Tool");
  logger.info("=".repeat(50));

  const results: DiagnosticResults = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    url: window.location.href,
    errors: [],
    warnings: [],
    info: [],
  };

  // Check 1: IndexedDB Structure
  logger.info("📱 Checking IndexedDB...");
  try {
    const dbRequest = indexedDB.open("VioletVault");
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const storeNames = Array.from(db.objectStoreNames);
      results.indexedDB = {
        version: db.version,
        stores: storeNames,
      };
      logger.info("✅ IndexedDB stores:", { stores: storeNames });
    };
    dbRequest.onerror = (error) => {
      results.errors.push("IndexedDB connection failed: " + error);
      logger.error("❌ IndexedDB failed:", error);
    };
  } catch (error) {
    results.errors.push("IndexedDB error: " + error.message);
    logger.error("❌ IndexedDB error:", error);
  }

  // Check 2: Budget Metadata
  logger.info("💰 Checking Budget Metadata...");
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
        logger.info("✅ Budget metadata found:", metadata);
      } else {
        logger.warn("⚠️ No budget metadata record found");
        results.warnings.push("Budget metadata record missing");
      }
    } else {
      results.errors.push("budgetDb not available on window");
      logger.error("❌ budgetDb not available");
    }
  } catch (error) {
    results.errors.push("Budget metadata check failed: " + error.message);
    logger.error("❌ Budget metadata error:", error);
  }

  // Check 3: Data Counts
  logger.info("📊 Checking Data Counts...");
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
      logger.info("📊 Data counts:", counts);

      // Flag empty databases
      const totalRecords = Object.values(counts).reduce<number>(
        (sum, count) => (typeof count === "number" ? sum + count : sum),
        0
      );

      if (totalRecords === 0) {
        results.warnings.push("All data tables are empty - possible sync issue");
        logger.warn("⚠️ All data tables are empty");
      }
    }
  } catch (error) {
    results.errors.push("Data count check failed: " + error.message);
    logger.error("❌ Data count error:", error);
  }

  // Check 4: Cloud Sync Service
  logger.info("☁️ Checking Cloud Sync Service...");
  try {
    if (window.cloudSyncService) {
      const cloudSyncService = window.cloudSyncService as any;
      results.cloudSync = {
        isRunning: cloudSyncService.isRunning,
        config: !!cloudSyncService.config,
        lastSyncTime: cloudSyncService.lastSyncTime,
      };

      logger.info("✅ Cloud sync service found:", results.cloudSync);

      if (!cloudSyncService.isRunning) {
        results.warnings.push("Cloud sync service not running");
        logger.warn("⚠️ Cloud sync service not running");
      }
    } else {
      results.errors.push("cloudSyncService not available");
      logger.error("❌ cloudSyncService not available on window");
    }
  } catch (error) {
    results.errors.push("Cloud sync check failed: " + error.message);
    logger.error("❌ Cloud sync error:", error);
  }

  // Check 5: Firebase Auth
  logger.info("🔐 Checking Firebase Auth...");
  try {
    const firebaseAuth = (window as any).firebaseAuth;
    if (firebaseAuth) {
      const user = firebaseAuth.currentUser;
      results.firebaseAuth = {
        isSignedIn: !!user,
        userId: user?.uid || null,
        email: user?.email || null,
        isAnonymous: user?.isAnonymous || null,
      };

      if (user) {
        logger.info("✅ Firebase authenticated:", {
          uid: user.uid,
          email: user.email,
          isAnonymous: user.isAnonymous,
        });
      } else {
        results.warnings.push("Not authenticated with Firebase");
        logger.warn("⚠️ Not signed in to Firebase");
      }
    } else {
      results.errors.push("Firebase not available");
      logger.error("❌ Firebase not available on window");
    }
  } catch (error) {
    results.errors.push("Firebase auth check failed: " + error.message);
    logger.error("❌ Firebase auth error:", error);
  }

  // Check 6: Network Status
  logger.info("🌐 Checking Network...");
  const connection = (navigator as any).connection;
  results.network = {
    online: navigator.onLine,
    connection: connection
      ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
        }
      : "not available",
  };

  if (navigator.onLine) {
    logger.info("✅ Network online:", results.network);
  } else {
    results.errors.push("Device is offline");
    logger.error("❌ Device is offline");
  }

  // Summary
  logger.info("\n" + "=".repeat(50));
  logger.info("📋 DIAGNOSTIC SUMMARY");
  logger.info("=".repeat(50));

  if (results.errors.length > 0) {
    logger.error("❌ ERRORS:", results.errors);
  }

  if (results.warnings.length > 0) {
    logger.warn("⚠️ WARNINGS:", results.warnings);
  }

  if (results.errors.length === 0 && results.warnings.length === 0) {
    logger.info("✅ No critical issues detected");
  }

  logger.info("\n💾 Full diagnostic results:");
  logger.info(JSON.stringify(results, null, 2));

  return results;
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.runSyncDiagnostic = runSyncDiagnostic;
  // Sync diagnostic tool available via sync health dropdown
  // Console command: runSyncDiagnostic()
}
