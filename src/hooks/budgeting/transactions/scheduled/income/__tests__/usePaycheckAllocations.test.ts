import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { usePaycheckAllocations } from "../usePaycheckAllocations";
import * as paycheckUtils from "@/utils/budgeting/paycheckUtils";

// Mock the utils
vi.mock("@/utils/budgeting/paycheckUtils", () => ({
  calculateEnvelopeAllocations: vi.fn(),
  validatePaycheckForm: vi.fn(),
  validateAllocations: vi.fn(),
  getUniquePayers: vi.fn(),
}));

describe("usePaycheckAllocations", () => {
  const mockEnvelopes = [
    { id: "env-1", name: "Rent", category: "housing" },
    { id: "env-2", name: "Groceries", category: "food" },
  ] as any;

  it("should return empty allocations when amount is 0", () => {
    const { result } = renderHook(() => usePaycheckAllocations(0, "allocate", mockEnvelopes));

    expect(result.current.currentAllocations).toEqual({
      allocations: [],
      totalAllocated: 0,
      remainingAmount: 0,
      allocationRate: 0,
    });
    expect(result.current.hasAllocations).toBe(false);
  });

  it("should call calculateEnvelopeAllocations when amount is > 0", () => {
    const mockAllocationResult = {
      allocations: [{ envelopeId: "env-1", amount: 100 }],
      totalAllocated: 100,
      remainingAmount: 900,
      allocationRate: 0.1,
    };
    (paycheckUtils.calculateEnvelopeAllocations as any).mockReturnValue(mockAllocationResult);

    const { result } = renderHook(() => usePaycheckAllocations(1000, "allocate", mockEnvelopes));

    expect(paycheckUtils.calculateEnvelopeAllocations).toHaveBeenCalledWith(
      1000,
      mockEnvelopes,
      "allocate"
    );
    expect(result.current.currentAllocations).toEqual(mockAllocationResult);
    expect(result.current.hasAllocations).toBe(true);
  });

  it("should handle string amount values gracefully", () => {
    (paycheckUtils.calculateEnvelopeAllocations as any).mockReturnValue({
      allocations: [],
      totalAllocated: 0,
      remainingAmount: 0,
      allocationRate: 0,
    });

    renderHook(() => usePaycheckAllocations("1200.50", "allocate", mockEnvelopes));

    expect(paycheckUtils.calculateEnvelopeAllocations).toHaveBeenCalledWith(
      1200.5,
      mockEnvelopes,
      "allocate"
    );
  });
});
