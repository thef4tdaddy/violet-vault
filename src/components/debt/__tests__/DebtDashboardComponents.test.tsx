import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { DashboardHeader } from "../DebtDashboardComponents";

// Mock the getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <svg data-testid="mock-icon" />),
}));

// Mock components used within sections
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
  StylizedButtonText: ({ children }: any) => <span>{children}</span>,
}));

describe("DebtDashboardHeader", () => {
  const defaultProps = {
    onAddDebt: vi.fn(),
    debtStats: {
      activeDebtCount: 2,
      totalDebt: 5000,
      totalMonthlyPayments: 500,
      averageInterestRate: 15,
      totalInterestPaid: 100,
      totalDebtCount: 2,
      overdueDebtCount: 0,
      nextPaymentDate: null,
      projectedPayoffDate: null,
      dueSoonAmount: 0,
      dueSoonCount: 0,
      debtsByType: {
        mortgage: [],
        auto: [],
        credit_card: [],
        chapter13: [],
        student: [],
        personal: [],
        medical: [],
        business: [],
        other: [],
      },
    },
    handleAddDebt: vi.fn(),
  };

  it("should render correctly with title", () => {
    render(<DashboardHeader {...defaultProps} />);

    // Header text is split by spans for styling
    expect(screen.getByRole("heading", { name: /DEBT TRACKING/i })).toBeInTheDocument();
  });

  it("should render 'Add Debt' button", () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByText("Add Debt")).toBeInTheDocument();
  });

  it("should render the credit card icon", () => {
    render(<DashboardHeader {...defaultProps} />);
    const icons = screen.getAllByTestId("mock-icon");
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });
});
