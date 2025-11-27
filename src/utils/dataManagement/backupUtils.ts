import { budgetDb, getBudgetMetadata } from "../../db/budgetDb.ts";
import logger from "../common/logger";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import { validateTransactionSafe } from "@/domain/schemas/transaction";
import { validateBillSafe } from "@/domain/schemas/bill";
import { validateDebtSafe } from "@/domain/schemas/debt";
import { validatePaycheckHistorySafe } from "@/domain/schemas/paycheck-history";

/**
 * Type for backup data keys that can be validated
 */
type BackupDataKey = "envelopes" | "transactions" | "bills" | "debts" | "paycheckHistory";

/**
 * Validation result for backup data
 */
interface BackupValidationResult {
  isValid: boolean;
  validCounts: Record<BackupDataKey, number>;
  invalidCounts: Record<BackupDataKey, number>;
  warnings: string[];
}

/**
 * Helper function to validate an array of items with a schema validator
 */
const validateItems = (
  items: unknown[] | undefined,
  validator: (item: unknown) => { success: boolean },
  itemType: string
): { valid: number; invalid: number; warnings: string[] } => {
  const result = { valid: 0, invalid: 0, warnings: [] as string[] };

  if (!items?.length) return result;

  for (const item of items) {
    const validation = validator(item);
    if (validation.success) {
      result.valid++;
    } else {
      result.invalid++;
      result.warnings.push(`Invalid ${itemType}: ${(item as { id?: string })?.id ?? "unknown"}`);
    }
  }

  return result;
};

/**
 * Validate backup data structure before saving (Issue #1342)
 * Validates all data types with Zod schemas
 */
export const validateBackupStructure = (data: {
  envelopes?: unknown[];
  transactions?: unknown[];
  bills?: unknown[];
  debts?: unknown[];
  paycheckHistory?: unknown[];
}): BackupValidationResult => {
  const result: BackupValidationResult = {
    isValid: true,
    validCounts: { envelopes: 0, transactions: 0, bills: 0, debts: 0, paycheckHistory: 0 },
    invalidCounts: { envelopes: 0, transactions: 0, bills: 0, debts: 0, paycheckHistory: 0 },
    warnings: [],
  };

  // Validate each data type
  const envelopeResult = validateItems(data.envelopes, validateEnvelopeSafe, "envelope");
  result.validCounts.envelopes = envelopeResult.valid;
  result.invalidCounts.envelopes = envelopeResult.invalid;
  result.warnings.push(...envelopeResult.warnings);

  const transactionResult = validateItems(
    data.transactions,
    validateTransactionSafe,
    "transaction"
  );
  result.validCounts.transactions = transactionResult.valid;
  result.invalidCounts.transactions = transactionResult.invalid;
  result.warnings.push(...transactionResult.warnings);

  const billResult = validateItems(data.bills, validateBillSafe, "bill");
  result.validCounts.bills = billResult.valid;
  result.invalidCounts.bills = billResult.invalid;
  result.warnings.push(...billResult.warnings);

  const debtResult = validateItems(data.debts, validateDebtSafe, "debt");
  result.validCounts.debts = debtResult.valid;
  result.invalidCounts.debts = debtResult.invalid;
  result.warnings.push(...debtResult.warnings);

  const paycheckResult = validateItems(
    data.paycheckHistory,
    validatePaycheckHistorySafe,
    "paycheck history"
  );
  result.validCounts.paycheckHistory = paycheckResult.valid;
  result.invalidCounts.paycheckHistory = paycheckResult.invalid;
  result.warnings.push(...paycheckResult.warnings);

  // Mark as invalid if any items failed validation
  const totalInvalid = Object.values(result.invalidCounts).reduce((sum, count) => sum + count, 0);
  result.isValid = totalInvalid === 0;

  return result;
};

/**
 * Create a backup of current data (v2.0 data model)
 * All savings goals and supplemental accounts are stored as envelopes with envelopeType
 * Validates backup structure before saving (Issue #1342)
 */
export const backupCurrentData = async () => {
  try {
    logger.info("Creating backup of current data");
    const [envelopes, bills, transactions, debts, paycheckHistory, auditLog, metadata] =
      await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.debts.toArray(),
        budgetDb.paycheckHistory.toArray(),
        budgetDb.auditLog.toArray(),
        getBudgetMetadata(),
      ]);

    const currentData = {
      envelopes,
      bills,
      transactions,
      debts,
      paycheckHistory,
      auditLog,
      unassignedCash: metadata?.unassignedCash || 0,
      biweeklyAllocation: metadata?.biweeklyAllocation || 0,
      actualBalance: metadata?.actualBalance || 0,
      isActualBalanceManual: metadata?.isActualBalanceManual || false,
    };

    // Validate backup structure before saving (Issue #1342)
    const validation = validateBackupStructure(currentData);
    if (!validation.isValid) {
      logger.warn("⚠️ Backup data contains invalid items", {
        invalidCounts: validation.invalidCounts,
        warnings: validation.warnings.slice(0, 10), // Limit warnings in log
      });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    localStorage.setItem(`dexie_backup_${timestamp}`, JSON.stringify(currentData));
    logger.info("Current Dexie data backed up successfully", {
      validCounts: validation.validCounts,
      invalidCounts: validation.invalidCounts,
    });
  } catch (backupError) {
    logger.warn("Failed to create backup", backupError as Record<string, unknown>);
  }
};
