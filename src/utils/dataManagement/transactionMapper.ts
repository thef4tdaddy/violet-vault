/**
 * Transaction Mapper Utility
 * Maps parsed CSV/JSON data to Transaction objects
 *
 * @module utils/dataManagement/transactionMapper
 */

import logger from "@/utils/common/logger";
import { v4 as uuidv4 } from "uuid";
import type { Transaction } from "@/domain/schemas/transaction";
import type { ParsedCSVRow } from "./csvParser";

export interface MappingConfig {
  date: string;
  amount: string;
  description?: string;
  category?: string;
  merchant?: string;
  notes?: string;
  dateFormat?: "US" | "EU" | "auto"; // Date format preference (default: "auto")
}

export interface TransactionMappingResult {
  transactions: Transaction[];
  invalid: Array<{ index: number; row: string; errors: string[] }>;
}

/**
 * Map parsed CSV rows to Transaction objects
 *
 * @param rows - Parsed CSV rows
 * @param mapping - Field mapping configuration
 * @returns Mapped transactions and validation errors
 */
export function mapRowsToTransactions(
  rows: ParsedCSVRow[],
  mapping: MappingConfig
): TransactionMappingResult {
  const transactions: Transaction[] = [];
  const invalid: Array<{ index: number; row: string; errors: string[] }> = [];
  const dateFormat = mapping.dateFormat || "auto";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];

    try {
      // Extract required fields
      const dateStr = row[mapping.date];
      const amountStr = row[mapping.amount];

      // Validate required fields
      if (!dateStr) {
        errors.push("Missing date");
      }
      if (!amountStr) {
        errors.push("Missing amount");
      }

      if (errors.length > 0) {
        invalid.push({
          index: i + 1,
          row: JSON.stringify(row),
          errors,
        });
        continue;
      }

      // Parse date with format preference
      const date = parseDate(dateStr, dateFormat);
      if (!date) {
        invalid.push({
          index: i + 1,
          row: JSON.stringify(row),
          errors: ["Invalid date format"],
        });
        continue;
      }

      // Parse amount
      const amount = parseAmount(amountStr);
      if (isNaN(amount)) {
        invalid.push({
          index: i + 1,
          row: JSON.stringify(row),
          errors: ["Invalid amount format"],
        });
        continue;
      }

      // Extract optional fields
      const description = mapping.description ? row[mapping.description] : "";
      const category = mapping.category ? row[mapping.category] : "uncategorized";
      const merchant = mapping.merchant ? row[mapping.merchant] : undefined;
      const notes = mapping.notes ? row[mapping.notes] : undefined;

      // Create transaction object
      const transaction: Transaction = {
        id: uuidv4(),
        date,
        amount: Math.abs(amount), // Store as positive value
        type: amount < 0 ? "expense" : "income",
        description: description || merchant || "Transaction",
        category,
        merchant,
        notes,
        envelopeId: "", // Will be assigned by user later
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      transactions.push(transaction);
    } catch (error) {
      invalid.push({
        index: i + 1,
        row: JSON.stringify(row),
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    }
  }

  logger.info("Transaction mapping complete", {
    total: rows.length,
    successful: transactions.length,
    invalid: invalid.length,
  });

  return { transactions, invalid };
}

/**
 * Parse date string to Date object
 * Supports multiple date formats: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY
 *
 * @param dateStr - Date string
 * @param format - Date format preference ("US", "EU", or "auto")
 * @returns Date object or null if invalid
 */
function parseDate(dateStr: string, format: "US" | "EU" | "auto" = "auto"): Date | null {
  if (!dateStr) return null;

  // Try ISO format first (YYYY-MM-DD) - unambiguous
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Parse slash-separated dates (MM/DD/YYYY or DD/MM/YYYY)
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    const firstNum = parseInt(first);
    const secondNum = parseInt(second);

    // Use explicit format if specified
    if (format === "US") {
      // MM/DD/YYYY
      const date = new Date(parseInt(year), firstNum - 1, secondNum);
      if (!isNaN(date.getTime())) return date;
    } else if (format === "EU") {
      // DD/MM/YYYY
      const date = new Date(parseInt(year), secondNum - 1, firstNum);
      if (!isNaN(date.getTime())) return date;
    } else {
      // Auto-detect based on values
      // If first number > 12, it must be day (EU format)
      if (firstNum > 12) {
        const date = new Date(parseInt(year), secondNum - 1, firstNum);
        if (!isNaN(date.getTime())) return date;
      }
      // If second number > 12, it must be day (US format)
      else if (secondNum > 12) {
        const date = new Date(parseInt(year), firstNum - 1, secondNum);
        if (!isNaN(date.getTime())) return date;
      }
      // Both numbers ≤ 12: ambiguous, default to US format
      // Note: Users should specify format explicitly in this case
      else {
        const date = new Date(parseInt(year), firstNum - 1, secondNum);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }

  // Try browser's Date.parse as fallback
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }

  return null;
}

/**
 * Parse amount string to number
 * Handles currency symbols, commas, and negative values
 *
 * @param amountStr - Amount string
 * @returns Parsed number
 */
function parseAmount(amountStr: string): number {
  if (!amountStr) return NaN;

  // Remove currency symbols, spaces, and commas
  let cleaned = amountStr.replace(/[$€£¥,\s]/g, "");

  // Handle negative values in parentheses: (100.00) -> -100.00
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = "-" + cleaned.slice(1, -1);
  }

  return parseFloat(cleaned);
}

/**
 * Validate transaction object
 *
 * @param transaction - Transaction to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateTransaction(transaction: Transaction): string[] {
  const errors: string[] = [];

  if (!transaction.id) {
    errors.push("Missing transaction ID");
  }

  if (!transaction.date) {
    errors.push("Missing date");
  } else if (isNaN(new Date(transaction.date).getTime())) {
    errors.push("Invalid date");
  }

  if (transaction.amount === undefined || transaction.amount === null) {
    errors.push("Missing amount");
  } else if (isNaN(transaction.amount)) {
    errors.push("Invalid amount");
  } else if (transaction.amount < 0) {
    errors.push("Amount must be positive (type indicates direction)");
  }

  if (!transaction.type || !["income", "expense", "transfer"].includes(transaction.type)) {
    errors.push("Invalid transaction type");
  }

  return errors;
}
