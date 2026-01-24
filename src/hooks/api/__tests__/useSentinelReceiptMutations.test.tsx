/**
 * Tests for useSentinelReceiptMutations hook
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useSentinelReceiptMutations } from "../useSentinelReceiptMutations";
import { sentinelShareService } from "../../../services/sentinel/sentinelShareService";
import { queryKeys } from "../../../utils/core/common/queryClient";

// Mock dependencies
vi.mock("../../../services/sentinel/sentinelShareService", () => ({
  sentinelShareService: {
    updateStatus: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  }),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
);

describe("useSentinelReceiptMutations Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update receipt status successfully", async () => {
    vi.mocked(sentinelShareService.updateStatus).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSentinelReceiptMutations(), { wrapper });

    await result.current.updateStatus("receipt-1", "matched", "trans-1");

    expect(sentinelShareService.updateStatus).toHaveBeenCalledWith({
      receiptId: "receipt-1",
      status: "matched",
      matchedTransactionId: "trans-1",
    });
  });

  it("should handle optimistic updates correctly", async () => {
    const queryClient = createTestQueryClient();
    const initialReceipts = [
      { id: "receipt-1", status: "pending", merchant: "Store", amount: 10, date: "2026-01-01" },
    ];
    queryClient.setQueryData(queryKeys.sentinelReceipts(), initialReceipts);

    vi.mocked(sentinelShareService.updateStatus).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() => useSentinelReceiptMutations(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    // Start mutation
    const promise = result.current.updateStatus("receipt-1", "matched", "trans-1");

    // Check optimistic state
    await waitFor(() => {
      const optimisticData = queryClient.getQueryData<any[]>(queryKeys.sentinelReceipts());
      expect(optimisticData?.[0].status).toBe("matched");
    });

    await promise;
  });

  it("should rollback on error", async () => {
    const queryClient = createTestQueryClient();
    const initialReceipts = [
      { id: "receipt-1", status: "pending", merchant: "Store", amount: 10, date: "2026-01-01" },
    ];
    queryClient.setQueryData(queryKeys.sentinelReceipts(), initialReceipts);

    vi.mocked(sentinelShareService.updateStatus).mockRejectedValue(new Error("Update failed"));

    const { result } = renderHook(() => useSentinelReceiptMutations(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    try {
      await result.current.updateStatus("receipt-1", "matched", "trans-1");
    } catch (e) {
      // Expected
    }

    // Check rolled back state
    const rolledBackData = queryClient.getQueryData<any[]>(queryKeys.sentinelReceipts());
    expect(rolledBackData?.[0].status).toBe("pending");
  });
});
