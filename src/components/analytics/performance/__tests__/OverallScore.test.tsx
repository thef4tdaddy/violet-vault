import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OverallScore from "../OverallScore";

// Mock getPerformanceMessage
vi.mock("@/utils/performanceUtils", () => ({
  getPerformanceMessage: (score: number) => {
    if (score >= 90) return "Excellent financial health!";
    if (score >= 70) return "Good financial health";
    if (score >= 50) return "Fair financial health";
    return "Needs improvement";
  },
}));

describe("OverallScore", () => {
  describe("Rendering", () => {
    it("should render overall score", () => {
      render(<OverallScore score={85} />);
      expect(screen.getByText("85")).toBeInTheDocument();
    });

    it("should render Overall Financial Health title", () => {
      render(<OverallScore score={85} />);
      expect(screen.getByText("Overall Financial Health")).toBeInTheDocument();
    });

    it("should render performance message", () => {
      render(<OverallScore score={85} />);
      expect(screen.getByText("Good financial health")).toBeInTheDocument();
    });

    it("should display score in a circular badge", () => {
      const { container } = render(<OverallScore score={85} />);
      const badge = container.querySelector(".rounded-full");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("w-24", "h-24");
    });
  });

  describe("Score Display", () => {
    it("should display perfect score (100)", () => {
      render(<OverallScore score={100} />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should display zero score", () => {
      render(<OverallScore score={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display mid-range score", () => {
      render(<OverallScore score={50} />);
      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("should display decimal score", () => {
      render(<OverallScore score={85.5} />);
      expect(screen.getByText("85.5")).toBeInTheDocument();
    });

    it("should display negative score", () => {
      render(<OverallScore score={-10} />);
      expect(screen.getByText("-10")).toBeInTheDocument();
    });

    it("should display score greater than 100", () => {
      render(<OverallScore score={150} />);
      expect(screen.getByText("150")).toBeInTheDocument();
    });
  });

  describe("Performance Messages", () => {
    it("should show excellent message for high scores", () => {
      render(<OverallScore score={95} />);
      expect(screen.getByText("Excellent financial health!")).toBeInTheDocument();
    });

    it("should show good message for good scores", () => {
      render(<OverallScore score={80} />);
      expect(screen.getByText("Good financial health")).toBeInTheDocument();
    });

    it("should show fair message for fair scores", () => {
      render(<OverallScore score={60} />);
      expect(screen.getByText("Fair financial health")).toBeInTheDocument();
    });

    it("should show needs improvement message for low scores", () => {
      render(<OverallScore score={30} />);
      expect(screen.getByText("Needs improvement")).toBeInTheDocument();
    });

    it("should show excellent message for score exactly 90", () => {
      render(<OverallScore score={90} />);
      expect(screen.getByText("Excellent financial health!")).toBeInTheDocument();
    });

    it("should show good message for score exactly 70", () => {
      render(<OverallScore score={70} />);
      expect(screen.getByText("Good financial health")).toBeInTheDocument();
    });

    it("should show fair message for score exactly 50", () => {
      render(<OverallScore score={50} />);
      expect(screen.getByText("Fair financial health")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply correct container styling", () => {
      const { container } = render(<OverallScore score={85} />);
      const mainContainer = container.querySelector(".mb-8");
      expect(mainContainer).toBeInTheDocument();
    });

    it("should center align content", () => {
      const { container } = render(<OverallScore score={85} />);
      const centerContainer = container.querySelector(".text-center");
      expect(centerContainer).toBeInTheDocument();
    });

    it("should apply gradient background to score badge", () => {
      const { container } = render(<OverallScore score={85} />);
      const badge = container.querySelector(".bg-linear-to-r");
      expect(badge).toHaveClass("from-purple-500", "to-blue-600", "text-white");
    });

    it("should style score text as large and bold", () => {
      const { container } = render(<OverallScore score={85} />);
      const scoreText = container.querySelector(".text-2xl");
      expect(scoreText).toHaveClass("font-bold");
      expect(scoreText).toHaveTextContent("85");
    });

    it("should style title text", () => {
      const { container } = render(<OverallScore score={85} />);
      const title = container.querySelector(".text-lg");
      expect(title).toHaveClass("font-semibold", "text-gray-900", "mb-2");
    });

    it("should style message text", () => {
      const { container } = render(<OverallScore score={85} />);
      const message = container.querySelector(".text-gray-600");
      expect(message).toHaveClass("max-w-md", "mx-auto");
    });
  });

  describe("Layout", () => {
    it("should display badge with correct dimensions", () => {
      const { container } = render(<OverallScore score={85} />);
      const badge = container.querySelector(".w-24.h-24");
      expect(badge).toBeInTheDocument();
    });

    it("should inline-flex the badge", () => {
      const { container } = render(<OverallScore score={85} />);
      const badge = container.querySelector(".inline-flex");
      expect(badge).toHaveClass("items-center", "justify-center");
    });

    it("should add margin bottom to badge", () => {
      const { container } = render(<OverallScore score={85} />);
      const badge = container.querySelector(".mb-4");
      expect(badge).toBeInTheDocument();
    });

    it("should constrain message width", () => {
      const { container } = render(<OverallScore score={85} />);
      const message = container.querySelector(".max-w-md");
      expect(message).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large scores", () => {
      render(<OverallScore score={9999} />);
      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("should handle very small negative scores", () => {
      render(<OverallScore score={-9999} />);
      expect(screen.getByText("-9999")).toBeInTheDocument();
    });

    it("should handle fractional scores with many decimals", () => {
      render(<OverallScore score={85.123456} />);
      expect(screen.getByText("85.123456")).toBeInTheDocument();
    });

    it("should handle score as 0.0", () => {
      render(<OverallScore score={0.0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle very long performance messages", () => {
      const { container } = render(<OverallScore score={85} />);
      const message = container.querySelector(".text-gray-600");
      expect(message).toHaveClass("max-w-md"); // Should constrain width
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      const { container } = render(<OverallScore score={85} />);
      const heading = container.querySelector("h4");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Overall Financial Health");
    });

    it("should have readable text color contrast", () => {
      const { container } = render(<OverallScore score={85} />);
      const title = container.querySelector(".text-gray-900");
      expect(title).toBeInTheDocument();
    });

    it("should center content for better readability", () => {
      const { container } = render(<OverallScore score={85} />);
      const centerDiv = container.querySelector(".text-center");
      expect(centerDiv).toBeInTheDocument();
    });
  });
});
