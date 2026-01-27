/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useUnifiedReceipts, adaptSentinelReceipt, adaptOcrReceipt } from "../useUnifiedReceipts";
import type { SentinelReceipt } from "@/types/sentinel";
import type { Receipt } from "@/db/types";

// Mock the dependent hooks
vi.mock("@/hooks/api/useSentinelReceipts");
vi.mock("@/hooks/platform/data/useReceipts");

import { useSentinelReceipts } from "@/hooks/api/useSentinelReceipts";
import { useReceipts } from "@/hooks/platform/data/useReceipts";

describe("useUnifiedReceipts", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockSentinelReceipt: SentinelReceipt = {
    id: "sentinel-1",
    merchant: "Amazon",
    amount: 49.99,
    date: "2026-01-20T10:00:00Z",
    status: "pending",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  };

  const mockOcrReceipt: Receipt = {
    id: "ocr-1",
    merchant: "Target",
    amount: 29.99,
    date: "2026-01-21T14:00:00Z",
    currency: "USD",
    status: "pending",
    confidence: 0.85,
    ocrData: {
      rawText: "TARGET receipt",
      merchantConfidence: 0.9,
      totalConfidence: 0.85,
      dateConfidence: 0.88,
    },
  };

  describe("adaptSentinelReceipt", () => {
    it("should correctly adapt a Sentinel receipt", () => {
      const adapted = adaptSentinelReceipt(mockSentinelReceipt);

      expect(adapted).toEqual({
        id: "sentinel-1",
        source: "sentinel",
        merchant: "Amazon",
        amount: 49.99,
        date: "2026-01-20T10:00:00Z",
        status: "pending",
        matchConfidence: undefined,
        suggestedTransactionId: undefined,
        ocrConfidence: undefined,
        rawData: mockSentinelReceipt,
      });
    });

    it("should preserve matchedTransactionId", () => {
      const receiptWithMatch: SentinelReceipt = {
        ...mockSentinelReceipt,
        matchedTransactionId: "txn-123",
        status: "matched",
      };

      const adapted = adaptSentinelReceipt(receiptWithMatch);

      expect(adapted.suggestedTransactionId).toBe("txn-123");
      expect(adapted.status).toBe("matched");
    });
  });

  describe("adaptOcrReceipt", () => {
    it("should correctly adapt an OCR receipt with confidence data", () => {
      const adapted = adaptOcrReceipt(mockOcrReceipt);

      expect(adapted).toEqual({
        id: "ocr-1",
        source: "ocr",
        merchant: "Target",
        amount: 29.99,
        date: "2026-01-21T14:00:00Z",
        status: "pending",
        matchConfidence: 0.85,
        suggestedTransactionId: undefined,
        ocrConfidence: {
          merchant: "high",
          total: "high",
          date: "high",
          overall: 0.85,
        },
        rawData: mockOcrReceipt,
      });
    });

    it("should handle OCR receipt without confidence data", () => {
      const receiptWithoutOcr: Receipt = {
        id: "ocr-2",
        merchant: "Walmart",
        amount: 15.0,
        date: "2026-01-22T09:00:00Z",
        currency: "USD",
        status: "matched",
      };

      const adapted = adaptOcrReceipt(receiptWithoutOcr);

      expect(adapted.ocrConfidence).toBeUndefined();
      expect(adapted.matchConfidence).toBeUndefined();
    });

    it("should correctly map confidence scores to levels", () => {
      const testCases = [
        { score: 0.9, expected: "high" },
        { score: 0.75, expected: "medium" },
        { score: 0.5, expected: "low" },
        { score: 0.3, expected: "none" },
      ];

      testCases.forEach(({ score, expected }) => {
        const receipt: Receipt = {
          ...mockOcrReceipt,
          ocrData: {
            rawText: "test",
            merchantConfidence: score,
            totalConfidence: score,
            dateConfidence: score,
          },
        };

        const adapted = adaptOcrReceipt(receipt);
        expect(adapted.ocrConfidence?.merchant).toBe(expected);
        expect(adapted.ocrConfidence?.total).toBe(expected);
        expect(adapted.ocrConfidence?.date).toBe(expected);
      });
    });

    it("should preserve transactionId as suggestedTransactionId", () => {
      const receiptWithTxn: Receipt = {
        ...mockOcrReceipt,
        transactionId: "txn-456",
      };

      const adapted = adaptOcrReceipt(receiptWithTxn);
      expect(adapted.suggestedTransactionId).toBe("txn-456");
    });
  });

  describe("useUnifiedReceipts hook", () => {
    it("should combine Sentinel and OCR receipts", () => {
      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [mockSentinelReceipt],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        receipts: [mockOcrReceipt],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.allReceipts).toHaveLength(2);
      expect(result.current.allReceipts[0].source).toBe("ocr"); // Newer date
      expect(result.current.allReceipts[1].source).toBe("sentinel");
    });

    it("should sort receipts by date (newest first)", () => {
      const olderSentinel: SentinelReceipt = {
        ...mockSentinelReceipt,
        id: "sentinel-old",
        date: "2026-01-15T10:00:00Z",
      };

      const newerOcr: Receipt = {
        ...mockOcrReceipt,
        id: "ocr-new",
        date: "2026-01-25T14:00:00Z",
      };

      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [olderSentinel],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        receipts: [newerOcr],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.allReceipts[0].id).toBe("ocr-new");
      expect(result.current.allReceipts[1].id).toBe("sentinel-old");
    });

    it("should filter pending receipts correctly", () => {
      const matchedReceipt: Receipt = {
        ...mockOcrReceipt,
        id: "ocr-matched",
        status: "matched",
      };

      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [mockSentinelReceipt], // pending
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        receipts: [mockOcrReceipt, matchedReceipt], // 1 pending, 1 matched
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.pendingReceipts).toHaveLength(2);
      expect(result.current.pendingReceipts.every((r) => r.status === "pending")).toBe(true);
    });

    it("should filter by source correctly", () => {
      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [mockSentinelReceipt],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        receipts: [mockOcrReceipt],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.sentinelReceipts).toHaveLength(1);
      expect(result.current.sentinelReceipts[0].source).toBe("sentinel");

      expect(result.current.ocrReceipts).toHaveLength(1);
      expect(result.current.ocrReceipts[0].source).toBe("ocr");
    });

    it("should aggregate loading states", () => {
      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [],
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        allReceipts: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it("should aggregate error states", () => {
      const mockError = new Error("Sentinel fetch failed");

      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [],
        isLoading: false,
        isError: true,
        error: mockError,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        allReceipts: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    it("should handle empty data from both sources", () => {
      vi.mocked(useSentinelReceipts).mockReturnValue({
        receipts: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      vi.mocked(useReceipts).mockReturnValue({
        allReceipts: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { result } = renderHook(() => useUnifiedReceipts(), { wrapper });

      expect(result.current.allReceipts).toHaveLength(0);
      expect(result.current.pendingReceipts).toHaveLength(0);
      expect(result.current.sentinelReceipts).toHaveLength(0);
      expect(result.current.ocrReceipts).toHaveLength(0);
    });
  });
});
