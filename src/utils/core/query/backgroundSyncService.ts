/**
 * Background Sync Service
 * Enhanced background sync utilities and network management
 * Extracted from queryClient.js for Issue #154
 */
import { budgetDb } from "@/db/budgetDb";
import logger from "./logger";
import queryClient from "./queryClientConfig.ts";
import { queryKeys } from "./queryKeys.ts";

// Enhanced background sync utilities
export const backgroundSync = {
  syncAllData: async () => {
    const queries = [
      queryKeys.envelopesList(),
      queryKeys.transactionsList(),
      queryKeys.billsList(),
      queryKeys.dashboardSummary(),
      queryKeys.savingsGoalsList(),
      queryKeys.paycheckHistory(),
    ];

    const results = await Promise.allSettled(
      queries.map((queryKey) => queryClient.refetchQueries({ queryKey }))
    );

    // Log sync results in development
    if (process.env.NODE_ENV === "development") {
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      logger.info(`Background sync completed: ${successful} successful, ${failed} failed`, {
        successful,
        failed,
        source: "backgroundSync",
      });
    }

    return results;
  },

  invalidateStaleData: () => {
    // Mark all data as stale to trigger background refetch
    queryClient.invalidateQueries();
  },

  syncWithDexie: async () => {
    try {
      // Sync TanStack Query cache with Dexie for persistence
      const queries = queryClient.getQueryCache().getAll();
      const syncPromises = queries.map(async (query) => {
        if (query.state.data) {
          const cacheKey = JSON.stringify(query.queryKey);
          await budgetDb.setCachedValue(cacheKey, query.state.data);
        }
      });

      await Promise.all(syncPromises);
      logger.info("Successfully synced query cache with Dexie", {
        source: "backgroundSync",
      });
    } catch (error) {
      logger.error("Failed to sync cache with Dexie", error, {
        source: "backgroundSync",
      });
    }
  },

  restoreFromDexie: async () => {
    try {
      // Restore cache from Dexie on app startup
      const cachedEntries = await budgetDb.cache.toArray();
      const restorePromises = cachedEntries.map(async (entry) => {
        try {
          // Only attempt to restore TanStack Query cache entries
          // Skip simple cache entries (like lastSyncTime, etc.)
          let queryKey;
          try {
            queryKey = JSON.parse(entry.key);
          } catch {
            // If it's not valid JSON, it's likely a simple cache entry, not a query key
            // Skip these entries as they're not TanStack Query cache
            return;
          }

          // Only restore if it's an array (valid TanStack Query key format)
          if (Array.isArray(queryKey)) {
            queryClient.setQueryData(queryKey, entry.value);
          }
        } catch (restoreError) {
          logger.warn("Failed to restore cached query", {
            key: entry.key,
            error: restoreError instanceof Error ? restoreError.message : String(restoreError),
            source: "backgroundSync",
          });
        }
      });

      await Promise.all(restorePromises);
      logger.info("Successfully restored query cache from Dexie", {
        source: "backgroundSync",
      });
    } catch (error) {
      logger.error("Failed to restore cache from Dexie", error, {
        source: "backgroundSync",
      });
    }
  },
};

// Network state management
export const networkManager = {
  onOnline: () => {
    // Trigger background sync when coming online
    backgroundSync.syncAllData();
    logger.info("Network online - triggering background sync", {
      source: "networkManager",
    });
  },

  onOffline: () => {
    // Save current state to Dexie when going offline
    backgroundSync.syncWithDexie();
    logger.info("Network offline - persisting cache to Dexie", {
      source: "networkManager",
    });
  },
};

// Initialize network listeners (but don't auto-execute cache restore)
if (typeof window !== "undefined") {
  window.addEventListener("online", networkManager.onOnline);
  window.addEventListener("offline", networkManager.onOffline);

  // Note: restoreFromDexie() should be called explicitly by app initialization,
  // not automatically on module load to prevent React error #185
}

export default backgroundSync;
