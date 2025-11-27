import { useState } from "react";
import { globalToast as _globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import type { Transaction } from "@/domain/schemas/transaction";

/**
 * Result type for transaction import processing
 */
export interface ProcessTransactionsResult {
  valid: Transaction[];
  invalid: Array<{
    index: number;
    row: unknown;
    errors: string[];
  }>;
}

/**
 * Generate success message for transaction import
 * Extracted to reduce hook function length
 */
const generateSuccessMessage = (
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

  /**
   * Process a single transaction row
   * Extracted to reduce complexity
   */
  const processTransactionRow = (
    row: Record<string, unknown>,
    index: number,
    fieldMapping: {
      amount: string;
      date: string;
      description: string;
      category: string;
      notes: string;
    }
  ): { success: true; transaction: Transaction } | { success: false; errors: string[] } => {
    try {
      const rawAmount = row[fieldMapping.amount];
      const amountStr =
        typeof rawAmount === "string" ? rawAmount.replace(/[$,]/g, "") : String(rawAmount || "0");
      const amount = parseFloat(amountStr);

      // Determine transaction type based on amount sign
      const type = amount >= 0 ? "income" : "expense";

      // Build transaction object with required fields
      const rawTransaction = {
        id: `import_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
        date: String(row[fieldMapping.date] || new Date().toISOString().split("T")[0]),
        description: String(
          row[fieldMapping.description || "description"] || "Imported Transaction"
        ),
        amount, // Will be normalized by validateAndNormalizeTransaction
        category: String(row[fieldMapping.category] || "Imported"),
        type,
        envelopeId: "unassigned", // Default to unassigned envelope
        lastModified: Date.now(),
        createdAt: Date.now(),
        // Optional fields
        notes: String(row[fieldMapping.notes] || ""),
        merchant: undefined,
        receiptUrl: undefined,
      };

      // Validate and normalize transaction using Zod schema
      // This ensures:
      // - Amount sign matches type (expense = negative, income = positive)
      // - All required fields are present
      // - Field types are correct
      const validatedTransaction = validateAndNormalizeTransaction(rawTransaction);
      return { success: true, transaction: validatedTransaction };
    } catch (error) {
      // Collect validation errors for user feedback
      const errorMessage = error instanceof Error ? error.message : String(error);
      const zodErrors =
        error && typeof error === "object" && "issues" in error
          ? (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues.map(
              (issue) => `${issue.path.join(".")}: ${issue.message}`
            )
          : [errorMessage];

      return { success: false, errors: zodErrors };
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
    const validTransactions: Transaction[] = [];
    const invalidRows: Array<{ index: number; row: unknown; errors: string[] }> = [];
    const dataArray = Array.isArray(importData) ? importData : (importData.data as unknown[]) || [];

    for (let i = 0; i < dataArray.length; i++) {
      const row = dataArray[i] as Record<string, unknown>;
      setImportProgress((i / dataArray.length) * 100);

      const result = processTransactionRow(row, i, fieldMapping);
      if (result.success) {
        validTransactions.push(result.transaction);
      } else {
        const descriptionField = fieldMapping.description || "description";
        // TypeScript type narrowing: result.success is false, so result has errors property
        const errorResult = result as { success: false; errors: string[] };
        invalidRows.push({
          index: i,
          row,
          errors: errorResult.errors,
        });

        logger.warn(`Row ${i} validation failed:`, {
          errors: errorResult.errors,
          row: (row[descriptionField] as string) || `Row ${i}`,
        });
      }

      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    logger.info("Transaction import processing complete", {
      total: dataArray.length,
      valid: validTransactions.length,
      invalid: invalidRows.length,
    });

    return {
      valid: validTransactions,
      invalid: invalidRows,
    };
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
