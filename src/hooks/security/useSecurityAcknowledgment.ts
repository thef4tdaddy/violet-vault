import { useState, useEffect } from "react";
import localStorageService from "@/services/storage/localStorageService";
import logger from "../../utils/common/logger";

const ACKNOWLEDGMENT_KEY = "localDataSecurityAcknowledged";
const ACKNOWLEDGMENT_TIME_KEY = "localDataSecurityAcknowledgedAt";

/**
 * Hook for managing security warning acknowledgment state
 */
export const useSecurityAcknowledgment = () => {
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(false);

  useEffect(() => {
    const acknowledged = localStorageService.getItem(ACKNOWLEDGMENT_KEY);
    if (acknowledged) {
      setHasBeenAcknowledged(true);
    }
  }, []);

  const acknowledge = () => {
    localStorageService.setItem(ACKNOWLEDGMENT_KEY, "true");
    localStorageService.setItem(ACKNOWLEDGMENT_TIME_KEY, Date.now().toString());
    setHasBeenAcknowledged(true);
    logger.info("🔒 User acknowledged local data security warning");
  };

  return { hasBeenAcknowledged, acknowledge };
};
