import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDashboardHelpers } from "../useDashboardHelpers";
import type { Transaction } from "../types";

describe("useDashboardHelpers", () => {
  it("should get recent transactions with limit", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    const transactions = [
      { id: "1", description: "Trans 1" } as Transaction,
      { id: "2", description: "Trans 2" } as Transaction,
      { id: "3", description: "Trans 3" } as Transaction,
      { id: "4", description: "Trans 4" } as Transaction,
    ];

    const recent = result.current.getRecentTransactions(transactions, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0]).toBe(transactions[0]);
    expect(recent[1]).toBe(transactions[1]);
  });

  it("should format currency correctly", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.formatCurrency(100.123)).toBe("$100.12");
    expect(result.current.formatCurrency(-50.567)).toBe("$50.57");
    expect(result.current.formatCurrency(0)).toBe("$0.00");
    expect(result.current.formatCurrency(null as unknown as number)).toBe("$0.00");
  });

  it("should return correct transaction icons", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getTransactionIcon(100)).toBe("TrendingUp");
    expect(result.current.getTransactionIcon(-50)).toBe("TrendingDown");
    expect(result.current.getTransactionIcon(0)).toBe("TrendingDown");
  });

  it("should return correct transaction colors", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getTransactionColor(100)).toBe("text-green-600");
    expect(result.current.getTransactionColor(-50)).toBe("text-red-600");
    expect(result.current.getTransactionColor(0)).toBe("text-red-600");
  });

  it("should return correct balance status colors", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getBalanceStatusColor(true, 0)).toBe("bg-green-50");
    expect(result.current.getBalanceStatusColor(false, 15)).toBe("bg-red-50");
    expect(result.current.getBalanceStatusColor(false, 5)).toBe("bg-yellow-50");
  });

  it("should return correct balance status icons", () => {
    const { result } = renderHook(() => useDashboardHelpers());

    expect(result.current.getBalanceStatusIcon(true, 0)).toBe("CheckCircle");
    expect(result.current.getBalanceStatusIcon(false, 15)).toBe("AlertTriangle");
    expect(result.current.getBalanceStatusIcon(false, 5)).toBe("AlertTriangle");
  });
});
