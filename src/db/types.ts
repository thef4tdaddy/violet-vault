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
  envelopeType?: string;
  monthlyBudget?: number;
  biweeklyAllocation?: number;
  // Connection properties
  billId?: string;
  debtId?: string;
  // Savings goal properties (for envelopeType: "savings")
  priority?: "low" | "medium" | "high";
  isPaused?: boolean;
  isCompleted?: boolean;
  targetDate?: Date | string;
  monthlyContribution?: number;
  // Supplemental account properties (for envelopeType: "supplemental")
  annualContribution?: number;
  expirationDate?: Date | string | null;
  isActive?: boolean;
  accountType?: string; // FSA, HSA, etc.
  [key: string]: unknown;
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
  notes?: string;
  // Paycheck-related metadata for internal transfers
  isInternalTransfer?: boolean;
  paycheckId?: string;
  // Transfer-specific fields
  fromEnvelopeId?: string;
  toEnvelopeId?: string;
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
}

export interface PaycheckHistory {
  id: string;
  date?: Date | string;
  processedAt?: Date | string;
  amount: number;
  source?: string;
  payerName?: string;
  allocationMode?: string;
  totalAllocated?: number;
  remainingAmount?: number;
  allocations?:
    | Record<string, number>
    | Array<{ envelopeId: string; envelopeName: string; amount: number }>;
  lastModified: number;
  createdAt?: number;
  // Additional paycheck properties
  deductions?: Record<string, number>;
  netAmount?: number;
  processedBy?: string;
  // Transaction IDs for audit trail (Issue #1340)
  incomeTransactionId?: string;
  transferTransactionIds?: string[];
  [key: string]: unknown;
}

export interface AuditLogEntry {
  id?: number; // Auto-increment primary key
  timestamp: number;
  action: string;
  entityType: string;
  entityId: string;
  // Additional audit properties
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CacheEntry {
  key: string;
  value: unknown;
  expiresAt: number | null;
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
  [key: string]: unknown;
}

export interface BudgetCommit {
  hash: string;
  timestamp: number;
  message: string;
  author: string;
  parentHash?: string | null;
  deviceFingerprint?: string;
  // Additional commit properties for encrypted data
  encryptedSnapshot?: number[];
  iv?: number[];
  snapshotData?: string;
  changes?: Record<string, unknown>;
  [key: string]: unknown;
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
  [key: string]: unknown;
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

export interface Condition {
  id?: string;
  type: string;
  envelopeId?: string | null;
  value: number;
  operator?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AutoFundingRule {
  id: string;
  name: string;
  description: string;
  type: string;
  trigger: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  lastExecuted: string | null;
  executionCount: number;
  config: {
    sourceType: "unassigned" | "envelope" | "income";
    sourceId: string | null;
    targetType: "envelope" | "multiple";
    targetId: string | null;
    targetIds: string[];
    amount: number;
    percentage: number;
    conditions: Condition[];
    scheduleConfig: Record<string, unknown>;
  };
  lastModified: number;
}

export interface ExecutionRecord {
  id: string;
  trigger: string;
  totalFunded?: number;
  success?: boolean;
  executedAt?: string;
  rulesExecuted?: number;
  timestamp?: string; // Legacy/Alias support
  lastModified: number;
  [key: string]: unknown;
}

// Utility types for query operations
export type DateRange = {
  start: Date;
  end: Date;
};

export type BulkUpdate = {
  type: "envelope" | "transaction" | "bill" | "savingsGoal" | "paycheck" | "autoFundingRule";
  data: unknown;
};

// Database statistics type
export interface DatabaseStats {
  envelopes: number;
  transactions: number;
  bills: number;
  savingsGoals: number;
  paychecks: number;
  autoFundingRules: number;
  autoFundingHistory: number;
  cache: number;
  lastOptimized: number;
}
