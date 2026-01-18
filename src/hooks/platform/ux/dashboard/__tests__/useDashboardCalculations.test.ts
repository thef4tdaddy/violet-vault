import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDashboardCalculations } from "../useDashboardCalculations";
import type { Envelope, SavingsGoal } from "../types";

describe("useDashboardCalculations", () => {
  const mockEnvelopes: Envelope[] = [
    {
      id: "1",
      name: "Env 1",
      currentBalance: "100.50",
      category: "Test",
      budgetAmount: 100,
      progress: 0,
      status: "active",
      icon: "test",
      color: "red",
      lastModified: "2023-01-01",
      createdAt: "2023-01-01",
    },
    {
      id: "2",
      name: "Env 2",
      currentBalance: "200.25",
      category: "Test",
      budgetAmount: 100,
      progress: 0,
      status: "active",
      icon: "test",
      color: "red",
      lastModified: "2023-01-01",
      createdAt: "2023-01-01",
    },
    {
      id: "3",
      name: "Env 3",
      currentBalance: "0",
      category: "Test",
      budgetAmount: 100,
      progress: 0,
      status: "active",
      icon: "test",
      color: "red",
      lastModified: "2023-01-01",
      createdAt: "2023-01-01",
    },
  ];

  const mockSavingsGoals: SavingsGoal[] = [
    {
      id: "1",
      name: "Goal 1",
      currentAmount: "500.00",
      targetAmount: 1000,
      deadline: "2023-12-31",
      icon: "test",
      color: "blue",
      status: "active",
    },
    {
      id: "2",
      name: "Goal 2",
      currentAmount: "250.75",
      targetAmount: 500,
      deadline: "2023-12-31",
      icon: "test",
      color: "blue",
      status: "active",
    },
  ];

  it("should calculate totals correctly", () => {
    const { result } = renderHook(() =>
      useDashboardCalculations(mockEnvelopes, mockSavingsGoals, 150.0, 1200.0)
    );

    expect(result.current.totalEnvelopeBalance).toBe(300.75);
    expect(result.current.totalSavingsBalance).toBe(750.75);
    expect(result.current.safeUnassignedCash).toBe(150.0);
    expect(result.current.totalVirtualBalance).toBe(1201.5);
    expect(result.current.difference).toBe(-1.5);
    expect(result.current.isBalanced).toBe(false);
  });

  it("should handle balanced accounts", () => {
    // Total envelope = 300.75, total savings = 750.75
    // Total virtual = 300.75 + 750.75 + 149.5 = 1201
    // For balance: actualBalance should equal totalVirtualBalance
    const { result } = renderHook(() =>
      useDashboardCalculations(mockEnvelopes, mockSavingsGoals, 149.5, 1201)
    );

    expect(Math.abs(result.current.difference)).toBeLessThan(0.01);
    expect(result.current.isBalanced).toBe(true);
  });

  it("should handle NaN values safely", () => {
    const invalidEnvelopes = [
      { id: "1", currentBalance: "invalid" } as Envelope,
      { id: "2", currentBalance: null } as unknown as Envelope,
    ];

    const { result } = renderHook(() => useDashboardCalculations(invalidEnvelopes, [], NaN, 100));

    expect(result.current.totalEnvelopeBalance).toBe(0);
    expect(result.current.safeUnassignedCash).toBe(0);
    expect(result.current.totalVirtualBalance).toBe(0);
  });

  it("should handle empty arrays", () => {
    const { result } = renderHook(() => useDashboardCalculations([], [], 0, 0));

    expect(result.current.totalEnvelopeBalance).toBe(0);
    expect(result.current.totalSavingsBalance).toBe(0);
    expect(result.current.totalVirtualBalance).toBe(0);
    expect(result.current.isBalanced).toBe(true);
  });
});
