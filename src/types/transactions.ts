import { BaseEntity, DateRange, QueryOptions } from './common';

/**
 * Transaction types
 */

export interface Transaction extends BaseEntity {
  amount: number;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  envelopeId?: string;
  billId?: string;
  reconciled?: boolean;
  reconciledAt?: string;
  receiptData?: ReceiptData;
  tags?: string[];
  notes?: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface ReceiptData {
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface TransactionQueryOptions extends QueryOptions {
  dateRange?: DateRange;
  envelopeId?: string;
  category?: string;
  type?: TransactionType;
}

export interface TransactionMutationData {
  amount?: number;
  date?: string;
  description?: string;
  category?: string;
  type?: TransactionType;
  envelopeId?: string;
  billId?: string;
  reconciled?: boolean;
  notes?: string;
  tags?: string[];
  updatedAt?: string;
  reconciledAt?: string;
}

export interface TransactionBalance {
  transactionId: string;
  previousBalance: number;
  newBalance: number;
  envelopeId?: string;
}