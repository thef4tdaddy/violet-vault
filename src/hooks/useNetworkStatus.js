import { useEffect } from "react";
import useBudgetStore from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Custom hook for network status management
 * Extracts network status logic from Layout component
 */
const useNetworkStatus = () => {
  // Set up online/offline status detection
  useEffect(() => {
    // Get the action from the store
    const { setOnlineStatus } = useBudgetStore.getState();

    // Handler for when the browser goes online
    const handleOnline = () => {
      logger.info("Network status: Online");
      setOnlineStatus(true);
    };

    // Handler for when the browser goes offline
    const handleOffline = () => {
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
  }, []);
};

export default useNetworkStatus;
