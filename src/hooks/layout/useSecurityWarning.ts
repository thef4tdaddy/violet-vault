/**
 * useSecurityWarning - Manages security warning modal display
 * Shows warning after delay when user has acknowledged it
 */

import { useState, useEffect } from "react";

interface UseSecurityWarningProps {
  isUnlocked: boolean;
  currentUser: unknown;
  isOnboarded: boolean;
  hasAcknowledged: boolean;
}

interface UseSecurityWarningReturn {
  showSecurityWarning: boolean;
  setShowSecurityWarning: (show: boolean) => void;
}

export const useSecurityWarning = ({
  isUnlocked,
  currentUser,
  isOnboarded,
  hasAcknowledged,
}: UseSecurityWarningProps): UseSecurityWarningReturn => {
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  useEffect(() => {
    if (isUnlocked && currentUser && isOnboarded && !hasAcknowledged) {
      const timer = setTimeout(() => {
        setShowSecurityWarning(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, currentUser, isOnboarded, hasAcknowledged]);

  return {
    showSecurityWarning,
    setShowSecurityWarning,
  };
};
