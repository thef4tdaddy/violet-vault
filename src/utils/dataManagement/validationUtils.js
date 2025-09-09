import logger from "../common/logger";

const validateDataStructure = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file: not a valid JSON object.");
  }

  if (!data.envelopes || !Array.isArray(data.envelopes)) {
    throw new Error("Invalid backup file: missing or invalid envelopes data.");
  }
};

const checkBudgetIdMismatch = (importedData, currentUser) => {
  const importBudgetId = importedData.exportMetadata?.budgetId;
  const currentBudgetId = currentUser?.budgetId;
  return (
    importBudgetId && currentBudgetId && importBudgetId !== currentBudgetId
  );
};

const unifyTransactions = (importedData) => {
  return Array.isArray(importedData.allTransactions)
    ? importedData.allTransactions
    : [...(importedData.transactions || []), ...(importedData.bills || [])];
};

export const validateImportedData = (importedData, currentUser) => {
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
