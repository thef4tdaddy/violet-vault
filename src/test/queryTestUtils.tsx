/**
 * Test utilities for TanStack Query testing
 * Provides wrappers, mocks, and helpers for testing React Query hooks
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { vi } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";

/**
 * Creates a fresh QueryClient instance for each test
 * Disables retries and logging for faster, cleaner tests
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Keep data in cache during test
        staleTime: 0, // Data is immediately stale
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false, // Disable retries in tests
      },
    },
  });
};

/**
 * Wrapper component that provides QueryClient and AuthProvider to tests
 *
 * This wrapper combines:
 * - QueryClientProvider: for TanStack Query hooks
 * - AuthProvider: for useAuth, useAuthManager, and related hooks
 *
 * Use this wrapper for component tests that need either or both providers.
 */
export const createQueryWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createTestQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

/**
 * Wait for queries to finish loading
 */
export const waitForQueries = async (queryClient: QueryClient) => {
  await new Promise((resolve) => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().getAll();
      const isLoading = queries.some((query) => query.state.fetchStatus === "fetching");

      if (!isLoading) {
        unsubscribe();
        resolve(true);
      }
    });
  });
};

/**
 * Wait for mutations to complete
 */
export const waitForMutations = async (queryClient: QueryClient) => {
  await new Promise((resolve) => {
    const unsubscribe = queryClient.getMutationCache().subscribe(() => {
      const mutations = queryClient.getMutationCache().getAll();
      const isLoading = mutations.some((mutation) => mutation.state.status === "pending");

      if (!isLoading) {
        unsubscribe();
        resolve(true);
      }
    });
  });
};

/**
 * Clear all cache data between tests
 */
export const clearQueryCache = (queryClient: QueryClient) => {
  queryClient.clear();
};

/**
 * Get query state for testing
 */
export const getQueryState = (queryClient: QueryClient, queryKey: unknown[]) => {
  const query = queryClient.getQueryCache().find({ queryKey });
  return query?.state;
};

/**
 * Get query data for testing
 */
export const getQueryData = <T,>(queryClient: QueryClient, queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

/**
 * Set query data for testing
 */
export const setQueryData = <T,>(queryClient: QueryClient, queryKey: unknown[], data: T) => {
  queryClient.setQueryData<T>(queryKey, data);
};

/**
 * Mock error response
 */
export const createMockError = (message = "Test error", status = 500) => {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
};

/**
 * Simulate network delay
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock query function that returns data after delay
 */
export const createMockQueryFn = <T,>(data: T, delayMs = 0) => {
  return vi.fn(async () => {
    if (delayMs > 0) {
      await delay(delayMs);
    }
    return data;
  });
};

/**
 * Mock query function that throws error after delay
 */
export const createMockErrorQueryFn = (error: Error, delayMs = 0) => {
  return vi.fn(async () => {
    if (delayMs > 0) {
      await delay(delayMs);
    }
    throw error;
  });
};

/**
 * Mock mutation function
 */
export const createMockMutationFn = <TData, TVariables>(
  callback?: (variables: TVariables) => TData | Promise<TData>
) => {
  return vi.fn(async (variables: TVariables) => {
    if (callback) {
      return await callback(variables);
    }
    return {} as TData;
  });
};

/**
 * Assert query is in loading state
 */
export const expectQueryLoading = (queryClient: QueryClient, queryKey: unknown[]) => {
  const state = getQueryState(queryClient, queryKey);
  expect(state?.fetchStatus).toBe("fetching");
};

/**
 * Assert query is in success state
 */
export const expectQuerySuccess = (queryClient: QueryClient, queryKey: unknown[]) => {
  const state = getQueryState(queryClient, queryKey);
  expect(state?.status).toBe("success");
  expect(state?.error).toBeNull();
};

/**
 * Assert query is in error state
 */
export const expectQueryError = (queryClient: QueryClient, queryKey: unknown[]) => {
  const state = getQueryState(queryClient, queryKey);
  expect(state?.status).toBe("error");
  expect(state?.error).toBeTruthy();
};

/**
 * Assert query data matches expected value
 */
export const expectQueryData = <T,>(
  queryClient: QueryClient,
  queryKey: unknown[],
  expectedData: T
) => {
  const data = getQueryData<T>(queryClient, queryKey);
  expect(data).toEqual(expectedData);
};
