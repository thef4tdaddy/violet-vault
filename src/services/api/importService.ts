/**
 * Import Service - Hybrid Backend/Client Import
 * High-performance CSV/JSON parsing via Go backend with client-side fallback
 * Implements progressive enhancement for offline capability
 *
 * @module services/api/importService
 */

import { ApiClient, type ApiResponse } from "@/services/api/client";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/domain/schemas/transaction";
import {
  parseCSV,
  readFileAsText,
  autoDetectFieldMapping as autoDetectCSVMapping,
} from "@/utils/dataManagement/csvParser";
import { mapRowsToTransactions } from "@/utils/dataManagement/transactionMapper";

// --- Request/Response Types ---
// These match the Go backend structs in /api/import.go

export interface ImportRequest {
  file: File;
  fieldMapping?: Record<string, string>;
}

export interface InvalidRow {
  index: number;
  row: string;
  errors: string[];
}

export interface ImportResponse {
  success: boolean;
  transactions: Transaction[];
  invalid: InvalidRow[];
  error?: string;
  message?: string;
}

// --- Service Implementation ---

export class ImportService {
  private static readonly ENDPOINT = "/api/import";

  /**
   * Import and parse transactions with automatic backend/client fallback
   *
   * @param file - CSV or JSON file to import
   * @param fieldMapping - Optional field mapping for CSV columns
   * @param options - Import options
   * @returns Parsed transactions and validation errors
   */
  static async importTransactions(
    file: File,
    fieldMapping?: Record<string, string>,
    options: { preferBackend?: boolean; forceClientSide?: boolean } = {}
  ): Promise<ApiResponse<ImportResponse>> {
    const { preferBackend = true, forceClientSide = false } = options;

    // Force client-side parsing if requested
    if (forceClientSide) {
      logger.info("Using client-side import (forced)", {
        fileName: file.name,
        fileSize: file.size,
      });
      return this.importTransactionsClientSide(file, fieldMapping);
    }

    // Try backend import if preferred
    if (preferBackend) {
      const backendAvailable = await this.isAvailable();

      if (backendAvailable) {
        try {
          const result = await this.importTransactionsBackend(file, fieldMapping);

          if (result.success) {
            return result;
          }

          logger.warn("Backend import failed, falling back to client-side", {
            error: result.error,
          });
        } catch (error) {
          logger.warn("Backend import error, falling back to client-side", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        logger.info("Backend unavailable, using client-side import");
      }
    }

    // Fallback to client-side parsing
    return this.importTransactionsClientSide(file, fieldMapping);
  }

  /**
   * Import transactions using Go backend
   */
  private static async importTransactionsBackend(
    file: File,
    fieldMapping?: Record<string, string>
  ): Promise<ApiResponse<ImportResponse>> {
    try {
      logger.info("Importing transactions via Go backend", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasMappings: !!fieldMapping,
      });

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Add field mapping if provided
      if (fieldMapping) {
        formData.append("fieldMapping", JSON.stringify(fieldMapping));
      }

      const response = await ApiClient.post<ImportResponse>(this.ENDPOINT, formData, {
        timeout: 120000, // 120 seconds for large files
      });

      if (!response.success) {
        logger.error("Backend import failed", {
          error: response.error,
        });
        return response;
      }

      logger.info("Backend import successful", {
        transactionCount: response.data?.transactions?.length || 0,
        invalidCount: response.data?.invalid?.length || 0,
      });

      return response;
    } catch (error) {
      logger.error("Backend import error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Backend import failed",
      };
    }
  }

  /**
   * Import transactions using client-side parsing
   */
  private static async importTransactionsClientSide(
    file: File,
    fieldMapping?: Record<string, string>
  ): Promise<ApiResponse<ImportResponse>> {
    try {
      logger.info("Importing transactions via client-side parsing", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasMappings: !!fieldMapping,
      });

      const lastDotIndex = file.name.lastIndexOf(".");
      const fileExtension = lastDotIndex === -1 ? "" : file.name.slice(lastDotIndex).toLowerCase();

      if (fileExtension === ".csv") {
        return this.importCSVClientSide(file, fieldMapping);
      } else if (fileExtension === ".json") {
        return this.importJSONClientSide(file);
      } else {
        return {
          success: false,
          error: "Unsupported file type. Please use CSV or JSON.",
        };
      }
    } catch (error) {
      logger.error("Client-side import error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Client-side import failed",
      };
    }
  }

  /**
   * Import CSV file using client-side parser
   */
  private static async importCSVClientSide(
    file: File,
    fieldMapping?: Record<string, string>
  ): Promise<ApiResponse<ImportResponse>> {
    try {
      // Read file content
      const content = await readFileAsText(file);

      // Parse CSV
      const parseResult = parseCSV(content);

      if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
        return {
          success: false,
          error: `Failed to parse CSV: ${parseResult.errors[0].error}`,
        };
      }

      // Auto-detect or use provided field mapping
      const mapping = fieldMapping || autoDetectCSVMapping(parseResult.headers);

      // Validate required fields
      if (!mapping.date || !mapping.amount) {
        return {
          success: false,
          error: "Could not detect required fields (date, amount). Please provide field mapping.",
          data: {
            success: false,
            transactions: [],
            invalid: [],
            message: "Missing required field mappings",
          },
        };
      }

      // Map rows to transactions
      const mappingResult = mapRowsToTransactions(parseResult.rows, {
        date: mapping.date,
        amount: mapping.amount,
        description: mapping.description,
        category: mapping.category,
        merchant: mapping.merchant,
        notes: mapping.notes,
      });

      logger.info("Client-side CSV import successful", {
        transactionCount: mappingResult.transactions.length,
        invalidCount: mappingResult.invalid.length,
      });

      return {
        success: true,
        data: {
          success: true,
          transactions: mappingResult.transactions,
          invalid: mappingResult.invalid,
          message: `Imported ${mappingResult.transactions.length} transactions (client-side)`,
        },
      };
    } catch (error) {
      logger.error("Client-side CSV import error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse CSV",
      };
    }
  }

  /**
   * Import JSON file using client-side parser
   */
  private static async importJSONClientSide(file: File): Promise<ApiResponse<ImportResponse>> {
    try {
      // Read file content
      const content = await readFileAsText(file);

      // Parse JSON
      const data = JSON.parse(content);

      // Validate JSON structure
      if (!Array.isArray(data)) {
        return {
          success: false,
          error: "Invalid JSON format. Expected an array of transactions.",
        };
      }

      // Validate and map transactions
      const transactions: Transaction[] = [];
      const invalid: InvalidRow[] = [];

      for (let i = 0; i < data.length; i++) {
        const { transaction, errors } = this.validateAndMapJSONItem(
          data[i] as Record<string, unknown>
        );

        if (errors.length > 0) {
          invalid.push({
            index: i + 1,
            row: JSON.stringify(data[i]),
            errors,
          });
          continue;
        }

        if (transaction) {
          transactions.push(transaction);
        }
      }

      logger.info("Client-side JSON import successful", {
        transactionCount: transactions.length,
        invalidCount: invalid.length,
      });

      return {
        success: true,
        data: {
          success: true,
          transactions,
          invalid,
          message: `Imported ${transactions.length} transactions (client-side)`,
        },
      };
    } catch (error) {
      logger.error("Client-side JSON import error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse JSON",
      };
    }
  }

  /**
   * Helper to validate and map a single JSON item to a Transaction
   */
  private static validateAndMapJSONItem(item: Record<string, unknown>): {
    transaction: Transaction | null;
    errors: string[];
  } {
    const errors = this.validateJSONItem(item);

    if (errors.length > 0) {
      return { transaction: null, errors };
    }

    return { transaction: this.mapJSONItemToTransaction(item), errors: [] };
  }

  /**
   * Validate JSON item fields
   */
  private static validateJSONItem(item: Record<string, unknown>): string[] {
    const errors: string[] = [];

    if (!item.date) errors.push("Missing date");
    if (item.amount === undefined || item.amount === null) errors.push("Missing amount");
    if (!item.type || !["income", "expense", "transfer"].includes(String(item.type))) {
      errors.push("Missing or invalid type");
    }
    if (!item.id) errors.push("Missing id");

    return errors;
  }

  /**
   * Map JSON item to Transaction object
   */
  private static mapJSONItemToTransaction(item: Record<string, unknown>): Transaction {
    const amount = typeof item.amount === "number" ? item.amount : parseFloat(String(item.amount));
    const type = item.type as "income" | "expense" | "transfer";

    // Notes field is removed from Transaction type in issue #1551 refactor
    // Append it to description instead
    let description = String(item.description || "Transaction");
    if (item.notes) {
      description = `${description} (${item.notes})`;
    }

    return {
      id: String(item.id),
      date: new Date(String(item.date)),
      amount,
      type,
      description,
      category: String(item.category || "uncategorized"),
      envelopeId: String(item.envelopeId || ""),
      merchant: item.merchant ? String(item.merchant) : undefined,
      isScheduled: typeof item.isScheduled === "boolean" ? item.isScheduled : false,
      createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
      lastModified: typeof item.lastModified === "number" ? item.lastModified : Date.now(),
    };
  }

  /**
   * Validate file before import
   * Check file type and size constraints
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = [".csv", ".json"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: "Invalid file type. Please upload a CSV or JSON file.",
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size exceeds 10MB limit. Please upload a smaller file.",
      };
    }

    return { valid: true };
  }

  /**
   * Check if import service is available
   * Used for feature detection and fallback logic
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if API client is online
      if (!ApiClient.isOnline()) {
        return false;
      }

      // Perform a lightweight health check
      const health = await ApiClient.healthCheck();
      return health === true;
    } catch (error) {
      logger.warn("Import service not available", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Auto-detect field mapping from CSV headers
   * This is a client-side helper for UI purposes
   * The backend also has auto-detection logic
   */
  static autoDetectFieldMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const header of headers) {
      const headerLower = header.toLowerCase().trim();
      // Normalize by removing common separators
      const normalizedHeader = headerLower.replace(/[^a-z0-9]/g, "");

      if (this.isDateField(headerLower, normalizedHeader)) {
        mapping.date = header;
      } else if (this.isAmountField(headerLower, normalizedHeader)) {
        mapping.amount = header;
      } else if (this.isDescriptionField(headerLower, normalizedHeader)) {
        mapping.description = header;
      } else if (this.isCategoryField(headerLower, normalizedHeader)) {
        mapping.category = header;
      } else if (this.isMerchantField(headerLower, normalizedHeader)) {
        mapping.merchant = header;
      } else if (this.isNotesField(headerLower, normalizedHeader)) {
        mapping.notes = header;
      }
    }

    return mapping;
  }

  private static isDateField(header: string, normalized: string): boolean {
    return (
      header === "date" ||
      header === "transaction_date" ||
      normalized === "transactiondate" ||
      normalized === "transdate" ||
      normalized === "postingdate" ||
      (normalized.startsWith("txn") && normalized.includes("date"))
    );
  }

  private static isAmountField(header: string, normalized: string): boolean {
    return (
      header === "amount" ||
      header === "value" ||
      normalized.includes("amount") ||
      normalized.includes("amt") ||
      normalized.includes("total")
    );
  }

  private static isDescriptionField(header: string, normalized: string): boolean {
    return (
      header === "description" ||
      header === "memo" ||
      header === "payee" ||
      normalized.includes("desc") ||
      normalized.includes("details")
    );
  }

  private static isCategoryField(header: string, normalized: string): boolean {
    return header === "category" || normalized === "cat" || normalized.startsWith("category");
  }

  private static isMerchantField(header: string, normalized: string): boolean {
    return (
      header === "merchant" ||
      header === "vendor" ||
      normalized.includes("merchant") ||
      normalized.includes("vendor") ||
      normalized.includes("store")
    );
  }

  private static isNotesField(header: string, normalized: string): boolean {
    return (
      header === "notes" ||
      header === "note" ||
      normalized.includes("note") ||
      normalized.includes("comment") ||
      normalized.includes("remark")
    );
  }
}

export default ImportService;
