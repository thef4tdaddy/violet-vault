import { useState } from "react";
import logger from "@/utils/core/common/logger";
import { TransactionImportOrchestrator } from "@/services/transactions/transactionImportOrchestrator";
import type { ProcessTransactionsResult } from "@/services/transactions/transactionImportOrchestrator";

export type { ProcessTransactionsResult };

/**
 * Generate success message for transaction import
 * Extracted to reduce hook function length
 */
export const generateSuccessMessage = (
  result: ProcessTransactionsResult,
  importData: { clearExisting?: boolean },
  autoFundingPromises: Array<{
    result: { execution: { totalFunded: number; rulesExecuted: number } };
  }>
): string => {
  const { valid: processedTransactions, invalid } = result;
  const incomeCount = processedTransactions.filter((t) => t.amount >= 0).length;
  const expenseCount = processedTransactions.filter((t) => t.amount < 0).length;

  let message = importData.clearExisting
    ? `🗑️ Cleared existing data and imported ${processedTransactions.length} transactions!\n`
    : `Successfully imported ${processedTransactions.length} transactions!\n`;

  message += `• ${incomeCount} income transactions\n` + `• ${expenseCount} expense transactions\n`;

  if (invalid.length > 0) {
    message += `\n⚠️ ${invalid.length} row(s) skipped due to validation errors.`;
  }

  message += "\n";

  if (autoFundingPromises.length > 0) {
    const totalAutoFunded = autoFundingPromises.reduce(
      (sum: number, result) => sum + result.result.execution.totalFunded,
      0
    );
    message +=
      `🤖 Auto-funding executed for ${autoFundingPromises.length} income transactions:\n` +
      `• Total auto-funded: $${totalAutoFunded.toFixed(2)}\n` +
      `• Rules executed: ${autoFundingPromises.reduce((sum: number, result) => sum + result.result.execution.rulesExecuted, 0)}\n\n`;
  }

  message += `All valid transactions have been added to your ledger with "Imported" category.`;
  return message;
};

/**
 * Hook for processing and importing transactions
 * Extracted from useTransactionImport.js for better maintainability
 */
export const useTransactionImportProcessing = (_currentUser: { userName?: string } | undefined) => {
  const [importProgress, setImportProgress] = useState(0);
  const [autoFundingResults, setAutoFundingResults] = useState<unknown[]>([]);

  const clearExistingData = async () => {
    try {
      // Import Dexie database
      const { budgetDb } = await import("@/db/budgetDb");

      // Clear transactions and paycheck history
      await budgetDb.transactions.clear();
      // await budgetDb.paycheckHistory.clear(); // Deprecated

      // Reset budget metadata balances
      const { setBudgetMetadata } = await import("@/db/budgetDb");
      await setBudgetMetadata({
        actualBalance: 0,
        unassignedCash: 0,
      });

      // Clear envelope balances
      await budgetDb.envelopes.toCollection().modify({ currentBalance: 0 });

      logger.info("Cleared existing data before import", {
        clearedTransactions: true,
        clearedPaychecks: true,
        resetBalances: true,
      });
    } catch (error) {
      logger.error("Failed to clear existing data", error);
      throw new Error("Failed to clear existing data");
    }
  };

  const processTransactions = async (
    importData: { data?: unknown[] } | unknown[],
    fieldMapping: {
      amount: string;
      date: string;
      description: string;
      category: string;
      notes: string;
    }
  ): Promise<ProcessTransactionsResult> => {
    return TransactionImportOrchestrator.processTransactions(
      importData,
      fieldMapping,
      setImportProgress
    );
  };

  /**
   * Process file import with automatic backend/client fallback
   */
  const processFileImport = async (
    file: File,
    fieldMapping?: Record<string, string>,
    preferBackend = true
  ): Promise<ProcessTransactionsResult> => {
    return TransactionImportOrchestrator.processFileImport(
      file,
      fieldMapping,
      preferBackend,
      setImportProgress
    );
  };

  return {
    importProgress,
    setImportProgress,
    autoFundingResults,
    setAutoFundingResults,
    clearExistingData,
    processTransactions,
    processFileImport,
    generateSuccessMessage,
  };
};
