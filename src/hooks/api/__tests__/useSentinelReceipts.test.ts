/**
 * Tests for useSentinelReceipts hook
 * Validates polling behavior, optimistic updates, error handling, and cache management
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSentinelReceipts } from "../useSentinelReceipts";
import type { ReactNode } from "react";
import type { SentinelReceipt } from "@/types/sentinel";

// Mock dependencies
vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { uid: "test-user-123", email: "test@example.com" },
  })),
}));

vi.mock("@/services/sentinel/sentinelShareService", () => ({
  sentinelShareService: {
    fetchReceipts: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock data
const mockReceipts: SentinelReceipt[] = [
  {
    id: "receipt-1",
    amount: 50.0,
    merchant: "Test Merchant 1",
    date: "2026-01-15T10:00:00Z",
    category: "Groceries",
    description: "Weekly groceries",
    status: "pending",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "receipt-2",
    amount: 100.0,
    merchant: "Test Merchant 2",
    date: "2026-01-16T14:30:00Z",
    category: "Dining",
    description: "Lunch meeting",
    status: "matched",
    createdAt: "2026-01-16T14:30:00Z",
    updatedAt: "2026-01-16T14:30:00Z",
    matchedTransactionId: "transaction-123",
  },
  {
    id: "receipt-3",
    amount: 25.0,
    merchant: "Test Merchant 3",
    date: "2026-01-17T09:15:00Z",
    status: "ignored",
    createdAt: "2026-01-17T09:15:00Z",
    updatedAt: "2026-01-17T09:15:00Z",
  },
];

describe("useSentinelReceipts", () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Create wrapper with QueryClientProvider
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe("Initial State", () => {
    it("should provide initial loading state", () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      expect(result.current.receipts).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should provide all required properties", () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      expect(result.current).toHaveProperty("receipts");
      expect(result.current).toHaveProperty("pendingReceipts");
      expect(result.current).toHaveProperty("matchedReceipts");
      expect(result.current).toHaveProperty("ignoredReceipts");
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("isFetching");
      expect(result.current).toHaveProperty("isError");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("isPolling");
      expect(result.current).toHaveProperty("isUpdating");
      expect(result.current).toHaveProperty("updateError");
      expect(result.current).toHaveProperty("refetch");
      expect(result.current).toHaveProperty("updateStatus");
      expect(result.current).toHaveProperty("getReceiptById");
      expect(result.current).toHaveProperty("getReceiptsByMerchant");
      expect(result.current).toHaveProperty("getReceiptsByDateRange");
    });
  });

  describe("Data Fetching", () => {
    it("should fetch receipts successfully", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.receipts).toEqual(mockReceipts);
      expect(result.current.receipts.length).toBe(3);
      expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(1);
    });

    it("should filter receipts by status", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pendingReceipts.length).toBe(1);
      expect(result.current.matchedReceipts.length).toBe(1);
      expect(result.current.ignoredReceipts.length).toBe(1);

      expect(result.current.pendingReceipts[0].id).toBe("receipt-1");
      expect(result.current.matchedReceipts[0].id).toBe("receipt-2");
      expect(result.current.ignoredReceipts[0].id).toBe("receipt-3");
    });

    it("should handle fetch errors", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      const mockError = new Error("Failed to fetch receipts");
      sentinelShareService.sentinelShareService.fetchReceipts.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.receipts).toEqual([]);
    });
  });

  describe("Polling Behavior", () => {
    it("should poll API every 30 seconds", async () => {
      vi.useFakeTimers();

      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      // Initial fetch
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(1);

      // Advance time by 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Wait for the polling to trigger
      await waitFor(() => {
        expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(2);
      });

      // Advance time by another 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      await waitFor(() => {
        expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(3);
      });

      vi.useRealTimers();
    });

    it("should not poll when user is logged out", async () => {
      const useAuth = vi.requireMock("@/hooks/auth/useAuth");
      useAuth.useAuth.mockReturnValue({ user: null });

      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      // Wait a bit to ensure no fetching happens
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.isLoading).toBe(false);
      expect(sentinelShareService.sentinelShareService.fetchReceipts).not.toHaveBeenCalled();
    });
  });

  describe("Optimistic Updates", () => {
    it("should optimistically update receipt status", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });
      sentinelShareService.sentinelShareService.updateStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialPendingCount = result.current.pendingReceipts.length;
      expect(initialPendingCount).toBe(1);

      // Update status
      await act(async () => {
        await result.current.updateStatus("receipt-1", "matched", "transaction-456");
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(sentinelShareService.sentinelShareService.updateStatus).toHaveBeenCalledWith({
        receiptId: "receipt-1",
        status: "matched",
        matchedTransactionId: "transaction-456",
      });
    });

    it("should rollback optimistic update on error", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const mockError = new Error("Update failed");
      sentinelShareService.sentinelShareService.updateStatus.mockRejectedValue(mockError);

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialReceipts = result.current.receipts;

      // Attempt to update status (will fail)
      await act(async () => {
        try {
          await result.current.updateStatus("receipt-1", "matched");
        } catch {
          // Expected to fail
        }
      });

      await waitFor(() => {
        expect(result.current.updateError).toBeTruthy();
      });

      // Data should be rolled back to initial state
      expect(result.current.receipts).toEqual(initialReceipts);
    });
  });

  describe("Utility Methods", () => {
    it("should get receipt by ID", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const receipt = result.current.getReceiptById("receipt-2");
      expect(receipt).toBeDefined();
      expect(receipt?.id).toBe("receipt-2");
      expect(receipt?.merchant).toBe("Test Merchant 2");
    });

    it("should get receipts by merchant", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const receipts = result.current.getReceiptsByMerchant("Merchant 2");
      expect(receipts.length).toBe(1);
      expect(receipts[0].id).toBe("receipt-2");
    });

    it("should get receipts by date range", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const receipts = result.current.getReceiptsByDateRange(
        "2026-01-16T00:00:00Z",
        "2026-01-18T00:00:00Z"
      );
      expect(receipts.length).toBe(2);
      expect(receipts[0].id).toBe("receipt-2");
      expect(receipts[1].id).toBe("receipt-3");
    });
  });

  describe("Refetch", () => {
    it("should manually refetch data", async () => {
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(1);

      // Manually refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(sentinelShareService.sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cache Invalidation", () => {
    it("should clear cache when user logs out", async () => {
      const useAuth = vi.requireMock("@/hooks/auth/useAuth");
      const sentinelShareService = vi.requireMock("@/services/sentinel/sentinelShareService");
      sentinelShareService.sentinelShareService.fetchReceipts.mockResolvedValue({
        receipts: mockReceipts,
        total: mockReceipts.length,
      });

      // Initially logged in
      useAuth.useAuth.mockReturnValue({ user: { uid: "test-user-123" } });

      const { result, rerender } = renderHook(() => useSentinelReceipts(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.receipts.length).toBe(3);

      // Log out user
      useAuth.useAuth.mockReturnValue({ user: null });

      // Rerender to trigger useEffect
      rerender();

      // Wait for cache to be cleared
      await waitFor(() => {
        // Cache should be invalidated
        const cacheData = queryClient.getQueryData(["sentinelShare", "receipts", {}]);
        expect(cacheData).toBeUndefined();
      });
    });
  });
});
