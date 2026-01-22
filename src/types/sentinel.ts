/**
 * Type definitions for SentinelShare integration
 * SentinelShare is a cross-app transaction matching service
 */

/**
 * Status of a SentinelShare receipt
 */
export type SentinelReceiptStatus = "pending" | "matched" | "ignored";

/**
 * SentinelShare receipt from the PostgreSQL API
 */
export interface SentinelReceipt {
  /** Unique receipt identifier */
  id: string;

  /** Transaction amount */
  amount: number;

  /** Merchant or vendor name */
  merchant: string;

  /** Transaction date (ISO 8601 format) */
  date: string;

  /** Receipt category */
  category?: string;

  /** Receipt description or notes */
  description?: string;

  /** Current status of the receipt */
  status: SentinelReceiptStatus;

  /** Timestamp when receipt was created */
  createdAt: string;

  /** Timestamp when receipt was last updated */
  updatedAt: string;

  /** ID of the matched transaction (if matched) */
  matchedTransactionId?: string;

  /** Source application that created the receipt */
  sourceApp?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response from the SentinelShare API
 */
export interface SentinelReceiptsResponse {
  receipts: SentinelReceipt[];
  total: number;
  page?: number;
  pageSize?: number;
}

/**
 * Options for updating receipt status
 */
export interface UpdateReceiptStatusOptions {
  receiptId: string;
  status: "matched" | "ignored";
  matchedTransactionId?: string;
}

/**
 * Error response from SentinelShare API
 */
export interface SentinelApiError {
  message: string;
  code?: string;
  details?: unknown;
}
