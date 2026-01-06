/**
 * Service Availability Manager
 * Centralized tracking of backend service availability for progressive enhancement
 *
 * @module services/serviceAvailabilityManager
 */

import logger from "@/utils/common/logger";
import { ApiClient } from "@/services/api/client";
import { BudgetEngineService } from "@/services/api/budgetEngineService";
import { ImportService } from "@/services/api/importService";

export type ServiceName = "api" | "budgetEngine" | "import";

export interface ServiceStatus {
  available: boolean;
  lastChecked: number;
  error?: string;
}

export interface AllServicesStatus {
  api: ServiceStatus;
  budgetEngine: ServiceStatus;
  import: ServiceStatus;
}

/**
 * ServiceAvailabilityManager - Tracks backend service availability
 * Provides centralized status checks and caching for all API services
 */
export class ServiceAvailabilityManager {
  private static instance: ServiceAvailabilityManager;
  private statusCache: Map<ServiceName, ServiceStatus> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private healthCheckInProgress: Map<ServiceName, Promise<boolean>> = new Map();

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceAvailabilityManager {
    if (!ServiceAvailabilityManager.instance) {
      ServiceAvailabilityManager.instance = new ServiceAvailabilityManager();
    }
    return ServiceAvailabilityManager.instance;
  }

  /**
   * Check if a specific service is available
   *
   * @param service - Service name to check
   * @param forceRefresh - Force a fresh check, bypassing cache
   * @returns Promise resolving to service availability status
   */
  async checkService(service: ServiceName, forceRefresh = false): Promise<boolean> {
    // Return cached status if recent and not forcing refresh
    if (!forceRefresh) {
      const cached = this.getCachedStatus(service);
      if (cached !== null) {
        return cached.available;
      }
    }

    // If a health check is already in progress, return the same promise
    const inProgress = this.healthCheckInProgress.get(service);
    if (inProgress) {
      return inProgress;
    }

    // Start new health check
    const checkPromise = this.performHealthCheck(service);
    this.healthCheckInProgress.set(service, checkPromise);

    try {
      const available = await checkPromise;
      return available;
    } catch (error) {
      // Clean up failed promise from map
      logger.warn(`Health check failed for ${service}`, { error });
      return false;
    } finally {
      this.healthCheckInProgress.delete(service);
    }
  }

  /**
   * Check all services
   *
   * @param forceRefresh - Force fresh checks for all services
   * @returns Promise resolving to status of all services
   */
  async checkAllServices(forceRefresh = false): Promise<AllServicesStatus> {
    const [api, budgetEngine, importService] = await Promise.all([
      this.checkService("api", forceRefresh),
      this.checkService("budgetEngine", forceRefresh),
      this.checkService("import", forceRefresh),
    ]);

    return {
      api: this.getStatus("api") || this.createStatus(api),
      budgetEngine: this.getStatus("budgetEngine") || this.createStatus(budgetEngine),
      import: this.getStatus("import") || this.createStatus(importService),
    };
  }

  /**
   * Get current status for a service (from cache)
   *
   * @param service - Service name
   * @returns Current service status or null if not cached
   */
  getStatus(service: ServiceName): ServiceStatus | null {
    return this.getCachedStatus(service);
  }

  /**
   * Get status for all services (from cache)
   *
   * @returns Status of all services
   */
  getAllStatus(): AllServicesStatus {
    return {
      api: this.getStatus("api") || this.createStatus(false, "Not checked"),
      budgetEngine: this.getStatus("budgetEngine") || this.createStatus(false, "Not checked"),
      import: this.getStatus("import") || this.createStatus(false, "Not checked"),
    };
  }

  /**
   * Clear cache for a specific service
   *
   * @param service - Service name to clear cache for
   */
  clearCache(service?: ServiceName): void {
    if (service) {
      this.statusCache.delete(service);
    } else {
      this.statusCache.clear();
    }
  }

  /**
   * Check if device is online
   *
   * @returns Boolean indicating online status
   */
  isDeviceOnline(): boolean {
    return ApiClient.isOnline();
  }

  /**
   * Perform health check for a specific service
   */
  private async performHealthCheck(service: ServiceName): Promise<boolean> {
    try {
      // First check if device is online
      if (!this.isDeviceOnline()) {
        this.updateCache(service, false, "Device offline");
        return false;
      }

      let available = false;

      switch (service) {
        case "api":
          available = await ApiClient.healthCheck();
          break;

        case "budgetEngine":
          available = await BudgetEngineService.isAvailable();
          break;

        case "import":
          available = await ImportService.isAvailable();
          break;

        default:
          logger.warn("Unknown service type", { service });
          available = false;
      }

      this.updateCache(service, available);
      return available;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Health check failed";
      logger.warn(`Service ${service} health check failed`, { error: errorMessage });
      this.updateCache(service, false, errorMessage);
      return false;
    }
  }

  /**
   * Get cached status if still valid
   */
  private getCachedStatus(service: ServiceName): ServiceStatus | null {
    const cached = this.statusCache.get(service);
    if (!cached) return null;

    const age = Date.now() - cached.lastChecked;
    if (age > this.CACHE_DURATION) {
      return null; // Cache expired
    }

    return cached;
  }

  /**
   * Update cache with new status
   */
  private updateCache(service: ServiceName, available: boolean, error?: string): void {
    this.statusCache.set(service, {
      available,
      lastChecked: Date.now(),
      error,
    });

    logger.info(`Service ${service} status updated`, { available, error });
  }

  /**
   * Create a new status object
   */
  private createStatus(available: boolean, error?: string): ServiceStatus {
    return {
      available,
      lastChecked: Date.now(),
      error,
    };
  }

  /**
   * Subscribe to network status changes
   * Automatically refresh service status when network changes
   */
  subscribeToNetworkChanges(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      logger.info("Network online - refreshing service status");
      this.clearCache();
      this.checkAllServices(true);
    });

    window.addEventListener("offline", () => {
      logger.info("Network offline - marking all services unavailable");
      this.statusCache.forEach((_status, service) => {
        this.updateCache(service, false, "Device offline");
      });
    });
  }
}

// Export singleton instance
export const serviceAvailability = ServiceAvailabilityManager.getInstance();

// Auto-subscribe to network changes
if (typeof window !== "undefined") {
  serviceAvailability.subscribeToNetworkChanges();
}

export default serviceAvailability;
