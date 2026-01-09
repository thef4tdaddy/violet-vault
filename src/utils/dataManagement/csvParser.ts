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
  // Treat completely empty content as an empty CSV
  if (!content) {
    logger.warn("Empty CSV content");
    return { headers: [], rows: [], errors: [{ row: 0, error: "Empty CSV file" }] };
  }

  const { records, errors: parseErrors } = parseCSVRecords(content);

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
    return {
      headers: [],
      rows: [],
      errors: [{ row: firstNonEmptyIndex + 1, error: "No headers found" }],
    };
  }

  const { rows, errors: rowErrors } = processCSVRows(records, headers, firstNonEmptyIndex);
  const errors = [...parseErrors, ...rowErrors];

  logger.info("CSV parsed successfully", {
    headers: headers.length,
    rows: rows.length,
    errors: errors.length,
  });

  return { headers, rows, errors };
}

function parseCSVRecords(content: string): {
  records: string[][];
  errors: Array<{ row: number; error: string }>;
} {
  const records: string[][] = [];
  const errors: Array<{ row: number; error: string }> = [];

  let state = {
    currentRecord: [] as string[],
    currentField: "",
    inQuotes: false,
  };

  const length = content.length;
  for (let i = 0; i < length; i++) {
    const char = content[i];
    const nextChar = i + 1 < length ? content[i + 1] : "";

    const result = handleCSVChar(char, nextChar, state, records);
    i += result.skipChars;
  }

  if (state.inQuotes) {
    errors.push({
      row: records.length + 1,
      error: "Unterminated quoted field in CSV content",
    });
  }

  if (state.currentField.length > 0 || state.currentRecord.length > 0) {
    state.currentRecord.push(state.currentField);
    records.push(state.currentRecord);
  }

  return { records, errors };
}

interface ParserState {
  currentRecord: string[];
  currentField: string;
  inQuotes: boolean;
}

function handleCSVChar(
  char: string,
  nextChar: string,
  state: ParserState,
  records: string[][]
): { skipChars: number } {
  if (state.inQuotes) {
    return handleQuotedChar(char, nextChar, state);
  } else {
    return handleUnquotedChar(char, nextChar, state, records);
  }
}

function handleQuotedChar(
  char: string,
  nextChar: string,
  state: ParserState
): { skipChars: number } {
  if (char === '"') {
    if (nextChar === '"') {
      state.currentField += '"';
      return { skipChars: 1 };
    } else {
      state.inQuotes = false;
    }
  } else {
    state.currentField += char;
  }
  return { skipChars: 0 };
}

function handleUnquotedChar(
  char: string,
  nextChar: string,
  state: ParserState,
  records: string[][]
): { skipChars: number } {
  if (char === '"') {
    state.inQuotes = true;
  } else if (char === ",") {
    state.currentRecord.push(state.currentField);
    state.currentField = "";
  } else if (char === "\r" || char === "\n") {
    state.currentRecord.push(state.currentField);
    state.currentField = "";
    records.push([...state.currentRecord]);
    state.currentRecord = [];
    if (char === "\r" && nextChar === "\n") {
      return { skipChars: 1 };
    }
  } else {
    state.currentField += char;
  }
  return { skipChars: 0 };
}

function processCSVRows(
  records: string[][],
  headers: string[],
  startIndex: number
): { rows: ParsedCSVRow[]; errors: Array<{ row: number; error: string }> } {
  const rows: ParsedCSVRow[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  for (let recordIndex = startIndex + 1; recordIndex < records.length; recordIndex++) {
    const record = records[recordIndex];
    if (!record.some((field) => field.trim().length > 0)) continue;

    if (record.length !== headers.length) {
      errors.push({
        row: recordIndex + 1,
        error: `Expected ${headers.length} columns, got ${record.length}`,
      });
      continue;
    }

    const row: ParsedCSVRow = {};
    headers.forEach((header, index) => {
      row[header.trim()] = record[index]?.trim() || "";
    });

    rows.push(row);
  }

  return { rows, errors };
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
    detectAndMapField(header, mapping);
  }

  return mapping;
}

function detectAndMapField(header: string, mapping: Record<string, string>): void {
  const headerLower = header.toLowerCase().trim();
  const normalized = headerLower.replace(/[^a-z0-9]/g, "");

  if (!mapping.date && isDateField(headerLower, normalized)) {
    mapping.date = header;
  } else if (!mapping.amount && isAmountField(headerLower, normalized)) {
    mapping.amount = header;
  } else if (!mapping.description && isDescriptionField(headerLower, normalized)) {
    mapping.description = header;
  } else if (!mapping.category && isCategoryField(headerLower, normalized)) {
    mapping.category = header;
  } else if (!mapping.merchant && isMerchantField(headerLower, normalized)) {
    mapping.merchant = header;
  } else if (!mapping.notes && isNotesField(headerLower, normalized)) {
    mapping.notes = header;
  }
}

function isDateField(header: string, normalized: string): boolean {
  return (
    header === "date" ||
    header === "transaction_date" ||
    normalized === "transactiondate" ||
    normalized === "transdate" ||
    normalized === "postingdate" ||
    (normalized.startsWith("txn") && normalized.includes("date"))
  );
}

function isAmountField(header: string, normalized: string): boolean {
  return (
    header === "amount" ||
    header === "value" ||
    normalized.includes("amount") ||
    normalized.includes("amt") ||
    normalized.includes("total")
  );
}

function isDescriptionField(header: string, normalized: string): boolean {
  return (
    header === "description" ||
    header === "memo" ||
    header === "payee" ||
    normalized.includes("desc") ||
    normalized.includes("details")
  );
}

function isCategoryField(header: string, normalized: string): boolean {
  return header === "category" || normalized === "cat" || normalized.startsWith("category");
}

function isMerchantField(header: string, normalized: string): boolean {
  return (
    header === "merchant" ||
    header === "vendor" ||
    normalized.includes("merchant") ||
    normalized.includes("vendor") ||
    normalized.includes("store")
  );
}

function isNotesField(header: string, normalized: string): boolean {
  return (
    header === "notes" ||
    header === "note" ||
    normalized.includes("note") ||
    normalized.includes("comment") ||
    normalized.includes("remark")
  );
}
