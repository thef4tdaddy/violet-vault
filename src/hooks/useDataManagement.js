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

      // Try different localStorage keys (new Zustand format first, then old formats)
      let rawData = null;
      let dataSource = null;

      // Try new violet-vault-store (develop branch)
      const newData = localStorage.getItem("violet-vault-store");
      if (newData) {
        rawData = JSON.parse(newData);
        dataSource = "violet-vault-store";
        console.log("📁 Found data in violet-vault-store");
      }

      // Try old budget-store (main branch)
      if (!rawData) {
        const oldData = localStorage.getItem("budget-store");
        if (oldData) {
          rawData = JSON.parse(oldData);
          dataSource = "budget-store";
          console.log("📁 Found data in budget-store");
        }
      }

      // Try legacy envelopeBudgetData (very old format)
      if (!rawData) {
        const legacyData = localStorage.getItem("envelopeBudgetData");
        if (legacyData) {
          const { encryptedData, iv } = JSON.parse(legacyData);
          rawData = {
            state: await encryptionUtils.decrypt(encryptedData, encryptionKey, iv),
          };
          dataSource = "envelopeBudgetData";
          console.log("📁 Found encrypted data in envelopeBudgetData");
        }
      }

      if (!rawData) {
        alert("No data found to export");
        return;
      }

      // Extract data from different store formats
      let decryptedData;
      if (dataSource === "violet-vault-store") {
        // New Zustand format - data is directly in state
        decryptedData = rawData.state || rawData;
      } else if (dataSource === "budget-store") {
        // Old Zustand format - data is in state property
        decryptedData = rawData.state || rawData;
      } else {
        // Legacy encrypted format - already decrypted above
        decryptedData = rawData.state;
      }

      console.log("📁 Data extracted from", dataSource, "- Keys:", Object.keys(decryptedData));

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
          appVersion: "1.8.0",
          dataVersion: "2.0",
          dataSource: dataSource,
          exportedFrom: "develop-branch",
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
          // Backup from the correct localStorage key
          const currentVioletData = localStorage.getItem("violet-vault-store");
          const currentBudgetData = localStorage.getItem("budget-store");
          const currentLegacyData = localStorage.getItem("envelopeBudgetData");

          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

          if (currentVioletData) {
            localStorage.setItem(`violet-vault-store_backup_${timestamp}`, currentVioletData);
            console.log("✅ Current violet-vault-store data backed up");
          }
          if (currentBudgetData) {
            localStorage.setItem(`budget-store_backup_${timestamp}`, currentBudgetData);
            console.log("✅ Current budget-store data backed up");
          }
          if (currentLegacyData) {
            localStorage.setItem(`envelopeBudgetData_backup_${timestamp}`, currentLegacyData);
            console.log("✅ Current legacy data backed up");
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
