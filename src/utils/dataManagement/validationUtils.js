import logger from "../common/logger";

export const validateImportedData = (importedData, currentUser) => {
  logger.info("Validating imported data");

  if (!importedData || typeof importedData !== "object") {
    throw new Error("Invalid backup file: not a valid JSON object.");
  }

  if (!importedData.envelopes || !Array.isArray(importedData.envelopes)) {
    throw new Error("Invalid backup file: missing or invalid envelopes data.");
  }

  const importBudgetId = importedData.exportMetadata?.budgetId;
  const currentBudgetId = currentUser?.budgetId;
  const hasBudgetIdMismatch =
    importBudgetId && currentBudgetId && importBudgetId !== currentBudgetId;

  const unifiedAllTransactions = Array.isArray(importedData.allTransactions)
    ? importedData.allTransactions
    : [...(importedData.transactions || []), ...(importedData.bills || [])];

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
    importBudgetId,
  };
};