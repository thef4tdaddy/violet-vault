import React, { useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useConfirm } from "@/hooks/common/useConfirm";
import { useToastHelpers } from "@/utils/common/toastHelpers";
import logger from "@/utils/common/logger";
import { readFileContent } from "@/utils/dataManagement/fileUtils";
import {
  validateImportedData,
  type ValidationResult,
} from "@/utils/dataManagement/validationUtils";
import { backupCurrentData } from "@/utils/dataManagement/backupUtils";
import { clearAllDexieData, importDataToDexie } from "@/utils/dataManagement/dexieUtils";
import { clearFirebaseData, forcePushToCloud } from "@/utils/dataManagement/firebaseUtils";
import { queryClient } from "@/utils/common/queryClient";
import { trackImport } from "@/utils/monitoring/performanceMonitor";
import type { UserData } from "@/types/auth";
import type { Envelope } from "@/db/types";
import type { Transaction } from "@/types/finance";
import type { Bill } from "@/types/bills";
import type { DebtAccount } from "@/types/debt";
import type { SavingsGoal } from "@/domain/schemas/savings-goal";
import type { AuditLogEntry } from "@/domain/schemas/audit-log";
import type { PaycheckHistory } from "@/domain/schemas/paycheck-history";

/**
 * Interface for envelope with optional envelopeType for counting
 */
interface EnvelopeWithType extends Envelope {
  envelopeType?: string;
}

// Define validated data structure
interface ValidatedImportData {
  envelopes?: Envelope[];
  bills?: Bill[];
  debts?: DebtAccount[];
  auditLog?: AuditLogEntry[];
  allTransactions?: Transaction[];
  savingsGoals?: SavingsGoal[];
  supplementalAccounts?: unknown[];
  paycheckHistory?: PaycheckHistory[];
  [key: string]: unknown; // Allow additional properties
}

// Define import counts structure - updated for envelope-based model
interface ImportCounts {
  envelopes: number;
  savingsEnvelopes: number;
  supplementalEnvelopes: number;
  legacySavingsGoals: number;
  legacySupplementalAccounts: number;
  bills: number;
  debts: number;
  auditLog: number;
  transactions: number;
}

// Define import result structure - updated to include savings/supplemental counts
interface ImportResult {
  success: boolean;
  imported: {
    envelopes: number;
    savingsEnvelopes: number;
    supplementalEnvelopes: number;
    bills: number;
    transactions: number;
    savingsGoals: number;
    debts: number;
    paycheckHistory: number;
    auditLog: number;
  };
}

/**
 * Get import counts including envelope-based savings and supplemental accounts
 */
const getImportCounts = (validatedData: ValidatedImportData): ImportCounts => {
  const envelopes = (validatedData.envelopes || []) as EnvelopeWithType[];

  // Count envelopes by type
  const savingsEnvelopes = envelopes.filter((e) => e.envelopeType === "savings").length;
  const supplementalEnvelopes = envelopes.filter((e) => e.envelopeType === "supplemental").length;
  const regularEnvelopes = envelopes.length - savingsEnvelopes - supplementalEnvelopes;

  // Count legacy arrays that will be converted
  const legacySavingsGoals = validatedData.savingsGoals?.length || 0;
  const legacySupplementalAccounts = (validatedData.supplementalAccounts as unknown[])?.length || 0;

  return {
    envelopes: regularEnvelopes,
    savingsEnvelopes,
    supplementalEnvelopes,
    legacySavingsGoals,
    legacySupplementalAccounts,
    bills: validatedData.bills?.length || 0,
    debts: validatedData.debts?.length || 0,
    auditLog: validatedData.auditLog?.length || 0,
    transactions: validatedData.allTransactions?.length || 0,
  };
};

/**
 * Build base message for import confirmation - updated for envelope-based model
 */
const buildBaseMessage = (counts: ImportCounts): string => {
  const parts: string[] = [];

  // Regular envelopes
  if (counts.envelopes > 0) {
    parts.push(`${counts.envelopes} envelopes`);
  }

  // Savings (both from envelopes and legacy conversion)
  const totalSavings = counts.savingsEnvelopes + counts.legacySavingsGoals;
  if (totalSavings > 0) {
    if (counts.legacySavingsGoals > 0 && counts.savingsEnvelopes > 0) {
      parts.push(
        `${totalSavings} savings goals (${counts.savingsEnvelopes} as envelopes, ${counts.legacySavingsGoals} legacy → converted)`
      );
    } else if (counts.legacySavingsGoals > 0) {
      parts.push(`${counts.legacySavingsGoals} savings goals (legacy → converted to envelopes)`);
    } else {
      parts.push(`${counts.savingsEnvelopes} savings goals`);
    }
  }

  // Supplemental accounts (both from envelopes and legacy conversion)
  const totalSupplemental = counts.supplementalEnvelopes + counts.legacySupplementalAccounts;
  if (totalSupplemental > 0) {
    if (counts.legacySupplementalAccounts > 0 && counts.supplementalEnvelopes > 0) {
      parts.push(
        `${totalSupplemental} supplemental accounts (${counts.supplementalEnvelopes} as envelopes, ${counts.legacySupplementalAccounts} legacy → converted)`
      );
    } else if (counts.legacySupplementalAccounts > 0) {
      parts.push(
        `${counts.legacySupplementalAccounts} supplemental accounts (legacy → converted to envelopes)`
      );
    } else {
      parts.push(`${counts.supplementalEnvelopes} supplemental accounts`);
    }
  }

  if (counts.bills > 0) {
    parts.push(`${counts.bills} bills`);
  }
  if (counts.debts > 0) {
    parts.push(`${counts.debts} debts`);
  }
  if (counts.auditLog > 0) {
    parts.push(`${counts.auditLog} audit entries`);
  }
  if (counts.transactions > 0) {
    parts.push(`${counts.transactions} transactions`);
  }

  const summary = parts.length > 0 ? parts.join(", ") : "no data";
  return `Import ${summary}?\n\nThis will replace your current data.`;
};

const buildMismatchWarning = (
  importBudgetId: string | undefined,
  currentUser: UserData | null
): string => {
  const backupId = importBudgetId?.substring(0, 12) || "unknown";
  const currentId = currentUser?.budgetId?.substring(0, 12) || "unknown";
  return `\n\n⚠️ ENCRYPTION CONTEXT CHANGE DETECTED:\nBackup budgetId: ${backupId}...\nCurrent budgetId: ${currentId}...\n\nImport will re-encrypt data with your current session context.`;
};

/**
 * Maximum number of validation warnings to display in confirmation dialog
 */
const MAX_DISPLAYED_WARNINGS = 5;

/**
 * Build validation warning message for confirmation dialog
 */
const buildValidationWarning = (validationWarnings: string[]): string => {
  if (validationWarnings.length === 0) {
    return "";
  }

  const displayedWarnings = validationWarnings.slice(0, MAX_DISPLAYED_WARNINGS).join("\n");
  const remainingCount = validationWarnings.length - MAX_DISPLAYED_WARNINGS;
  const moreWarningsText = remainingCount > 0 ? `\n... and ${remainingCount} more warnings` : "";

  return `\n\n⚠️ VALIDATION WARNINGS:\n${displayedWarnings}${moreWarningsText}`;
};

const buildConfirmMessage = (
  validatedData: ValidatedImportData,
  hasBudgetIdMismatch: boolean,
  importBudgetId: string | undefined,
  currentUser: UserData | null,
  validationWarnings: string[] = []
): string => {
  const counts = getImportCounts(validatedData);
  let message = buildBaseMessage(counts);

  if (hasBudgetIdMismatch) {
    message += buildMismatchWarning(importBudgetId, currentUser);
  }

  if (validationWarnings.length > 0) {
    message += buildValidationWarning(validationWarnings);
  }

  return message;
};

/**
 * Confirmation options for import dialog
 */
interface ConfirmationOptions {
  confirm: (config: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }) => Promise<boolean>;
  validatedData: ValidatedImportData;
  hasBudgetIdMismatch: boolean;
  importBudgetId: string | undefined;
  currentUser: UserData | null;
  validationWarnings?: string[];
}

const handleConfirmation = async (options: ConfirmationOptions): Promise<boolean> => {
  const {
    confirm,
    validatedData,
    hasBudgetIdMismatch,
    importBudgetId,
    currentUser,
    validationWarnings = [],
  } = options;

  const message = buildConfirmMessage(
    validatedData,
    hasBudgetIdMismatch,
    importBudgetId,
    currentUser,
    validationWarnings
  );

  const hasWarnings = validationWarnings.length > 0;
  let title = "Import Data";
  if (hasBudgetIdMismatch && hasWarnings) {
    title = "Import Data (Warnings Detected)";
  } else if (hasBudgetIdMismatch) {
    title = "Import Data (Encryption Context Change)";
  } else if (hasWarnings) {
    title = "Import Data (Validation Warnings)";
  }

  return confirm({
    title,
    message,
    confirmLabel: "Import Data",
    cancelLabel: "Cancel",
    destructive: true,
  });
};

/**
 * Build import result with envelope-based statistics
 */
const buildImportResult = (validatedData: ValidatedImportData): ImportResult => {
  const counts = getImportCounts(validatedData);

  return {
    success: true,
    imported: {
      envelopes: counts.envelopes,
      savingsEnvelopes: counts.savingsEnvelopes + counts.legacySavingsGoals,
      supplementalEnvelopes: counts.supplementalEnvelopes + counts.legacySupplementalAccounts,
      bills: counts.bills,
      transactions: counts.transactions,
      savingsGoals: counts.legacySavingsGoals, // Legacy count for backward compatibility
      debts: counts.debts,
      paycheckHistory: validatedData.paycheckHistory?.length || 0,
      auditLog: counts.auditLog,
    },
  };
};

const performImport = async (
  validatedData: ValidatedImportData,
  showSuccessToast: (message: string, title?: string) => number
): Promise<void> => {
  await backupCurrentData();
  await clearFirebaseData();
  await clearAllDexieData();
  await importDataToDexie(validatedData);

  showSuccessToast("Local data imported! Now syncing to cloud...", "Import Complete");

  // Pass sync config to force push since sync service will be stopped during import
  await forcePushToCloud();
  showSuccessToast("Import complete! Data synced to cloud successfully.");

  // Force UI refresh by invalidating all queries
  await queryClient.invalidateQueries();
  await queryClient.refetchQueries();

  const counts = getImportCounts(validatedData);
  logger.info("✅ Data import completed and synced to cloud", {
    envelopes: counts.envelopes,
    savingsEnvelopes: counts.savingsEnvelopes + counts.legacySavingsGoals,
    supplementalEnvelopes: counts.supplementalEnvelopes + counts.legacySupplementalAccounts,
    transactions: counts.transactions,
    bills: counts.bills,
    debts: counts.debts,
  });
  logger.info("TanStack Query cache invalidated and refetched after data import");
};

/**
 * Process the validated import data with Sentry performance tracking
 * Extracted to reduce statement count in main import function
 */
const executeImport = async (
  validationResult: ValidationResult,
  showSuccessToast: (message: string, title?: string) => number,
  showWarningToast: (message: string, title?: string) => number
): Promise<ImportResult> => {
  const { validatedData, validationWarnings } = validationResult;
  const counts = getImportCounts(validatedData as ValidatedImportData);

  // Track import performance with Sentry
  await trackImport(
    async () => {
      await performImport(validatedData as ValidatedImportData, showSuccessToast);
    },
    {
      itemsImported:
        counts.envelopes +
        counts.savingsEnvelopes +
        counts.supplementalEnvelopes +
        counts.bills +
        counts.debts +
        counts.transactions +
        counts.auditLog,
      envelopes: counts.envelopes,
      transactions: counts.transactions,
      bills: counts.bills,
      debts: counts.debts,
      validationWarnings: validationWarnings.length,
    }
  );

  // Show warning toast if there were validation issues
  if (validationWarnings.length > 0) {
    showWarningToast(
      `Import completed with ${validationWarnings.length} validation warning(s). Some items may have been imported with default values.`,
      "Import Warnings"
    );
  }

  return buildImportResult(validatedData as ValidatedImportData);
};

/**
 * Log validation warnings if present
 */
const logValidationWarnings = (validationWarnings: string[]): void => {
  if (validationWarnings.length > 0) {
    logger.warn("Import data has validation warnings", {
      warningCount: validationWarnings.length,
    });
  }
};

export const useImportData = () => {
  const { user: currentUser } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();
  const confirm = useConfirm();

  const importData = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputElement = event.target as HTMLInputElement;
      const file = inputElement.files ? inputElement.files[0] : null;
      if (!file) {
        if (inputElement) inputElement.value = "";
        return;
      }

      try {
        logger.info("Starting import process");
        const fileContent = await readFileContent(file);
        const importedData = JSON.parse(String(fileContent));
        const validationResult: ValidationResult = validateImportedData(importedData, currentUser);
        const { validatedData, hasBudgetIdMismatch, importBudgetId, validationWarnings } =
          validationResult;

        logValidationWarnings(validationWarnings);

        const confirmed = await handleConfirmation({
          confirm,
          validatedData: validatedData as ValidatedImportData,
          hasBudgetIdMismatch,
          importBudgetId,
          currentUser,
          validationWarnings,
        });

        if (!confirmed) {
          logger.info("Import cancelled by user");
          return;
        }

        return await executeImport(validationResult, showSuccessToast, showWarningToast);
      } catch (error: unknown) {
        logger.error("Import failed", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        showErrorToast(`Import failed: ${errorMessage}`, "Import Failed");
        throw error;
      } finally {
        if (inputElement) inputElement.value = "";
      }
    },
    [currentUser, confirm, showSuccessToast, showErrorToast, showWarningToast]
  );

  return { importData };
};
