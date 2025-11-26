import { useState } from "react";
import { globalToast as _globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

/**
 * Hook for processing and importing transactions
 * Extracted from useTransactionImport.js for better maintainability
 */
export const useTransactionImportProcessing = (currentUser: { userName?: string } | undefined) => {
  const [importProgress, setImportProgress] = useState(0);
  const [autoFundingResults, setAutoFundingResults] = useState<unknown[]>([]);

  const clearExistingData = async () => {
    try {
      // Import Dexie database
      const { budgetDb } = await import("../../db/budgetDb");

      // Clear transactions and paycheck history
      await budgetDb.transactions.clear();
      await budgetDb.paycheckHistory.clear();

      // Reset budget metadata balances
      const { setBudgetMetadata } = await import("../../db/budgetDb");
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
  ) => {
    const processedTransactions: unknown[] = [];
    const dataArray = Array.isArray(importData) ? importData : (importData.data as unknown[]) || [];

    for (let i = 0; i < dataArray.length; i++) {
      const row = dataArray[i] as Record<string, unknown>;
      setImportProgress((i / dataArray.length) * 100);

      try {
        const rawAmount = row[fieldMapping.amount];
        const amountStr =
          typeof rawAmount === "string" ? rawAmount.replace(/[$,]/g, "") : String(rawAmount || "0");
        const amount = parseFloat(amountStr);

        const transaction = {
          id: `import_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          date: String(row[fieldMapping.date] || new Date().toISOString().split("T")[0]),
          description: String(row[fieldMapping.description] || "Imported Transaction"),
          amount,
          category: String(row[fieldMapping.category] || "Imported"),
          notes: String(row[fieldMapping.notes] || ""),
          envelopeId: "", // Empty means unassigned

          // Add type based on amount
          type: amount >= 0 ? "income" : "expense",

          // Import metadata
          reconciled: false,
          createdBy: currentUser?.userName || "Unknown",
          createdAt: new Date().toISOString(),
          importSource: "file_import",
        };

        processedTransactions.push(transaction);
      } catch (error) {
        logger.error(`Error processing row ${i}:`, error);
      }

      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    return processedTransactions;
  };

  const generateSuccessMessage = (
    processedTransactions: Array<{ amount: number }>,
    importData: { clearExisting?: boolean },
    autoFundingPromises: Array<{
      result: { execution: { totalFunded: number; rulesExecuted: number } };
    }>
  ) => {
    const incomeCount = processedTransactions.filter((t) => t.amount >= 0).length;
    const expenseCount = processedTransactions.filter((t) => t.amount < 0).length;

    let message = importData.clearExisting
      ? `🗑️ Cleared existing data and imported ${processedTransactions.length} transactions!\n`
      : `Successfully imported ${processedTransactions.length} transactions!\n`;

    message +=
      `• ${incomeCount} income transactions\n` + `• ${expenseCount} expense transactions\n\n`;

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

    message += `All transactions have been added to your ledger with "Imported" category.`;
    return message;
  };

  return {
    importProgress,
    setImportProgress,
    autoFundingResults,
    setAutoFundingResults,
    clearExistingData,
    processTransactions,
    generateSuccessMessage,
  };
};
