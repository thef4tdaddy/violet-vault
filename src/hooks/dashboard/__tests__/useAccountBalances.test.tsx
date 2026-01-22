import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccountBalances } from "../useAccountBalances";
import { useActualBalance } from "@/hooks/budgeting/metadata/useActualBalance";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useUnassignedCash";

// Mock the hooks
vi.mock("@/hooks/budgeting/metadata/useActualBalance");
vi.mock("@/hooks/budgeting/metadata/useUnassignedCash");

const mockUseActualBalance = vi.mocked(useActualBalance);
const mockUseUnassignedCash = vi.mocked(useUnassignedCash);

describe("useAccountBalances", () => {
  let queryClient: QueryClient;

  // Wrapper component for React Query
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe("Basic functionality", () => {
    it("should return account balances with default data", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 100,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.checking.balance).toBe(1000);
      expect(result.current.accountBalances.checking.isManual).toBe(false);
      expect(result.current.accountBalances.unassigned.amount).toBe(100);
      expect(result.current.accountBalances.unassigned.isNegative).toBe(false);
      expect(result.current.accountBalances.unassigned.isHigh).toBe(false);
    });

    it("should detect negative unassigned cash", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: -50,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.unassigned.isNegative).toBe(true);
    });

    it("should detect high unassigned cash (> $500)", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 750,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.unassigned.isHigh).toBe(true);
    });
  });

  describe("Loading states", () => {
    it("should aggregate loading states correctly", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: true,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 100,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it("should show loading when unassigned cash is loading", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 100,
        isLoading: true,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("Error states", () => {
    it("should propagate balance errors", () => {
      const balanceError = new Error("Balance fetch failed");

      mockUseActualBalance.mockReturnValue({
        actualBalance: 0,
        isActualBalanceManual: false,
        isLoading: false,
        error: balanceError,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 0,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.error).toBe(balanceError);
    });

    it("should propagate unassigned cash errors", () => {
      const unassignedError = new Error("Unassigned cash fetch failed");

      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 0,
        isLoading: false,
        error: unassignedError,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.error).toBe(unassignedError);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero balances", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 0,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 0,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.checking.balance).toBe(0);
      expect(result.current.accountBalances.unassigned.amount).toBe(0);
      expect(result.current.accountBalances.unassigned.isNegative).toBe(false);
    });

    it("should handle exactly $500 unassigned (not high)", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 1000,
        isActualBalanceManual: false,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 500,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.unassigned.isHigh).toBe(false);
    });

    it("should handle manual balance entry correctly", () => {
      mockUseActualBalance.mockReturnValue({
        actualBalance: 2500,
        isActualBalanceManual: true,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateActualBalance: vi.fn(),
        refetch: vi.fn(),
        getBalanceDifference: vi.fn(),
        shouldConfirmChange: vi.fn(),
        formatBalance: vi.fn(),
        validateBalanceInput: vi.fn(),
      });

      mockUseUnassignedCash.mockReturnValue({
        unassignedCash: 100,
        isLoading: false,
        error: null,
        isUpdating: false,
        updateUnassignedCash: vi.fn(),
        refetch: vi.fn(),
      });

      const { result } = renderHook(() => useAccountBalances(), { wrapper });

      expect(result.current.accountBalances.checking.isManual).toBe(true);
    });
  });
});
