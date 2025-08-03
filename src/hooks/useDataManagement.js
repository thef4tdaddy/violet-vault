import { useCallback } from "react";
import { encryptionUtils } from "../utils/encryption";
import useAuthStore from "../stores/authStore";

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = () => {
  const { encryptionKey, currentUser } = useAuthStore();

  const exportData = useCallback(async () => {
    try {
      console.log("📁 Starting export process...");

      // Get current data from localStorage
      const savedData = localStorage.getItem("envelopeBudgetData");
      if (!savedData) {
        alert("No data found to export");
        return;
      }

      // Decrypt the data
      const { encryptedData, iv } = JSON.parse(savedData);
      const decryptedData = await encryptionUtils.decrypt(encryptedData, encryptionKey, iv);

      // Normalize transactions for unified structure
      const allTransactions = Array.isArray(decryptedData.allTransactions)
        ? decryptedData.allTransactions
        : [...(decryptedData.transactions || []), ...(decryptedData.bills || [])];
      const transactions = allTransactions.filter((t) => !t.type || t.type === "transaction");

      // Prepare export data with metadata
      const exportData = {
        ...decryptedData,
        transactions,
        allTransactions,
        exportMetadata: {
          exportedBy: currentUser?.userName || "Unknown User",
          exportDate: new Date().toISOString(),
          appVersion: "1.0.0",
          dataVersion: "1.0",
        },
      };

      // Create and download the file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `VioletVault Budget Backup ${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("✅ Export completed successfully");
      alert("Backup exported successfully!");
    } catch (error) {
      console.error("❌ Export failed:", error);
      alert(`Export failed: ${error.message}`);
    }
  }, [encryptionKey, currentUser]);

  const importData = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        console.log("📁 Starting import process...");

        // Read the file
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        // Parse JSON
        const importedData = JSON.parse(fileContent);
        console.log("✅ File parsed successfully:", {
          envelopes: importedData.envelopes?.length || 0,
          bills: importedData.bills?.length || 0,
          savingsGoals: importedData.savingsGoals?.length || 0,
          allTransactions: importedData.allTransactions?.length || 0,
        });

        // Build unified transaction list if missing
        const unifiedAllTransactions = Array.isArray(importedData.allTransactions)
          ? importedData.allTransactions
          : [...(importedData.transactions || []), ...(importedData.bills || [])];
        const unifiedTransactions = unifiedAllTransactions.filter(
          (t) => !t.type || t.type === "transaction"
        );

        // Validate the data structure
        if (!importedData.envelopes || !Array.isArray(importedData.envelopes)) {
          throw new Error("Invalid backup file: missing or invalid envelopes data");
        }

        // Confirm import with user
        const confirmed = confirm(
          `Import ${importedData.envelopes?.length || 0} envelopes, ${importedData.bills?.length || 0} bills, and ${importedData.allTransactions?.length || 0} transactions?\n\nThis will replace your current data.`
        );

        if (!confirmed) {
          console.log("Import cancelled by user");
          return;
        }

        // Create backup of current data before import
        try {
          const currentData = localStorage.getItem("envelopeBudgetData");
          if (currentData) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            localStorage.setItem(`envelopeBudgetData_backup_${timestamp}`, currentData);
            console.log("✅ Current data backed up");
          }
        } catch (backupError) {
          console.warn("⚠️ Failed to create backup:", backupError);
        }

        // Prepare the data for loading - ensure user information is preserved
        const processedData = {
          ...importedData,
          transactions: unifiedTransactions,
          allTransactions: unifiedAllTransactions,
          // Preserve current user info
          currentUser: currentUser,
        };

        console.log("✅ Import completed successfully");
        alert("Data imported successfully!");

        return processedData;
      } catch (error) {
        console.error("❌ Import failed:", error);
        alert(`Import failed: ${error.message}`);
        throw error;
      }
    },
    [currentUser]
  );

  const resetEncryptionAndStartFresh = useCallback(() => {
    console.log("🔄 Resetting encryption and starting fresh...");

    // Clear all stored data
    const keysToRemove = ["envelopeBudgetData", "userProfile", "passwordLastChanged"];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear any backup data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("envelopeBudgetData_backup_")) {
        localStorage.removeItem(key);
      }
    });

    console.log("✅ All data cleared, ready for fresh start");

    // Force page reload to reset application state
    window.location.reload();
  }, []);

  return {
    exportData,
    importData,
    resetEncryptionAndStartFresh,
  };
};

export default useDataManagement;
