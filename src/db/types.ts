// Database schema types for VioletVault Dexie tables
// These interfaces define the shape of data stored in IndexedDB via Dexie

export interface BudgetRecord {
  id: string;
  lastModified: number;
  version?: number;
  // Additional properties for encrypted budget data
  [key: string]: unknown;
}

export interface Envelope {
  id: string;
  name: string;
  category: string;
  archived: boolean;
  lastModified: number;
  createdAt?: number;
  // Additional envelope properties
  currentBalance?: number;
  targetAmount?: number;
  description?: string;
  autoAllocate?: boolean;
  // Connection properties
  billId?: string;
  debtId?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  envelopeId: string;
  category: string;
  type: "income" | "expense" | "transfer";
  lastModified: number;
  createdAt?: number;
  // Additional transaction properties
  description?: string;
  merchant?: string;
  receiptUrl?: string;
}

export interface Bill {
  id: string;
  name: string;
  dueDate: Date;
  amount: number;
  category: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: "monthly" | "quarterly" | "annually";
  envelopeId?: string;
  lastModified: number;
  createdAt?: number;
  // Additional bill properties
  description?: string;
  paymentMethod?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: string;
  priority: "low" | "medium" | "high";
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  isPaused: boolean;
  isCompleted: boolean;
  lastModified: number;
  createdAt?: number;
  // Additional savings goal properties
  description?: string;
  monthlyContribution?: number;
}

export interface PaycheckHistory {
  id: string;
  date: Date;
  amount: number;
  source: string;
  allocations?: Record<string, number>;
  lastModified: number;
  createdAt?: number;
  // Additional paycheck properties
  deductions?: Record<string, number>;
  netAmount?: number;
}

export interface AuditLogEntry {
  id?: number; // Auto-increment primary key
  timestamp: number;
  action: string;
  entityType: string;
  entityId: string;
  // Additional audit properties
  userId?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt: number;
  category: string;
  // Additional cache properties
  size?: number;
}

export interface Debt {
  id: string;
  name: string;
  creditor: string;
  type: "credit_card" | "loan" | "mortgage" | "other";
  status: "active" | "paid_off" | "delinquent";
  currentBalance: number;
  minimumPayment: number;
  lastModified: number;
  createdAt?: number;
  // Additional debt properties
  interestRate?: number;
  dueDate?: Date;
  originalBalance?: number;
  envelopeId?: string;
}

export interface BudgetCommit {
  hash: string;
  timestamp: number;
  message: string;
  author: string;
  parentHash?: string;
  deviceFingerprint?: string;
  // Additional commit properties
  changes?: Record<string, unknown>;
}

export interface BudgetChange {
  id?: number; // Auto-increment primary key
  commitHash: string;
  entityType: string;
  entityId: string;
  changeType: "create" | "update" | "delete";
  description?: string;
  // Additional change properties
  oldValue?: unknown;
  newValue?: unknown;
}

export interface BudgetBranch {
  id?: number; // Auto-increment primary key
  name: string;
  description?: string;
  sourceCommitHash: string;
  headCommitHash: string;
  author: string;
  created: number;
  isActive: boolean;
  isMerged: boolean;
  // Additional branch properties
  mergedAt?: number;
  mergedBy?: string;
}

export interface BudgetTag {
  id?: number; // Auto-increment primary key
  name: string;
  description?: string;
  commitHash: string;
  tagType: "release" | "milestone" | "backup";
  author: string;
  created: number;
  // Additional tag properties
  version?: string;
}

export interface AutoBackup {
  id: string;
  timestamp: number;
  type: "manual" | "scheduled" | "sync_triggered";
  syncType?: "firebase" | "export" | "import";
  // Additional backup properties
  size?: number;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

// Utility types for query operations
export type DateRange = {
  start: Date;
  end: Date;
};

export type BulkUpdate = {
  type: "envelope" | "transaction" | "bill" | "savingsGoal" | "paycheck";
  data: unknown;
};

// Database statistics type
export interface DatabaseStats {
  envelopes: number;
  transactions: number;
  bills: number;
  savingsGoals: number;
  paychecks: number;
  cache: number;
  lastOptimized: number;
}
