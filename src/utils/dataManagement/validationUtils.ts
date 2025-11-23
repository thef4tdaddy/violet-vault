import logger from "../common/logger";

interface ImportedData {
  envelopes?: unknown[];
  exportMetadata?: { budgetId?: string };
  allTransactions?: unknown[];
  transactions?: unknown[];
  bills?: unknown[];
  savingsGoals?: unknown[];
  debts?: unknown[];
  auditLog?: unknown[];
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
  return !!(importBudgetId && currentBudgetId && importBudgetId !== currentBudgetId);
};

const unifyTransactions = (importedData: ImportedData): unknown[] => {
  return Array.isArray(importedData.allTransactions)
    ? importedData.allTransactions
    : [...(importedData.transactions || []), ...(importedData.bills || [])];
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
    envelopes: importedData.envelopes?.length || 0,
    bills: importedData.bills?.length || 0,
    savingsGoals: importedData.savingsGoals?.length || 0,
    debts: importedData.debts?.length || 0,
    auditLog: importedData.auditLog?.length || 0,
    allTransactions: unifiedAllTransactions?.length || 0,
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
