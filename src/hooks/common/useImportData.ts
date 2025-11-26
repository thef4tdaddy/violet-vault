import React, { useCallback } from "react";
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
import type { UserData } from "../../types/auth";
import type { Envelope, Transaction } from "../../types/finance";
import type { Bill } from "../../types/bills";
import type { DebtAccount } from "../../types/debt";
import type { SavingsGoal } from "../../domain/schemas/savings-goal";
import type { AuditLogEntry } from "../../domain/schemas/audit-log";
import type { PaycheckHistory } from "../../domain/schemas/paycheck-history";

// Define validated data structure
interface ValidatedImportData {
  envelopes?: Envelope[];
  bills?: Bill[];
  debts?: DebtAccount[];
  auditLog?: AuditLogEntry[];
  allTransactions?: Transaction[];
  savingsGoals?: SavingsGoal[];
  paycheckHistory?: PaycheckHistory[];
  [key: string]: unknown; // Allow additional properties
}

// Define import counts structure
interface ImportCounts {
  envelopes: number;
  bills: number;
  debts: number;
  auditLog: number;
  transactions: number;
}

// Define import result structure
interface ImportResult {
  success: boolean;
  imported: {
    envelopes: number;
    bills: number;
    transactions: number;
    savingsGoals: number;
    debts: number;
    paycheckHistory: number;
    auditLog: number;
  };
}

// Define auth config structure
interface AuthConfig {
  budgetId: string | null;
  encryptionKey: CryptoKey | null;
  currentUser: UserData | null;
}

const getImportCounts = (validatedData: ValidatedImportData): ImportCounts => ({
  envelopes: validatedData.envelopes?.length || 0,
  bills: validatedData.bills?.length || 0,
  debts: validatedData.debts?.length || 0,
  auditLog: validatedData.auditLog?.length || 0,
  transactions: validatedData.allTransactions?.length || 0,
});

const buildBaseMessage = (counts: ImportCounts): string =>
  `Import ${counts.envelopes} envelopes, ${counts.bills} bills, ${counts.debts} debts, ${counts.auditLog} audit entries, and ${counts.transactions} transactions?\n\nThis will replace your current data.`;

const buildMismatchWarning = (
  importBudgetId: string | undefined,
  currentUser: UserData | null
): string => {
  const backupId = importBudgetId?.substring(0, 12) || "unknown";
  const currentId = currentUser?.budgetId?.substring(0, 12) || "unknown";
  return `\n\n⚠️ ENCRYPTION CONTEXT CHANGE DETECTED:\nBackup budgetId: ${backupId}...\nCurrent budgetId: ${currentId}...\n\nImport will re-encrypt data with your current session context.`;
};

const buildConfirmMessage = (
  validatedData: ValidatedImportData,
  hasBudgetIdMismatch: boolean,
  importBudgetId: string | undefined,
  currentUser: UserData | null
): string => {
  const counts = getImportCounts(validatedData);
  const baseMessage = buildBaseMessage(counts);

  if (hasBudgetIdMismatch) {
    return baseMessage + buildMismatchWarning(importBudgetId, currentUser);
  }

  return baseMessage;
};

const handleConfirmation = async (
  confirm: (config: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>,
  validatedData: ValidatedImportData,
  hasBudgetIdMismatch: boolean,
  importBudgetId: string | undefined,
  currentUser: UserData | null
): Promise<boolean> => {
  const message = buildConfirmMessage(
    validatedData,
    hasBudgetIdMismatch,
    importBudgetId,
    currentUser
  );
  const title = hasBudgetIdMismatch ? "Import Data (Encryption Context Change)" : "Import Data";

  return confirm({
    title,
    message,
    confirmLabel: "Import Data",
    cancelLabel: "Cancel",
    destructive: true,
  });
};

const buildImportResult = (validatedData: ValidatedImportData): ImportResult => ({
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
});

const performImport = async (
  validatedData: ValidatedImportData,
  showSuccessToast: (message: string, title?: string) => number,
  authConfig: AuthConfig
): Promise<void> => {
  await backupCurrentData();
  await clearFirebaseData();
  await clearAllDexieData();
  await importDataToDexie(validatedData);

  showSuccessToast("Local data imported! Now syncing to cloud...", "Import Complete");

  // Convert AuthConfig to the format expected by forcePushToCloud
  const syncConfig = {
    budgetId: authConfig.budgetId || undefined,
    encryptionKey: authConfig.encryptionKey || undefined,
    currentUser: authConfig.currentUser
      ? {
          userName: authConfig.currentUser.userName,
          userColor: authConfig.currentUser.userColor,
        }
      : undefined,
  };

  // Pass sync config to force push since sync service will be stopped during import
  await forcePushToCloud(syncConfig);
  showSuccessToast("Import complete! Data synced to cloud successfully.");

  // Force UI refresh by invalidating all queries
  await queryClient.invalidateQueries();
  await queryClient.refetchQueries();

  logger.info("✅ Data import completed and synced to cloud", {
    envelopes: validatedData.envelopes?.length || 0,
    transactions: validatedData.allTransactions?.length || 0,
    bills: validatedData.bills?.length || 0,
    debts: validatedData.debts?.length || 0,
    savingsGoals: validatedData.savingsGoals?.length || 0,
  });
  logger.info("TanStack Query cache invalidated and refetched after data import");
};

export const useImportData = () => {
  const { user: currentUser, budgetId, encryptionKey } = useAuthManager();
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const confirm = useConfirm();

  const importData = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputElement = event.target as HTMLInputElement;
      const file = inputElement.files ? inputElement.files[0] : null;
      if (!file) {
        if (inputElement) {
          inputElement.value = "";
        }
        return;
      }

      try {
        logger.info("Starting import process");

        const fileContent = await readFileContent(file);
        const importedData = JSON.parse(String(fileContent));

        const { validatedData, hasBudgetIdMismatch, importBudgetId } = validateImportedData(
          importedData,
          currentUser
        );

        const confirmed = await handleConfirmation(
          confirm,
          validatedData as ValidatedImportData,
          hasBudgetIdMismatch,
          importBudgetId,
          currentUser
        );

        if (!confirmed) {
          logger.info("Import cancelled by user");
          return;
        }

        // Build auth config to pass to force push
        // This ensures the sync service has access to auth data after being stopped
        const authConfig: AuthConfig = {
          budgetId,
          encryptionKey,
          currentUser,
        };

        await performImport(validatedData as ValidatedImportData, showSuccessToast, authConfig);

        return buildImportResult(validatedData as ValidatedImportData);
      } catch (error: unknown) {
        logger.error("Import failed", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(`Import failed: ${errorMessage}`, "Import Failed");
        throw error;
      } finally {
        if (inputElement) {
          inputElement.value = "";
        }
      }
    },
    [currentUser, budgetId, encryptionKey, confirm, showErrorToast, showSuccessToast]
  );

  return { importData };
};
