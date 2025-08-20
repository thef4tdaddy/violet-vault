// Development debugging tools - accessible in browser console
import logger from "./logger";

// Export debug functions to window for browser console access
if (typeof window !== "undefined") {
  window.debugVioletVault = window.debugVioletVault || {};

  window.debugVioletVault.clearAllData = async () => {
    if (!confirm("This will clear ALL local data. Are you sure?")) return;

    // Clear localStorage
    localStorage.clear();

    // Clear IndexedDB
    if ("indexedDB" in window) {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(async (db) => {
          return new Promise((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name);
            deleteReq.onsuccess = () => resolve();
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        }),
      );
    }

    logger.info("🗑️ All local data cleared");
    window.location.reload();
  };

  window.debugVioletVault.clearAllCloudData = async () => {
    if (!confirm("This will clear ALL cloud data for ALL budget IDs. Are you sure?")) return;

    try {
      logger.info("🔄 Starting comprehensive cloud data cleanup...");

      // List of known budget IDs to clean up
      const knownBudgetIds = [
        "budget_3",
        "budget_38d2ee32",
        // Add any other budget IDs we've seen in logs
      ];

      // Import ChunkedFirebaseSync for cleanup
      const ChunkedFirebaseSync = (await import("./chunkedFirebaseSync")).default;
      
      // Initialize with a dummy encryption key for cleanup operations
      const { encryptionUtils } = await import("./encryption");
      const dummyKeyData = await encryptionUtils.deriveKey("dummy_password_for_cleanup");
      
      for (const budgetId of knownBudgetIds) {
        try {
          logger.info(`🗑️ Cleaning up cloud data for ${budgetId}...`);
          
          await ChunkedFirebaseSync.initialize(budgetId, dummyKeyData.key);
          const result = await ChunkedFirebaseSync.resetCloudData();
          
          logger.info(`✅ Cleaned up ${budgetId}:`, result);
        } catch (error) {
          logger.warn(`⚠️ Failed to clean up ${budgetId}:`, error.message);
        }
      }

      logger.info("✅ Comprehensive cloud cleanup completed!");
      
    } catch (error) {
      logger.error("❌ Cloud cleanup failed:", error);
    }
  };

  window.debugVioletVault.testBudgetIdGeneration = async () => {
    const { encryptionUtils } = await import("./encryption");
    
    const testPassword = "test_password_123";
    logger.info("🧪 Testing budget ID generation consistency...");
    
    const results = [];
    for (let i = 0; i < 5; i++) {
      const budgetId = encryptionUtils.generateBudgetId(testPassword);
      results.push(budgetId);
      logger.info(`Test ${i + 1}: ${budgetId}`);
    }
    
    const allSame = results.every(id => id === results[0]);
    logger.info(`✅ Budget ID generation is ${allSame ? 'CONSISTENT' : 'INCONSISTENT'}`, {
      results,
      allSame
    });
    
    return { results, allSame };
  };

  logger.info("🔧 Debug tools loaded! Access via window.debugVioletVault");
}