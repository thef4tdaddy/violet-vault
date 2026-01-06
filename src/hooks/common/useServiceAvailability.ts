import { useState, useEffect, useCallback } from "react";
import {
  serviceAvailability,
  type ServiceName,
  type ServiceStatus,
  type AllServicesStatus,
} from "@/services/serviceAvailabilityManager";
import logger from "@/utils/common/logger";

/**
 * Hook for monitoring service availability
 * Provides real-time service status and refresh capabilities
 *
 * @param serviceName - Optional specific service to monitor
 * @param autoRefresh - Enable automatic periodic refresh (default: true)
 * @param refreshInterval - Refresh interval in ms (default: 60000ms = 1 minute)
 * @returns Service status and control functions
 */
export function useServiceAvailability(
  serviceName?: ServiceName,
  autoRefresh = true,
  refreshInterval = 60000
) {
  const [status, setStatus] = useState<ServiceStatus | AllServicesStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Check service availability
   */
  const checkAvailability = useCallback(
    async (forceRefresh = false) => {
      setIsChecking(true);
      setLastError(null);

      try {
        if (serviceName) {
          // Check specific service
          const available = await serviceAvailability.checkService(serviceName, forceRefresh);
          const serviceStatus = serviceAvailability.getStatus(serviceName);
          setStatus(serviceStatus);
        } else {
          // Check all services
          const allStatus = await serviceAvailability.checkAllServices(forceRefresh);
          setStatus(allStatus);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check service";
        setLastError(errorMessage);
        logger.error("Service availability check failed", error);
      } finally {
        setIsChecking(false);
      }
    },
    [serviceName]
  );

  /**
   * Force refresh service status
   */
  const refresh = useCallback(() => {
    return checkAvailability(true);
  }, [checkAvailability]);

  /**
   * Check if device is online
   */
  const isOnline = useCallback(() => {
    return serviceAvailability.isDeviceOnline();
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkAvailability(false);
  }, [checkAvailability]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      checkAvailability(false);
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, checkAvailability]);

  // Listen for network status changes
  useEffect(() => {
    const handleOnline = () => {
      logger.info("Network online - refreshing service availability");
      checkAvailability(true);
    };

    const handleOffline = () => {
      logger.info("Network offline - service availability will be unavailable");
      // Update status to reflect offline state
      if (serviceName) {
        setStatus({
          available: false,
          lastChecked: Date.now(),
          error: "Device offline",
        });
      } else {
        setStatus({
          api: { available: false, lastChecked: Date.now(), error: "Device offline" },
          budgetEngine: { available: false, lastChecked: Date.now(), error: "Device offline" },
          import: { available: false, lastChecked: Date.now(), error: "Device offline" },
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [serviceName, checkAvailability]);

  return {
    status,
    isChecking,
    lastError,
    refresh,
    isOnline,
  };
}

export default useServiceAvailability;
