import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { useConfirm } from "@/hooks/platform/ux/useConfirm";
import { trackImport } from "@/utils/platform/monitoring/performanceMonitor";
import { validateImportedData } from "@/utils/data/dataManagement/validationUtils";
import { budgetDb } from "@/db/budgetDb";
import { Transaction, Envelope, BudgetRecord, BudgetCommit, BudgetChange } from "@/db/types";
import logger from "@/utils/core/common/logger";

interface ImportCounts {
  envelopes: number;
  transactions: number;
  auditLog: number;
  history: number;
}

interface ImportResult {
  success: boolean;
  counts?: ImportCounts;
  error?: string;
}

// Define types for import data structure
interface ImportDataStructure {
  envelopes?: unknown[];
  allTransactions?: unknown[];
  auditLog?: unknown[];
  budget?: unknown[];
  budgetCommits?: unknown[];
  budgetChanges?: unknown[];
  [key: string]: unknown;
}

export const useImportData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToastHelpers();
  const confirm = useConfirm();

  const getImportCounts = useCallback(
    (data: ImportDataStructure): ImportCounts => ({
      envelopes: data.envelopes?.length || 0,
      transactions: data.allTransactions?.length || 0,
      auditLog: data.auditLog?.length || 0,
      history: (data.budgetCommits?.length || 0) + (data.budgetChanges?.length || 0),
    }),
    []
  );

  const performImport = useCallback(
    async (data: ImportDataStructure) => {
      try {
        await budgetDb.transaction(
          "rw",
          [
            budgetDb.envelopes,
            budgetDb.transactions,
            budgetDb.budget,
            budgetDb.budgetCommits,
            budgetDb.budgetChanges,
          ],
          async () => {
            await budgetDb.envelopes.clear();
            await budgetDb.transactions.clear();
            await budgetDb.budget.clear();
            await budgetDb.budgetCommits.clear();
            await budgetDb.budgetChanges.clear();

            // Cast to validation types or any to satisfy Dexie
            if (data.envelopes?.length) {
              await budgetDb.envelopes.bulkAdd(data.envelopes as unknown as Envelope[]);
            }
            if (data.allTransactions?.length) {
              await budgetDb.transactions.bulkAdd(data.allTransactions as unknown as Transaction[]);
            }

            // Import metadata
            if (data.budget?.length) {
              await budgetDb.budget.bulkAdd(data.budget as unknown as BudgetRecord[]);
            }

            // Import history if available
            if (data.budgetCommits?.length) {
              await budgetDb.budgetCommits.bulkAdd(data.budgetCommits as unknown as BudgetCommit[]);
            }
            if (data.budgetChanges?.length) {
              await budgetDb.budgetChanges.bulkAdd(data.budgetChanges as unknown as BudgetChange[]);
            }
          }
        );

        // Invalidate all related queries to force fresh data in UI
        await queryClient.invalidateQueries({ queryKey: ["envelopes"] });
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        await queryClient.invalidateQueries({ queryKey: ["budget-metadata"] });
        await queryClient.invalidateQueries({ queryKey: ["unassigned-cash"] });
        await queryClient.invalidateQueries({ queryKey: ["actual-balance"] });
        await queryClient.invalidateQueries({ queryKey: ["budget-commits"] });
        await queryClient.invalidateQueries({ queryKey: ["budget-changes"] });

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

        // Cast validatedData to ImportDataStructure since it matches shape but types might be strict
        const dataToImport = validatedData as unknown as ImportDataStructure;

        const counts = getImportCounts(dataToImport);
        const message = `This will overwrite your existing data with ${counts.envelopes} envelopes, ${counts.transactions} transactions, and ${counts.history} history entries. Continue?`;

        const confirmed = await confirm({
          title: "Confirm Import",
          message,
        });

        if (!confirmed) return;

        await trackImport(
          async () => {
            await performImport(dataToImport);
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
