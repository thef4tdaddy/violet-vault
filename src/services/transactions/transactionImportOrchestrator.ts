import { ImportService } from "@/services/api/importService";
import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import type { Transaction } from "@/domain/schemas/transaction";
import { parseContentToRows, processTransactionRow } from "@/utils/transactions/importHelpers";
import logger from "@/utils/common/logger";

export interface ProcessTransactionsResult {
  valid: Transaction[];
  invalid: Array<{
    index: number;
    row: unknown;
    errors: string[];
  }>;
  source?: "backend" | "client";
}

export type ProgressCallback = (progress: number) => void;

export class TransactionImportOrchestrator {
  /**
   * Process file import with automatic backend/client fallback
   */
  static async processFileImport(
    file: File,
    fieldMapping: Record<string, string> | undefined,
    preferBackend: boolean,
    onProgress: ProgressCallback
  ): Promise<ProcessTransactionsResult> {
    // Check if backend is available
    if (preferBackend) {
      const backendAvailable = await ImportService.isAvailable();

      if (backendAvailable) {
        try {
          return await this.processFileWithBackend(file, fieldMapping, onProgress);
        } catch (error) {
          logger.warn("Backend import failed, falling back to client-side", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        logger.info("Backend not available, using client-side import");
      }
    }

    // Fallback: Client-side processing
    return this.processFileClientSide(file, fieldMapping, onProgress);
  }

  /**
   * Process file using Go backend
   */
  private static async processFileWithBackend(
    file: File,
    fieldMapping: Record<string, string> | undefined,
    onProgress: ProgressCallback
  ): Promise<ProcessTransactionsResult> {
    try {
      onProgress(10);
      logger.info("Processing file with backend", {
        fileName: file.name,
        fileSize: file.size,
        hasMappings: !!fieldMapping,
      });

      const validation = ImportService.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      onProgress(20);
      const response = await ImportService.importTransactions(file, fieldMapping);
      onProgress(80);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Import failed");
      }

      const { transactions, invalid } = response.data;

      // Re-validate client-side for safety
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

      onProgress(100);

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
  }

  /**
   * Process file client-side
   */
  private static async processFileClientSide(
    file: File,
    fieldMapping: Record<string, string> | undefined,
    onProgress: ProgressCallback
  ): Promise<ProcessTransactionsResult> {
    logger.info("Using client-side file import");
    try {
      const rawRows = await parseContentToRows(file);

      const mappingToUse = {
        amount: fieldMapping?.amount || "amount",
        date: fieldMapping?.date || "date",
        description: fieldMapping?.description || "description",
        category: fieldMapping?.category || "category",
        notes: fieldMapping?.notes || "notes",
      };

      return this.processTransactions(rawRows, mappingToUse, onProgress);
    } catch (error) {
      logger.error("Client-side file parsing failed", error);
      throw error;
    }
  }

  /**
   * Process raw rows (client-side logic)
   */
  static async processTransactions(
    importData: { data?: unknown[] } | unknown[],
    fieldMapping: {
      amount: string;
      date: string;
      description: string;
      category: string;
      notes: string;
    },
    onProgress: ProgressCallback
  ): Promise<ProcessTransactionsResult> {
    const validTransactions: Transaction[] = [];
    const invalidRows: Array<{ index: number; row: unknown; errors: string[] }> = [];
    const dataArray = Array.isArray(importData) ? importData : (importData.data as unknown[]) || [];

    for (let i = 0; i < dataArray.length; i++) {
      const row = dataArray[i] as Record<string, unknown>;
      onProgress((i / dataArray.length) * 100);

      const result = processTransactionRow(row, i, fieldMapping);
      if (result.success && result.transaction) {
        validTransactions.push(result.transaction);
      } else {
        invalidRows.push({
          index: i,
          row,
          errors: result.errors || ["Unknown error"],
        });
      }

      if (i % 50 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    onProgress(100);

    return {
      valid: validTransactions,
      invalid: invalidRows,
      source: "client",
    };
  }
}
