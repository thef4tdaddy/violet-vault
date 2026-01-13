/**
 * Transaction and Envelope normalization utilities
 * Extracted from TransactionLedger for reusability
 */
import type { Transaction, Envelope } from "@/types/finance";

/**
 * Normalize a raw transaction object to a valid Transaction type
 * @param txn - Raw transaction data from API or database
 * @returns Normalized Transaction or null if invalid
 */
export const normalizeTransaction = (txn: unknown): Transaction | null => {
  if (!txn || typeof txn !== "object") {
    return null;
  }

  const record = txn as {
    id?: string | number;
    date?: string | Date;
    description?: unknown;
    amount?: unknown;
    category?: unknown;
    envelopeId?: unknown;
    notes?: unknown;
    type?: unknown;
    lastModified?: unknown;
    createdAt?: unknown;
  };

  // Normalize date
  const rawDate = record.date;
  const date =
    typeof rawDate === "string"
      ? rawDate
      : rawDate instanceof Date
        ? rawDate.toISOString().split("T")[0]
        : undefined;

  if (!date) {
    return null;
  }

  // Validate ID
  if (record.id === undefined || record.id === null) {
    return null;
  }

  const validatedId = record.id as string | number;

  // Normalize amount and metadata
  const amountRaw =
    record.amount === undefined || record.amount === null ? 0 : Number(record.amount);
  if (Number.isNaN(amountRaw)) {
    return null;
  }
  const description = typeof record.description === "string" ? record.description : "";
  const category =
    typeof record.category === "string" && record.category.trim().length > 0
      ? record.category
      : "uncategorized";
  const envelopeId =
    typeof record.envelopeId === "string" || typeof record.envelopeId === "number"
      ? String(record.envelopeId)
      : "unassigned";
  const notes = typeof record.notes === "string" ? record.notes : undefined;

  // Determine transaction type
  let typeCandidate: Transaction["type"];
  if (record.type === "income" || record.type === "expense" || record.type === "transfer") {
    typeCandidate = record.type;
  } else {
    typeCandidate = amountRaw >= 0 ? "income" : "expense";
  }

  // Apply correct sign to amount based on type
  const signedAmount =
    typeCandidate === "expense"
      ? -Math.abs(amountRaw)
      : typeCandidate === "income"
        ? Math.abs(amountRaw)
        : amountRaw;

  return {
    id: validatedId,
    date,
    description,
    amount: signedAmount,
    category,
    envelopeId,
    notes,
    type: typeCandidate,
  } satisfies Transaction;
};

/**
 * Normalize a raw envelope object to a valid Envelope type
 * @param env - Raw envelope data from API or database
 * @returns Normalized Envelope or null if invalid
 */
export const normalizeEnvelope = (env: unknown): Envelope | null => {
  if (!env || typeof env !== "object") {
    return null;
  }

  const record = env as {
    id?: string | number;
    name?: unknown;
    category?: unknown;
    currentBalance?: unknown;
    targetAmount?: unknown;
    color?: unknown;
    icon?: unknown;
    description?: unknown;
    archived?: unknown;
    lastModified?: unknown;
    createdAt?: unknown;
  };

  // Validate required fields
  if (record.id === undefined || typeof record.name !== "string") {
    return null;
  }

  return {
    id: String(record.id),
    name: record.name,
    category:
      typeof record.category === "string" && record.category.trim().length > 0
        ? record.category
        : "uncategorized",
    currentBalance: Number(record.currentBalance ?? 0),
    targetAmount: Number(record.targetAmount ?? 0),
    color: typeof record.color === "string" ? record.color : undefined,
    icon: typeof record.icon === "string" ? record.icon : undefined,
    description: typeof record.description === "string" ? record.description : undefined,
    isArchived: Boolean(record.archived),
  };
};

/**
 * Normalize an array of transactions
 */
export const normalizeTransactions = (transactions: unknown[]): Transaction[] => {
  return transactions.map(normalizeTransaction).filter((txn): txn is Transaction => txn !== null);
};

/**
 * Normalize an array of envelopes
 */
export const normalizeEnvelopes = (envelopes: unknown[]): Envelope[] => {
  return envelopes.map(normalizeEnvelope).filter((env): env is Envelope => env !== null);
};

export default {
  normalizeTransaction,
  normalizeEnvelope,
  normalizeTransactions,
  normalizeEnvelopes,
};
