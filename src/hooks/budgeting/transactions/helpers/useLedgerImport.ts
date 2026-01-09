import logger from "@/utils/common/logger";
import { useTransactionImport } from "../useTransactionImport";

interface UseLedgerImportProps {
  currentUser: unknown;
  transactions: unknown[];
  setAllTransactions?: (transactions: unknown[]) => void;
}

export const useLedgerImport = ({
  currentUser,
  transactions,
  setAllTransactions,
}: UseLedgerImportProps) => {
  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions: unknown[]): void => {
    logger.debug("🔄 Bulk import called with transactions:", { count: newTransactions.length });
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions?.(updatedAllTransactions);
    logger.debug("💾 Bulk import complete. Total transactions:", {
      count: updatedAllTransactions.length,
    });
  };

  const {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    handleFileUpload,
    handleImport: originalHandleImport,
    resetImport,
  } = useTransactionImport(currentUser, handleBulkImport);

  return {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    handleFileUpload,
    handleImport: originalHandleImport,
    resetImport,
  };
};
