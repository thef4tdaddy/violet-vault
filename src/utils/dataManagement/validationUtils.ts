import logger from "@/utils/common/logger";
import {
  ImportedDataSchema,
  validateImportedDataStructureSafe,
  validateEnvelopes,
  validateTransactions,
  validateBills,
  validateDebts,
  formatValidationErrors,
  type ImportedData,
  type ItemValidationResult,
} from "@/domain/schemas/import-export";

/**
 * Envelope with optional envelopeType for import validation
 */
interface EnvelopeWithType {
  id?: string;
  name?: string;
  envelopeType?: string;
  [key: string]: unknown;
}

interface CurrentUser {
  budgetId?: string;
}

/**
 * Validation result containing validated data and any validation issues
 */
export interface ValidationResult {
  validatedData: (ImportedData & { allTransactions: unknown[] }) | Record<string, unknown>;
  hasBudgetIdMismatch: boolean;
  importBudgetId: string | undefined;
  validationWarnings: string[];
  itemValidation: {
    envelopes: ItemValidationResult<unknown>;
    transactions: ItemValidationResult<unknown>;
    bills: ItemValidationResult<unknown>;
    debts: ItemValidationResult<unknown>;
  };
}

/**
 * Validate data structure using Zod schema
 * @throws Error if the structure is invalid
 */
const validateDataStructure = (data: unknown): ImportedData => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file: not a valid JSON object.");
  }

  const result = validateImportedDataStructureSafe(data);

  if (!result.success) {
    // Extract the first meaningful error message
    const firstError = result.error.issues[0];
    const path = firstError.path.join(".");
    const message = firstError.message;

    // Check for specific common errors
    if (path === "envelopes" || path.startsWith("envelopes")) {
      throw new Error("Invalid backup file: missing or invalid envelopes data.");
    }

    throw new Error(`Invalid backup file: ${path ? `${path}: ` : ""}${message}`);
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

const unifyTransactions = (importedData: ImportedData): unknown[] => {
  if (Array.isArray(importedData.allTransactions)) {
    return importedData.allTransactions;
  }
  const transactions = importedData.transactions || [];
  const bills = importedData.bills || [];
  return [...transactions, ...bills];
};

/**
 * Count array length safely
 */
const safeLength = (arr: unknown[] | undefined): number => arr?.length || 0;

/**
 * Count envelopes by type for logging
 */
const countEnvelopesByType = (envelopes: EnvelopeWithType[]): Record<string, number> => {
  const counts: Record<string, number> = {
    regular: 0,
    savings: 0,
    supplemental: 0,
    bill: 0,
    variable: 0,
    other: 0,
  };

  for (const envelope of envelopes) {
    const type = envelope.envelopeType || "regular";
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
};

/**
 * Validate individual items and collect warnings
 * Returns validation results for each item type
 */
const validateIndividualItems = (
  importedData: ImportedData
): {
  envelopes: ItemValidationResult<unknown>;
  transactions: ItemValidationResult<unknown>;
  bills: ItemValidationResult<unknown>;
  debts: ItemValidationResult<unknown>;
} => {
  const envelopeResult = validateEnvelopes(importedData.envelopes || []);
  const transactionResult = validateTransactions(
    importedData.allTransactions || importedData.transactions || []
  );
  const billResult = validateBills(importedData.bills || []);
  const debtResult = validateDebts(importedData.debts || []);

  return {
    envelopes: envelopeResult,
    transactions: transactionResult,
    bills: billResult,
    debts: debtResult,
  };
};

/**
 * Validate imported data with comprehensive Zod schema validation
 * - Validates overall structure with ImportedDataSchema
 * - Validates individual items (envelopes, transactions, bills, debts)
 * - Provides detailed validation warnings for invalid items
 */
export const validateImportedData = (
  importedData: unknown,
  currentUser: CurrentUser | null | undefined
): ValidationResult => {
  logger.info("Validating imported data");

  // Step 1: Validate structure with Zod schema
  const validatedStructure = validateDataStructure(importedData);

  // Step 2: Check budget ID mismatch
  const hasBudgetIdMismatch = checkBudgetIdMismatch(validatedStructure, currentUser);

  // Step 3: Unify transactions
  const unifiedAllTransactions = unifyTransactions(validatedStructure);

  // Step 4: Validate individual items
  const dataForItemValidation = {
    ...validatedStructure,
    allTransactions: unifiedAllTransactions,
  };
  const itemValidation = validateIndividualItems(dataForItemValidation as ImportedData);

  // Step 5: Generate validation warnings for invalid items
  const validationWarnings = formatValidationErrors(
    itemValidation.envelopes.invalid,
    itemValidation.transactions.invalid,
    itemValidation.bills.invalid,
    itemValidation.debts.invalid
  );

  // Log validation results
  const envelopes = (validatedStructure.envelopes || []) as EnvelopeWithType[];
  logger.info("Data validation successful", {
    envelopes: safeLength(validatedStructure.envelopes),
    envelopesByType: countEnvelopesByType(envelopes),
    bills: safeLength(validatedStructure.bills),
    savingsGoals: safeLength(validatedStructure.savingsGoals),
    supplementalAccounts: safeLength(validatedStructure.supplementalAccounts),
    debts: safeLength(validatedStructure.debts),
    allTransactions: safeLength(unifiedAllTransactions),
    hasBudgetIdMismatch,
    validationWarnings: validationWarnings.length,
  });

  if (validationWarnings.length > 0) {
    logger.warn("Some items have validation warnings", {
      invalidEnvelopes: itemValidation.envelopes.invalid.length,
      invalidTransactions: itemValidation.transactions.invalid.length,
      invalidBills: itemValidation.bills.invalid.length,
      invalidDebts: itemValidation.debts.invalid.length,
    });
  }

  return {
    validatedData: {
      ...validatedStructure,
      allTransactions: unifiedAllTransactions,
    } as ImportedData & { allTransactions: unknown[] },
    hasBudgetIdMismatch,
    importBudgetId: validatedStructure.exportMetadata?.budgetId,
    validationWarnings,
    itemValidation,
  };
};

// Re-export types and functions for use in other modules
export type { ImportedData, ItemValidationResult };
export { ImportedDataSchema, formatValidationErrors };
