import { useState, useEffect, useCallback, useRef } from "react";
import {
  serviceAvailability,
  type ServiceName,
  type ServiceStatus,
  type AllServicesStatus,
} from "@/services/serviceAvailabilityManager";
import logger from "@/utils/core/common/logger";

/**
 * Hook for monitoring service availability
 * Provides real-time service status and refresh capabilities
 *
 * @param serviceName - Optional specific service to monitor
 * @param autoRefresh - Enable automatic periodic refresh (default: true)
 * @param refreshInterval - Base refresh interval in ms (default: 60000ms = 1 minute)
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
  const [failureCount, setFailureCount] = useState(0);
  const checkAvailabilityRef = useRef<((forceRefresh: boolean) => Promise<void>) | null>(null);

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

          // Track failures for exponential backoff
          if (!available) {
            setFailureCount((prev) => prev + 1);
          } else {
            setFailureCount(0);
          }
        } else {
          // Check all services
          const allStatus = await serviceAvailability.checkAllServices(forceRefresh);
          setStatus(allStatus);

          // Track failures if all services are down
          const allDown =
            !allStatus.api.available &&
            !allStatus.budgetEngine.available &&
            !allStatus.import.available;
          if (allDown) {
            setFailureCount((prev) => prev + 1);
          } else {
            setFailureCount(0);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to check service";
        setLastError(errorMessage);
        setFailureCount((prev) => prev + 1);
        logger.error("Service availability check failed", error);
      } finally {
        setIsChecking(false);
      }
    },
    [serviceName]
  );

  // Store the latest checkAvailability in ref to avoid stale closures
  useEffect(() => {
    checkAvailabilityRef.current = checkAvailability;
  }, [checkAvailability]);

  /**
   * Force refresh service status
   */
  const refresh = useCallback(() => {
    setFailureCount(0); // Reset failure count on manual refresh
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

  // Auto-refresh interval with exponential backoff
  useEffect(() => {
    if (!autoRefresh) return;

    // Calculate backoff interval: base * (2 ^ failureCount), capped at 10 minutes
    const backoffMultiplier = Math.min(Math.pow(2, failureCount), 10);
    const currentInterval = refreshInterval * backoffMultiplier;

    const intervalId = setInterval(() => {
      checkAvailabilityRef.current?.(false);
    }, currentInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, failureCount]);

  // Listen for network status changes
  useEffect(() => {
    const handleOnline = () => {
      logger.info("Network online - refreshing service availability");
      setFailureCount(0); // Reset failure count when coming online
      checkAvailabilityRef.current?.(true);
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
  }, [serviceName]); // Only depend on serviceName, not checkAvailability

  return {
    status,
    isChecking,
    lastError,
    refresh,
    isOnline,
  };
}

export default useServiceAvailability;
