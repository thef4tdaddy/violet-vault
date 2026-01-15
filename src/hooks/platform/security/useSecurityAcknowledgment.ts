import { useState } from "react";
import localStorageService from "@/services/storage/localStorageService";
import logger from "@/utils/core/common/logger";

const ACKNOWLEDGMENT_KEY = "localDataSecurityAcknowledged";
const ACKNOWLEDGMENT_TIME_KEY = "localDataSecurityAcknowledgedAt";

/**
 * Hook for managing security warning acknowledgment state
 */
export const useSecurityAcknowledgment = () => {
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(() => {
    return !!localStorageService.getItem(ACKNOWLEDGMENT_KEY);
  });

  const acknowledge = () => {
    localStorageService.setItem(ACKNOWLEDGMENT_KEY, "true");
    localStorageService.setItem(ACKNOWLEDGMENT_TIME_KEY, Date.now().toString());
    setHasBeenAcknowledged(true);
    logger.info("🔒 User acknowledged local data security warning");
  };

  return { hasBeenAcknowledged, acknowledge };
};
