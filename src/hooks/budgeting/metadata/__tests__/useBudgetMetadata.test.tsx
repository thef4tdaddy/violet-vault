import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useBudgetMetadata } from "../useBudgetMetadata";
import { useBudgetMetadataQuery } from "../useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "../useBudgetMetadataMutation";
import { useUnassignedCash } from "../useUnassignedCash";
import { useActualBalance } from "../useActualBalance";
import { useBudgetMetadataUtils } from "../useBudgetMetadataUtils";

// Mock all dependent hooks
vi.mock("../useBudgetMetadataQuery");
vi.mock("../useBudgetMetadataMutation");
vi.mock("../useUnassignedCash");
vi.mock("../useActualBalance");
vi.mock("../useBudgetMetadataUtils");

describe("useBudgetMetadata", () => {
  // Mock functions and data
  const mockRefetch = vi.fn();
  const mockUpdateMetadata = vi.fn();
  const mockUpdateUnassignedCash = vi.fn();
  const mockUpdateActualBalance = vi.fn();
  const mockSetBiweeklyAllocation = vi.fn();
  const mockGetBalanceDifference = vi.fn();
  const mockShouldConfirmChange = vi.fn();
  const mockFormatBalance = vi.fn();
  const mockValidateBalanceInput = vi.fn();

  const mockMetadata = {
    id: "metadata",
    unassignedCash: 1000,
    actualBalance: 5000,
    isActualBalanceManual: true,
    biweeklyAllocation: 2000,
    supplementalAccounts: [{ id: "acc1", name: "Savings" }],
    lastModified: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks for all hooks
    (useBudgetMetadataQuery as Mock).mockReturnValue({
      metadata: mockMetadata,
      unassignedCash: 1000,
      actualBalance: 5000,
      isActualBalanceManual: true,
      biweeklyAllocation: 2000,
      supplementalAccounts: [{ id: "acc1", name: "Savings" }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useBudgetMetadataMutation as Mock).mockReturnValue({
      updateMetadata: mockUpdateMetadata,
      isUpdating: false,
    });

    (useUnassignedCash as Mock).mockReturnValue({
      updateUnassignedCash: mockUpdateUnassignedCash,
    });

    (useActualBalance as Mock).mockReturnValue({
      updateActualBalance: mockUpdateActualBalance,
    });

    (useBudgetMetadataUtils as Mock).mockReturnValue({
      setBiweeklyAllocation: mockSetBiweeklyAllocation,
      getBalanceDifference: mockGetBalanceDifference,
      shouldConfirmChange: mockShouldConfirmChange,
      formatBalance: mockFormatBalance,
      validateBalanceInput: mockValidateBalanceInput,
    });
  });

  describe("State Properties", () => {
    it("should return metadata from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.metadata).toEqual(mockMetadata);
    });

    it("should return unassignedCash from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.unassignedCash).toBe(1000);
    });

    it("should return actualBalance from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.actualBalance).toBe(5000);
    });

    it("should return isActualBalanceManual from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.isActualBalanceManual).toBe(true);
    });

    it("should return biweeklyAllocation from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.biweeklyAllocation).toBe(2000);
    });

    it("should return supplementalAccounts from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.supplementalAccounts).toEqual([{ id: "acc1", name: "Savings" }]);
    });
  });

  describe("Loading States", () => {
    it("should return isLoading state from useBudgetMetadataQuery", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: mockMetadata,
        unassignedCash: 1000,
        actualBalance: 5000,
        isActualBalanceManual: true,
        biweeklyAllocation: 2000,
        supplementalAccounts: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.isLoading).toBe(true);
    });

    it("should return error state from useBudgetMetadataQuery", () => {
      const mockError = new Error("Failed to load");
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: mockMetadata,
        unassignedCash: 1000,
        actualBalance: 5000,
        isActualBalanceManual: true,
        biweeklyAllocation: 2000,
        supplementalAccounts: [],
        isLoading: false,
        error: mockError,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.error).toBe(mockError);
    });

    it("should return isUpdating state from useBudgetMetadataMutation", () => {
      (useBudgetMetadataMutation as Mock).mockReturnValue({
        updateMetadata: mockUpdateMetadata,
        isUpdating: true,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.isUpdating).toBe(true);
    });
  });

  describe("Action Functions", () => {
    it("should provide updateUnassignedCash function from useUnassignedCash", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.updateUnassignedCash).toBe(mockUpdateUnassignedCash);
    });

    it("should provide updateActualBalance function from useActualBalance", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.updateActualBalance).toBe(mockUpdateActualBalance);
    });

    it("should provide setBiweeklyAllocation function from useBudgetMetadataUtils", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.setBiweeklyAllocation).toBe(mockSetBiweeklyAllocation);
    });

    it("should provide updateMetadata function from useBudgetMetadataMutation", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.updateMetadata).toBe(mockUpdateMetadata);
    });

    it("should provide refetch function from useBudgetMetadataQuery", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });

  describe("Utility Functions", () => {
    it("should provide getBalanceDifference function from useBudgetMetadataUtils", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.getBalanceDifference).toBe(mockGetBalanceDifference);
    });

    it("should provide shouldConfirmChange function from useBudgetMetadataUtils", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.shouldConfirmChange).toBe(mockShouldConfirmChange);
    });

    it("should provide formatBalance function from useBudgetMetadataUtils", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.formatBalance).toBe(mockFormatBalance);
    });

    it("should provide validateBalanceInput function from useBudgetMetadataUtils", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.validateBalanceInput).toBe(mockValidateBalanceInput);
    });
  });

  describe("Hook Integration", () => {
    it("should call all dependent hooks once", () => {
      renderHook(() => useBudgetMetadata());

      expect(useBudgetMetadataQuery).toHaveBeenCalledTimes(1);
      expect(useBudgetMetadataMutation).toHaveBeenCalledTimes(1);
      expect(useUnassignedCash).toHaveBeenCalledTimes(1);
      expect(useActualBalance).toHaveBeenCalledTimes(1);
      expect(useBudgetMetadataUtils).toHaveBeenCalledTimes(1);
    });

    it("should maintain stable reference for action functions across re-renders", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadata());

      const firstRender = {
        updateUnassignedCash: result.current.updateUnassignedCash,
        updateActualBalance: result.current.updateActualBalance,
        setBiweeklyAllocation: result.current.setBiweeklyAllocation,
        updateMetadata: result.current.updateMetadata,
        refetch: result.current.refetch,
      };

      rerender();

      expect(result.current.updateUnassignedCash).toBe(firstRender.updateUnassignedCash);
      expect(result.current.updateActualBalance).toBe(firstRender.updateActualBalance);
      expect(result.current.setBiweeklyAllocation).toBe(firstRender.setBiweeklyAllocation);
      expect(result.current.updateMetadata).toBe(firstRender.updateMetadata);
      expect(result.current.refetch).toBe(firstRender.refetch);
    });

    it("should maintain stable reference for utility functions across re-renders", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadata());

      const firstRender = {
        getBalanceDifference: result.current.getBalanceDifference,
        shouldConfirmChange: result.current.shouldConfirmChange,
        formatBalance: result.current.formatBalance,
        validateBalanceInput: result.current.validateBalanceInput,
      };

      rerender();

      expect(result.current.getBalanceDifference).toBe(firstRender.getBalanceDifference);
      expect(result.current.shouldConfirmChange).toBe(firstRender.shouldConfirmChange);
      expect(result.current.formatBalance).toBe(firstRender.formatBalance);
      expect(result.current.validateBalanceInput).toBe(firstRender.validateBalanceInput);
    });

    it("should update state values when underlying hooks return different data", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadata());

      // Initial state
      expect(result.current.unassignedCash).toBe(1000);
      expect(result.current.actualBalance).toBe(5000);

      // Update the mock to return different values
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: { ...mockMetadata, unassignedCash: 2000, actualBalance: 6000 },
        unassignedCash: 2000,
        actualBalance: 6000,
        isActualBalanceManual: true,
        biweeklyAllocation: 2000,
        supplementalAccounts: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender();

      // Verify state updates
      expect(result.current.unassignedCash).toBe(2000);
      expect(result.current.actualBalance).toBe(6000);
    });

    it("should update loading states when underlying hooks change state", () => {
      const { result, rerender } = renderHook(() => useBudgetMetadata());

      // Initial state - not loading
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isUpdating).toBe(false);

      // Update mocks to simulate loading state
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: mockMetadata,
        unassignedCash: 1000,
        actualBalance: 5000,
        isActualBalanceManual: true,
        biweeklyAllocation: 2000,
        supplementalAccounts: [],
        isLoading: true,
        error: null,
        refetch: mockRefetch,
      });

      (useBudgetMetadataMutation as Mock).mockReturnValue({
        updateMetadata: mockUpdateMetadata,
        isUpdating: true,
      });

      rerender();

      // Verify loading states update
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isUpdating).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing metadata gracefully", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: {},
        unassignedCash: 0,
        actualBalance: 0,
        isActualBalanceManual: false,
        biweeklyAllocation: 0,
        supplementalAccounts: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.metadata).toEqual({});
      expect(result.current.unassignedCash).toBe(0);
      expect(result.current.actualBalance).toBe(0);
    });

    it("should handle null supplementalAccounts", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: mockMetadata,
        unassignedCash: 1000,
        actualBalance: 5000,
        isActualBalanceManual: true,
        biweeklyAllocation: 2000,
        supplementalAccounts: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.supplementalAccounts).toBeNull();
    });

    it("should handle undefined values in metadata", () => {
      (useBudgetMetadataQuery as Mock).mockReturnValue({
        metadata: {
          id: "metadata",
          lastModified: Date.now(),
        },
        unassignedCash: undefined,
        actualBalance: undefined,
        isActualBalanceManual: undefined,
        biweeklyAllocation: undefined,
        supplementalAccounts: undefined,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useBudgetMetadata());

      expect(result.current.unassignedCash).toBeUndefined();
      expect(result.current.actualBalance).toBeUndefined();
      expect(result.current.isActualBalanceManual).toBeUndefined();
    });
  });

  describe("Data Flow Pattern", () => {
    it("should follow the proper data flow: TanStack Query ↔ Dexie", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      // Verify that the hook integrates properly with TanStack Query pattern
      expect(result.current.metadata).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.refetch).toBeDefined();
    });

    it("should provide both read and write operations", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      // Read operations
      expect(result.current.unassignedCash).toBeDefined();
      expect(result.current.actualBalance).toBeDefined();
      expect(result.current.biweeklyAllocation).toBeDefined();

      // Write operations
      expect(result.current.updateUnassignedCash).toBeDefined();
      expect(result.current.updateActualBalance).toBeDefined();
      expect(result.current.setBiweeklyAllocation).toBeDefined();
      expect(result.current.updateMetadata).toBeDefined();
    });
  });

  describe("Return Value Structure", () => {
    it("should return all expected properties", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      // State
      expect(result.current).toHaveProperty("metadata");
      expect(result.current).toHaveProperty("unassignedCash");
      expect(result.current).toHaveProperty("actualBalance");
      expect(result.current).toHaveProperty("isActualBalanceManual");
      expect(result.current).toHaveProperty("biweeklyAllocation");
      expect(result.current).toHaveProperty("supplementalAccounts");

      // Loading states
      expect(result.current).toHaveProperty("isLoading");
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("isUpdating");

      // Actions
      expect(result.current).toHaveProperty("updateUnassignedCash");
      expect(result.current).toHaveProperty("updateActualBalance");
      expect(result.current).toHaveProperty("setBiweeklyAllocation");
      expect(result.current).toHaveProperty("updateMetadata");
      expect(result.current).toHaveProperty("refetch");

      // Utility functions
      expect(result.current).toHaveProperty("getBalanceDifference");
      expect(result.current).toHaveProperty("shouldConfirmChange");
      expect(result.current).toHaveProperty("formatBalance");
      expect(result.current).toHaveProperty("validateBalanceInput");
    });

    it("should have correct function types for all methods", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      expect(typeof result.current.updateUnassignedCash).toBe("function");
      expect(typeof result.current.updateActualBalance).toBe("function");
      expect(typeof result.current.setBiweeklyAllocation).toBe("function");
      expect(typeof result.current.updateMetadata).toBe("function");
      expect(typeof result.current.refetch).toBe("function");
      expect(typeof result.current.getBalanceDifference).toBe("function");
      expect(typeof result.current.shouldConfirmChange).toBe("function");
      expect(typeof result.current.formatBalance).toBe("function");
      expect(typeof result.current.validateBalanceInput).toBe("function");
    });
  });

  describe("Hook Composition", () => {
    it("should compose all five specialized hooks correctly", () => {
      renderHook(() => useBudgetMetadata());

      // Verify all hooks are called
      expect(useBudgetMetadataQuery).toHaveBeenCalled();
      expect(useBudgetMetadataMutation).toHaveBeenCalled();
      expect(useUnassignedCash).toHaveBeenCalled();
      expect(useActualBalance).toHaveBeenCalled();
      expect(useBudgetMetadataUtils).toHaveBeenCalled();
    });

    it("should aggregate state from multiple hooks", () => {
      const { result } = renderHook(() => useBudgetMetadata());

      // State from useBudgetMetadataQuery
      expect(result.current.metadata).toBe(mockMetadata);
      expect(result.current.isLoading).toBe(false);

      // State from useBudgetMetadataMutation
      expect(result.current.isUpdating).toBe(false);

      // Functions from useUnassignedCash
      expect(result.current.updateUnassignedCash).toBe(mockUpdateUnassignedCash);

      // Functions from useActualBalance
      expect(result.current.updateActualBalance).toBe(mockUpdateActualBalance);

      // Functions from useBudgetMetadataUtils
      expect(result.current.setBiweeklyAllocation).toBe(mockSetBiweeklyAllocation);
    });
  });
});
