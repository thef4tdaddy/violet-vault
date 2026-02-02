import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MinimalHealthGauge } from "../MinimalHealthGauge";

describe("MinimalHealthGauge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render health gauge", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("minimal-health-gauge")).toBeInTheDocument();
    });

    it("should render title", () => {
      render(<MinimalHealthGauge score={85} title="Test Gauge" />);

      expect(screen.getByText("Test Gauge")).toBeInTheDocument();
    });

    it("should render default title when not provided", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByText("Health Score")).toBeInTheDocument();
    });

    it("should render score value", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("85");
    });

    it("should render '/ 100' label", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("gauge-label")).toHaveTextContent("/ 100");
    });

    it("should have correct accessibility attributes", () => {
      render(<MinimalHealthGauge score={85} />);

      const region = screen.getByRole("region", { name: "Health Score" });
      expect(region).toBeInTheDocument();

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("aria-label", "Health score: 85 out of 100");
    });
  });

  describe("Score Clamping", () => {
    it("should clamp negative scores to 0", () => {
      render(<MinimalHealthGauge score={-10} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("0");
    });

    it("should clamp scores above 100 to 100", () => {
      render(<MinimalHealthGauge score={150} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("100");
    });

    it("should handle decimal scores by rounding", () => {
      render(<MinimalHealthGauge score={85.7} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("86");
    });

    it("should accept valid scores between 0-100", () => {
      render(<MinimalHealthGauge score={50} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("50");
    });
  });

  describe("Health Status Colors", () => {
    it("should show green for excellent health (≥90)", () => {
      render(<MinimalHealthGauge score={95} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Excellent");
      expect(status).toHaveStyle({ color: "#10b981" }); // emerald-500
    });

    it("should show blue for good health (75-89)", () => {
      render(<MinimalHealthGauge score={80} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Good");
      expect(status).toHaveStyle({ color: "#3b82f6" }); // blue-500
    });

    it("should show amber for fair health (60-74)", () => {
      render(<MinimalHealthGauge score={65} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Fair");
      expect(status).toHaveStyle({ color: "#f59e0b" }); // amber-500
    });

    it("should show red for poor health (<60)", () => {
      render(<MinimalHealthGauge score={45} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Needs Attention");
      expect(status).toHaveStyle({ color: "#ef4444" }); // red-500
    });

    it("should show correct color at boundary: score 90", () => {
      render(<MinimalHealthGauge score={90} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Excellent");
    });

    it("should show correct color at boundary: score 75", () => {
      render(<MinimalHealthGauge score={75} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Good");
    });

    it("should show correct color at boundary: score 60", () => {
      render(<MinimalHealthGauge score={60} />);

      const status = screen.getByTestId("gauge-status");
      expect(status).toHaveTextContent("Fair");
    });
  });

  describe("SVG Structure", () => {
    it("should render SVG with correct viewBox", () => {
      render(<MinimalHealthGauge score={85} size={200} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("viewBox", "0 0 200 200");
    });

    it("should render background circle", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("gauge-background")).toBeInTheDocument();
    });

    it("should render progress circle", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("gauge-progress")).toBeInTheDocument();
    });

    it("should render center content", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.getByTestId("gauge-center")).toBeInTheDocument();
    });

    it("should respect custom size prop", () => {
      render(<MinimalHealthGauge score={85} size={150} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("width", "150");
      expect(svg).toHaveAttribute("height", "150");
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      render(<MinimalHealthGauge score={85} loading={true} />);

      expect(screen.getByTestId("health-gauge-loading")).toBeInTheDocument();
      expect(screen.queryByTestId("minimal-health-gauge")).not.toBeInTheDocument();
    });

    it("should show animated skeleton", () => {
      const { container } = render(<MinimalHealthGauge score={85} loading={true} />);

      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not show loading state by default", () => {
      render(<MinimalHealthGauge score={85} />);

      expect(screen.queryByTestId("health-gauge-loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("minimal-health-gauge")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle score of 0", () => {
      render(<MinimalHealthGauge score={0} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("0");
      expect(screen.getByTestId("gauge-status")).toHaveTextContent("Needs Attention");
    });

    it("should handle score of 100", () => {
      render(<MinimalHealthGauge score={100} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("100");
      expect(screen.getByTestId("gauge-status")).toHaveTextContent("Excellent");
    });

    it("should handle very small positive scores", () => {
      render(<MinimalHealthGauge score={0.1} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("0");
    });

    it("should handle very large negative scores", () => {
      render(<MinimalHealthGauge score={-1000} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("0");
    });

    it("should handle very large positive scores", () => {
      render(<MinimalHealthGauge score={1000} />);

      expect(screen.getByTestId("gauge-score")).toHaveTextContent("100");
    });
  });

  describe("Size Variations", () => {
    it("should handle small size", () => {
      render(<MinimalHealthGauge score={85} size={100} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("width", "100");
      expect(svg).toHaveAttribute("height", "100");
    });

    it("should handle large size", () => {
      render(<MinimalHealthGauge score={85} size={300} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("width", "300");
      expect(svg).toHaveAttribute("height", "300");
    });

    it("should use default size when not provided", () => {
      render(<MinimalHealthGauge score={85} />);

      const svg = screen.getByRole("img");
      expect(svg).toHaveAttribute("width", "200");
      expect(svg).toHaveAttribute("height", "200");
    });
  });

  describe("Progress Calculation", () => {
    it("should show no progress for score 0", () => {
      render(<MinimalHealthGauge score={0} />);

      const progress = screen.getByTestId("gauge-progress");
      // Should have full offset (no progress)
      expect(progress).toHaveAttribute("stroke-dashoffset");
    });

    it("should show full progress for score 100", () => {
      render(<MinimalHealthGauge score={100} />);

      const progress = screen.getByTestId("gauge-progress");
      // Should have zero or minimal offset (full progress)
      expect(progress).toHaveAttribute("stroke-dashoffset");
    });

    it("should show half progress for score 50", () => {
      render(<MinimalHealthGauge score={50} />);

      const progress = screen.getByTestId("gauge-progress");
      expect(progress).toHaveAttribute("stroke-dashoffset");
    });
  });
});
