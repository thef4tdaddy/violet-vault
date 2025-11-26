/**
 * Core Finance Domain Types
 * Created for Issue #409 - TypeScript Conversion
 */

/**
 * Transaction type for categorizing income vs expenses
 */
export type TransactionType = "income" | "expense" | "transfer";

/**
 * Transaction metadata for additional context
 */
export interface TransactionMetadata {
  items?: Array<{
    name: string;
    price?: number;
    totalPrice?: number;
    category?: {
      name: string;
    };
  }>;
  shipping?: number;
  tax?: number;
  splitData?: {
    splitIndex: number;
    totalSplits: number;
    originalTransactionId: string | number;
    isOriginalItem?: boolean;
    originalItem?: unknown;
  };
  [key: string]: unknown;
}

/**
 * Core Transaction entity
 */
export interface Transaction {
  id: string | number;
  date: string; // ISO date string (YYYY-MM-DD)
  description: string;
  amount: number; // Negative for expenses, positive for income
  category: string;
  envelopeId?: string | number;
  notes?: string;
  reconciled?: boolean;
  account?: string;
  type?: TransactionType;
  createdBy?: string;
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
  importSource?: string;
  isSplit?: boolean;
  splitIndex?: number;
  splitTotal?: number;
  parentTransactionId?: string | number;
  originalAmount?: number;
  metadata?: TransactionMetadata;
  source?: string;
  fromEnvelopeId?: string | number;
  toEnvelopeId?: string | number;
  [key: string]: unknown;
}

/**
 * Envelope entity for budget categories
 */
export interface Envelope {
  id: string | number;
  name: string;
  category?: string;
  currentBalance?: number;
  targetAmount?: number;
  color?: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivity?: string;
  priority?: number;
  isArchived?: boolean;
  [key: string]: unknown;
}

/**
 * Split allocation for transaction splitting
 */
export interface SplitAllocation {
  id: string | number;
  description: string;
  amount: number;
  category: string;
  envelopeId: string | number | "";
  isOriginalItem?: boolean;
  originalItem?: unknown;
  [key: string]: unknown;
}

/**
 * Split totals calculation result
 */
export interface SplitTotals {
  original: number;
  allocated: number;
  remaining: number;
  isValid: boolean;
  isOverAllocated: boolean;
  isUnderAllocated: boolean;
  error?: string;
}

/**
 * User entity for multi-user features
 */
export interface User {
  userName: string;
  userColor: string;
  userId?: string;
  email?: string;
}

/**
 * Filter configuration for StandardFilters
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "date" | "text" | "search";
  options?: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
}

/**
 * Transaction filter state
 */
export interface TransactionFilters {
  search?: string;
  dateFilter?: string;
  typeFilter?: string;
  envelopeFilter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Transaction form data
 */
export interface TransactionFormData {
  date: string;
  description: string;
  amount: string;
  type: TransactionType;
  envelopeId: string | number;
  category: string;
  notes: string;
  reconciled: boolean;
}
