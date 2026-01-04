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
      // Normalize by removing common separators so we can match "transaction_date",
      // "transaction date", "transactiondate", "txn_date", etc.
      const normalizedHeader = headerLower.replace(/[^a-z0-9]/g, "");

      // Date detection
      if (
        headerLower === "date" ||
        headerLower === "transaction_date" ||
        headerLower === "transaction date" ||
        normalizedHeader === "transactiondate" ||
        normalizedHeader === "transdate" ||
        normalizedHeader === "transactiondt" ||
        normalizedHeader === "postingdate" ||
        // common abbreviations like "txn_date", "txn date", "txndate"
        (normalizedHeader.startsWith("txn") && normalizedHeader.includes("date")) ||
        (normalizedHeader.startsWith("trans") && normalizedHeader.includes("date"))
      ) {
        mapping.date = header;
      }
      // Amount detection
      else if (
        headerLower === "amount" ||
        headerLower === "value" ||
        normalizedHeader.includes("amount") ||
        normalizedHeader.includes("amt") ||
        normalizedHeader.includes("value") ||
        normalizedHeader.includes("price") ||
        normalizedHeader.includes("total")
      ) {
        mapping.amount = header;
      }
      // Description detection
      else if (
        headerLower === "description" ||
        headerLower === "memo" ||
        headerLower === "payee" ||
        normalizedHeader.includes("description") ||
        normalizedHeader.includes("desc") ||
        normalizedHeader.includes("memo") ||
        normalizedHeader.includes("payee") ||
        normalizedHeader.includes("details")
      ) {
        mapping.description = header;
      }
      // Category detection
      else if (
        headerLower === "category" ||
        normalizedHeader === "category" ||
        normalizedHeader.startsWith("category") ||
        normalizedHeader === "cat" ||
        normalizedHeader.startsWith("cat")
      ) {
        mapping.category = header;
      }
      // Merchant detection
      else if (
        headerLower === "merchant" ||
        headerLower === "vendor" ||
        normalizedHeader.includes("merchant") ||
        normalizedHeader.includes("vendor") ||
        normalizedHeader.includes("store") ||
        normalizedHeader.includes("shop")
      ) {
        mapping.merchant = header;
      }
      // Notes detection
      else if (
        headerLower === "notes" ||
        headerLower === "note" ||
        normalizedHeader.includes("note") ||
        normalizedHeader.includes("notes") ||
        normalizedHeader.includes("comment") ||
        normalizedHeader.includes("comments") ||
        normalizedHeader.includes("remark") ||
        normalizedHeader.includes("remarks")
      ) {
        mapping.notes = header;
      }
    }

    return mapping;
  }
}

export default ImportService;
