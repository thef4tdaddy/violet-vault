import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MinimalOverviewTab } from "../MinimalOverviewTab";
import type { AllocationMetrics } from "../MinimalOverviewTab";

// Mock MetricCard
vi.mock("@/components/primitives/cards/MetricCard", () => ({
  MetricCard: ({
    title,
    value,
    variant,
    subtitle,
    loading,
  }: {
    title: string;
    value: number | string;
    variant?: string;
    subtitle?: string;
    loading?: boolean;
  }) => (
    <div data-testid={`metric-card-${title}`} data-variant={variant} data-loading={loading}>
      <div data-testid="metric-title">{title}</div>
      <div data-testid="metric-value">{value}</div>
      {subtitle && <div data-testid="metric-subtitle">{subtitle}</div>}
    </div>
  ),
}));

describe("MinimalOverviewTab", () => {
  const mockMetrics: AllocationMetrics = {
    totalAllocations: 2500,
    avgPerPaycheck: 1250,
    healthScore: 85,
    frequency: "Bi-weekly",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all metric cards", () => {
      render(<MinimalOverviewTab metrics={mockMetrics} />);

      expect(screen.getByTestId("metric-card-Total Allocations")).toBeInTheDocument();
      expect(screen.getByTestId("metric-card-Avg Per Paycheck")).toBeInTheDocument();
      expect(screen.getByTestId("metric-card-Health Score")).toBeInTheDocument();
      expect(screen.getByTestId("metric-card-Frequency")).toBeInTheDocument();
    });

    it("should display correct values", () => {
      render(<MinimalOverviewTab metrics={mockMetrics} />);

      const values = screen.getAllByTestId("metric-value");
      expect(values[0]).toHaveTextContent("2500");
      expect(values[1]).toHaveTextContent("1250");
      expect(values[2]).toHaveTextContent("85");
      expect(values[3]).toHaveTextContent("Bi-weekly");
    });

    it("should have correct accessibility attributes", () => {
      render(<MinimalOverviewTab metrics={mockMetrics} />);

      const region = screen.getByRole("region", { name: "Allocation Overview" });
      expect(region).toBeInTheDocument();
      expect(region).toHaveAttribute("data-testid", "minimal-overview-tab");
    });
  });

  describe("Health Score Variants", () => {
    it("should show success variant for excellent health (≥90)", () => {
      const metrics = { ...mockMetrics, healthScore: 95 };
      render(<MinimalOverviewTab metrics={metrics} />);

      const healthCard = screen.getByTestId("metric-card-Health Score");
      expect(healthCard).toHaveAttribute("data-variant", "success");

      const subtitles = screen.getAllByTestId("metric-subtitle");
      const healthSubtitle = subtitles.find((el) => el.textContent === "Excellent");
      expect(healthSubtitle).toBeInTheDocument();
    });

    it("should show info variant for good health (75-89)", () => {
      const metrics = { ...mockMetrics, healthScore: 80 };
      render(<MinimalOverviewTab metrics={metrics} />);

      const healthCard = screen.getByTestId("metric-card-Health Score");
      expect(healthCard).toHaveAttribute("data-variant", "info");

      const subtitles = screen.getAllByTestId("metric-subtitle");
      const healthSubtitle = subtitles.find((el) => el.textContent === "Good");
      expect(healthSubtitle).toBeInTheDocument();
    });

    it("should show warning variant for fair health (60-74)", () => {
      const metrics = { ...mockMetrics, healthScore: 65 };
      render(<MinimalOverviewTab metrics={metrics} />);

      const healthCard = screen.getByTestId("metric-card-Health Score");
      expect(healthCard).toHaveAttribute("data-variant", "warning");

      const subtitles = screen.getAllByTestId("metric-subtitle");
      const healthSubtitle = subtitles.find((el) => el.textContent === "Fair");
      expect(healthSubtitle).toBeInTheDocument();
    });

    it("should show danger variant for poor health (<60)", () => {
      const metrics = { ...mockMetrics, healthScore: 45 };
      render(<MinimalOverviewTab metrics={metrics} />);

      const healthCard = screen.getByTestId("metric-card-Health Score");
      expect(healthCard).toHaveAttribute("data-variant", "danger");

      const subtitles = screen.getAllByTestId("metric-subtitle");
      const healthSubtitle = subtitles.find((el) => el.textContent === "Needs Attention");
      expect(healthSubtitle).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should pass loading prop to all metric cards", () => {
      render(<MinimalOverviewTab metrics={mockMetrics} loading={true} />);

      const cards = [
        screen.getByTestId("metric-card-Total Allocations"),
        screen.getByTestId("metric-card-Avg Per Paycheck"),
        screen.getByTestId("metric-card-Health Score"),
        screen.getByTestId("metric-card-Frequency"),
      ];

      cards.forEach((card) => {
        expect(card).toHaveAttribute("data-loading", "true");
      });
    });

    it("should not show loading by default", () => {
      render(<MinimalOverviewTab metrics={mockMetrics} />);

      const cards = [
        screen.getByTestId("metric-card-Total Allocations"),
        screen.getByTestId("metric-card-Avg Per Paycheck"),
        screen.getByTestId("metric-card-Health Score"),
        screen.getByTestId("metric-card-Frequency"),
      ];

      cards.forEach((card) => {
        expect(card).toHaveAttribute("data-loading", "false");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero values", () => {
      const metrics: AllocationMetrics = {
        totalAllocations: 0,
        avgPerPaycheck: 0,
        healthScore: 0,
        frequency: "None",
      };

      render(<MinimalOverviewTab metrics={metrics} />);

      const values = screen.getAllByTestId("metric-value");
      expect(values[0]).toHaveTextContent("0");
      expect(values[1]).toHaveTextContent("0");
      expect(values[2]).toHaveTextContent("0");
    });

    it("should handle large values", () => {
      const metrics: AllocationMetrics = {
        totalAllocations: 999999,
        avgPerPaycheck: 500000,
        healthScore: 100,
        frequency: "Monthly",
      };

      render(<MinimalOverviewTab metrics={metrics} />);

      const values = screen.getAllByTestId("metric-value");
      expect(values[0]).toHaveTextContent("999999");
      expect(values[1]).toHaveTextContent("500000");
      expect(values[2]).toHaveTextContent("100");
    });

    it("should handle negative values gracefully", () => {
      const metrics: AllocationMetrics = {
        totalAllocations: -100,
        avgPerPaycheck: -50,
        healthScore: -10,
        frequency: "Invalid",
      };

      render(<MinimalOverviewTab metrics={metrics} />);

      // Should still render without crashing
      expect(screen.getByTestId("minimal-overview-tab")).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("should have responsive grid classes", () => {
      const { container } = render(<MinimalOverviewTab metrics={mockMetrics} />);

      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1");
      expect(grid).toHaveClass("sm:grid-cols-2");
      expect(grid).toHaveClass("lg:grid-cols-4");
    });
  });
});
