import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { DistributionTable } from "../DistributionTable";
import type { CategoryDistribution } from "../DistributionTable";

// Mock getIcon
vi.mock("@/utils", () => ({
  getIcon: vi.fn((iconName: string) => {
    return ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${iconName}`} className={className}>
        <path d="M0 0" />
      </svg>
    );
  }),
}));

describe("DistributionTable", () => {
  const mockData: CategoryDistribution[] = [
    {
      category: "Groceries",
      amount: 500,
      percentage: 35,
      transactionCount: 12,
    },
    {
      category: "Transportation",
      amount: 300,
      percentage: 21,
      transactionCount: 8,
    },
    {
      category: "Entertainment",
      amount: 200,
      percentage: 14,
      transactionCount: 5,
    },
    {
      category: "Utilities",
      amount: 150,
      percentage: 10.5,
      transactionCount: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render distribution table", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });

    it("should render title", () => {
      render(<DistributionTable data={mockData} title="Test Distribution" />);

      expect(screen.getByText("Test Distribution")).toBeInTheDocument();
    });

    it("should render default title when not provided", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("Category Distribution")).toBeInTheDocument();
    });

    it("should render all data rows", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByTestId("distribution-row-0")).toBeInTheDocument();
      expect(screen.getByTestId("distribution-row-1")).toBeInTheDocument();
      expect(screen.getByTestId("distribution-row-2")).toBeInTheDocument();
      expect(screen.getByTestId("distribution-row-3")).toBeInTheDocument();
    });

    it("should render category names", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("Groceries")).toBeInTheDocument();
      expect(screen.getByText("Transportation")).toBeInTheDocument();
      expect(screen.getByText("Entertainment")).toBeInTheDocument();
      expect(screen.getByText("Utilities")).toBeInTheDocument();
    });

    it("should have correct accessibility attributes", () => {
      render(<DistributionTable data={mockData} />);

      const region = screen.getByRole("region", { name: "Category Distribution" });
      expect(region).toBeInTheDocument();

      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });
  });

  describe("Column Headers", () => {
    it("should render all column headers", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("%")).toBeInTheDocument();
      expect(screen.getByText("Count")).toBeInTheDocument();
    });

    it("should render sort buttons", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByTestId("sort-category")).toBeInTheDocument();
      expect(screen.getByTestId("sort-amount")).toBeInTheDocument();
      expect(screen.getByTestId("sort-percentage")).toBeInTheDocument();
      expect(screen.getByTestId("sort-count")).toBeInTheDocument();
    });
  });

  describe("Data Formatting", () => {
    it("should format amounts as currency", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("$500.00")).toBeInTheDocument();
      expect(screen.getByText("$300.00")).toBeInTheDocument();
      expect(screen.getByText("$200.00")).toBeInTheDocument();
      expect(screen.getByText("$150.00")).toBeInTheDocument();
    });

    it("should format percentages correctly", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("35.0%")).toBeInTheDocument();
      expect(screen.getByText("21.0%")).toBeInTheDocument();
      expect(screen.getByText("14.0%")).toBeInTheDocument();
      expect(screen.getByText("10.5%")).toBeInTheDocument();
    });

    it("should display transaction counts", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("Progress Bars", () => {
    it("should render progress bars for each row", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.getByTestId("progress-bar-0")).toBeInTheDocument();
      expect(screen.getByTestId("progress-bar-1")).toBeInTheDocument();
      expect(screen.getByTestId("progress-bar-2")).toBeInTheDocument();
      expect(screen.getByTestId("progress-bar-3")).toBeInTheDocument();
    });

    it("should set correct width for progress bars", () => {
      render(<DistributionTable data={mockData} />);

      const bar0 = screen.getByTestId("progress-bar-0");
      expect(bar0).toHaveStyle({ width: "35%" });

      const bar1 = screen.getByTestId("progress-bar-1");
      expect(bar1).toHaveStyle({ width: "21%" });
    });

    it("should have correct ARIA attributes", () => {
      render(<DistributionTable data={mockData} />);

      const bar = screen.getByTestId("progress-bar-0");
      expect(bar).toHaveAttribute("role", "progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "35");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("should cap progress bar at 100%", () => {
      const overData: CategoryDistribution[] = [
        {
          category: "Over",
          amount: 1000,
          percentage: 150,
          transactionCount: 1,
        },
      ];

      render(<DistributionTable data={overData} />);

      const bar = screen.getByTestId("progress-bar-0");
      expect(bar).toHaveStyle({ width: "100%" });
    });
  });

  describe("Sorting", () => {
    it("should sort by amount descending by default", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Groceries");
      expect(rows[1]).toHaveTextContent("Transportation");
      expect(rows[2]).toHaveTextContent("Entertainment");
    });

    it("should sort by category when clicking category header", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const sortButton = screen.getByTestId("sort-category");
      fireEvent.click(sortButton);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Entertainment");
      expect(rows[1]).toHaveTextContent("Groceries");
      expect(rows[2]).toHaveTextContent("Transportation");
    });

    it("should toggle sort direction on second click", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const sortButton = screen.getByTestId("sort-amount");

      // First click (should already be desc)
      const rowsBefore = container.querySelectorAll("tbody tr");
      expect(rowsBefore[0]).toHaveTextContent("Groceries");

      // Second click (should be asc)
      fireEvent.click(sortButton);
      const rowsAfter = container.querySelectorAll("tbody tr");
      expect(rowsAfter[0]).toHaveTextContent("Utilities");
      expect(rowsAfter[3]).toHaveTextContent("Groceries");
    });

    it("should sort by percentage", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const sortButton = screen.getByTestId("sort-percentage");
      fireEvent.click(sortButton);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Groceries"); // 35%
      expect(rows[3]).toHaveTextContent("Utilities"); // 10.5%
    });

    it("should sort by transaction count", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const sortButton = screen.getByTestId("sort-count");
      fireEvent.click(sortButton);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Groceries"); // 12
      expect(rows[3]).toHaveTextContent("Utilities"); // 3
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      render(<DistributionTable data={mockData} loading={true} />);

      expect(screen.getByTestId("distribution-table-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("distribution-table")).not.toBeInTheDocument();
    });

    it("should show animated skeleton", () => {
      const { container } = render(<DistributionTable data={mockData} loading={true} />);

      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not show loading state by default", () => {
      render(<DistributionTable data={mockData} />);

      expect(screen.queryByTestId("distribution-table-loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no data", () => {
      render(<DistributionTable data={[]} />);

      expect(screen.getByText("No distribution data available")).toBeInTheDocument();
    });

    it("should render component with empty message", () => {
      render(<DistributionTable data={[]} />);

      expect(screen.getByTestId("distribution-table")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero values", () => {
      const zeroData: CategoryDistribution[] = [
        {
          category: "Zero",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
      ];

      render(<DistributionTable data={zeroData} />);

      expect(screen.getByText("$0.00")).toBeInTheDocument();
      expect(screen.getByText("0.0%")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle negative amounts", () => {
      const negativeData: CategoryDistribution[] = [
        {
          category: "Refund",
          amount: -50,
          percentage: -5,
          transactionCount: 1,
        },
      ];

      render(<DistributionTable data={negativeData} />);

      expect(screen.getByText("-$50.00")).toBeInTheDocument();
    });

    it("should handle very large amounts", () => {
      const largeData: CategoryDistribution[] = [
        {
          category: "Large",
          amount: 1000000,
          percentage: 100,
          transactionCount: 999,
        },
      ];

      render(<DistributionTable data={largeData} />);

      expect(screen.getByText("$1,000,000.00")).toBeInTheDocument();
    });

    it("should handle decimal percentages", () => {
      const decimalData: CategoryDistribution[] = [
        {
          category: "Decimal",
          amount: 100,
          percentage: 12.345,
          transactionCount: 1,
        },
      ];

      render(<DistributionTable data={decimalData} />);

      expect(screen.getByText("12.3%")).toBeInTheDocument();
    });

    it("should handle single row", () => {
      const singleRow = [mockData[0]];
      render(<DistributionTable data={singleRow} />);

      expect(screen.getByTestId("distribution-row-0")).toBeInTheDocument();
      expect(screen.queryByTestId("distribution-row-1")).not.toBeInTheDocument();
    });
  });

  describe("Hover Effects", () => {
    it("should have hover styles on rows", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const rows = container.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        expect(row).toHaveClass("hover:bg-gray-50");
      });
    });
  });

  describe("Responsive Design", () => {
    it("should have overflow-x-auto for horizontal scrolling", () => {
      const { container } = render(<DistributionTable data={mockData} />);

      const scrollContainer = container.querySelector(".overflow-x-auto");
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});
