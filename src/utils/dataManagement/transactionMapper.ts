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
    const { transaction, errors } = processTransactionRow(row, mapping, dateFormat);

    if (errors.length > 0) {
      invalid.push({
        index: i + 1,
        row: JSON.stringify(row),
        errors,
      });
    } else if (transaction) {
      transactions.push(transaction);
    }
  }

  logger.info("Transaction mapping complete", {
    total: rows.length,
    successful: transactions.length,
    invalid: invalid.length,
  });

  return { transactions, invalid };
}

function processTransactionRow(
  row: ParsedCSVRow,
  mapping: MappingConfig,
  dateFormat: "US" | "EU" | "auto"
): { transaction: Transaction | null; errors: string[] } {
  try {
    const errors: string[] = [];

    // Extract required fields
    const dateStr = row[mapping.date];
    const amountStr = row[mapping.amount];

    if (!dateStr) errors.push("Missing date");
    if (!amountStr) errors.push("Missing amount");

    if (errors.length > 0) return { transaction: null, errors };

    // Parse date
    const date = parseDate(dateStr, dateFormat);
    if (!date) return { transaction: null, errors: ["Invalid date format"] };

    // Parse amount
    const amount = parseAmount(amountStr);
    if (isNaN(amount)) return { transaction: null, errors: ["Invalid amount format"] };

    return {
      transaction: createTransaction(row, mapping, date, amount),
      errors: [],
    };
  } catch (error) {
    return {
      transaction: null,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

function createTransaction(
  row: ParsedCSVRow,
  mapping: MappingConfig,
  date: Date,
  amount: number
): Transaction {
  let description = mapping.description ? row[mapping.description] : "";
  const merchant = mapping.merchant ? row[mapping.merchant] : undefined;
  const notes = mapping.notes ? row[mapping.notes] : undefined;

  if (notes) {
    description = description ? `${description} (${notes})` : notes;
  }

  // Clean description if empty but merchant exists
  if (!description && merchant) {
    description = merchant;
  }

  // Default description if still empty
  if (!description) {
    description = "Transaction";
  }

  return {
    id: uuidv4(),
    date,
    amount: Math.abs(amount), // Store as positive value
    type: amount < 0 ? "expense" : "income",
    description,
    category: mapping.category ? row[mapping.category] : "uncategorized",
    merchant,
    envelopeId: "", // Will be assigned by user later
    isScheduled: false,
    createdAt: Date.now(),
    lastModified: Date.now(),
  };
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
  const isoDate = tryISOFormat(dateStr);
  if (isoDate) return isoDate;

  // Parse slash-separated dates (MM/DD/YYYY or DD/MM/YYYY)
  const slashDate = trySlashDate(dateStr, format);
  if (slashDate) return slashDate;

  // Handle other formats or fallbacks
  return tryFallbackParse(dateStr);
}

function trySlashDate(dateStr: string, format: "US" | "EU" | "auto"): Date | null {
  const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return trySlashFormat(slashMatch, format, dateStr);
  }
  return null;
}

function tryFallbackParse(dateStr: string): Date | null {
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }
  return null;
}

function tryISOFormat(dateStr: string): Date | null {
  const isoMatch = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return isValidDate(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10));
  }
  return null;
}

function trySlashFormat(
  match: RegExpMatchArray,
  format: "US" | "EU" | "auto",
  originalStr: string
): Date | null {
  const [, first, second, year] = match;
  const firstNum = parseInt(first, 10);
  const secondNum = parseInt(second, 10);
  const yearNum = parseInt(year, 10);

  if (format === "US") {
    return isValidDate(yearNum, firstNum, secondNum);
  } else if (format === "EU") {
    return isValidDate(yearNum, secondNum, firstNum);
  } else {
    return tryAutoDetectFormat(yearNum, firstNum, secondNum, originalStr);
  }
}

function tryAutoDetectFormat(
  year: number,
  first: number,
  second: number,
  originalStr: string
): Date | null {
  if (first > 12) {
    // Must be EU (DD/MM/YYYY)
    return isValidDate(year, second, first);
  } else if (second > 12) {
    // Must be US (MM/DD/YYYY)
    return isValidDate(year, first, second);
  } else {
    // Ambiguous
    logger.warn(
      `Ambiguous date detected: "${originalStr}". Both day and month are ≤ 12. ` +
        'Defaulting to US format (MM/DD/YYYY). Specify dateFormat as "US" or "EU" in mapping config to avoid ambiguity.'
    );
    return isValidDate(year, first, second);
  }
}

function isValidDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (
    !isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  ) {
    return date;
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
  } else {
    // Handle both Date objects and timestamps
    const dateValue =
      transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
    if (isNaN(dateValue.getTime())) {
      errors.push("Invalid date");
    }
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
