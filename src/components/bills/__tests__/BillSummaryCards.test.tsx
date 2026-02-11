import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BillSummaryCards from "../BillSummaryCards";
import "@testing-library/jest-dom";

// No mock needed for PageSummaryCard, we'll use the real one since we added data-testid support

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
      expect(
        screen.getByText((content) => content.includes("$1") && content.includes("500.00"))
      ).toBeInTheDocument();
    });

    it("should pass overdue amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText((content) => content.includes("$200.00"))).toBeInTheDocument();
    });

    it("should pass paid amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText((content) => content.includes("$300.00"))).toBeInTheDocument();
    });

    it("should pass upcoming amount", () => {
      render(<BillSummaryCards {...defaultProps} />);
      expect(screen.getByText((content) => content.includes("$500.00"))).toBeInTheDocument();
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
      expect(screen.getByText((content) => content.includes("$0.00"))).toBeInTheDocument();
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
      expect(
        screen.getByText((content) => content.includes("$9") && content.includes("999.99"))
      ).toBeInTheDocument();
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
