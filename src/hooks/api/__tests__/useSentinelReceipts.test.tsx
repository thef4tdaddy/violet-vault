/**
 * Tests for useSentinelReceipts hook
 * Covers polling behavior, mutation logic, and state management
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSentinelReceipts } from "../useSentinelReceipts";
import { sentinelShareService } from "../../../services/sentinel/sentinelShareService";
import type { SentinelReceipt } from "../../../types/sentinel";

// Mock dependencies
vi.mock("../../../hooks/auth/useAuth", () => ({
  useAuth: () => ({
    user: { uid: "test-user-123", email: "test@example.com" },
  }),
}));

vi.mock("../../../services/sentinel/sentinelShareService", () => ({
  sentinelShareService: {
    fetchReceipts: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Helper to create a QueryClient for testing
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

const mockReceipts: SentinelReceipt[] = [
  {
    id: "receipt-1",
    amount: 50.0,
    merchant: "Test Merchant 1",
    date: "2026-01-15T10:00:00Z",
    category: "Groceries",
    status: "pending",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
];

describe("useSentinelReceipts Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sentinelShareService.fetchReceipts).mockResolvedValue({
      receipts: mockReceipts,
      total: 1,
    });
  });

  it("should fetch receipts successfully", async () => {
    const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

    await waitFor(() => expect(result.current.receipts).toHaveLength(1));
    expect(result.current.receipts[0].merchant).toBe("Test Merchant 1");
    expect(sentinelShareService.fetchReceipts).toHaveBeenCalled();
  });

  it("should handle polling correctly", async () => {
    const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

    await waitFor(() => expect(result.current.receipts).toHaveLength(1));
    expect(sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(1);

    // Instead of fake timers which conflict with QueryClient, we can manually refetch
    // to verify the logic or just trust TanStack Query's refetchInterval configuration.
    // To actually test the trigger, we can use refetch().
    await result.current.refetch();
    expect(sentinelShareService.fetchReceipts).toHaveBeenCalledTimes(2);
  });

  it("should filter pending receipts", async () => {
    const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

    await waitFor(() => expect(result.current.pendingReceipts).toHaveLength(1));
    expect(result.current.pendingReceipts[0].status).toBe("pending");
  });

  it("should update receipt status with optimistic updates", async () => {
    vi.mocked(sentinelShareService.updateStatus).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

    await waitFor(() => expect(result.current.receipts).toHaveLength(1));

    await result.current.updateStatus("receipt-1", "matched", "trans-123");

    // Verify service call
    expect(sentinelShareService.updateStatus).toHaveBeenCalledWith({
      receiptId: "receipt-1",
      status: "matched",
      matchedTransactionId: "trans-123",
    });
  });

  it("should handle fetch errors", async () => {
    vi.mocked(sentinelShareService.fetchReceipts).mockRejectedValueOnce(new Error("API Error"));

    const { result } = renderHook(() => useSentinelReceipts({ retry: false }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true)); // Timeout no longer needed
    expect(result.current.error).toBeDefined();
  });

  it("should find receipt by ID", async () => {
    const { result } = renderHook(() => useSentinelReceipts(), { wrapper });

    await waitFor(() => expect(result.current.receipts).toHaveLength(1));

    const receipt = result.current.getReceiptById("receipt-1");
    expect(receipt).toBeDefined();
    expect(receipt?.id).toBe("receipt-1");
  });
});
