import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PerformanceOverviewTab from "../PerformanceOverviewTab";

// Mock getIcon
vi.mock("../../../../utils", () => ({
  getIcon: () => (props: { className?: string }) => (
    <svg className={props.className} data-testid="mock-icon" />
  ),
}));

describe("PerformanceOverviewTab", () => {
  const mockPerformanceHistory = [
    { score: 85, timestamp: new Date("2024-01-01T10:00:00").getTime() },
    { score: 90, timestamp: new Date("2024-01-01T11:00:00").getTime() },
    { score: 87, timestamp: new Date("2024-01-01T12:00:00").getTime() },
    { score: 92, timestamp: new Date("2024-01-01T13:00:00").getTime() },
    { score: 88, timestamp: new Date("2024-01-01T14:00:00").getTime() },
  ];

  describe("Rendering with Data", () => {
    it("should render performance trend when history is provided", () => {
      render(<PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />);
      expect(screen.getByText("Performance Trend")).toBeInTheDocument();
    });

    it("should render bars for each performance entry", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const bars = container.querySelectorAll(".bg-purple-500");
      expect(bars.length).toBe(5);
    });

    it("should handle large performance history", () => {
      const largeHistory = Array.from({ length: 50 }, (_, i) => ({
        score: 70 + Math.random() * 30,
        timestamp: new Date(`2024-01-01T${10 + i}:00:00`).getTime(),
      }));
      const { container } = render(<PerformanceOverviewTab performanceHistory={largeHistory} />);
      const bars = container.querySelectorAll(".bg-purple-500");
      // Should only show last 20
      expect(bars.length).toBe(20);
    });

    it("should render single performance entry", () => {
      const singleHistory = [{ score: 85, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={singleHistory} />);
      const bars = container.querySelectorAll(".bg-purple-500");
      expect(bars.length).toBe(1);
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no history", () => {
      render(<PerformanceOverviewTab performanceHistory={[]} />);
      expect(
        screen.getByText("Performance history will appear here over time")
      ).toBeInTheDocument();
    });

    it("should render clock icon in empty state", () => {
      render(<PerformanceOverviewTab performanceHistory={[]} />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("should have correct empty state styling", () => {
      const { container } = render(<PerformanceOverviewTab performanceHistory={[]} />);
      const emptyState = container.querySelector(".text-center");
      expect(emptyState).toHaveClass("py-8", "text-gray-500");
    });
  });

  describe("Score Visualization", () => {
    it("should render bar heights proportional to scores", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const bars = container.querySelectorAll(".bg-purple-500");

      bars.forEach((bar, index) => {
        const entry = mockPerformanceHistory[index];
        const expectedHeight = `${(entry.score / 100) * 100}%`;
        expect(bar).toHaveStyle({ height: expectedHeight });
      });
    });

    it("should handle perfect score (100)", () => {
      const perfectScore = [{ score: 100, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={perfectScore} />);
      const bar = container.querySelector(".bg-purple-500");
      expect(bar).toHaveStyle({ height: "100%" });
    });

    it("should handle zero score", () => {
      const zeroScore = [{ score: 0, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={zeroScore} />);
      const bar = container.querySelector(".bg-purple-500");
      expect(bar).toHaveStyle({ height: "0%" });
    });

    it("should handle mid-range scores", () => {
      const midScore = [{ score: 50, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={midScore} />);
      const bar = container.querySelector(".bg-purple-500");
      expect(bar).toHaveStyle({ height: "50%" });
    });
  });

  describe("Tooltips", () => {
    it("should set title attributes with score and time", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const bars = container.querySelectorAll(".bg-purple-500");

      bars.forEach((bar, index) => {
        const entry = mockPerformanceHistory[index];
        const title = bar.getAttribute("title");
        expect(title).toContain(`Score: ${entry.score}`);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle performance history with exactly 20 entries", () => {
      const twentyEntries = Array.from({ length: 20 }, (_, i) => ({
        score: 80 + i,
        timestamp: Date.now() + i * 1000,
      }));
      const { container } = render(<PerformanceOverviewTab performanceHistory={twentyEntries} />);
      const bars = container.querySelectorAll(".bg-purple-500");
      expect(bars.length).toBe(20);
    });

    it("should handle scores greater than 100", () => {
      const highScore = [{ score: 150, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={highScore} />);
      const bar = container.querySelector(".bg-purple-500");
      // Should be capped at 150% visually (150/100 * 100)
      expect(bar).toHaveStyle({ height: "150%" });
    });

    it("should handle negative scores", () => {
      const negativeScore = [{ score: -10, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={negativeScore} />);
      const bar = container.querySelector(".bg-purple-500");
      expect(bar).toHaveStyle({ height: "-10%" });
    });

    it("should handle very old timestamps", () => {
      const oldHistory = [{ score: 85, timestamp: new Date("2000-01-01").getTime() }];
      render(<PerformanceOverviewTab performanceHistory={oldHistory} />);
      expect(screen.getByText("Performance Trend")).toBeInTheDocument();
    });

    it("should handle future timestamps", () => {
      const futureHistory = [{ score: 85, timestamp: new Date("2099-01-01").getTime() }];
      render(<PerformanceOverviewTab performanceHistory={futureHistory} />);
      expect(screen.getByText("Performance Trend")).toBeInTheDocument();
    });

    it("should handle decimal scores", () => {
      const decimalScore = [{ score: 85.5, timestamp: Date.now() }];
      const { container } = render(<PerformanceOverviewTab performanceHistory={decimalScore} />);
      const bar = container.querySelector(".bg-purple-500");
      expect(bar).toHaveStyle({ height: "85.5%" });
    });
  });

  describe("Styling", () => {
    it("should apply hover opacity transition", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const bars = container.querySelectorAll(".bg-purple-500");
      bars.forEach((bar) => {
        expect(bar).toHaveClass("opacity-60", "hover:opacity-100", "transition-opacity");
      });
    });

    it("should have correct container styling", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const chartContainer = container.querySelector(".bg-white\\/60");
      expect(chartContainer).toHaveClass("rounded-lg", "p-4", "border", "border-white/20");
    });

    it("should have correct height for bar chart", () => {
      const { container } = render(
        <PerformanceOverviewTab performanceHistory={mockPerformanceHistory} />
      );
      const barContainer = container.querySelector(".h-20");
      expect(barContainer).toHaveClass("flex", "items-end", "gap-1");
    });
  });
});
