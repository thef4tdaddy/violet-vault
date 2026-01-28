/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOCRJobStatus } from "../useOCRJobStatus";

// Mock the OCR status service
const mockFetchOCRStatus = vi.fn();
vi.mock("@/services/ocr/ocrStatusService", () => ({
  fetchOCRStatus: mockFetchOCRStatus,
}));

describe("useOCRJobStatus", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockFetchOCRStatus.mockResolvedValue({ status: "idle", progress: 0 });
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
    mockFetchOCRStatus
      .mockResolvedValueOnce({ status: "processing", progress: 20 })
      .mockResolvedValueOnce({ status: "processing", progress: 50 })
      .mockResolvedValueOnce({ status: "completed", progress: 100 });

    const { result } = renderHook(() => useOCRJobStatus("receipt-123"), { wrapper });

    // Initial fetch
    await waitFor(() => expect(result.current.status).toBe("processing"));
    expect(result.current.progress).toBe(20);

    // Fast-forward time to trigger next poll (2s)
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(result.current.progress).toBe(50));

    // Fast-forward again
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(result.current.status).toBe("completed"));
  });
});
