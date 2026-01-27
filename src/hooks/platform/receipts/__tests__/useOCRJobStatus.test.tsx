/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOCRJobStatus } from "../useOCRJobStatus";

describe("useOCRJobStatus", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("should return idle status initially or when receiptId is missing", () => {
    const { result } = renderHook(() => useOCRJobStatus(""), { wrapper });
    expect(result.current.status).toBe("idle");
  });

  it("should poll when status is processing", async () => {
    vi.mock("@/services/ocr/ocrStatusService", () => ({
      fetchOCRStatus: vi
        .fn()
        .mockResolvedValueOnce({ status: "processing", progress: 20 })
        .mockResolvedValueOnce({ status: "processing", progress: 50 })
        .mockResolvedValueOnce({ status: "completed", progress: 100 }),
    }));

    const { result } = renderHook(() => useOCRJobStatus("receipt-123"), { wrapper });

    // Initial fetch
    await waitFor(() => expect(result.current.status).toBe("processing"), { timeout: 1000 });
    expect(result.current.progress).toBe(20);

    // Fast-forward time to trigger next poll (2s)
    await vi.advanceTimersByTimeAsync(2000);
    await waitFor(() => expect(result.current.progress).toBe(50));

    // Fast-forward again
    await vi.advanceTimersByTimeAsync(2000);
    await waitFor(() => expect(result.current.status).toBe("completed"));
  });
});
