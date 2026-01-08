import type React from "react";
import { useTransactionFileUpload } from "./useTransactionFileUpload";
import { useTransactionImportProcessing } from "./useTransactionImportProcessing";
import { globalToast } from "@/stores/ui/toastStore";
import logger from "@/utils/common/logger";

interface FieldMapping {
  date?: string;
  description?: string;
  amount?: string;
  [key: string]: string | undefined;
}

interface ImportData {
  clearExisting?: boolean;
  [key: string]: unknown;
}

export const useTransactionImport = (
  currentUser: unknown,
  onBulkImport: (transactions: unknown[]) => void
) => {
  // Use focused sub-hooks
  const {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    handleFileUpload,
    resetImport: resetFileUpload,
  } = useTransactionFileUpload() as unknown as {
    importData: ImportData;
    importStep: number;
    setImportStep: (step: number) => void;
    fieldMapping: FieldMapping;
    setFieldMapping: (mapping: FieldMapping) => void;
    handleFileUpload: (
      event: React.ChangeEvent<HTMLInputElement>,
      options?: { clearExisting?: boolean }
    ) => void;
    resetImport: () => void;
  };

  const {
    importProgress,
    setImportProgress,
    autoFundingResults,
    setAutoFundingResults,
    clearExistingData,
    processTransactions,
    generateSuccessMessage,
  } = useTransactionImportProcessing(currentUser as { userName?: string } | undefined);

  const handleImport = async () => {
    if (!fieldMapping.date || !fieldMapping.description || !fieldMapping.amount) {
      globalToast.showError(
        "Please map at least Date, Description, and Amount fields",
        "Mapping Required",
        undefined
      );
      return;
    }

    // Clear existing data if option is selected
    if (importData.clearExisting) {
      try {
        await clearExistingData();
      } catch {
        globalToast.showError(
          "Failed to clear existing data. Import cancelled.",
          "Clear Failed",
          8000
        );
        return;
      }
    }

    setImportStep(3);

    // Process transactions with validation
    const processResult = await processTransactions(
      importData as unknown[] | { data?: unknown[] },
      fieldMapping as {
        amount: string;
        date: string;
        description: string;
        category: string;
        notes: string;
      }
    );

    // Show validation warnings if any rows were invalid
    if (processResult.invalid.length > 0) {
      const errorCount = processResult.invalid.length;
      const errorSummary = processResult.invalid
        .slice(0, 3)
        .map((invalid) => {
          const descriptionField = fieldMapping.description || "description";
          const rowDesc =
            (invalid.row as Record<string, unknown>)?.[descriptionField] ||
            `Row ${invalid.index + 1}`;
          return `  • ${rowDesc}: ${invalid.errors.slice(0, 2).join("; ")}`;
        })
        .join("\n");
      const moreText =
        processResult.invalid.length > 3
          ? `\n  ... and ${processResult.invalid.length - 3} more`
          : "";

      globalToast.showWarning(
        `${errorCount} row(s) skipped due to validation errors:\n${errorSummary}${moreText}`,
        "Import Warnings",
        8000
      );
    }

    // Import only valid transactions
    onBulkImport(processResult.valid);

    // Process auto-funding for income transactions
    const autoFundingPromises: unknown[] = [];
    const incomeTransactions = processResult.valid.filter((t) => t.amount > 0);

    if (incomeTransactions.length > 0) {
      logger.info("Processing auto-funding for imported income transactions", {
        incomeCount: incomeTransactions.length,
      });

      // Auto-funding for imported income transactions is planned for future enhancement
      // when modular auto-funding hooks are available
    }

    setAutoFundingResults(autoFundingPromises);
    resetImport();

    // Enhanced success message including auto-funding results
    const message = generateSuccessMessage(
      processResult,
      importData as { clearExisting?: boolean },
      autoFundingPromises as Array<{
        result: { execution: { totalFunded: number; rulesExecuted: number } };
      }>
    );
    globalToast.showInfo(message, "Import Update", 5000);
  };

  const resetImport = () => {
    resetFileUpload();
    setImportProgress(0);
    setAutoFundingResults([]);
  };

  return {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    autoFundingResults,
    handleFileUpload,
    handleImport,
    resetImport,
  };
};
