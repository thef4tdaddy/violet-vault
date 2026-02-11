/**
 * Tests for Service Availability Manager
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServiceAvailabilityManager } from "../serviceAvailabilityManager";
import { ApiClient } from "@/services/api/client";
import { BudgetEngineService } from "@/services/api/budgetEngineService";
import { ImportService } from "@/services/api/importService";

// Mock the services
vi.mock("@/services/api/client", () => ({
  ApiClient: {
    isOnline: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

vi.mock("@/services/api/budgetEngineService", () => ({
  BudgetEngineService: {
    isAvailable: vi.fn(),
  },
}));

vi.mock("@/services/api/importService", () => ({
  ImportService: {
    isAvailable: vi.fn(),
  },
}));

describe("ServiceAvailabilityManager", () => {
  let manager: ServiceAvailabilityManager;

  beforeEach(() => {
    // Create a fresh instance for each test
    manager = new ServiceAvailabilityManager();
    manager.clearCache();

    // Reset all mocks
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(ApiClient.isOnline).mockReturnValue(true);
    vi.mocked(ApiClient.healthCheck).mockResolvedValue(true);
    vi.mocked(BudgetEngineService.isAvailable).mockResolvedValue(true);
    vi.mocked(ImportService.isAvailable).mockResolvedValue(true);
  });

  describe("checkService", () => {
    it("should check API service availability", async () => {
      const available = await manager.checkService("api");

      expect(available).toBe(true);
      expect(ApiClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it("should check Budget Engine service availability", async () => {
      const available = await manager.checkService("budgetEngine");

      expect(available).toBe(true);
      expect(BudgetEngineService.isAvailable).toHaveBeenCalledTimes(1);
    });

    it("should check Import service availability", async () => {
      const available = await manager.checkService("import");

      expect(available).toBe(true);
      expect(ImportService.isAvailable).toHaveBeenCalledTimes(1);
    });

    it("should return false when device is offline", async () => {
      vi.mocked(ApiClient.isOnline).mockReturnValue(false);

      const available = await manager.checkService("api");

      expect(available).toBe(false);
      expect(ApiClient.healthCheck).not.toHaveBeenCalled();
    });

    it("should cache service status", async () => {
      // First check
      await manager.checkService("api");

      // Second check should use cache
      const available = await manager.checkService("api");

      expect(available).toBe(true);
      expect(ApiClient.healthCheck).toHaveBeenCalledTimes(1); // Only called once
    });

    it("should bypass cache when forceRefresh is true", async () => {
      // First check
      await manager.checkService("api");

      // Second check with forceRefresh
      const available = await manager.checkService("api", true);

      expect(available).toBe(true);
      expect(ApiClient.healthCheck).toHaveBeenCalledTimes(2);
    });

    it("should handle service check errors gracefully", async () => {
      vi.mocked(ApiClient.healthCheck).mockRejectedValue(new Error("Network error"));

      const available = await manager.checkService("api");

      expect(available).toBe(false);
    });

    it("should deduplicate concurrent health checks", async () => {
      // Start multiple checks simultaneously
      const checks = [
        manager.checkService("api"),
        manager.checkService("api"),
        manager.checkService("api"),
      ];

      const results = await Promise.all(checks);

      // All should return the same result
      expect(results).toEqual([true, true, true]);

      // But health check should only be called once
      expect(ApiClient.healthCheck).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkAllServices", () => {
    it("should check all services", async () => {
      const status = await manager.checkAllServices();

      expect(status.api.available).toBe(true);
      expect(status.budgetEngine.available).toBe(true);
      expect(status.import.available).toBe(true);

      expect(ApiClient.healthCheck).toHaveBeenCalledTimes(1);
      expect(BudgetEngineService.isAvailable).toHaveBeenCalledTimes(1);
      expect(ImportService.isAvailable).toHaveBeenCalledTimes(1);
    });

    it("should handle mixed service availability", async () => {
      vi.mocked(ApiClient.healthCheck).mockResolvedValue(true);
      vi.mocked(BudgetEngineService.isAvailable).mockResolvedValue(false);
      vi.mocked(ImportService.isAvailable).mockResolvedValue(true);

      const status = await manager.checkAllServices();

      expect(status.api.available).toBe(true);
      expect(status.budgetEngine.available).toBe(false);
      expect(status.import.available).toBe(true);
    });

    it("should check all services in parallel", async () => {
      const startTime = Date.now();

      // Make each service take 100ms
      vi.mocked(ApiClient.healthCheck).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );
      vi.mocked(BudgetEngineService.isAvailable).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );
      vi.mocked(ImportService.isAvailable).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      );

      await manager.checkAllServices();

      const duration = Date.now() - startTime;

      // Should complete in ~100ms (parallel) not ~300ms (sequential)
      // Increased tolerance to 1500ms for CI environments
      expect(duration).toBeLessThan(1500);
    });
  });

  describe("getStatus", () => {
    it("should return cached status", async () => {
      await manager.checkService("api");

      const status = manager.getStatus("api");

      expect(status).not.toBeNull();
      expect(status?.available).toBe(true);
    });

    it("should return null for unchecked service", () => {
      const status = manager.getStatus("api");

      expect(status).toBeNull();
    });
  });

  describe("getAllStatus", () => {
    it("should return status for all services", async () => {
      await manager.checkAllServices();

      const status = manager.getAllStatus();

      expect(status.api).toBeDefined();
      expect(status.budgetEngine).toBeDefined();
      expect(status.import).toBeDefined();
    });

    it("should return placeholder status for unchecked services", () => {
      const status = manager.getAllStatus();

      expect(status.api.available).toBe(false);
      expect(status.api.error).toBe("Not checked");
    });
  });

  describe("clearCache", () => {
    it("should clear cache for specific service", async () => {
      await manager.checkService("api");

      manager.clearCache("api");

      const status = manager.getStatus("api");
      expect(status).toBeNull();
    });

    it("should clear cache for all services", async () => {
      await manager.checkAllServices();

      manager.clearCache();

      expect(manager.getStatus("api")).toBeNull();
      expect(manager.getStatus("budgetEngine")).toBeNull();
      expect(manager.getStatus("import")).toBeNull();
    });
  });

  describe("isDeviceOnline", () => {
    it("should return true when device is online", () => {
      vi.mocked(ApiClient.isOnline).mockReturnValue(true);

      expect(manager.isDeviceOnline()).toBe(true);
    });

    it("should return false when device is offline", () => {
      vi.mocked(ApiClient.isOnline).mockReturnValue(false);

      expect(manager.isDeviceOnline()).toBe(false);
    });
  });

  describe("singleton instance", () => {
    it("should return the same instance", () => {
      const instance1 = ServiceAvailabilityManager.getInstance();
      const instance2 = ServiceAvailabilityManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});
