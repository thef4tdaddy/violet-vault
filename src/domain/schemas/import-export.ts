/**
 * Import/Export Data Validation Schemas
 */

import { z } from "zod";
import { EnvelopeSchema } from "./envelope";
import { TransactionSchema } from "./transaction";

/**
 * Export metadata schema
 */
export const ExportMetadataSchema = z
  .object({
    appVersion: z.string().optional(),
    budgetId: z.string().optional(),
  })
  .passthrough();

export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;

/**
 * Imported data schema
 */
export const ImportedDataSchema = z
  .object({
    envelopes: z.array(z.any()), // Required for valid backup
    transactions: z.array(z.any()).optional(),
    budget: z.array(z.any()).optional(),
    budgetCommits: z.array(z.any()).optional(),
    budgetChanges: z.array(z.any()).optional(),
    exportMetadata: ExportMetadataSchema.optional(),
    // Deprecated fields kept for backward compatibility during v2.0 transition
    bills: z.array(z.any()).optional().default([]),
    debts: z.array(z.any()).optional().default([]),
    paycheckHistory: z.array(z.any()).optional().default([]),
    savingsGoals: z.array(z.any()).optional().default([]),
    supplementalAccounts: z.array(z.any()).optional().default([]),
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

export const validateImportedDataStructureSafe = (data: unknown) => {
  return ImportedDataSchema.safeParse(data);
};

export const validateEnvelopes = (envelopes: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  envelopes.forEach((envelope, index) => {
    const result = EnvelopeSchema.safeParse(envelope);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        index,
        data: envelope,
        errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
  });

  return { valid, invalid };
};

export const validateTransactions = (transactions: unknown[]): ItemValidationResult<unknown> => {
  const valid: unknown[] = [];
  const invalid: Array<{ index: number; data: unknown; errors: string[] }> = [];

  transactions.forEach((tx, index) => {
    const result = TransactionSchema.safeParse(tx);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        index,
        data: tx,
        errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
      });
    }
  });

  return { valid, invalid };
};

// Deprecated validators
export const validateBills = (_items: unknown[]): ItemValidationResult<unknown> => ({
  valid: [],
  invalid: [],
});
export const validateDebts = (_items: unknown[]): ItemValidationResult<unknown> => ({
  valid: [],
  invalid: [],
});

export const formatValidationErrors = (
  envelopeErrors: ItemValidationResult<unknown>["invalid"],
  transactionErrors: ItemValidationResult<unknown>["invalid"],
  _billErrors: ItemValidationResult<unknown>["invalid"] = [],
  _debtErrors: ItemValidationResult<unknown>["invalid"] = []
): string[] => {
  const errors: string[] = [];

  if (envelopeErrors.length > 0) {
    errors.push(`${envelopeErrors.length} envelope(s) have validation errors:`);
  }
  if (transactionErrors.length > 0) {
    errors.push(`${transactionErrors.length} transaction(s) have validation errors:`);
  }

  return errors;
};
