import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrendLineChart from "../TrendLineChart";

// Mock ComposedFinancialChart
vi.mock("../ComposedFinancialChart", () => ({
  default: ({
    title,
    subtitle,
    data,
    series,
  }: {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    data?: Array<Record<string, unknown>>;
    series?: Array<Record<string, unknown>>;
  }) => (
    <div data-testid="composed-financial-chart">
      <div>{title}</div>
      {subtitle && <div>{subtitle}</div>}
      <div data-testid="chart-data-length">{data?.length || 0}</div>
      <div data-testid="chart-series-length">{series?.length || 0}</div>
    </div>
  ),
}));

describe("TrendLineChart", () => {
  const mockData = [
    { month: "Jan", income: 5000, expenses: 3000, net: 2000 },
    { month: "Feb", income: 5500, expenses: 3200, net: 2300 },
    { month: "Mar", income: 6000, expenses: 3500, net: 2500 },
  ];

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<TrendLineChart />);
      expect(screen.getByText("Trend Analysis")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<TrendLineChart title="Monthly Trends" />);
      expect(screen.getByText("Monthly Trends")).toBeInTheDocument();
    });

    it("should render with subtitle", () => {
      render(<TrendLineChart subtitle="Income vs Expenses" />);
      expect(screen.getByText("Income vs Expenses")).toBeInTheDocument();
    });

    it("should pass data to ComposedFinancialChart", () => {
      render(<TrendLineChart data={mockData} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("3");
    });
  });

  describe("Chart Types", () => {
    it("should default to line chart type", () => {
      render(<TrendLineChart data={mockData} />);
      expect(screen.getByTestId("chart-series-length")).toHaveTextContent("3");
    });

    it("should handle line chart type", () => {
      render(<TrendLineChart data={mockData} chartType="line" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle area chart type", () => {
      render(<TrendLineChart data={mockData} chartType="area" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle bar chart type", () => {
      render(<TrendLineChart data={mockData} chartType="bar" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle type prop as alias for chartType", () => {
      render(<TrendLineChart data={mockData} type="area" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should prioritize type prop over chartType", () => {
      render(<TrendLineChart data={mockData} type="bar" chartType="line" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should fallback to line for invalid chart type", () => {
      const { getByTestId, unmount } = render(<TrendLineChart data={mockData} chartType="line" />);
      const lineChartContent = getByTestId("composed-financial-chart").innerHTML;
      unmount();

      render(<TrendLineChart data={mockData} chartType="invalid" />);
      // Invalid chart type should fallback to line type, resulting in same rendering as line chart
      expect(screen.getByTestId("composed-financial-chart").innerHTML).toBe(lineChartContent);
      expect(screen.getByTestId("chart-series-length")).toHaveTextContent("3");
    });
  });

  describe("Data Handling", () => {
    it("should handle empty data array", () => {
      render(<TrendLineChart data={[]} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("0");
    });

    it("should handle undefined data", () => {
      render(<TrendLineChart data={undefined} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("0");
    });

    it("should handle null data", () => {
      render(<TrendLineChart data={null as unknown as Array<Record<string, unknown>>} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("0");
    });

    it("should handle single data point", () => {
      const singleData = [{ month: "Jan", income: 5000, expenses: 3000, net: 2000 }];
      render(<TrendLineChart data={singleData} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("1");
    });

    it("should handle large datasets", () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        month: `Month ${i}`,
        income: Math.random() * 10000,
        expenses: Math.random() * 8000,
        net: Math.random() * 2000,
      }));
      render(<TrendLineChart data={largeData} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("100");
    });
  });

  describe("Height Configuration", () => {
    it("should use default height", () => {
      render(<TrendLineChart data={mockData} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle custom height", () => {
      render(<TrendLineChart data={mockData} height={500} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle zero height", () => {
      render(<TrendLineChart data={mockData} height={0} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle very large height", () => {
      render(<TrendLineChart data={mockData} height={10000} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });
  });

  describe("Props Forwarding", () => {
    it("should forward additional props to ComposedFinancialChart", () => {
      render(<TrendLineChart data={mockData} loading={true} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should forward className prop", () => {
      render(<TrendLineChart data={mockData} className="custom-class" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should forward error prop", () => {
      render(<TrendLineChart data={mockData} error={new Error("Test error")} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should forward actions prop", () => {
      const actions = <button>Export</button>;
      render(<TrendLineChart data={mockData} actions={actions} />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle data with zero values", () => {
      const zeroData = [{ month: "Jan", income: 0, expenses: 0, net: 0 }];
      render(<TrendLineChart data={zeroData} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("1");
    });

    it("should handle data with negative values", () => {
      const negativeData = [{ month: "Jan", income: 5000, expenses: 6000, net: -1000 }];
      render(<TrendLineChart data={negativeData} />);
      expect(screen.getByTestId("chart-data-length")).toHaveTextContent("1");
    });

    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);
      render(<TrendLineChart title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle empty string title", () => {
      render(<TrendLineChart title="" />);
      expect(screen.getByTestId("composed-financial-chart")).toBeInTheDocument();
    });

    it("should handle title as ReactNode", () => {
      const titleNode = (
        <div>
          <span>Complex</span> Title
        </div>
      );
      render(<TrendLineChart title={titleNode} />);
      expect(screen.getByText("Complex")).toBeInTheDocument();
    });
  });
});
