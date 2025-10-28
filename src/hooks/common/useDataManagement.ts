import { useExportData } from "./useExportData";
import { useImportData } from "./useImportData";
import { useResetEncryption } from "./useResetEncryption";

/**
 * Data management hook return type
 */
interface UseDataManagementReturn {
  exportData: () => Promise<void>;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => Promise<
    | {
        success: boolean;
        imported: {
          envelopes: number;
          bills: number;
          transactions: number;
          savingsGoals: number;
          debts: number;
          paycheckHistory: number;
          auditLog: number;
        };
      }
    | undefined
  >;
  resetEncryptionAndStartFresh: () => void;
}

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = (): UseDataManagementReturn => {
  const { exportData } = useExportData();
  const { importData } = useImportData();
  const { resetEncryptionAndStartFresh } = useResetEncryption();

  return {
    exportData,
    importData,
    resetEncryptionAndStartFresh,
  };
};

export default useDataManagement;
