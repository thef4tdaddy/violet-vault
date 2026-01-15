/**
 * Tests for QueryClient Configuration
 * Verifies TanStack Query client setup, default options, and caching behavior
 */
import { describe, it, expect, vi } from "vitest";
import { createQueryClient } from "../../queryClientConfig";
import { QueryCache, MutationCache } from "@tanstack/react-query";

describe("QueryClient Configuration", () => {
  describe("createQueryClient", () => {
    it("should create a QueryClient with default options", () => {
      // Act
      const queryClient = createQueryClient();

      // Assert
      expect(queryClient).toBeDefined();
      expect(queryClient.getDefaultOptions()).toBeDefined();
    });

    it("should configure default query options", () => {
      // Act
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      // Assert - Check query defaults
      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000); // 5 minutes
      expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000); // 10 minutes
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
      expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
      expect(defaultOptions.queries?.refetchOnMount).toBe("always");
      expect(defaultOptions.queries?.networkMode).toBe("offlineFirst");
    });

    it("should configure default mutation options", () => {
      // Act
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      // Assert - Check mutation defaults
      expect(defaultOptions.mutations?.retry).toBe(1);
      expect(defaultOptions.mutations?.networkMode).toBe("offlineFirst");
    });

    it("should configure custom retry logic", () => {
      // Act
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();
      const retryFn = defaultOptions.queries?.retry as Function;

      // Assert - Should not retry on auth errors (401, 403)
      expect(retryFn(0, { status: 401 })).toBe(false);
      expect(retryFn(0, { status: 403 })).toBe(false);

      // Should retry on other errors up to 3 times
      expect(retryFn(0, { status: 500 })).toBe(true);
      expect(retryFn(1, { status: 500 })).toBe(true);
      expect(retryFn(2, { status: 500 })).toBe(true);
      expect(retryFn(3, { status: 500 })).toBe(false); // 4th attempt
    });

    it("should configure exponential backoff for retries", () => {
      // Act
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();
      const retryDelayFn = defaultOptions.queries?.retryDelay as Function;

      // Assert - Check exponential backoff with cap at 30s
      expect(retryDelayFn(0)).toBe(1000); // 1s
      expect(retryDelayFn(1)).toBe(2000); // 2s
      expect(retryDelayFn(2)).toBe(4000); // 4s
      expect(retryDelayFn(3)).toBe(8000); // 8s
      expect(retryDelayFn(4)).toBe(16000); // 16s
      expect(retryDelayFn(5)).toBe(30000); // 30s (capped)
      expect(retryDelayFn(10)).toBe(30000); // Still capped
    });

    it("should create QueryCache with error handling", () => {
      // Act
      const queryClient = createQueryClient();
      const queryCache = queryClient.getQueryCache();

      // Assert
      expect(queryCache).toBeInstanceOf(QueryCache);
    });

    it("should create MutationCache with error handling", () => {
      // Act
      const queryClient = createQueryClient();
      const mutationCache = queryClient.getMutationCache();

      // Assert
      expect(mutationCache).toBeInstanceOf(MutationCache);
    });
  });

  describe("Cache Policies", () => {
    it("should respect staleTime for queries", async () => {
      // Arrange
      const queryClient = createQueryClient();
      let callCount = 0;
      const queryFn = vi.fn(async () => {
        callCount++;
        return { data: `call_${callCount}` };
      });

      // Act - First fetch
      await queryClient.fetchQuery({
        queryKey: ["test"],
        queryFn,
      });

      // Act - Immediate second fetch (within staleTime)
      await queryClient.fetchQuery({
        queryKey: ["test"],
        queryFn,
      });

      // Assert - Should use cached data, not refetch
      expect(queryFn).toHaveBeenCalledTimes(1);
    });

    it("should cache query data after fetch", async () => {
      // Arrange
      const queryClient = createQueryClient();
      const queryFn = vi.fn(async () => ({ data: "test" }));

      // Act
      await queryClient.fetchQuery({
        queryKey: ["test"],
        queryFn,
      });

      // Assert - Data should be in cache
      expect(queryClient.getQueryData(["test"])).toEqual({ data: "test" });
    });

    it("should allow manual cache invalidation", async () => {
      // Arrange
      const queryClient = createQueryClient();
      const queryFn = vi.fn(async () => ({ data: "test" }));

      await queryClient.fetchQuery({
        queryKey: ["test"],
        queryFn,
      });

      // Act - Invalidate
      await queryClient.invalidateQueries({ queryKey: ["test"] });

      // Assert - Query should be marked as stale
      const query = queryClient.getQueryCache().find({ queryKey: ["test"] });
      expect(query?.isStale()).toBe(true);
    });

    it("should support clearing all cache", () => {
      // Arrange
      const queryClient = createQueryClient();
      queryClient.setQueryData(["test1"], { data: "test1" });
      queryClient.setQueryData(["test2"], { data: "test2" });

      // Act
      queryClient.clear();

      // Assert
      expect(queryClient.getQueryData(["test1"])).toBeUndefined();
      expect(queryClient.getQueryData(["test2"])).toBeUndefined();
    });
  });

  describe("Network Mode", () => {
    it("should use offlineFirst network mode for queries", () => {
      // Arrange
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      // Assert
      expect(defaultOptions.queries?.networkMode).toBe("offlineFirst");
    });

    it("should use offlineFirst network mode for mutations", () => {
      // Arrange
      const queryClient = createQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      // Assert
      expect(defaultOptions.mutations?.networkMode).toBe("offlineFirst");
    });
  });

  describe("Query Statistics", () => {
    it("should track active queries", async () => {
      // Arrange
      const queryClient = createQueryClient();
      const queryFn = vi.fn(async () => ({ data: "test" }));

      // Act
      await queryClient.fetchQuery({ queryKey: ["test1"], queryFn });
      await queryClient.fetchQuery({ queryKey: ["test2"], queryFn });

      // Assert
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      expect(queries.length).toBeGreaterThanOrEqual(2);
    });

    it("should check if query data exists", () => {
      // Arrange
      const queryClient = createQueryClient();
      queryClient.setQueryData(["test"], { data: "test" });

      // Act & Assert
      expect(queryClient.getQueryData(["test"])).toBeDefined();
      expect(queryClient.getQueryData(["nonexistent"])).toBeUndefined();
    });
  });

  describe("Error Handling in Callbacks", () => {
    it("should handle query errors through onError callback", async () => {
      // Arrange
      const queryClient = createQueryClient();
      const queryFn = vi.fn(async () => {
        throw new Error("Query error");
      });

      // Act - Attempt to fetch
      try {
        await queryClient.fetchQuery({
          queryKey: ["test"],
          queryFn,
          retry: false,
        });
      } catch (error) {
        // Expected error
      }

      // Assert - Query should be in error state
      const query = queryClient.getQueryCache().find({ queryKey: ["test"] });
      expect(query?.state.status).toBe("error");
    });

    it("should not retry on auth errors", async () => {
      // Arrange
      const queryClient = createQueryClient();
      let attemptCount = 0;
      const queryFn = vi.fn(async () => {
        attemptCount++;
        const error = new Error("Unauthorized") as any;
        error.status = 401;
        throw error;
      });

      // Act
      try {
        await queryClient.fetchQuery({
          queryKey: ["test"],
          queryFn,
        });
      } catch (error) {
        // Expected error
      }

      // Assert - Should only attempt once (no retries for 401)
      expect(attemptCount).toBe(1);
    });

    it("should retry on non-auth errors", async () => {
      // Arrange
      const queryClient = createQueryClient();
      let attemptCount = 0;
      const queryFn = vi.fn(async () => {
        attemptCount++;
        const error = new Error("Server error") as any;
        error.status = 500;
        throw error;
      });

      // Act
      try {
        await queryClient.fetchQuery({
          queryKey: ["test"],
          queryFn,
          retryDelay: 1, // Very short delay for testing
        });
      } catch (error) {
        // Expected error
      }

      // Assert - Should retry (at least 2 attempts including initial)
      expect(attemptCount).toBeGreaterThanOrEqual(2);
    }, 10000); // Allow longer timeout for retries
  });
});
