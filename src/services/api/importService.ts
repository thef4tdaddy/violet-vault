/**
 * Import Service - Go Backend Integration
 * High-performance CSV/JSON parsing and transaction normalization via Go serverless functions
 *
 * @module services/api/importService
 */

import { ApiClient, type ApiResponse } from "@/services/api/client";
import logger from "@/utils/common/logger";
import type { Transaction } from "@/domain/schemas/transaction";

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
   * Import and parse transactions using Go backend
   *
   * @param file - CSV or JSON file to import
   * @param fieldMapping - Optional field mapping for CSV columns
   * @returns Parsed transactions and validation errors
   */
  static async importTransactions(
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
        logger.error("Import failed", {
          error: response.error,
        });
        return response;
      }

      logger.info("Import successful", {
        transactionCount: response.data?.transactions?.length || 0,
        invalidCount: response.data?.invalid?.length || 0,
      });

      return response;
    } catch (error) {
      logger.error("Import error", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      };
    }
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
      return health;
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
