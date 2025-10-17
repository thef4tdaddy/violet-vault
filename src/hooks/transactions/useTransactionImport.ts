import { useTransactionFileUpload } from "./useTransactionFileUpload";
import { useTransactionImportProcessing } from "./useTransactionImportProcessing";
import { globalToast } from "../../stores/ui/toastStore";
import logger from "../../utils/common/logger";

export const useTransactionImport = (currentUser, onBulkImport, budget) => {
  // Use focused sub-hooks
  const {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    handleFileUpload,
    resetImport: resetFileUpload,
  } = useTransactionFileUpload();

  const {
    importProgress,
    setImportProgress,
    autoFundingResults,
    setAutoFundingResults,
    clearExistingData,
    processTransactions,
    generateSuccessMessage,
  } = useTransactionImportProcessing(currentUser);

  const handleImport = async () => {
    if (!fieldMapping.date || !fieldMapping.description || !fieldMapping.amount) {
      globalToast.showError(
        "Please map at least Date, Description, and Amount fields",
        "Mapping Required"
      );
      return;
    }

    // Clear existing data if option is selected
    if (importData.clearExisting) {
      try {
        await clearExistingData();
      } catch {
        globalToast.showError("Failed to clear existing data. Import cancelled.", "Clear Failed", 8000);
        return;
      }
    }

    setImportStep(3);

    // Process transactions
    const processedTransactions = await processTransactions(importData, fieldMapping);

    // Import transactions first
    onBulkImport(processedTransactions);

    // Process auto-funding for income transactions
    const autoFundingPromises = [];
    const incomeTransactions = processedTransactions.filter((t) => t.amount > 0);

    if (incomeTransactions.length > 0 && budget) {
      logger.info("Processing auto-funding for imported income transactions", {
        incomeCount: incomeTransactions.length,
      });

      // TODO: Re-implement auto-funding for income transactions using new modular hooks
    }

    setAutoFundingResults(autoFundingPromises);
    resetImport();

    // Enhanced success message including auto-funding results
    const message = generateSuccessMessage(processedTransactions, importData, autoFundingPromises);
    globalToast.showInfo(message, "Import Update", 5000);
  };

  const resetImport = () => {
    resetFileUpload();
    setImportProgress(0);
    setAutoFundingResults([]);
  };

  return {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    autoFundingResults,
    handleFileUpload,
    handleImport,
    resetImport,
  };
};
