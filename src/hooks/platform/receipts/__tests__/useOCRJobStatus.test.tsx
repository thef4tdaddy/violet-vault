/**
 */
import { renderHook, waitFor, act } from "@/test/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOCRJobStatus } from "../useOCRJobStatus";

// Mock the OCR status service
const { mockFetchOCRStatus } = vi.hoisted(() => ({
  mockFetchOCRStatus: vi.fn(),
}));

vi.mock("@/services/ocr/ocrStatusService", () => ({
  fetchOCRStatus: mockFetchOCRStatus,
}));

describe("useOCRJobStatus", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
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
    await waitFor(() => expect(result.current.status).toBe("processing"), { timeout: 5000 });
    expect(result.current.progress).toBe(20);

    // Wait for next poll (2s real time)
    await waitFor(() => expect(result.current.progress).toBe(50), { timeout: 5000 });

    // Wait for completion
    await waitFor(() => expect(result.current.status).toBe("completed"), { timeout: 5000 });
  });
});
