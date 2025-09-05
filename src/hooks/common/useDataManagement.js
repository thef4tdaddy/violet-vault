import { useExportData } from "./useExportData";
import { useImportData } from "./useImportData";
import { useResetEncryption } from "./useResetEncryption";

/**
 * Custom hook for data import/export operations
 * Extracts data management logic from Layout component
 */
const useDataManagement = () => {
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
