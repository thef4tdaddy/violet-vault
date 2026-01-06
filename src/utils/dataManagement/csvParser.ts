/**
 * Client-side CSV Parser Utility
 * Fallback parser for when Go backend is unavailable
 *
 * @module utils/dataManagement/csvParser
 */

import logger from "@/utils/common/logger";

export interface ParsedCSVRow {
  [key: string]: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: ParsedCSVRow[];
  errors: Array<{ row: number; error: string }>;
}

/**
 * Parse CSV content into structured data
 *
 * @param content - Raw CSV file content as string
 * @returns Parsed CSV data with headers and rows
 */
export function parseCSV(content: string): CSVParseResult {
  const errors: Array<{ row: number; error: string }> = [];

  // Treat completely empty content as an empty CSV
  if (!content) {
    logger.warn("Empty CSV content");
    return { headers: [], rows: [], errors: [{ row: 0, error: "Empty CSV file" }] };
  }

  // Character-by-character CSV parsing to correctly handle commas and newlines
  // inside quoted fields.
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = "";
  let inQuotes = false;

  const length = content.length;
  for (let i = 0; i < length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        // Handle escaped quote ("")
        if (i + 1 < length && content[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRecord.push(currentField);
        currentField = "";
      } else if (char === "\r" || char === "\n") {
        // End of record (handle CRLF as a single newline)
        currentRecord.push(currentField);
        currentField = "";

        records.push(currentRecord);
        currentRecord = [];

        if (char === "\r" && i + 1 < length && content[i + 1] === "\n") {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  // Finalize the last field/record if any content remains
  if (inQuotes) {
    errors.push({
      row: records.length + 1,
      error: "Unterminated quoted field in CSV content",
    });
  }

  if (currentField.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentField);
    records.push(currentRecord);
  }

  // Find first non-empty record to use as headers
  const firstNonEmptyIndex = records.findIndex((record) =>
    record.some((field) => field.trim().length > 0)
  );

  if (firstNonEmptyIndex === -1) {
    logger.warn("Empty CSV content");
    return { headers: [], rows: [], errors: [{ row: 0, error: "Empty CSV file" }] };
  }

  const headers = records[firstNonEmptyIndex];

  if (headers.length === 0) {
    logger.error("CSV has no headers");
    return { headers: [], rows: [], errors: [{ row: firstNonEmptyIndex + 1, error: "No headers found" }] };
  }

  // Parse data rows
  const rows: ParsedCSVRow[] = [];
  for (let recordIndex = firstNonEmptyIndex + 1; recordIndex < records.length; recordIndex++) {
    const record = records[recordIndex];

    // Skip empty records (equivalent to skipping empty lines)
    const hasData = record.some((field) => field.trim().length > 0);
    if (!hasData) {
      continue;
    }

    if (record.length !== headers.length) {
      errors.push({
        row: recordIndex + 1,
        error: `Expected ${headers.length} columns, got ${record.length}`,
      });
      continue;
    }

    const row: ParsedCSVRow = {};
    headers.forEach((header, index) => {
      row[header] = record[index];
    });

    rows.push(row);
  }

  logger.info("CSV parsed successfully", {
    headers: headers.length,
    rows: rows.length,
    errors: errors.length,
  });

  return { headers, rows, errors };
}

/**
 * Parse a single CSV line, handling quoted fields
 *
 * @param line - Raw CSV line
 * @returns Array of field values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : "";

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (char === "," && !inQuotes) {
      // End of field
      result.push(currentField.trim());
      currentField = "";
      i++;
      continue;
    }

    // Add character to current field
    currentField += char;
    i++;
  }

  // Add the last field
  result.push(currentField.trim());

  return result;
}

/**
 * Read file content as text
 *
 * @param file - File to read
 * @returns Promise resolving to file content as string
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
}

/**
 * Auto-detect field mapping from CSV headers
 *
 * @param headers - CSV headers
 * @returns Detected field mapping
 */
export function autoDetectFieldMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const headerLower = header.toLowerCase().trim();
    const normalized = headerLower.replace(/[^a-z0-9]/g, "");

    // Date field detection
    if (
      headerLower === "date" ||
      headerLower === "transaction_date" ||
      normalized === "transactiondate" ||
      normalized === "transdate" ||
      normalized === "postingdate" ||
      (normalized.startsWith("txn") && normalized.includes("date"))
    ) {
      mapping.date = header;
    }

    // Amount field detection
    else if (
      headerLower === "amount" ||
      headerLower === "value" ||
      normalized.includes("amount") ||
      normalized.includes("amt") ||
      normalized.includes("total")
    ) {
      mapping.amount = header;
    }

    // Description field detection
    else if (
      headerLower === "description" ||
      headerLower === "memo" ||
      headerLower === "payee" ||
      normalized.includes("desc") ||
      normalized.includes("details")
    ) {
      mapping.description = header;
    }

    // Category field detection
    else if (headerLower === "category" || normalized === "cat" || normalized.startsWith("category")) {
      mapping.category = header;
    }

    // Merchant field detection
    else if (
      headerLower === "merchant" ||
      headerLower === "vendor" ||
      normalized.includes("merchant") ||
      normalized.includes("vendor") ||
      normalized.includes("store")
    ) {
      mapping.merchant = header;
    }

    // Notes field detection
    else if (
      headerLower === "notes" ||
      headerLower === "note" ||
      normalized.includes("note") ||
      normalized.includes("comment") ||
      normalized.includes("remark")
    ) {
      mapping.notes = header;
    }
  }

  return mapping;
}
