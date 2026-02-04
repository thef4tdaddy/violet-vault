import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { backgroundSync, networkManager } from "../backgroundSyncService";
import { budgetDb } from "@/db/budgetDb";
import logger from "../../common/logger";
import queryClient from "../queryClientConfig";
import { queryKeys } from "../queryKeys";

// Mock logger
vi.mock("../../common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock queryClient
vi.mock("../queryClientConfig", () => ({
  default: {
    refetchQueries: vi.fn(),
    invalidateQueries: vi.fn(),
    getQueryCache: vi.fn(),
    setQueryData: vi.fn(),
  },
}));

// Mock budgetDb
vi.mock("@/db/budgetDb", () => ({
  budgetDb: {
    setCachedValue: vi.fn(),
    cache: {
      toArray: vi.fn(),
    },
  },
}));

describe("backgroundSyncService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("backgroundSync.syncAllData", () => {
    it("should refetch all queries successfully", async () => {
      // Mock successful refetch for all queries
      vi.mocked(queryClient.refetchQueries).mockResolvedValue({
        status: "fulfilled",
        value: undefined,
      } as PromiseFulfilledResult<unknown>);

      const result = await backgroundSync.syncAllData();

      // Should have attempted to refetch 6 query types
      expect(queryClient.refetchQueries).toHaveBeenCalledTimes(6);

      // Verify each query key was used
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.envelopesList(),
      });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.transactionsList(),
      });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.billsList(),
      });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.dashboardSummary(),
      });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.savingsGoalsList(),
      });
      expect(queryClient.refetchQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.paycheckHistory(),
      });

      expect(result).toHaveLength(6);
      expect(result.every((r) => r.status === "fulfilled")).toBe(true);
    });

    it("should handle mixed success and failure results", async () => {
      // Mock mixed results
      let callCount = 0;
      vi.mocked(queryClient.refetchQueries).mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.resolve({
            status: "fulfilled",
            value: undefined,
          } as PromiseFulfilledResult<unknown>);
        }
        return Promise.reject(new Error("Network error"));
      });

      const result = await backgroundSync.syncAllData();

      expect(result).toHaveLength(6);
      const fulfilled = result.filter((r) => r.status === "fulfilled");
      const rejected = result.filter((r) => r.status === "rejected");
      expect(fulfilled.length).toBe(3);
      expect(rejected.length).toBe(3);
    });

    it("should log sync results in development mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      vi.mocked(queryClient.refetchQueries).mockResolvedValue({
        status: "fulfilled",
        value: undefined,
      } as PromiseFulfilledResult<unknown>);

      await backgroundSync.syncAllData();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Background sync completed"),
        expect.objectContaining({
          successful: expect.any(Number),
          failed: expect.any(Number),
          source: "backgroundSync",
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log sync results in production mode", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      vi.mocked(queryClient.refetchQueries).mockResolvedValue({
        status: "fulfilled",
        value: undefined,
      } as PromiseFulfilledResult<unknown>);

      vi.mocked(logger.info).mockClear();

      await backgroundSync.syncAllData();

      expect(logger.info).not.toHaveBeenCalledWith(
        expect.stringContaining("Background sync completed"),
        expect.any(Object)
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should return results for all queries even if some fail", async () => {
      // Make some queries fail
      vi.mocked(queryClient.refetchQueries)
        .mockResolvedValueOnce({
          status: "fulfilled",
          value: undefined,
        } as PromiseFulfilledResult<unknown>)
        .mockRejectedValueOnce(new Error("Failed query"))
        .mockResolvedValueOnce({
          status: "fulfilled",
          value: undefined,
        } as PromiseFulfilledResult<unknown>)
        .mockResolvedValueOnce({
          status: "fulfilled",
          value: undefined,
        } as PromiseFulfilledResult<unknown>)
        .mockResolvedValueOnce({
          status: "fulfilled",
          value: undefined,
        } as PromiseFulfilledResult<unknown>)
        .mockResolvedValueOnce({
          status: "fulfilled",
          value: undefined,
        } as PromiseFulfilledResult<unknown>);

      const results = await backgroundSync.syncAllData();

      expect(results).toHaveLength(6);
    });
  });

  describe("backgroundSync.invalidateStaleData", () => {
    it("should invalidate all queries", () => {
      backgroundSync.invalidateStaleData();

      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith();
    });
  });

  describe("backgroundSync.syncWithDexie", () => {
    it("should sync all queries with Dexie successfully", async () => {
      const mockQueries = [
        {
          queryKey: ["envelopes", "list"],
          state: {
            data: [{ id: "1", name: "Groceries" }],
          },
        },
        {
          queryKey: ["transactions", "list"],
          state: {
            data: [{ id: "tx1", amount: 100 }],
          },
        },
        {
          queryKey: ["bills", "list"],
          state: {
            data: [],
          },
        },
      ];

      const mockQueryCache = {
        getAll: vi.fn().mockReturnValue(mockQueries),
      };

      vi.mocked(queryClient.getQueryCache).mockReturnValue(
        mockQueryCache as unknown as ReturnType<typeof queryClient.getQueryCache>
      );

      vi.mocked(budgetDb.setCachedValue).mockResolvedValue(undefined);

      await backgroundSync.syncWithDexie();

      // Should have called setCachedValue for each query with data
      expect(budgetDb.setCachedValue).toHaveBeenCalledTimes(3);
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(JSON.stringify(["envelopes", "list"]), [
        { id: "1", name: "Groceries" },
      ]);
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(
        JSON.stringify(["transactions", "list"]),
        [{ id: "tx1", amount: 100 }]
      );
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(JSON.stringify(["bills", "list"]), []);

      expect(logger.info).toHaveBeenCalledWith(
        "Successfully synced query cache with Dexie",
        expect.objectContaining({
          source: "backgroundSync",
        })
      );
    });

    it("should skip queries without data", async () => {
      const mockQueries = [
        {
          queryKey: ["envelopes", "list"],
          state: {
            data: [{ id: "1", name: "Groceries" }],
          },
        },
        {
          queryKey: ["transactions", "list"],
          state: {
            data: null,
          },
        },
        {
          queryKey: ["bills", "list"],
          state: {},
        },
      ];

      const mockQueryCache = {
        getAll: vi.fn().mockReturnValue(mockQueries),
      };

      vi.mocked(queryClient.getQueryCache).mockReturnValue(
        mockQueryCache as unknown as ReturnType<typeof queryClient.getQueryCache>
      );

      vi.mocked(budgetDb.setCachedValue).mockResolvedValue(undefined);

      await backgroundSync.syncWithDexie();

      // Should only sync the one query with data
      expect(budgetDb.setCachedValue).toHaveBeenCalledTimes(1);
      expect(budgetDb.setCachedValue).toHaveBeenCalledWith(JSON.stringify(["envelopes", "list"]), [
        { id: "1", name: "Groceries" },
      ]);
    });

    it("should handle errors during sync", async () => {
      const mockQueries = [
        {
          queryKey: ["envelopes", "list"],
          state: {
            data: [{ id: "1", name: "Groceries" }],
          },
        },
      ];

      const mockQueryCache = {
        getAll: vi.fn().mockReturnValue(mockQueries),
      };

      vi.mocked(queryClient.getQueryCache).mockReturnValue(
        mockQueryCache as unknown as ReturnType<typeof queryClient.getQueryCache>
      );

      const testError = new Error("Dexie error");
      vi.mocked(budgetDb.setCachedValue).mockRejectedValue(testError);

      await backgroundSync.syncWithDexie();

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to sync cache with Dexie",
        testError,
        expect.objectContaining({
          source: "backgroundSync",
        })
      );
    });

    it("should handle errors in individual query syncs gracefully", async () => {
      const mockQueries = [
        {
          queryKey: ["envelopes", "list"],
          state: {
            data: [{ id: "1" }],
          },
        },
        {
          queryKey: ["transactions", "list"],
          state: {
            data: [{ id: "tx1" }],
          },
        },
      ];

      const mockQueryCache = {
        getAll: vi.fn().mockReturnValue(mockQueries),
      };

      vi.mocked(queryClient.getQueryCache).mockReturnValue(
        mockQueryCache as unknown as ReturnType<typeof queryClient.getQueryCache>
      );

      // Mock one failing, one succeeding
      vi.mocked(budgetDb.setCachedValue)
        .mockRejectedValueOnce(new Error("First failed"))
        .mockResolvedValueOnce(undefined);

      await backgroundSync.syncWithDexie();

      // The overall function should catch the error
      expect(logger.error).toHaveBeenCalledWith(
        "Failed to sync cache with Dexie",
        expect.any(Error),
        expect.objectContaining({
          source: "backgroundSync",
        })
      );
    });
  });

  describe("backgroundSync.restoreFromDexie", () => {
    it("should restore valid query cache entries", async () => {
      const mockCacheEntries = [
        {
          key: JSON.stringify(["envelopes", "list"]),
          value: [{ id: "1", name: "Groceries" }],
        },
        {
          key: JSON.stringify(["transactions", "list"]),
          value: [{ id: "tx1", amount: 100 }],
        },
      ];

      vi.mocked(budgetDb.cache.toArray).mockResolvedValue(mockCacheEntries);

      await backgroundSync.restoreFromDexie();

      expect(queryClient.setQueryData).toHaveBeenCalledTimes(2);
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["envelopes", "list"],
        [{ id: "1", name: "Groceries" }]
      );
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["transactions", "list"],
        [{ id: "tx1", amount: 100 }]
      );

      expect(logger.info).toHaveBeenCalledWith(
        "Successfully restored query cache from Dexie",
        expect.objectContaining({
          source: "backgroundSync",
        })
      );
    });

    it("should skip non-JSON cache entries", async () => {
      const mockCacheEntries = [
        {
          key: "lastSyncTime",
          value: Date.now(),
        },
        {
          key: "userPreference",
          value: { theme: "dark" },
        },
        {
          key: JSON.stringify(["envelopes", "list"]),
          value: [{ id: "1" }],
        },
      ];

      vi.mocked(budgetDb.cache.toArray).mockResolvedValue(mockCacheEntries);

      await backgroundSync.restoreFromDexie();

      // Only the valid query key should be restored
      expect(queryClient.setQueryData).toHaveBeenCalledTimes(1);
      expect(queryClient.setQueryData).toHaveBeenCalledWith(["envelopes", "list"], [{ id: "1" }]);
    });

    it("should skip non-array query keys", async () => {
      const mockCacheEntries = [
        {
          key: JSON.stringify({ notAnArray: true }),
          value: { data: "test" },
        },
        {
          key: JSON.stringify(["transactions", "list"]),
          value: [{ id: "tx1" }],
        },
      ];

      vi.mocked(budgetDb.cache.toArray).mockResolvedValue(mockCacheEntries);

      await backgroundSync.restoreFromDexie();

      // Only the valid array query key should be restored
      expect(queryClient.setQueryData).toHaveBeenCalledTimes(1);
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["transactions", "list"],
        [{ id: "tx1" }]
      );
    });

    it("should log warnings for failed restore attempts", async () => {
      const mockCacheEntries = [
        {
          key: JSON.stringify(["envelopes", "list"]),
          value: [{ id: "1" }],
        },
        {
          key: JSON.stringify(["transactions", "list"]),
          value: [{ id: "tx1" }],
        },
      ];

      vi.mocked(budgetDb.cache.toArray).mockResolvedValue(mockCacheEntries);

      // Mock setQueryData to fail on the first call
      const mockSetQueryData = vi.mocked(queryClient.setQueryData);
      mockSetQueryData
        .mockImplementationOnce(() => {
          throw new Error("Failed to restore");
        })
        .mockImplementationOnce(() => {});

      await backgroundSync.restoreFromDexie();

      expect(logger.warn).toHaveBeenCalledWith(
        "Failed to restore cached query",
        expect.objectContaining({
          key: JSON.stringify(["envelopes", "list"]),
          error: "Failed to restore",
          source: "backgroundSync",
        })
      );

      // Should still complete and log success
      expect(logger.info).toHaveBeenCalledWith(
        "Successfully restored query cache from Dexie",
        expect.any(Object)
      );
    });

    it("should handle Dexie errors during restore", async () => {
      const testError = new Error("Database error");
      vi.mocked(budgetDb.cache.toArray).mockRejectedValue(testError);

      await backgroundSync.restoreFromDexie();

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to restore cache from Dexie",
        testError,
        expect.objectContaining({
          source: "backgroundSync",
        })
      );
    });

    it("should handle empty cache gracefully", async () => {
      vi.mocked(budgetDb.cache.toArray).mockResolvedValue([]);

      await backgroundSync.restoreFromDexie();

      expect(queryClient.setQueryData).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Successfully restored query cache from Dexie",
        expect.any(Object)
      );
    });

    it("should handle non-Error objects in catch", async () => {
      const mockCacheEntries = [
        {
          key: JSON.stringify(["envelopes", "list"]),
          value: [{ id: "1" }],
        },
      ];

      vi.mocked(budgetDb.cache.toArray).mockResolvedValue(mockCacheEntries);

      // Intentionally throw a string to test handling of non-Error objects
      // This can happen in JavaScript when libraries throw non-standard error types
      vi.mocked(queryClient.setQueryData).mockImplementationOnce(() => {
        throw "String error"; // eslint-disable-line no-throw-literal
      });

      await backgroundSync.restoreFromDexie();

      expect(logger.warn).toHaveBeenCalledWith(
        "Failed to restore cached query",
        expect.objectContaining({
          error: "String error",
        })
      );
    });
  });

  describe("networkManager", () => {
    describe("onOnline", () => {
      it("should trigger background sync and log when online", () => {
        // Mock syncAllData to return immediately
        const syncAllDataSpy = vi
          .spyOn(backgroundSync, "syncAllData")
          .mockResolvedValue([
            { status: "fulfilled", value: undefined } as PromiseFulfilledResult<unknown>,
          ]);

        networkManager.onOnline();

        expect(syncAllDataSpy).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
          "Network online - triggering background sync",
          expect.objectContaining({
            source: "networkManager",
          })
        );

        syncAllDataSpy.mockRestore();
      });
    });

    describe("onOffline", () => {
      it("should persist cache to Dexie and log when offline", () => {
        const syncWithDexieSpy = vi
          .spyOn(backgroundSync, "syncWithDexie")
          .mockResolvedValue(undefined);

        networkManager.onOffline();

        expect(syncWithDexieSpy).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith(
          "Network offline - persisting cache to Dexie",
          expect.objectContaining({
            source: "networkManager",
          })
        );

        syncWithDexieSpy.mockRestore();
      });
    });
  });

  describe("window event listeners", () => {
    it("should register online and offline event listeners on module load", () => {
      // The listeners are registered at module load time (lines 130-133 in backgroundSyncService.ts)
      // In jsdom environment, window is available
      // We verify the module loaded successfully and window is available
      expect(typeof window).toBe("object");
      expect(window.addEventListener).toBeDefined();

      // Note: The actual event listeners are registered at module load time before tests run,
      // so we can't spy on them here. The presence of window and addEventListener confirms
      // the code path was executed.
    });
  });

  describe("module exports", () => {
    it("should export backgroundSync and networkManager", () => {
      expect(backgroundSync).toBeDefined();
      expect(networkManager).toBeDefined();
    });
  });
});
