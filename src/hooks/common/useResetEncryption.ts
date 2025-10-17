import { useCallback } from "react";
import logger from "../../utils/common/logger";
import { authStorageService } from "../../services/authStorageService";
import { budgetStorageService } from "../../services/budgetStorageService";

/**
 * Reset encryption hook return type
 */
interface UseResetEncryptionReturn {
  resetEncryptionAndStartFresh: () => void;
}

export const useResetEncryption = (): UseResetEncryptionReturn => {
  const resetEncryptionAndStartFresh = useCallback((): void => {
    logger.info("Resetting encryption and starting fresh");

    // Clear auth-related data
    authStorageService.clearAll();

    // Clear backup keys
    budgetStorageService.getAllKeys().forEach((key) => {
      if (key.startsWith("envelopeBudgetData_backup_")) {
        budgetStorageService.removeItem(key);
      }
    });

    logger.info("All data cleared, ready for fresh start");

    window.location.reload();
  }, []);

  return { resetEncryptionAndStartFresh };
};
