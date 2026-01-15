/**
 * useLayoutLifecycle - Unified hook for layout-level lifecycle events
 * Consolidates corruption detection and security warning timers
 */

import { useState, useEffect } from "react";
import logger from "@/utils/core/common/logger";

interface UseLayoutLifecycleProps {
  isUnlocked: boolean;
  currentUser: unknown;
  isOnboarded: boolean;
  hasAcknowledgedSecurity?: boolean;
}

interface UseLayoutLifecycleReturn {
  showCorruptionModal: boolean;
  setShowCorruptionModal: (show: boolean) => void;
  showSecurityWarning: boolean;
  setShowSecurityWarning: (show: boolean) => void;
}

export const useLayoutLifecycle = ({
  isUnlocked,
  currentUser,
  isOnboarded,
  hasAcknowledgedSecurity = false,
}: UseLayoutLifecycleProps): UseLayoutLifecycleReturn => {
  // Corruption Detection State
  const [showCorruptionModal, setShowCorruptionModal] = useState(false);

  // Security Warning State
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Handle Corruption Events
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

  // Handle Security Warning Timer
  useEffect(() => {
    if (isUnlocked && currentUser && isOnboarded && !hasAcknowledgedSecurity) {
      const timer = setTimeout(() => {
        setShowSecurityWarning(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, currentUser, isOnboarded, hasAcknowledgedSecurity]);

  return {
    showCorruptionModal,
    setShowCorruptionModal,
    showSecurityWarning,
    setShowSecurityWarning,
  };
};

export default useLayoutLifecycle;
