/**
 * useCorruptionDetection - Manages corruption detection modal and window event listener
 */

import { useState, useEffect } from "react";
import logger from "@/utils/common/logger";

interface UseCorruptionDetectionReturn {
  showCorruptionModal: boolean;
  setShowCorruptionModal: (show: boolean) => void;
}

export const useCorruptionDetection = (): UseCorruptionDetectionReturn => {
  const [showCorruptionModal, setShowCorruptionModal] = useState(false);

  useEffect(() => {
    const handleCorruptionDetected = (event: Event): void => {
      const customEvent = event as CustomEvent;
      logger.warn("🚨 Corruption modal triggered by sync service", customEvent.detail);
      setShowCorruptionModal(true);
    };

    window.addEventListener("syncCorruptionDetected", handleCorruptionDetected);
    return () => {
      window.removeEventListener("syncCorruptionDetected", handleCorruptionDetected);
    };
  }, []);

  return {
    showCorruptionModal,
    setShowCorruptionModal,
  };
};
