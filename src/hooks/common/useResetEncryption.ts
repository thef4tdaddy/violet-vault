import { useCallback } from "react";
import logger from "../../utils/common/logger";

export const useResetEncryption = () => {
  const resetEncryptionAndStartFresh = useCallback(() => {
    logger.info("Resetting encryption and starting fresh");

    const keysToRemove = ["envelopeBudgetData", "userProfile", "passwordLastChanged"];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("envelopeBudgetData_backup_")) {
        localStorage.removeItem(key);
      }
    });

    logger.info("All data cleared, ready for fresh start");

    window.location.reload();
  }, []);

  return { resetEncryptionAndStartFresh };
};
