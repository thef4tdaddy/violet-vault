import logger from "@/utils/common/logger";

/**
 * Envelope with optional envelopeType for import validation
 */
interface EnvelopeWithType {
  id?: string;
  name?: string;
  envelopeType?: string;
  [key: string]: unknown;
}

/**
 * Import data structure - updated for envelope-based model
 */
interface ImportedData {
  envelopes?: EnvelopeWithType[];
  exportMetadata?: { budgetId?: string; modelVersion?: string };
  allTransactions?: unknown[];
  transactions?: unknown[];
  bills?: unknown[];
  savingsGoals?: unknown[];
  supplementalAccounts?: unknown[];
  debts?: unknown[];
  auditLog?: unknown[];
  paycheckHistory?: unknown[];
}

interface CurrentUser {
  budgetId?: string;
}

const validateDataStructure = (data: unknown): void => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file: not a valid JSON object.");
  }

  const typedData = data as ImportedData;
  if (!typedData.envelopes || !Array.isArray(typedData.envelopes)) {
    throw new Error("Invalid backup file: missing or invalid envelopes data.");
  }
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

export const validateImportedData = (
  importedData: ImportedData,
  currentUser: CurrentUser | null | undefined
): {
  validatedData: ImportedData & { allTransactions: unknown[] };
  hasBudgetIdMismatch: boolean;
  importBudgetId: string | undefined;
} => {
  logger.info("Validating imported data");
  validateDataStructure(importedData);

  const hasBudgetIdMismatch = checkBudgetIdMismatch(importedData, currentUser);
  const unifiedAllTransactions = unifyTransactions(importedData);

  logger.info("Data validation successful", {
    envelopes: safeLength(importedData.envelopes),
    envelopesByType: countEnvelopesByType(importedData.envelopes || []),
    bills: safeLength(importedData.bills),
    savingsGoals: safeLength(importedData.savingsGoals),
    supplementalAccounts: safeLength(importedData.supplementalAccounts),
    debts: safeLength(importedData.debts),
    allTransactions: safeLength(unifiedAllTransactions),
    hasBudgetIdMismatch,
  });

  return {
    validatedData: {
      ...importedData,
      allTransactions: unifiedAllTransactions,
    },
    hasBudgetIdMismatch,
    importBudgetId: importedData.exportMetadata?.budgetId,
  };
};
