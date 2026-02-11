import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import DebtSummaryWidget from "./DebtSummaryWidget";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

describe("DebtSummaryWidget", () => {
  const defaultProps = {
    onNavigateToDebts: vi.fn(),
  };

  // Mock debt management hook
  vi.mock("@/hooks/budgeting/envelopes/liabilities/useDebtManagement", () => ({
    useDebtManagement: vi.fn(() => ({
      debtStats: {
        totalDebt: 5000,
        activeDebtCount: 2,
        totalMonthlyPayments: 500,
        averageInterestRate: 15,
        totalInterestPaid: 100,
        totalDebtCount: 2,
      },
    })),
  }));

  it("should render correctly with debt information", () => {
    render(<DebtSummaryWidget {...defaultProps} />);

    expect(screen.getByText("Debt Summary")).toBeInTheDocument();
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
    expect(screen.getByText("2 active debts")).toBeInTheDocument();
  });

  it("should call onNavigateToDebts when 'Manage Active Debts' is clicked", () => {
    render(<DebtSummaryWidget {...defaultProps} />);

    const manageButton = screen.getByRole("button", { name: /manage active debts/i });
    fireEvent.click(manageButton);

    expect(defaultProps.onNavigateToDebts).toHaveBeenCalledTimes(1);
  });

  it("should render icons", () => {
    render(<DebtSummaryWidget {...defaultProps} />);
    // Should have both TrendingDown and Calendar icons (both mocked)
    const icons = screen.getAllByTestId("mock-icon");
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });
});
