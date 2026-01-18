import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BillSummaryCards from "../BillSummaryCards";
import "@testing-library/jest-dom";

// Mock child components and utilities
vi.mock("../../primitives/cards/MetricCard", () => ({
  MetricCard: ({ title, value, subtitle }: any) => (
    <div data-testid="summary-card">
      <span data-testid="card-label">{title}</span>
      <span data-testid="card-value">
        {/* MetricCard handles formatting internally, so we simulate the output for tests if passed raw number
            In the actual component, value is passed as number and format="currency" used.
            For this mock, we'll just check if value is passed correctly, or we can simple render it.
            Since the component passes raw numbers, we might want to just render inputs to verify prop passing,
            BUT the original tests asserted formatted strings.
            To minimize test churn, let's just render the value as a string for now, and update assertions to look for the raw value OR mock the formatting.
            Actually, the component now relies on MetricCard to format.
            Let's mock MetricCard to format simpler or just render raw.
        */}
        {typeof value === "number" ? value.toString() : value}
      </span>
      <span data-testid="card-subtext">{subtitle}</span>
    </div>
  ),
}));

describe("BillSummaryCards", () => {
  const defaultProps = {
    totals: {
      total: 1500.0,
      totalCount: 10,
      overdue: 200.0,
      overdueCount: 2,
      paid: 300.0,
      paidCount: 3,
      upcoming: 500.0,
      upcomingCount: 5,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render 4 summary cards", () => {
      render(<BillSummaryCards {...defaultProps} />);
      const cards = screen.getAllByTestId("summary-card");
      expect(cards.length).toBe(4);
    });

    it("should pass correct values to cards", () => {
      render(<BillSummaryCards {...defaultProps} />);
      // Since we mocked MetricCard to simply render toString(), check for that
      expect(screen.getByText("1500")).toBeInTheDocument();
    });

    it("should pass overdue amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText("200")).toBeInTheDocument();
    });

    it("should pass paid amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText("300")).toBeInTheDocument();
    });

    it("should pass upcoming amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("should display bill counts", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText("10 bills")).toBeInTheDocument();
      expect(screen.getByText("2 bills")).toBeInTheDocument();
      expect(screen.getByText("3 bills")).toBeInTheDocument();
      expect(screen.getByText("5 bills")).toBeInTheDocument();
    });
  });

  describe("Zero Values", () => {
    it("should handle zero bills", () => {
      const props = {
        totals: {
          total: 0,
          totalCount: 0,
          overdue: 0,
          overdueCount: 0,
          paid: 0,
          paidCount: 0,
          upcoming: 0,
          upcomingCount: 0,
        },
      };

      render(<BillSummaryCards {...props} />);
      // MetricCard mock renders "0 bills"
      expect(screen.getAllByText("0 bills").length).toBeGreaterThan(0);
    });

    it("should handle zero total due", () => {
      const props = {
        totals: {
          ...defaultProps.totals,
          total: 0,
        },
      };

      render(<BillSummaryCards {...props} />);
      // We expect the mock to render "0"
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Large Numbers", () => {
    it("should handle large bill counts", () => {
      const props = {
        totals: {
          ...defaultProps.totals,
          totalCount: 999,
          upcomingCount: 500,
        },
      };

      render(<BillSummaryCards {...props} />);
      expect(screen.getByText("999 bills")).toBeInTheDocument();
      expect(screen.getByText("500 bills")).toBeInTheDocument();
    });

    it("should handle large amounts", () => {
      const props = {
        totals: {
          ...defaultProps.totals,
          total: 9999.99,
        },
      };

      render(<BillSummaryCards {...props} />);
      expect(screen.getByText("9999.99")).toBeInTheDocument();
    });
  });

  describe("Props Validation", () => {
    it("should handle undefined totals prop gracefully", () => {
      render(<BillSummaryCards totals={undefined} />);
      const cards = screen.getAllByTestId("summary-card");
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should handle empty totals object gracefully", () => {
      render(<BillSummaryCards totals={{}} />);
      const cards = screen.getAllByTestId("summary-card");
      expect(cards.length).toBe(4);
    });
  });
});
