import { useCallback } from "react";
import { useAuthManager } from "../auth/useAuthManager";
import { useConfirm } from "./useConfirm";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import logger from "../../utils/common/logger";
import { readFileContent } from "../../utils/dataManagement/fileUtils";
import { validateImportedData } from "../../utils/dataManagement/validationUtils";
import { backupCurrentData } from "../../utils/dataManagement/backupUtils";
import { clearAllDexieData, importDataToDexie } from "../../utils/dataManagement/dexieUtils";
import { clearFirebaseData, forcePushToCloud } from "../../utils/dataManagement/firebaseUtils";
import { queryClient } from "../../utils/common/queryClient";

const handleConfirmation = async (
  confirm,
  validatedData,
  hasBudgetIdMismatch,
  importBudgetId,
  currentUser
) => {
  let confirmMessage = `Import ${validatedData.envelopes?.length || 0} envelopes, ${validatedData.bills?.length || 0} bills, ${validatedData.debts?.length || 0} debts, ${validatedData.auditLog?.length || 0} audit entries, and ${validatedData.allTransactions?.length || 0} transactions?\n\nThis will replace your current data.`;
  if (hasBudgetIdMismatch) {
    confirmMessage += `\n\n⚠️ ENCRYPTION CONTEXT CHANGE DETECTED:\nBackup budgetId: ${importBudgetId?.substring(0, 12)}...\nCurrent budgetId: ${currentUser?.budgetId?.substring(0, 12)}...\n\nImport will re-encrypt data with your current session context.`;
  }

  return confirm({
    title: hasBudgetIdMismatch ? "Import Data (Encryption Context Change)" : "Import Data",
    message: confirmMessage,
    confirmLabel: "Import Data",
    cancelLabel: "Cancel",
    destructive: true,
  });
};

const performImport = async (validatedData, showSuccessToast) => {
  await backupCurrentData();
  await clearFirebaseData();
  await clearAllDexieData();
  await importDataToDexie(validatedData);

  showSuccessToast("Local data imported! Now syncing to cloud...", "Import Complete");

  await forcePushToCloud();
  showSuccessToast("Import complete! Data synced to cloud successfully.");

  await queryClient.invalidateQueries();
  logger.info("TanStack Query cache invalidated after data import");
};

export const useImportData = () => {
  const { user: currentUser } = useAuthManager();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const confirm = useConfirm();

  const importData = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        logger.info("Starting import process");

        const fileContent = await readFileContent(file);
        const importedData = JSON.parse(fileContent);

        const { validatedData, hasBudgetIdMismatch, importBudgetId } = validateImportedData(
          importedData,
          currentUser
        );

        const confirmed = await handleConfirmation(
          confirm,
          validatedData,
          hasBudgetIdMismatch,
          importBudgetId,
          currentUser
        );

        if (!confirmed) {
          logger.info("Import cancelled by user");
          return;
        }

        await performImport(validatedData, showSuccessToast);

        return {
          success: true,
          imported: {
            envelopes: validatedData.envelopes?.length || 0,
            bills: validatedData.bills?.length || 0,
            transactions: validatedData.allTransactions?.length || 0,
            savingsGoals: validatedData.savingsGoals?.length || 0,
            debts: validatedData.debts?.length || 0,
            paycheckHistory: validatedData.paycheckHistory?.length || 0,
            auditLog: validatedData.auditLog?.length || 0,
          },
        };
      } catch (error) {
        logger.error("Import failed", error);
        showErrorToast(`Import failed: ${error.message}`, "Import Failed");
        throw error;
      }
    },
    [currentUser, confirm, showErrorToast, showSuccessToast]
  );

  return { importData };
};
