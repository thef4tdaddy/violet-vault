import { useCallback } from "react";
import logger from "@/utils/common/logger";
import localStorageService from "@/services/storage/localStorageService";

/**
 * Reset encryption hook return type
 */
interface UseResetEncryptionReturn {
  resetEncryptionAndStartFresh: () => void;
}

export const useResetEncryption = (): UseResetEncryptionReturn => {
  const resetEncryptionAndStartFresh = useCallback((): void => {
    logger.info("Resetting encryption and starting fresh");

    const keysToRemove = ["envelopeBudgetData", "userProfile", "passwordLastChanged"];

    keysToRemove.forEach((key) => {
      localStorageService.removeItem(key);
    });

    // Remove backup keys
    localStorageService.removeByPrefix("envelopeBudgetData_backup_");

    logger.info("All data cleared, ready for fresh start");

    window.location.reload();
  }, []);

  return { resetEncryptionAndStartFresh };
};
