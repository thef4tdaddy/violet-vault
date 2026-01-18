import logger from "@/utils/core/common/logger";
import {
  ImportedDataSchema,
  validateImportedDataStructureSafe,
  validateEnvelopes,
  validateTransactions,
  formatValidationErrors,
  type ImportedData,
  type ItemValidationResult,
} from "@/domain/schemas/import-export";

interface CurrentUser {
  budgetId?: string;
}

/**
 * Validated import data type with unified transactions
 */
export type ValidatedImportData = ImportedData & {
  allTransactions: Record<string, unknown>[];
};

export interface ValidationResult {
  validatedData: ValidatedImportData;
  hasBudgetIdMismatch: boolean;
  importBudgetId: string | undefined;
  validationWarnings: string[];
  itemValidation: {
    envelopes: ItemValidationResult<unknown>;
    transactions: ItemValidationResult<unknown>;
  };
}

const validateDataStructure = (data: unknown): ImportedData => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file: not a valid JSON object.");
  }
  const result = validateImportedDataStructureSafe(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    const path = firstError.path.join(".");
    // Specific error message for required envelopes
    if (path === "envelopes") {
      throw new Error("Invalid backup file: missing or invalid envelopes data.");
    }
    throw new Error(`Invalid backup file: ${path ? `${path}: ` : ""}${firstError.message}`);
  }
  return result.data;
};

const checkBudgetIdMismatch = (
  importedData: ImportedData,
  currentUser: CurrentUser | null | undefined
): boolean => {
  const importBudgetId = importedData.exportMetadata?.budgetId;
  const currentBudgetId = currentUser?.budgetId;
  return Boolean(importBudgetId && currentBudgetId && importBudgetId !== currentBudgetId);
};

const unifyTransactions = (importedData: ImportedData): Record<string, unknown>[] => {
  const record = importedData as unknown as Record<string, unknown>;
  if (Array.isArray(record.allTransactions)) {
    return record.allTransactions as Record<string, unknown>[];
  }
  const transactions = importedData.transactions || [];
  const bills = (record.bills as unknown[]) || [];
  return [...transactions, ...bills] as Record<string, unknown>[];
};

export const validateImportedData = (
  importedData: unknown,
  currentUser: CurrentUser | null | undefined
): ValidationResult => {
  logger.info("Validating imported data");

  const validatedStructure = validateDataStructure(importedData);
  const hasBudgetIdMismatch = checkBudgetIdMismatch(validatedStructure, currentUser);

  const transactions = unifyTransactions(validatedStructure);
  const validatedData: ValidatedImportData = {
    ...validatedStructure,
    allTransactions: transactions,
  };

  const itemValidationEnvelopes = validateEnvelopes(validatedData.envelopes || []);
  const itemValidationTransactions = validateTransactions(validatedData.allTransactions || []);

  const validationWarnings = formatValidationErrors(
    itemValidationEnvelopes.invalid,
    itemValidationTransactions.invalid
  );

  return {
    validatedData,
    hasBudgetIdMismatch,
    importBudgetId: validatedStructure.exportMetadata?.budgetId,
    validationWarnings,
    itemValidation: {
      envelopes: itemValidationEnvelopes,
      transactions: itemValidationTransactions,
    },
  };
};

export type { ImportedData, ItemValidationResult };
export { ImportedDataSchema, formatValidationErrors };
