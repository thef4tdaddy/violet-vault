/**
 * Import/Export Data Validation Schemas
 * Runtime validation for data import/export operations
 * Part of Issue #1404: Import/Export Data Validation with Zod
 *
 * Provides comprehensive validation for:
 * - Export metadata structure
 * - Import file structure
 * - Legacy format support (savingsGoals, supplementalAccounts)
 * - Individual item validation
 */

import { z } from "zod";
import { EnvelopeSchema } from "./envelope";
import { TransactionSchema } from "./transaction";
import { BillSchema } from "./bill";
import { DebtSchema } from "./debt";
import { AuditLogEntrySchema } from "./audit-log";
import { SavingsGoalSchema } from "./savings-goal";

/**
 * Export metadata schema
 * Validates the metadata structure created during export
 */
export const ExportMetadataSchema = z
  .object({
    exportedBy: z.string().optional(),
    exportDate: z.string().optional(),
    appVersion: z.string().optional(),
    dataVersion: z.string().optional(),
    dataSource: z.string().optional(),
    exportedFrom: z.string().optional(),
    budgetId: z.string().optional(),
    userColor: z.string().optional(),
    modelVersion: z.string().optional(),
    syncContext: z
      .object({
        note: z.string().optional(),
        originalBudgetId: z.string().optional(),
        exportTimestamp: z.number().optional(),
      })
      .optional(),
  })
  .passthrough();

export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;

/**
 * Legacy supplemental account schema for backward compatibility
 * Used when importing files from older versions
 */
/**
 * Zod schema for date fields that can be Unix timestamp (number) or date string
 * Used for flexible import validation of legacy data
 */
const flexibleDateSchema = z.union([
  z.number().int().positive(), // Unix timestamp in milliseconds
  z.string(), // ISO date string or other date format
  z.date(), // Date object
]);

export const LegacySupplementalAccountSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    category: z.string().optional(),
    currentBalance: z.number().min(0).optional(),
    annualContribution: z.number().min(0).optional(),
    expirationDate: z.union([z.date(), z.string(), z.null()]).optional(),
    isActive: z.boolean().optional(),
    accountType: z.string().optional(),
    lastModified: flexibleDateSchema.optional(),
    createdAt: flexibleDateSchema.optional(),
    description: z.string().optional(),
  })
  .passthrough();

export type LegacySupplementalAccount = z.infer<typeof LegacySupplementalAccountSchema>;

/**
 * Relaxed envelope schema for import validation
 * More permissive than EnvelopeSchema to allow importing legacy data
 * Uses passthrough to allow additional fields
 *
 * Note: lastModified is optional here (unlike strict EnvelopeSchema) because:
 * 1. Legacy backup files may not have this field
 * 2. The database layer will add lastModified on insertion if missing
 * 3. This allows importing data from older app versions
 */
export const ImportEnvelopeSchema = z
  .object({
    id: z.string().min(1, "Envelope ID is required"),
    name: z.string().min(1, "Envelope name is required"),
    category: z.string().optional().default("Uncategorized"),
    archived: z.boolean().optional().default(false),
    lastModified: z.number().int().positive().optional(),
    createdAt: z.number().int().positive().optional(),
    currentBalance: z.number().optional(),
    targetAmount: z.number().optional(),
    description: z.string().optional(),
    envelopeType: z.string().optional(),
    autoAllocate: z.boolean().optional(),
    monthlyBudget: z.number().optional(),
    biweeklyAllocation: z.number().optional(),
    billId: z.string().optional(),
    debtId: z.string().optional(),
    priority: z.string().optional(),
    isPaused: z.boolean().optional(),
    isCompleted: z.boolean().optional(),
    targetDate: z.union([z.date(), z.string()]).optional(),
    monthlyContribution: z.number().optional(),
    annualContribution: z.number().optional(),
    expirationDate: z.union([z.date(), z.string(), z.null()]).optional(),
    isActive: z.boolean().optional(),
    accountType: z.string().optional(),
  })
  .passthrough();

export type ImportEnvelope = z.infer<typeof ImportEnvelopeSchema>;

/**
 * Relaxed transaction schema for import validation
 * More permissive than TransactionSchema to allow importing various data formats
 *
 * Note: lastModified is optional to support legacy backup files
 */
export const ImportTransactionSchema = z
  .object({
    id: z.string().min(1, "Transaction ID is required"),
    date: z.union([z.date(), z.string()]),
    amount: z.number(),
    envelopeId: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    lastModified: z.number().int().positive().optional(),
    createdAt: z.number().int().positive().optional(),
    description: z.string().optional(),
    merchant: z.string().optional(),
    receiptUrl: z.string().optional(),
    isInternalTransfer: z.boolean().optional(),
    paycheckId: z.string().optional(),
    fromEnvelopeId: z.string().optional(),
    toEnvelopeId: z.string().optional(),
  })
  .passthrough();

export type ImportTransaction = z.infer<typeof ImportTransactionSchema>;

/**
 * Relaxed bill schema for import validation
 *
 * Note: lastModified is optional to support legacy backup files
 */
export const ImportBillSchema = z
  .object({
    id: z.string().min(1, "Bill ID is required"),
    name: z.string().min(1, "Bill name is required"),
    dueDate: z.union([z.date(), z.string()]),
    amount: z.number().min(0),
    category: z.string().optional(),
    isPaid: z.boolean().optional(),
    isRecurring: z.boolean().optional(),
    frequency: z.string().optional(),
    envelopeId: z.string().optional(),
    lastModified: z.number().int().positive().optional(),
    createdAt: z.number().int().positive().optional(),
    description: z.string().optional(),
    paymentMethod: z.string().optional(),
  })
  .passthrough();

export type ImportBill = z.infer<typeof ImportBillSchema>;

/**
 * Relaxed debt schema for import validation
 *
 * Note: lastModified is optional to support legacy backup files
 */
export const ImportDebtSchema = z
  .object({
    id: z.string().min(1, "Debt ID is required"),
    name: z.string().min(1, "Debt name is required"),
    creditor: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    currentBalance: z.number().min(0).optional(),
    minimumPayment: z.number().min(0).optional(),
    lastModified: z.number().int().positive().optional(),
    createdAt: z.number().int().positive().optional(),
    interestRate: z.number().optional(),
    dueDate: z.union([z.date(), z.string()]).optional(),
    originalBalance: z.number().optional(),
  })
  .passthrough();

export type ImportDebt = z.infer<typeof ImportDebtSchema>;

/**
 * Imported data schema
 * Validates the complete import file structure including:
 * - Current envelope-based model
 * - Legacy format support (savingsGoals, supplementalAccounts)
 */
export const ImportedDataSchema = z
  .object({
    // Required: Must have envelopes array
    envelopes: z.array(ImportEnvelopeSchema).min(0),

    // Optional: Export metadata
    exportMetadata: ExportMetadataSchema.optional(),

    // Optional: Transaction arrays
    allTransactions: z.array(ImportTransactionSchema).optional(),
    transactions: z.array(ImportTransactionSchema).optional(),

    // Optional: Bills
    bills: z.array(ImportBillSchema).optional(),

    // Optional: Debts
    debts: z.array(ImportDebtSchema).optional(),

    // Optional: Audit log
    auditLog: z.array(AuditLogEntrySchema.partial()).optional(),

    // Optional: Paycheck history (allow partial to be more permissive)
    paycheckHistory: z.array(z.record(z.string(), z.unknown())).optional(),

    // Legacy format support
    savingsGoals: z.array(SavingsGoalSchema.partial()).optional(),
    supplementalAccounts: z.array(LegacySupplementalAccountSchema).optional(),

    // Regular envelopes array from newer exports
    regularEnvelopes: z.array(ImportEnvelopeSchema).optional(),

    // Budget metadata fields
    unassignedCash: z.number().optional(),
    biweeklyAllocation: z.number().optional(),
    actualBalance: z.number().optional(),
    isActualBalanceManual: z.boolean().optional(),

    // Data guide (informational only)
    _dataGuide: z.unknown().optional(),
  })
  .passthrough();

export type ImportedData = z.infer<typeof ImportedDataSchema>;

/**
 * Validation result for individual items
 */
export interface ItemValidationResult<T> {
  valid: T[];
  invalid: Array<{
    index: number;
    data: unknown;
    errors: string[];
  }>;
}

/**
 * Validate imported data structure
 * @throws ZodError if the structure is invalid
 */
export const validateImportedDataStructure = (data: unknown): ImportedData => {
  return ImportedDataSchema.parse(data);
};

/**
 * Safe validation for imported data structure
 * Returns result with error details instead of throwing
 */
export const validateImportedDataStructureSafe = (data: unknown) => {
  return ImportedDataSchema.safeParse(data);
};

/**
 * Validate individual envelopes using the strict schema
 * Returns valid items and details about invalid ones
 */
export const validateEnvelopes = (envelopes: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  envelopes.forEach((envelope, index) => {
    const result = EnvelopeSchema.safeParse(envelope);
    if (result.success) {
      valid.push(result.data);
    } else {
      // Safety check: ensure issues is an array before map
      const issues = result.error?.issues || [];
      const safeIssues = Array.isArray(issues) ? issues : [];
      invalid.push({
        index,
        data: envelope,
        errors: safeIssues.map(
          (i) => `${i?.path?.join(".") || "unknown"}: ${i?.message || "Validation error"}`
        ),
      });
    }
  });

  return { valid, invalid };
};

/**
 * Validate individual transactions using the strict schema
 * Returns valid items and details about invalid ones
 */
export const validateTransactions = (transactions: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  transactions.forEach((transaction, index) => {
    const result = TransactionSchema.safeParse(transaction);
    if (result.success) {
      valid.push(result.data);
    } else {
      // Safety check: ensure issues is an array before map
      const issues = result.error?.issues || [];
      const safeIssues = Array.isArray(issues) ? issues : [];
      invalid.push({
        index,
        data: transaction,
        errors: safeIssues.map(
          (i) => `${i?.path?.join(".") || "unknown"}: ${i?.message || "Validation error"}`
        ),
      });
    }
  });

  return { valid, invalid };
};

/**
 * Validate individual bills using the strict schema
 * Returns valid items and details about invalid ones
 */
export const validateBills = (bills: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  bills.forEach((bill, index) => {
    const result = BillSchema.safeParse(bill);
    if (result.success) {
      valid.push(result.data);
    } else {
      // Safety check: ensure issues is an array before map
      const issues = result.error?.issues || [];
      const safeIssues = Array.isArray(issues) ? issues : [];
      invalid.push({
        index,
        data: bill,
        errors: safeIssues.map(
          (i) => `${i?.path?.join(".") || "unknown"}: ${i?.message || "Validation error"}`
        ),
      });
    }
  });

  return { valid, invalid };
};

/**
 * Validate individual debts using the strict schema
 * Returns valid items and details about invalid ones
 */
export const validateDebts = (debts: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  debts.forEach((debt, index) => {
    const result = DebtSchema.safeParse(debt);
    if (result.success) {
      valid.push(result.data);
    } else {
      // Safety check: ensure issues is an array before map
      const issues = result.error?.issues || [];
      const safeIssues = Array.isArray(issues) ? issues : [];
      invalid.push({
        index,
        data: debt,
        errors: safeIssues.map(
          (i) => `${i?.path?.join(".") || "unknown"}: ${i?.message || "Validation error"}`
        ),
      });
    }
  });

  return { valid, invalid };
};

/**
 * Format validation errors for user display
 * Creates user-friendly error messages from validation results
 */
export const formatValidationErrors = (
  envelopeErrors: ItemValidationResult<unknown>["invalid"],
  transactionErrors: ItemValidationResult<unknown>["invalid"],
  billErrors: ItemValidationResult<unknown>["invalid"],
  debtErrors: ItemValidationResult<unknown>["invalid"]
): string[] => {
  const errors: string[] = [];

  if (envelopeErrors.length > 0) {
    errors.push(`${envelopeErrors.length} envelope(s) have validation errors:`);
    envelopeErrors.slice(0, 3).forEach((e) => {
      const name = (e.data as Record<string, unknown>)?.name || `at index ${e.index}`;
      errors.push(`  - Envelope "${name}": ${e.errors.slice(0, 2).join("; ")}`);
    });
    if (envelopeErrors.length > 3) {
      errors.push(`  ... and ${envelopeErrors.length - 3} more`);
    }
  }

  if (transactionErrors.length > 0) {
    errors.push(`${transactionErrors.length} transaction(s) have validation errors:`);
    transactionErrors.slice(0, 3).forEach((e) => {
      const desc = (e.data as Record<string, unknown>)?.description || `at index ${e.index}`;
      errors.push(`  - Transaction "${desc}": ${e.errors.slice(0, 2).join("; ")}`);
    });
    if (transactionErrors.length > 3) {
      errors.push(`  ... and ${transactionErrors.length - 3} more`);
    }
  }

  if (billErrors.length > 0) {
    errors.push(`${billErrors.length} bill(s) have validation errors:`);
    billErrors.slice(0, 3).forEach((e) => {
      const name = (e.data as Record<string, unknown>)?.name || `at index ${e.index}`;
      errors.push(`  - Bill "${name}": ${e.errors.slice(0, 2).join("; ")}`);
    });
    if (billErrors.length > 3) {
      errors.push(`  ... and ${billErrors.length - 3} more`);
    }
  }

  if (debtErrors.length > 0) {
    errors.push(`${debtErrors.length} debt(s) have validation errors:`);
    debtErrors.slice(0, 3).forEach((e) => {
      const name = (e.data as Record<string, unknown>)?.name || `at index ${e.index}`;
      errors.push(`  - Debt "${name}": ${e.errors.slice(0, 2).join("; ")}`);
    });
    if (debtErrors.length > 3) {
      errors.push(`  ... and ${debtErrors.length - 3} more`);
    }
  }

  return errors;
};
