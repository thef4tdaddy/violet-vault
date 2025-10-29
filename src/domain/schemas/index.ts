/**
 * Zod Schemas Barrel Export
 * Central export point for all domain validation schemas
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

// Core Finance Schemas & Types
export {
  EnvelopeSchema,
  EnvelopePartialSchema,
  validateEnvelope,
  validateEnvelopeSafe,
  validateEnvelopePartial,
  type Envelope,
  type EnvelopePartial,
} from "./envelope";

export {
  TransactionSchema,
  TransactionTypeSchema,
  TransactionPartialSchema,
  validateTransaction,
  validateTransactionSafe,
  validateTransactionPartial,
  type Transaction,
  type TransactionPartial,
  type TransactionType,
} from "./transaction";

export {
  BillSchema,
  BillFrequencySchema,
  BillPartialSchema,
  validateBill,
  validateBillSafe,
  validateBillPartial,
  type Bill,
  type BillPartial,
  type BillFrequency,
} from "./bill";

export {
  SavingsGoalSchema,
  PrioritySchema,
  SavingsGoalPartialSchema,
  validateSavingsGoal,
  validateSavingsGoalSafe,
  validateSavingsGoalPartial,
  type SavingsGoal,
  type SavingsGoalPartial,
  type Priority,
} from "./savings-goal";

export {
  DebtSchema,
  DebtTypeSchema,
  DebtStatusSchema,
  DebtPartialSchema,
  validateDebt,
  validateDebtSafe,
  validateDebtPartial,
  type Debt,
  type DebtPartial,
  type DebtType,
  type DebtStatus,
} from "./debt";

export {
  PaycheckHistorySchema,
  PaycheckHistoryPartialSchema,
  validatePaycheckHistory,
  validatePaycheckHistorySafe,
  validatePaycheckHistoryPartial,
  type PaycheckHistory,
  type PaycheckHistoryPartial,
} from "./paycheck-history";

// Database Infrastructure Schemas & Types
export {
  BudgetRecordSchema,
  BudgetRecordPartialSchema,
  validateBudgetRecord,
  validateBudgetRecordSafe,
  validateBudgetRecordPartial,
  type BudgetRecord,
  type BudgetRecordPartial,
} from "./budget-record";

export {
  AuditLogEntrySchema,
  AuditLogEntryPartialSchema,
  validateAuditLogEntry,
  validateAuditLogEntrySafe,
  validateAuditLogEntryPartial,
  type AuditLogEntry,
  type AuditLogEntryPartial,
} from "./audit-log";

export {
  CacheEntrySchema,
  CacheEntryPartialSchema,
  validateCacheEntry,
  validateCacheEntrySafe,
  validateCacheEntryPartial,
  type CacheEntry,
  type CacheEntryPartial,
} from "./cache";

export {
  AutoBackupSchema,
  BackupTypeSchema,
  SyncTypeSchema,
  AutoBackupPartialSchema,
  validateAutoBackup,
  validateAutoBackupSafe,
  validateAutoBackupPartial,
  type AutoBackup,
  type AutoBackupPartial,
  type BackupType,
  type SyncType,
} from "./backup";

// Version Control Schemas & Types
export {
  BudgetCommitSchema,
  BudgetChangeSchema,
  BudgetBranchSchema,
  BudgetTagSchema,
  validateBudgetCommit,
  validateBudgetCommitSafe,
  validateBudgetChange,
  validateBudgetChangeSafe,
  validateBudgetBranch,
  validateBudgetBranchSafe,
  validateBudgetTag,
  validateBudgetTagSafe,
  type BudgetCommit,
  type BudgetChange,
  type BudgetBranch,
  type BudgetTag,
} from "./version-control";

// Utility Schemas & Types
export {
  DateRangeSchema,
  BulkUpdateTypeSchema,
  BulkUpdateSchema,
  DatabaseStatsSchema,
  validateDateRange,
  validateDateRangeSafe,
  validateBulkUpdate,
  validateBulkUpdateSafe,
  validateDatabaseStats,
  validateDatabaseStatsSafe,
  type DateRange,
  type BulkUpdateType,
  type BulkUpdate,
  type DatabaseStats,
} from "./utility";
