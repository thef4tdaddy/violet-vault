import { validateAndNormalizeTransaction } from "@/domain/schemas/transaction";
import type { Transaction } from "@/domain/schemas/transaction";

/**
 * Result of processing a single transaction row
 */
export interface RowProcessingResult {
  success: boolean;
  transaction?: Transaction;
  errors?: string[];
}

/**
 * Helper to process a single transaction row
 * Validates and normalizes data using Zod schema
 */
export const processTransactionRow = (
  row: Record<string, unknown>,
  index: number,
  fieldMapping: {
    amount: string;
    date: string;
    description: string;
    category: string;
    notes: string;
  }
): RowProcessingResult => {
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
      description: String(row[fieldMapping.description || "description"] || "Imported Transaction"),
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

/**
 * Helper to read a file as text using FileReader
 */
export const readFileAsText = (fileToRead: File): Promise<string> => {
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

/**
 * Helper to parse file content (JSON or CSV) into raw rows
 */
export const parseContentToRows = async (file: File): Promise<unknown[]> => {
  const content = await readFileAsText(file);

  // Try JSON first
  try {
    const json = JSON.parse(content);
    if (Array.isArray(json)) {
      return json;
    }
    if (
      json &&
      typeof json === "object" &&
      "transactions" in json &&
      Array.isArray((json as { transactions: unknown }).transactions)
    ) {
      return (json as { transactions: unknown[] }).transactions;
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
