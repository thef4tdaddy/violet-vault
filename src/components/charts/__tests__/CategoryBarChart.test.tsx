import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryBarChart from "../CategoryBarChart";

// Mock useChartConfig hook
vi.mock("../../../hooks/platform/ux/useChartConfig", () => ({
  useChartConfig: () => ({
    CustomTooltip: () => <div>Custom Tooltip</div>,
    chartDefaults: {
      axis: { stroke: "#888" },
      cartesianGrid: { strokeDasharray: "3 3", stroke: "#e0e0e0" },
    },
    chartTypeConfigs: {
      bar: { radius: [8, 8, 0, 0] },
    },
    getColorByCategory: (key: string, index: number) => {
      const colors = ["#10b981", "#ef4444", "#3b82f6"];
      return colors[index % colors.length];
    },
    formatters: {
      shortCurrency: (value: number) => `$${value.toLocaleString()}`,
    },
  }),
}));

describe("CategoryBarChart", () => {
  const mockData = [
    { name: "Food", income: 1000, expenses: 800 },
    { name: "Transport", income: 500, expenses: 600 },
    { name: "Entertainment", income: 200, expenses: 300 },
  ];

  describe("Rendering", () => {
    it("should render with default title", () => {
      render(<CategoryBarChart />);
      expect(screen.getByText("Category Analysis")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<CategoryBarChart title="Custom Category Chart" />);
      expect(screen.getByText("Custom Category Chart")).toBeInTheDocument();
    });

    it("should render with subtitle", () => {
      render(<CategoryBarChart subtitle="Monthly breakdown" />);
      expect(screen.getByText("Monthly breakdown")).toBeInTheDocument();
    });

    it("should render chart with data", () => {
      render(<CategoryBarChart data={mockData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should render with custom actions", () => {
      const actions = <button>Export</button>;
      render(<CategoryBarChart actions={actions} />);
      expect(screen.getByText("Export")).toBeInTheDocument();
    });
  });

  describe("Data Handling", () => {
    it("should handle empty data array", () => {
      render(<CategoryBarChart data={[]} />);
      expect(screen.getByText("No category data available")).toBeInTheDocument();
    });

    it("should handle undefined data", () => {
      render(<CategoryBarChart data={undefined} />);
      expect(screen.getByText("No category data available")).toBeInTheDocument();
    });

    it("should handle null data", () => {
      render(<CategoryBarChart data={null as unknown as Array<Record<string, unknown>>} />);
      expect(screen.getByText("No category data available")).toBeInTheDocument();
    });

    it("should render multiple data points", () => {
      render(<CategoryBarChart data={mockData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle single data point", () => {
      const singleData = [{ name: "Food", income: 1000, expenses: 800 }];
      render(<CategoryBarChart data={singleData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle large datasets", () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        name: `Category ${i}`,
        income: Math.random() * 1000,
        expenses: Math.random() * 1000,
      }));
      render(<CategoryBarChart data={largeData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should render loading state when loading is true", () => {
      render(<CategoryBarChart loading={true} data={mockData} />);
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it("should not render chart when loading", () => {
      render(<CategoryBarChart loading={true} data={mockData} />);
      expect(screen.queryByTestId("category-bar-chart")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state when error is provided", () => {
      const error = new Error("Chart error");
      render(<CategoryBarChart error={error} data={mockData} />);
      expect(screen.getAllByText(/error/i).length).toBeGreaterThan(0);
    });

    it("should not render chart when error exists", () => {
      const error = new Error("Chart error");
      render(<CategoryBarChart error={error} data={mockData} />);
      expect(screen.queryByTestId("category-bar-chart")).not.toBeInTheDocument();
    });
  });

  describe("Configuration Options", () => {
    it("should handle custom empty message", () => {
      render(<CategoryBarChart data={[]} emptyMessage="No data found" />);
      expect(screen.getByText("No data found")).toBeInTheDocument();
    });

    it("should handle custom height", () => {
      render(<CategoryBarChart data={mockData} height={500} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle custom className", () => {
      const { container } = render(<CategoryBarChart data={mockData} className="custom-chart" />);
      expect(container.querySelector(".custom-chart")).toBeInTheDocument();
    });

    it("should handle vertical orientation", () => {
      render(<CategoryBarChart data={mockData} orientation="vertical" />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle horizontal orientation", () => {
      render(<CategoryBarChart data={mockData} orientation="horizontal" />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle custom categoryKey", () => {
      const customData = [
        { category: "Food", value: 1000 },
        { category: "Transport", value: 500 },
      ];
      render(<CategoryBarChart data={customData} categoryKey="category" />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle custom maxBarSize", () => {
      render(<CategoryBarChart data={mockData} maxBarSize={100} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });
  });

  describe("Bar Configuration", () => {
    it("should use default bars when none provided", () => {
      render(<CategoryBarChart data={mockData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle custom bars configuration", () => {
      const customBars = [{ dataKey: "total", name: "Total", fill: "#8884d8" }];
      render(<CategoryBarChart data={mockData} bars={customBars} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle empty bars array", () => {
      render(<CategoryBarChart data={mockData} bars={[]} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle multiple custom bars", () => {
      const multipleBars = [
        { dataKey: "income", name: "Income", fill: "#10b981" },
        { dataKey: "expenses", name: "Expenses", fill: "#ef4444" },
        { dataKey: "savings", name: "Savings", fill: "#3b82f6" },
      ];
      render(<CategoryBarChart data={mockData} bars={multipleBars} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });
  });

  describe("Grid and Legend", () => {
    it("should show grid by default", () => {
      render(<CategoryBarChart data={mockData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should hide grid when showGrid is false", () => {
      render(<CategoryBarChart data={mockData} showGrid={false} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should show legend by default", () => {
      render(<CategoryBarChart data={mockData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should hide legend when showLegend is false", () => {
      render(<CategoryBarChart data={mockData} showLegend={false} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle data with zero values", () => {
      const zeroData = [{ name: "Food", income: 0, expenses: 0 }];
      render(<CategoryBarChart data={zeroData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle data with negative values", () => {
      const negativeData = [{ name: "Food", income: -100, expenses: -50 }];
      render(<CategoryBarChart data={negativeData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle very long category names", () => {
      const longNameData = [{ name: "A".repeat(100), income: 1000, expenses: 800 }];
      render(<CategoryBarChart data={longNameData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle special characters in category names", () => {
      const specialData = [{ name: "Food & Drinks (€)", income: 1000, expenses: 800 }];
      render(<CategoryBarChart data={specialData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });

    it("should handle very large values", () => {
      const largeValueData = [{ name: "Investment", income: 999999999, expenses: 500000000 }];
      render(<CategoryBarChart data={largeValueData} />);
      expect(screen.getByTestId("category-bar-chart")).toBeInTheDocument();
    });
  });
});
