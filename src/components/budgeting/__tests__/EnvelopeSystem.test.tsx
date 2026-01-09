import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useEnvelopeSystem from "../EnvelopeSystem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import useBills from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";

// Mock dependencies
vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn((selector) => {
    const mockState = {
      unassignedCash: 0,
      setEnvelopes: vi.fn(),
      setBiweeklyAllocation: vi.fn(),
      setUnassignedCash: vi.fn(),
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [],
    addEnvelope: vi.fn(),
    updateEnvelope: vi.fn(),
    deleteEnvelope: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  default: vi.fn(() => ({
    bills: [],
    isLoading: false,
  })),
}));

vi.mock("@/utils/budgeting", () => ({
  calculateBiweeklyNeeds: vi.fn(() => 0),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useEnvelopeSystem", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  describe("Hook Initialization", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useEnvelopeSystem(), {
        wrapper: createWrapper(),
      });

      expect(result.current.envelopes).toEqual([]);
      expect(result.current.bills).toEqual([]);
      expect(result.current.unassignedCash).toBe(0);
      expect(result.current.isLoading).toBe(false);
    });

    it("should provide envelope operations", () => {
      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      expect(typeof result.current.createEnvelope).toBe("function");
      expect(typeof result.current.updateEnvelope).toBe("function");
      expect(typeof result.current.deleteEnvelope).toBe("function");
    });

    it("should provide utility functions", () => {
      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      expect(typeof result.current.updateBiweeklyAllocations).toBe("function");
      expect(typeof result.current.setUnassignedCash).toBe("function");
    });
  });

  describe("Envelope Operations", () => {
    it("should create envelope successfully", async () => {
      const mockAddEnvelope = vi.fn().mockResolvedValue(undefined);
      const { useEnvelopes } = await import("@/hooks/budgeting/envelopes/useEnvelopes");
      (useEnvelopes as ReturnType<typeof vi.fn>).mockReturnValue({
        envelopes: [],
        addEnvelope: mockAddEnvelope,
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      const envelopeData = { name: "Test", monthlyAmount: 100 };
      const response = await result.current.createEnvelope(envelopeData);

      expect(response.success).toBe(true);
      expect(mockAddEnvelope).toHaveBeenCalledWith(envelopeData);
    });

    it("should handle create envelope error", async () => {
      const mockAddEnvelope = vi.fn().mockRejectedValue(new Error("Create failed"));
      const { useEnvelopes } = await import("@/hooks/budgeting/envelopes/useEnvelopes");
      (useEnvelopes as ReturnType<typeof vi.fn>).mockReturnValue({
        envelopes: [],
        addEnvelope: mockAddEnvelope,
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      const envelopeData = { name: "Test", monthlyAmount: 100 };
      const response = await result.current.createEnvelope(envelopeData);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Create failed");
    });

    it("should update envelope successfully", async () => {
      const mockUpdateEnvelope = vi.fn().mockResolvedValue(undefined);
      const { useEnvelopes } = await import("@/hooks/budgeting/envelopes/useEnvelopes");
      (useEnvelopes as ReturnType<typeof vi.fn>).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        updateEnvelope: mockUpdateEnvelope,
        deleteEnvelope: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      const response = await result.current.updateEnvelope("env1", { name: "Updated" });

      expect(response.success).toBe(true);
      expect(mockUpdateEnvelope).toHaveBeenCalledWith("env1", { name: "Updated" });
    });

    it("should delete envelope successfully", async () => {
      const mockDeleteEnvelope = vi.fn().mockResolvedValue(undefined);
      const { useEnvelopes } = await import("@/hooks/budgeting/envelopes/useEnvelopes");
      (useEnvelopes as ReturnType<typeof vi.fn>).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: mockDeleteEnvelope,
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      const response = await result.current.deleteEnvelope("env1", false);

      expect(response.success).toBe(true);
      expect(mockDeleteEnvelope).toHaveBeenCalledWith({
        envelopeId: "env1",
        deleteBillsToo: false,
      });
    });
  });

  describe("Data Integration", () => {
    it("should integrate envelopes from useEnvelopes hook", () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 500 },
        { id: "2", name: "Gas", balance: 200 },
      ];

      vi.mocked(useEnvelopes).mockReturnValue({
        envelopes: mockEnvelopes,
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      expect(result.current.envelopes).toEqual(mockEnvelopes);
    });

    it("should integrate bills from useBills hook", () => {
      const mockBills = [
        { id: "1", name: "Rent", amount: 1000 },
        { id: "2", name: "Electric", amount: 100 },
      ];

      vi.mocked(useBills).mockReturnValue({
        bills: mockBills,
        isLoading: false,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      expect(result.current.bills).toEqual(mockBills);
    });

    it("should report loading state correctly", () => {
      vi.mocked(useEnvelopes).mockReturnValue({
        envelopes: [],
        addEnvelope: vi.fn(),
        updateEnvelope: vi.fn(),
        deleteEnvelope: vi.fn(),
        isLoading: true,
      });

      const { result } = renderHook(() => useEnvelopeSystem(), { wrapper: createWrapper() });

      expect(result.current.isLoading).toBe(true);
    });
  });
});
