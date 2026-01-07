import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactionSplitterUI } from "../useTransactionSplitterUI";

describe("useTransactionSplitterUI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const { result } = renderHook(() => useTransactionSplitterUI());

      expect(result.current.splitAllocations).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
      expect(typeof result.current.setSplitAllocations).toBe("function");
      expect(typeof result.current.setIsProcessing).toBe("function");
      expect(typeof result.current.resetState).toBe("function");
    });
  });

  describe("resetState", () => {
    it("should reset state to initial values", () => {
      const { result } = renderHook(() => useTransactionSplitterUI());

      // Modify state first
      act(() => {
        result.current.setSplitAllocations([{ id: 1, amount: 100 } as any]);
        result.current.setIsProcessing(true);
      });

      // Reset
      act(() => {
        result.current.resetState();
      });

      expect(result.current.splitAllocations).toEqual([]);
      expect(result.current.isProcessing).toBe(false);
    });
  });
});
