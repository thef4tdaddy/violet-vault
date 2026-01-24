import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFinancialInsights } from "../useFinancialInsights";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useBillsQuery } from "@/hooks/budgeting/transactions/scheduled/expenses/useBills";
import { useUnassignedCash } from "@/hooks/budgeting/metadata/useUnassignedCash";

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(),
}));

vi.mock("@/hooks/budgeting/transactions/scheduled/expenses/useBills", () => ({
  useBillsQuery: vi.fn(),
}));

vi.mock("@/hooks/budgeting/metadata/useUnassignedCash", () => ({
  useUnassignedCash: vi.fn(),
}));

describe("useFinancialInsights Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects unallocated cash", () => {
    (useEnvelopes as any).mockReturnValue({
      envelopes: [],
      isLoading: false,
    });
    (useUnassignedCash as any).mockReturnValue({
      unassignedCash: 100,
      isLoading: false,
    });
    (useBillsQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { result } = renderHook(() => useFinancialInsights());
    const unallocatedInsight = result.current.insights.find((i) => i.title === "Unallocated Funds");
    expect(unallocatedInsight).toBeDefined();
    expect(unallocatedInsight?.description).toContain("$100.00");
  });

  it("detects bill risk when bills exceed unallocated cash", () => {
    (useEnvelopes as any).mockReturnValue({
      envelopes: [],
      isLoading: false,
    });
    (useUnassignedCash as any).mockReturnValue({
      unassignedCash: 50,
      isLoading: false,
    });
    (useBillsQuery as any).mockReturnValue({
      data: [{ amount: -100 }],
      isLoading: false,
    });

    const { result } = renderHook(() => useFinancialInsights());
    const billAlert = result.current.insights.find((i) => i.title === "Upcoming Bill Alert");
    expect(billAlert).toBeDefined();
  });

  it("detects savings progress", () => {
    (useEnvelopes as any).mockReturnValue({
      envelopes: [{ type: "goal" }],
      isLoading: false,
    });
    (useUnassignedCash as any).mockReturnValue({
      unassignedCash: 0,
      isLoading: false,
    });
    (useBillsQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { result } = renderHook(() => useFinancialInsights());
    expect(result.current.insights.some((i) => i.title === "Savings Progress")).toBe(true);
  });
});
