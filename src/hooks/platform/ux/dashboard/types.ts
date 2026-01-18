import type {
  Envelope as DbEnvelope,
  SavingsGoal as DbSavingsGoal,
  Transaction as DbTransaction,
  PaycheckHistory,
} from "@/db/types";

// Type definitions for dashboard
export type Envelope = DbEnvelope;
export type SavingsGoal = DbSavingsGoal;
export type PaycheckHistoryItem = PaycheckHistory;
export type Transaction = DbTransaction;

export interface TransactionFormState {
  amount?: string;
  description?: string;
  type?: "expense" | "income";
  envelopeId?: string;
  category?: string;
  date?: string;
}

export type ReconcileInput = Omit<DbTransaction, "lastModified" | "createdAt">;

export interface EnvelopeOption {
  id: string;
  name: string;
}
