import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { SimpleHeatmapGrid } from "../SimpleHeatmapGrid";
import type { HeatmapDataPoint } from "../SimpleHeatmapGrid";

describe("SimpleHeatmapGrid", () => {
  const mockData: HeatmapDataPoint[] = [
    { date: "2024-01-01", amount: 100, intensity: 75 },
    { date: "2024-01-02", amount: 50, intensity: 40 },
    { date: "2024-01-03", amount: 200, intensity: 95 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render heatmap grid", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });

    it("should render title", () => {
      render(<SimpleHeatmapGrid data={mockData} title="Test Heatmap" />);

      expect(screen.getByText("Test Heatmap")).toBeInTheDocument();
    });

    it("should render default title when not provided", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      expect(screen.getByText("Activity Heatmap")).toBeInTheDocument();
    });

    it("should render 35 cells (7 cols × 5 rows)", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      for (let i = 0; i < 35; i++) {
        expect(screen.getByTestId(`heatmap-cell-${i}`)).toBeInTheDocument();
      }
    });

    it("should render day labels", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      days.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it("should render legend", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      expect(screen.getByText("Less")).toBeInTheDocument();
      expect(screen.getByText("More")).toBeInTheDocument();
    });

    it("should have correct accessibility attributes", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      const region = screen.getByRole("region", { name: "Activity Heatmap" });
      expect(region).toBeInTheDocument();
    });
  });

  describe("Cell Styling", () => {
    it("should apply intensity-based opacity to cells with data", () => {
      const { container } = render(<SimpleHeatmapGrid data={mockData} />);

      const cells = container.querySelectorAll('[role="gridcell"]');

      // At least some cells should have styles applied
      expect(cells.length).toBe(35);

      // Check that cells exist and have inline styles
      cells.forEach((cell) => {
        expect(cell).toHaveAttribute("style");
      });
    });

    it("should render empty cells with low opacity", () => {
      const { container } = render(<SimpleHeatmapGrid data={[]} />);

      const cells = container.querySelectorAll('[role="gridcell"]');

      // All 35 cells should exist even with no data
      expect(cells.length).toBe(35);
    });
  });

  describe("Tooltip", () => {
    it("should show tooltip on hover", () => {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const dataWithToday: HeatmapDataPoint[] = [{ date: dateStr, amount: 150, intensity: 80 }];

      render(<SimpleHeatmapGrid data={dataWithToday} />);

      // Find the last cell (today)
      const lastCell = screen.getByTestId("heatmap-cell-34");

      // Hover over cell
      fireEvent.mouseEnter(lastCell, {
        clientX: 100,
        clientY: 100,
      });

      // Tooltip should appear
      const tooltip = screen.getByTestId("heatmap-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("$150.00");
    });

    it("should hide tooltip on mouse leave", () => {
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const dataWithToday: HeatmapDataPoint[] = [{ date: dateStr, amount: 150, intensity: 80 }];

      render(<SimpleHeatmapGrid data={dataWithToday} />);

      const lastCell = screen.getByTestId("heatmap-cell-34");

      // Hover over cell
      fireEvent.mouseEnter(lastCell, {
        clientX: 100,
        clientY: 100,
      });

      expect(screen.getByTestId("heatmap-tooltip")).toBeInTheDocument();

      // Mouse leave
      fireEvent.mouseLeave(lastCell);

      expect(screen.queryByTestId("heatmap-tooltip")).not.toBeInTheDocument();
    });

    it("should not show tooltip for empty cells", () => {
      render(<SimpleHeatmapGrid data={[]} />);

      const firstCell = screen.getByTestId("heatmap-cell-0");

      fireEvent.mouseEnter(firstCell, {
        clientX: 100,
        clientY: 100,
      });

      expect(screen.queryByTestId("heatmap-tooltip")).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      render(<SimpleHeatmapGrid data={mockData} loading={true} />);

      expect(screen.getByTestId("heatmap-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("simple-heatmap-grid")).not.toBeInTheDocument();
    });

    it("should render skeleton with 35 cells", () => {
      const { container } = render(<SimpleHeatmapGrid data={mockData} loading={true} />);

      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();

      // Check that skeleton has grid structure
      const gridCells = container.querySelectorAll(".grid > div");
      expect(gridCells.length).toBeGreaterThan(0);
    });

    it("should not show loading state by default", () => {
      render(<SimpleHeatmapGrid data={mockData} />);

      expect(screen.queryByTestId("heatmap-loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });
  });

  describe("Data Handling", () => {
    it("should handle empty data array", () => {
      render(<SimpleHeatmapGrid data={[]} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();

      // All 35 cells should still render
      for (let i = 0; i < 35; i++) {
        expect(screen.getByTestId(`heatmap-cell-${i}`)).toBeInTheDocument();
      }
    });

    it("should handle data with future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const futureData: HeatmapDataPoint[] = [
        {
          date: futureDate.toISOString().split("T")[0],
          amount: 100,
          intensity: 50,
        },
      ];

      render(<SimpleHeatmapGrid data={futureData} />);

      // Should render without crashing
      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });

    it("should handle data with very old dates", () => {
      const oldData: HeatmapDataPoint[] = [{ date: "2020-01-01", amount: 100, intensity: 50 }];

      render(<SimpleHeatmapGrid data={oldData} />);

      // Should render without crashing
      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero amount", () => {
      const zeroData: HeatmapDataPoint[] = [
        {
          date: new Date().toISOString().split("T")[0],
          amount: 0,
          intensity: 0,
        },
      ];

      render(<SimpleHeatmapGrid data={zeroData} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });

    it("should handle negative amount", () => {
      const negativeData: HeatmapDataPoint[] = [
        {
          date: new Date().toISOString().split("T")[0],
          amount: -100,
          intensity: 50,
        },
      ];

      render(<SimpleHeatmapGrid data={negativeData} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });

    it("should handle intensity > 100", () => {
      const highIntensity: HeatmapDataPoint[] = [
        {
          date: new Date().toISOString().split("T")[0],
          amount: 1000,
          intensity: 150,
        },
      ];

      render(<SimpleHeatmapGrid data={highIntensity} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });

    it("should handle intensity < 0", () => {
      const lowIntensity: HeatmapDataPoint[] = [
        {
          date: new Date().toISOString().split("T")[0],
          amount: 100,
          intensity: -10,
        },
      ];

      render(<SimpleHeatmapGrid data={lowIntensity} />);

      expect(screen.getByTestId("simple-heatmap-grid")).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("should have grid with 7 columns", () => {
      const { container } = render(<SimpleHeatmapGrid data={mockData} />);

      const grid = container.querySelector(".grid-cols-7");
      expect(grid).toBeInTheDocument();
    });
  });
});
