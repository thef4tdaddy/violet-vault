/**
 * Type definitions for VioletVault
 * Centralized exports for all type definitions
 */

// Database types
export * from './database'

// Re-export for backward compatibility and easier imports
export type { 
  BaseEntity,
  BudgetMetadata,
  BudgetData,
  Envelope,
  Transaction,
  TransactionType,
  Bill,
  BillFrequency,
  SavingsGoal,
  SavingsPriority,
  Debt,
  DebtType,
  DebtStatus,
  PaycheckHistory,
  SupplementalAccount,
  AccountType,
  AuditLogEntry,
  AuditAction,
  EntityType,
  CacheEntry,
  BudgetCommit,
  BudgetChange,
  BudgetBranch,
  BudgetTag,
  AutoBackup,
  DateRange,
  QueryOptions,
  BulkUpdateOperation,
  AnalyticsData,
  CategorySpending,
  DatabaseStats
} from './database'