import { budgetDb, getBudgetMetadata } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger";
import { validateEnvelopeSafe } from "@/domain/schemas/envelope";
import { validateTransactionSafe } from "@/domain/schemas/transaction";

/**
 * Maximum number of warnings to include in logs to avoid log bloat
 */
const MAX_WARNINGS_IN_LOG = 10;

/**
 * Type for backup data keys that can be validated
 */
type BackupDataKey = "envelopes" | "transactions";

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
 * Type for Zod safe parse result
 */
interface SafeParseResult {
  success: boolean;
}

/**
 * Helper function to validate an array of items with a schema validator
 */
const validateItems = (
  items: unknown[] | undefined,
  validator: (item: unknown) => SafeParseResult,
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
 * Validate backup data structure before saving
 */
export const validateBackupStructure = (data: {
  envelopes?: unknown[];
  transactions?: unknown[];
}): BackupValidationResult => {
  const result: BackupValidationResult = {
    isValid: true,
    validCounts: { envelopes: 0, transactions: 0 },
    invalidCounts: { envelopes: 0, transactions: 0 },
    warnings: [],
  };

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

  const totalInvalid = Object.values(result.invalidCounts).reduce((sum, count) => sum + count, 0);
  result.isValid = totalInvalid === 0;

  return result;
};

/**
 * Create a backup of current data (v2.0 data model)
 */
export const backupCurrentData = async () => {
  try {
    logger.info("Creating backup of current data");
    const [envelopes, transactions, auditLog, metadata] = await Promise.all([
      budgetDb.envelopes.toArray(),
      budgetDb.transactions.toArray(),
      budgetDb.auditLog.toArray(),
      getBudgetMetadata(),
    ]);

    const currentData = {
      envelopes,
      transactions,
      auditLog,
      unassignedCash: metadata?.unassignedCash || 0,
      biweeklyAllocation: metadata?.biweeklyAllocation || 0,
      actualBalance: metadata?.actualBalance || 0,
      isActualBalanceManual: metadata?.isActualBalanceManual || false,
      // Deprecated fields kept for compatibility during v2.0 transition period if needed
      bills: [],
      debts: [],
      paycheckHistory: [],
    };

    const validation = validateBackupStructure(currentData);
    if (!validation.isValid) {
      logger.warn("⚠️ Backup data contains invalid items", {
        invalidCounts: validation.invalidCounts,
        warnings: validation.warnings.slice(0, MAX_WARNINGS_IN_LOG),
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
