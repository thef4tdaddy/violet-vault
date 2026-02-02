import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import EnvelopesTab from "../EnvelopesTab";

// Mocks for charting library components to avoid canvas errors
// Adjust path to point to src/components/charts from src/components/analytics/tabs/__tests__
vi.mock("../../../charts", () => ({
  BudgetVsActualChart: () => <div data-testid="budget-chart">Budget Chart</div>,
  DistributionPieChartWithDetails: ({ detailContent }: any) => (
    <div data-testid="pie-chart">
      Pie Chart
      {detailContent}
    </div>
  ),
  CategoryBarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

describe("EnvelopesTab", () => {
  const mockData = {
    envelopeSpending: [{ name: "Food", amount: 100, count: 5 }],
    budgetVsActual: [{ name: "Food", budgeted: 500, actual: 100 }],
    envelopes: [{ id: "1", name: "Savings", currentBalance: 1000, targetAmount: 2000 }],
    envelopeHealth: [
      { id: "1", name: "Savings", status: "Healthy", remaining: 1000, budgeted: 500 },
    ],
  };

  it("should render charts when data is provided", () => {
    render(<EnvelopesTab {...mockData} />);

    expect(screen.getByTestId("budget-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render balance summary details", () => {
    render(<EnvelopesTab {...mockData} />);

    expect(screen.getByText("Balance Summary")).toBeInTheDocument();
    expect(screen.getAllByText("Savings").length).toBeGreaterThan(0);
    // Currency formatter might output $1,000.00 or $1,000 depending on locale, usually we look for partial match or specific formatter output
    // Our fake formatter in component: en-US, no fractions
    expect(screen.getAllByText("$1,000").length).toBeGreaterThan(0);
  });

  it("should render health highlights", () => {
    render(<EnvelopesTab {...mockData} />);

    expect(screen.getByText("Envelope Health Highlights")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("should handle empty data gracefully", () => {
    const { container } = render(<EnvelopesTab />);

    // Should be empty or minimal, no crashes
    // Classes "space-y-6" implies a wrapper div
    expect(container.firstChild).toHaveClass("space-y-6");
    expect(screen.queryByTestId("budget-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
    expect(screen.queryByText("Envelope Health Highlights")).not.toBeInTheDocument();
  });
});
