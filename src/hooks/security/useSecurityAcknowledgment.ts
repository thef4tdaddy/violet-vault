import { useState, useEffect } from "react";

/**
 * Hook for managing security warning acknowledgment
 * Wraps localStorage to comply with architecture patterns
 */
export const useSecurityAcknowledgment = () => {
  const [hasBeenAcknowledged, setHasBeenAcknowledged] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged this warning
    try {
      const acknowledged = localStorage.getItem("localDataSecurityAcknowledged");
      if (acknowledged) {
        setHasBeenAcknowledged(true);
      }
    } catch (error) {
      console.error("Failed to check security acknowledgment:", error);
    }
  }, []);

  const acknowledgeSecurityWarning = () => {
    try {
      localStorage.setItem("localDataSecurityAcknowledged", "true");
      localStorage.setItem("localDataSecurityAcknowledgedAt", Date.now().toString());
      setHasBeenAcknowledged(true);
    } catch (error) {
      console.error("Failed to save security acknowledgment:", error);
    }
  };

  return { hasBeenAcknowledged, acknowledgeSecurityWarning };
};
