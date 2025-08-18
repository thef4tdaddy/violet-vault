/**
 * Fix Metadata Tool - Initialize missing metadata record without losing data
 * Usage: Copy and paste this into browser console to fix metadata issues
 */

export const fixMetadata = async () => {
  console.log("🔧 VioletVault Metadata Fix Tool");
  console.log("=".repeat(50));

  try {
    // Check if budgetDb is available
    if (!window.budgetDb) {
      console.error("❌ budgetDb not available on window");
      return { success: false, error: "budgetDb not available" };
    }

    // Check current metadata
    const existingMetadata = await window.budgetDb.budget.get("metadata");

    if (existingMetadata) {
      console.log("✅ Metadata already exists:", existingMetadata);
      return { success: true, action: "no_change", metadata: existingMetadata };
    }

    console.log("📝 Creating metadata record...");

    // Create metadata with safe defaults
    const newMetadata = {
      id: "metadata",
      unassignedCash: 0,
      actualBalance: 0,
      isActualBalanceManual: false,
      biweeklyAllocation: 0,
      lastModified: Date.now(),
    };

    // Save to database
    await window.budgetDb.budget.put(newMetadata);

    console.log("✅ Metadata created successfully:", newMetadata);

    // Verify it was saved
    const verifyMetadata = await window.budgetDb.budget.get("metadata");
    if (verifyMetadata) {
      console.log("✅ Verification successful - metadata is now in database");

      // Trigger sync if cloud sync service is available
      if (window.cloudSyncService && window.cloudSyncService.isRunning) {
        console.log("🔄 Triggering sync...");
        try {
          const syncResult = await window.cloudSyncService.forceSync();
          console.log("🔄 Sync result:", syncResult);
        } catch (syncError) {
          console.warn("⚠️ Sync trigger failed:", syncError);
        }
      }

      return {
        success: true,
        action: "created",
        metadata: verifyMetadata,
        syncTriggered: !!window.cloudSyncService?.isRunning,
      };
    } else {
      throw new Error("Failed to verify metadata creation");
    }
  } catch (error) {
    console.error("❌ Failed to fix metadata:", error);
    return { success: false, error: error.message };
  }
};

// Auto-run if in browser console
if (typeof window !== "undefined") {
  window.fixMetadata = fixMetadata;
  console.log("🔧 Metadata fix tool loaded! Run: fixMetadata()");
}
