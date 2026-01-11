/**
 * Zod Schemas Barrel Export
 * Central export point for all domain validation schemas
 */

// Auth Schemas & Types
export * from "./auth";

// Core Finance Schemas & Types
export {
  EnvelopeSchema,
  StandardEnvelopeSchema,
  GoalEnvelopeSchema,
  LiabilityEnvelopeSchema,
  SupplementalAccountSchema,
  validateEnvelope,
  validateEnvelopeSafe,
  validateEnvelopePartial,
  validateEnvelopePartialSafe,
  type Envelope,
  type StandardEnvelope,
  type GoalEnvelope,
  type LiabilityEnvelope,
  type SupplementalAccount,
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

// Legacy Aliases
export * from "./bill";
export * from "./debt";
export * from "./savingsGoal";

// Database Infrastructure Schemas & Types
export * from "./budget-record";
export * from "./audit-log";
export * from "./cache";
export * from "./backup";

// Version Control Schemas & Types
export * from "./version-control";

// Utility Schemas & Types
export * from "./utility";

// Bug Report Schemas & Types
export * from "./bug-report";

// API Response Schemas & Types
export * from "./api-responses";

// Import/Export Schemas & Types
export * from "./import-export";

// Component Props Schemas & Types
export * from "./component-props";

// Sync Schemas & Types
export * from "./sync";
