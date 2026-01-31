/**
 * Tests for DebtStrategies Component
 * Part of Daily Targets for Test Coverage
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DebtStrategies from "../DebtStrategies";
import { useDebtStrategies } from "@/hooks/budgeting/envelopes/liabilities/useDebtStrategies";

// Mock the hook
vi.mock("@/hooks/budgeting/envelopes/liabilities/useDebtStrategies", () => ({
  useDebtStrategies: vi.fn(),
}));

// Mock the icon utility
vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => (props: any) => <div data-testid="mock-icon" {...props} />),
}));

describe("DebtStrategies", () => {
  const mockDebts = [
    {
      id: "debt-1",
      name: "Credit Card",
      type: "credit_card",
      status: "active",
      currentBalance: 5000,
      minimumPayment: 150,
      interestRate: 19.9,
    },
  ];

  const mockStrategyData = {
    avalancheStrategy: {
      name: "Debt Avalanche",
      description: "Pay off debts with highest interest rates first",
      debts: [
        {
          id: "debt-1",
          name: "Credit Card",
          priority: 1,
          interestRate: 19.9,
          currentBalance: 5000,
          minimumPayment: 150,
        },
      ],
      totalInterest: 1200,
      payoffTime: 24,
    },
    snowballStrategy: {
      name: "Debt Snowball",
      description: "Pay off debts with lowest balances first",
      debts: [
        {
          id: "debt-1",
          name: "Credit Card",
          priority: 1,
          interestRate: 19.9,
          currentBalance: 5000,
          minimumPayment: 150,
        },
      ],
      totalInterest: 1400,
      payoffTime: 26,
    },
    recommendation: { strategy: "avalanche" },
    paymentImpact: [
      {
        extraPayment: 100,
        avalanche: { timeSavings: 5, interestSavings: 300 },
        snowball: { timeSavings: 4, interestSavings: 250 },
      },
    ],
    insights: [
      { type: "info", title: "Good Job", message: "You are making progress." },
      { type: "warning", title: "High Interest", message: "Consider consolidating." },
    ],
    recommendationText: "We recommend the Avalanche strategy to save the most interest.",
    hasDebts: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'No Active Debts!' when hasDebts is false", () => {
    vi.mocked(useDebtStrategies).mockReturnValue({
      ...mockStrategyData,
      hasDebts: false,
    } as any);

    render(<DebtStrategies debts={[]} />);

    expect(screen.getByText("No Active Debts!")).not.toBeNull();
    expect(screen.getByText(/Congratulations! You don't have any active debts/i)).not.toBeNull();
  });

  it("renders strategies and recommendation when hasDebts is true", () => {
    vi.mocked(useDebtStrategies).mockReturnValue(mockStrategyData as any);

    render(<DebtStrategies debts={mockDebts as any} />);

    expect(screen.getByText("Debt Payoff Strategies")).not.toBeNull();
    expect(screen.getByText("Debt Avalanche")).not.toBeNull();
    expect(screen.getByText("Debt Snowball")).not.toBeNull();
    expect(screen.getByText("Our Recommendation")).not.toBeNull();
    expect(screen.getByText(mockStrategyData.recommendationText)).not.toBeNull();
  });

  it("renders insights with correct types and icons", () => {
    vi.mocked(useDebtStrategies).mockReturnValue(mockStrategyData as any);

    render(<DebtStrategies debts={mockDebts as any} />);

    expect(screen.getByText("Good Job")).not.toBeNull();
    expect(screen.getByText("High Interest")).not.toBeNull();
    expect(screen.getByText("You are making progress.")).not.toBeNull();
    expect(screen.getByText("Consider consolidating.")).not.toBeNull();
  });

  it("renders payment impact table", () => {
    vi.mocked(useDebtStrategies).mockReturnValue(mockStrategyData as any);

    render(<DebtStrategies debts={mockDebts as any} />);

    expect(screen.getByText("Extra Payment Impact")).not.toBeNull();
    expect(screen.getByText(/\+\$100/)).not.toBeNull();
    expect(screen.getByText("5 months")).not.toBeNull();
    expect(screen.getByText("$300.00")).not.toBeNull();
  });

  it("handles empty insights or recommendation gracefully", () => {
    vi.mocked(useDebtStrategies).mockReturnValue({
      ...mockStrategyData,
      insights: [],
      recommendation: null,
    } as any);

    render(<DebtStrategies debts={mockDebts as any} />);

    expect(screen.queryByText("Our Recommendation")).toBeNull();
    expect(screen.queryByText("Good Job")).toBeNull();
  });
});
