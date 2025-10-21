import { useExportData } from "./useExportData";
import { useImportData } from "./useImportData";
import { useResetEncryption } from "./useResetEncryption";

/**
 * Data management hook return type
 */
interface UseDataManagementReturn {
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  resetEncryptionAndStartFresh: () => Promise<void>;
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
