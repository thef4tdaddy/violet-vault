import { useEffect } from "react";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import logger from "@/utils/core/common/logger";

/**
 * Custom hook for network status management
 * Extracts network status logic from Layout component
 */
const useNetworkStatus = (): void => {
  // Get the store action using proper subscription (prevents React error #185)
  const setOnlineStatus = useBudgetStore((state: UiStore) => state.setOnlineStatus);

  // Set up online/offline status detection
  useEffect(() => {
    // Handler for when the browser goes online
    const handleOnline = (): void => {
      logger.info("Network status: Online");
      setOnlineStatus(true);
    };

    // Handler for when the browser goes offline
    const handleOffline = (): void => {
      logger.info("Network status: Offline");
      setOnlineStatus(false);
    };

    // Add the event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set the initial status when the component mounts
    setOnlineStatus(navigator.onLine);

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]); // setOnlineStatus is stable in Zustand
};

export default useNetworkStatus;
