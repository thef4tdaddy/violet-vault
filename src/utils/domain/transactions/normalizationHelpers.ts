/**
 * Transaction and Envelope normalization utilities
 * Extracted from TransactionLedger for reusability
 */
import type { Transaction, Envelope } from "@/types/finance";

const normalizeDate = (rawDate: unknown): string | null => {
  if (typeof rawDate === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    return dateRegex.test(rawDate) ? rawDate : null;
  }
  if (rawDate instanceof Date) {
    return rawDate.toISOString().split("T")[0];
  }
  return null;
};

const normalizeId = (id: unknown): string | number | null => {
  if (id === undefined || id === null) return null;
  return id as string | number;
};

const getSignedAmount = (amount: number, type: Transaction["type"]): number => {
  if (type === "expense") return -Math.abs(amount);
  if (type === "income") return Math.abs(amount);
  return amount;
};

/**
 * Normalize a raw transaction object to a valid Transaction type
 * @param txn - Raw transaction data from API or database
 * @returns Normalized Transaction or null if invalid
 */
const getTransactionType = (
  record: Record<string, unknown>,
  amountRaw: number
): Transaction["type"] => {
  if (record.type === "income" || record.type === "expense" || record.type === "transfer") {
    return record.type;
  }
  return amountRaw >= 0 ? "income" : "expense";
};

/**
 * Normalize a raw transaction object to a valid Transaction type
 * @param txn - Raw transaction data from API or database
 * @returns Normalized Transaction or null if invalid
 */
export const normalizeTransaction = (txn: unknown): Transaction | null => {
  if (!txn || typeof txn !== "object") return null;

  const record = txn as Record<string, unknown>;
  const date = normalizeDate(record.date);
  const id = normalizeId(record.id);

  if (!date || id === null) return null;

  const amountRaw = Number(record.amount ?? 0);
  if (Number.isNaN(amountRaw)) return null;

  const type = getTransactionType(record, amountRaw);
  const description = typeof record.description === "string" ? record.description : "";
  const category =
    typeof record.category === "string" && record.category.trim().length > 0
      ? record.category
      : "uncategorized";
  const envelopeId =
    typeof record.envelopeId === "string" || typeof record.envelopeId === "number"
      ? String(record.envelopeId)
      : "unassigned";

  return {
    id,
    date,
    description,
    amount: getSignedAmount(amountRaw, type),
    category,
    envelopeId,
    notes: typeof record.notes === "string" ? record.notes : undefined,
    type,
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
    currentBalance: (() => {
      const balance = Number(record.currentBalance ?? 0);
      return Number.isNaN(balance) ? 0 : balance;
    })(),
    targetAmount: (() => {
      const target = Number(record.targetAmount ?? 0);
      return Number.isNaN(target) ? 0 : target;
    })(),
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
