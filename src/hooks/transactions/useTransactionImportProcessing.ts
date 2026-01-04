import { useState } from "react";
import { globalToast as _globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import type { Transaction } from "@/domain/schemas/transaction";
import { ImportService } from "@/services/api/importService";

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
  source?: "backend" | "client"; // Indicates which processing method was used
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

    logger.info("Transaction import processing complete (client-side)", {
      total: dataArray.length,
      valid: validTransactions.length,
      invalid: invalidRows.length,
    });

    return {
      valid: validTransactions,
      invalid: invalidRows,
      source: "client",
    };
  };

  /**
   * Process file import using Go backend
   * High-performance CSV/JSON parsing and normalization
   *
   * @param file - File to import (CSV or JSON)
   * @param fieldMapping - Optional field mapping for CSV columns
   * @returns Processed transactions with validation results
   */
  const processFileWithBackend = async (
    file: File,
    fieldMapping?: Record<string, string>
  ): Promise<ProcessTransactionsResult> => {
    try {
      setImportProgress(10);
      logger.info("Processing file with backend", {
        fileName: file.name,
        fileSize: file.size,
        hasMappings: !!fieldMapping,
      });

      // Validate file before upload
      const validation = ImportService.validateFile(file);
      if (!validation.valid) {
        logger.error("File validation failed", { error: validation.error });
        throw new Error(validation.error);
      }

      setImportProgress(20);

      // Call backend import service
      const response = await ImportService.importTransactions(file, fieldMapping);

      setImportProgress(80);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Import failed");
      }

      const { transactions, invalid } = response.data;

      // Validate and normalize transactions from backend
      // Backend already does validation, but we re-validate client-side for safety
      const validatedTransactions = transactions
        .map((tx) => {
          try {
            return validateAndNormalizeTransaction(tx);
          } catch (error) {
            logger.warn("Backend transaction failed client-side validation", {
              transactionId: tx.id,
              error,
            });
            return null;
          }
        })
        .filter((tx): tx is Transaction => tx !== null);

      setImportProgress(100);

      logger.info("Transaction import processing complete (backend)", {
        total: transactions.length,
        valid: validatedTransactions.length,
        invalid: invalid.length,
      });

      return {
        valid: validatedTransactions,
        invalid: invalid.map((inv) => ({
          index: inv.index,
          row: inv.row,
          errors: inv.errors,
        })),
        source: "backend",
      };
    } catch (error) {
      logger.error("Backend import processing failed", error);
      throw error;
    }
  };

  /**
   * Process file import with automatic backend/client fallback
   * Prefers backend for performance, falls back to client-side if unavailable
   *
   * @param file - File to import (CSV or JSON)
   * @param fieldMapping - Optional field mapping for CSV columns
   * @param preferBackend - Whether to prefer backend processing (default: true)
   * @returns Processed transactions with validation results
   */
  const processFileImport = async (
    file: File,
    fieldMapping?: Record<string, string>,
    preferBackend = true
  ): Promise<ProcessTransactionsResult> => {
    // Check if backend is available
    if (preferBackend) {
      const backendAvailable = await ImportService.isAvailable();

      if (backendAvailable) {
        try {
          return await processFileWithBackend(file, fieldMapping);
        } catch (error) {
          logger.warn("Backend import failed, falling back to client-side", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        logger.info("Backend not available, using client-side import");
      }
    }

    // Fallback: Read file and process client-side using FileReader
    logger.info("Using client-side file import");

    const readFileAsText = (fileToRead: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          resolve(typeof reader.result === "string" ? reader.result : "");
        };

        reader.onerror = () => {
          reject(reader.error ?? new Error("Unknown error while reading file on client-side"));
        };

        reader.readAsText(fileToRead);
      });
    };

    const parseContentToRows = async (): Promise<unknown[]> => {
      const content = await readFileAsText(file);

      // Try JSON first
      try {
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
          return json;
        }
        if (json && Array.isArray((json as any).transactions)) {
          return (json as any).transactions;
        }
      } catch {
        // Not JSON, fall through to CSV parsing
      }

      // Basic CSV parsing: first line as headers, remaining as data rows
      const lines = content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        return [];
      }

      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split(",").map((h) => h.trim());

      const rows = dataLines.map((line) => {
        const values = line.split(",");
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] !== undefined ? values[index].trim() : "";
        });
        return row;
      });

      return rows;
    };

    const rawRows = await parseContentToRows();

    // Auto-detect field mapping if not provided - ensure all required fields are present
    const mappingToUse: {
      amount: string;
      date: string;
      description: string;
      category: string;
      notes: string;
    } = {
      amount: fieldMapping?.amount || "amount",
      date: fieldMapping?.date || "date",
      description: fieldMapping?.description || "description",
      category: fieldMapping?.category || "category",
      notes: fieldMapping?.notes || "notes",
    };

    // Delegate validation/normalization to existing processing pipeline
    const result = await processTransactions(rawRows, mappingToUse);

    // Ensure the source is marked as client-side if not already set
    return {
      ...result,
      source: result.source ?? "client",
    };
  };

  return {
    importProgress,
    setImportProgress,
    autoFundingResults,
    setAutoFundingResults,
    clearExistingData,
    processTransactions,
    processFileWithBackend,
    processFileImport,
    generateSuccessMessage,
  };
};
