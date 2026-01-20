import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { trackImport } from "@/utils/platform/monitoring/performanceMonitor";
import {
  validateImportedData,
  type ValidatedImportData,
} from "@/utils/data/dataManagement/validationUtils";
import { budgetDb } from "@/db/budgetDb";
import { Transaction } from "@/db/types";
import logger from "@/utils/core/common/logger";

interface ImportCounts {
  envelopes: number;
  transactions: number;
  auditLog: number;
}

interface ImportResult {
  success: boolean;
  counts?: ImportCounts;
  error?: string;
}

export const useImportData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();
  const confirm = useConfirm();

  const getImportCounts = useCallback(
    (data: ValidatedImportData): ImportCounts => ({
      envelopes: data.envelopes?.length || 0,
      transactions: data.allTransactions?.length || 0,
      auditLog: 0,
    }),
    []
  );

  const performImport = useCallback(
    async (data: ValidatedImportData) => {
      try {
        await budgetDb.transaction("rw", [budgetDb.envelopes, budgetDb.transactions], async () => {
          await budgetDb.envelopes.clear();
          await budgetDb.transactions.clear();

          if (data.envelopes?.length) await budgetDb.envelopes.bulkAdd(data.envelopes);
          if (data.allTransactions?.length)
            await budgetDb.transactions.bulkAdd(data.allTransactions as Transaction[]);
        });

        // Invalidate all related queries to force fresh data in UI
        await queryClient.invalidateQueries({ queryKey: ["envelopes"] });
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["budget-metadata"] });
        await queryClient.invalidateQueries({ queryKey: ["unassigned-cash"] });
        await queryClient.invalidateQueries({ queryKey: ["actual-balance"] });

        showSuccessToast("Data imported successfully");
      } catch (error) {
        logger.error("Import failed during database operation", error);
        throw error;
      }
    },
    [showSuccessToast, queryClient]
  );

  const executeImport = useCallback(
    async (importedData: unknown): Promise<ImportResult | undefined> => {
      try {
        const validationResult = validateImportedData(importedData, user);
        const { validatedData, hasBudgetIdMismatch, validationWarnings } = validationResult;

        const counts = getImportCounts(validatedData);
        const message = `This will overwrite your existing data with ${counts.envelopes} envelopes and ${counts.transactions} transactions. Continue?`;

        const confirmed = await confirm({
          title: "Confirm Import",
          message,
        });

        if (!confirmed) return;

        await trackImport(
          async () => {
            await performImport(validatedData);
          },
          {
            envelopeCount: counts.envelopes,
            transactionCount: counts.transactions,
            isBudgetIdMismatch: hasBudgetIdMismatch,
          }
        );

        if (validationWarnings.length > 0) {
          showWarningToast(
            `Import completed with ${validationWarnings.length} validation warning(s).`,
            "Import Warnings"
          );
        }

        return { success: true, counts };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Invalid import file structure";
        showErrorToast(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [user, confirm, showWarningToast, showErrorToast, getImportCounts, performImport]
  );

  return { executeImport };
};
