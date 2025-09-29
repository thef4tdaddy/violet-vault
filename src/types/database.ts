/**
 * Database type definitions for VioletVault
 * These types define the shape of data stored in Dexie/IndexedDB
 */

// Common fields shared across all data entities
export interface BaseEntity {
  id: string
  lastModified: number
  createdAt?: number
}

// Budget metadata and main data
export interface BudgetMetadata extends BaseEntity {
  id: 'metadata'
  unassignedCash: number
  actualBalance: number
  isActualBalanceManual: boolean
  biweeklyAllocation: number
  supplementalAccounts?: SupplementalAccount[]
  lastUpdated?: string
}

export interface BudgetData extends BaseEntity {
  id: 'budgetData'
  version: number
  encryptedData?: string
  [key: string]: any // Allow additional encrypted data properties
}

// Envelope system
export interface Envelope extends BaseEntity {
  name: string
  category: string
  balance: number
  budgetedAmount: number
  archived: boolean
  colorHex?: string
  description?: string
  priority?: number
  autoFunding?: AutoFundingConfig
}

export interface AutoFundingConfig {
  enabled: boolean
  conditions: AutoFundingCondition[]
  allocation: AutoFundingAllocation
}

export interface AutoFundingCondition {
  type: 'balance_below' | 'date_range' | 'transaction_pattern'
  value: number | string
  parameters?: Record<string, any>
}

export interface AutoFundingAllocation {
  type: 'fixed_amount' | 'percentage_of_income' | 'percentage_of_unassigned'
  amount: number
}

// Transaction system
export interface Transaction extends BaseEntity {
  date: string // ISO date string
  amount: number
  description: string
  envelopeId: string
  category: string
  type: TransactionType
  paymentMethod?: string
  receiptUrl?: string
  splits?: TransactionSplit[]
  tags?: string[]
  isReconciled?: boolean
  externalId?: string // For imported transactions
}

export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment'

export interface TransactionSplit {
  id: string
  envelopeId: string
  amount: number
  description?: string
}

// Bill management
export interface Bill extends BaseEntity {
  name: string
  dueDate: string // ISO date string
  amount: number
  category: string
  isPaid: boolean
  isRecurring: boolean
  frequency?: BillFrequency
  envelopeId?: string
  description?: string
  paymentMethod?: string
  reminderDays?: number
  nextDueDate?: string // For recurring bills
}

export type BillFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

// Savings goals
export interface SavingsGoal extends BaseEntity {
  name: string
  category: string
  priority: SavingsPriority
  targetAmount: number
  currentAmount: number
  targetDate: string // ISO date string
  isPaused: boolean
  isCompleted: boolean
  description?: string
  colorHex?: string
  monthlyContribution?: number
}

export type SavingsPriority = 'low' | 'medium' | 'high' | 'critical'

// Debt tracking
export interface Debt extends BaseEntity {
  name: string
  creditor: string
  type: DebtType
  status: DebtStatus
  currentBalance: number
  originalBalance?: number
  minimumPayment: number
  interestRate?: number
  dueDate?: string // ISO date string
  payoffDate?: string // ISO date string
  notes?: string
}

export type DebtType = 'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'other'
export type DebtStatus = 'active' | 'paid_off' | 'in_default' | 'frozen'

// Paycheck history for trend analysis
export interface PaycheckHistory extends BaseEntity {
  date: string // ISO date string
  amount: number
  source: string
  allocations: PaycheckAllocation[]
  deductions?: PaycheckDeduction[]
  netAmount?: number
}

export interface PaycheckAllocation {
  envelopeId: string
  amount: number
  percentage?: number
}

export interface PaycheckDeduction {
  name: string
  amount: number
  type: 'tax' | 'insurance' | 'retirement' | 'other'
}

// Supplemental accounts (FSA, HSA, etc.)
export interface SupplementalAccount {
  id: string
  name: string
  type: AccountType
  currentBalance: number
  annualContribution?: number
  expirationDate?: string // ISO date string
  description?: string
  color: string
  isActive: boolean
  createdBy: string
  createdAt: string // ISO string
  lastUpdated: string // ISO string
  transactions: AccountTransaction[]
}

export type AccountType = 'FSA' | 'HSA' | 'Dependent Care FSA' | 'Commuter Benefits' | 'Gift Cards' | 'Store Credit' | 'Cashback/Points' | 'Other'

export interface AccountTransaction {
  id: string
  date: string // ISO date string
  amount: number
  description: string
  type: 'debit' | 'credit'
  createdAt: string // ISO string
}

// Audit log for change tracking
export interface AuditLogEntry extends BaseEntity {
  timestamp: number
  action: AuditAction
  entityType: EntityType
  entityId: string
  details?: Record<string, any>
  userId?: string
}

export type AuditAction = 'create' | 'update' | 'delete' | 'restore' | 'archive'
export type EntityType = 'envelope' | 'transaction' | 'bill' | 'debt' | 'savings_goal' | 'paycheck' | 'budget'

// Cache system
export interface CacheEntry {
  key: string
  value: any
  expiresAt: number
  category: string
}

// Budget history tracking (version control-like system)
export interface BudgetCommit {
  hash: string
  timestamp: number
  message: string
  author: string
  parentHash?: string
  deviceFingerprint?: string
}

export interface BudgetChange {
  id: number
  commitHash: string
  entityType: EntityType
  entityId: string
  changeType: 'create' | 'update' | 'delete'
  description: string
  previousValue?: any
  newValue?: any
}

export interface BudgetBranch {
  id: number
  name: string
  description?: string
  sourceCommitHash: string
  headCommitHash: string
  author: string
  created: number
  isActive: boolean
  isMerged: boolean
}

export interface BudgetTag {
  id: number
  name: string
  description?: string
  commitHash: string
  tagType: 'release' | 'backup' | 'milestone'
  author: string
  created: number
}

// Automatic backup storage
export interface AutoBackup {
  id: string
  timestamp: number
  type: 'scheduled' | 'manual' | 'pre_sync'
  syncType?: 'firebase' | 'local' | 'export'
  data?: any
  size?: number
}

// Query and date range utilities
export interface DateRange {
  start: Date | string
  end: Date | string
}

export interface QueryOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeArchived?: boolean
}

// Bulk update operations
export interface BulkUpdateOperation {
  type: EntityType
  data: BaseEntity
  operation?: 'put' | 'add' | 'update' | 'delete'
}

// Analytics and reporting types
export interface AnalyticsData {
  transactions: Transaction[]
  timeframe: DateRange
  includeTransfers: boolean
  categoryBreakdown?: CategorySpending[]
  totalSpent?: number
  totalIncome?: number
  netAmount?: number
}

export interface CategorySpending {
  category: string
  amount: number
  transactionCount: number
  percentage: number
}

// Database statistics
export interface DatabaseStats {
  envelopes: number
  transactions: number
  bills: number
  savingsGoals: number
  paychecks: number
  cache: number
  totalSize?: number
  lastOptimized: number
}