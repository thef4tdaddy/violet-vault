/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MatchConfidenceGlow, { getConfidenceLevel } from "../MatchConfidenceGlow";

describe("MatchConfidenceGlow", () => {
  describe("getConfidenceLevel helper", () => {
    it("should return 'high' for confidence >= 80%", () => {
      expect(getConfidenceLevel(0.8)).toBe("high");
      expect(getConfidenceLevel(0.9)).toBe("high");
      expect(getConfidenceLevel(1.0)).toBe("high");
    });

    it("should return 'medium' for confidence 60-79%", () => {
      expect(getConfidenceLevel(0.6)).toBe("medium");
      expect(getConfidenceLevel(0.7)).toBe("medium");
      expect(getConfidenceLevel(0.79)).toBe("medium");
    });

    it("should return 'none' for confidence < 60%", () => {
      expect(getConfidenceLevel(0)).toBe("none");
      expect(getConfidenceLevel(0.3)).toBe("none");
      expect(getConfidenceLevel(0.59)).toBe("none");
    });

    it("should return 'none' for undefined confidence", () => {
      expect(getConfidenceLevel(undefined)).toBe("none");
    });
  });

  describe("Indicator mode (default)", () => {
    it("should render a glowing dot for high confidence", () => {
      render(<MatchConfidenceGlow confidence={0.85} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute("data-confidence-level", "high");
      expect(indicator).toHaveClass("border-green-500", "bg-green-100");
      expect(indicator.className).toContain("shadow-[0_0_8px_rgba(34,197,94,0.5)]");
    });

    it("should render a glowing dot for medium confidence", () => {
      render(<MatchConfidenceGlow confidence={0.7} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveAttribute("data-confidence-level", "medium");
      expect(indicator).toHaveClass("border-yellow-500", "bg-yellow-100");
      expect(indicator.className).toContain("shadow-[0_0_8px_rgba(234,179,8,0.5)]");
    });

    it("should not render for low/none confidence", () => {
      const { container } = render(<MatchConfidenceGlow confidence={0.3} />);

      expect(screen.queryByTestId("confidence-indicator")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it("should not render when confidence is undefined", () => {
      const { container } = render(<MatchConfidenceGlow />);

      expect(screen.queryByTestId("confidence-indicator")).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it("should have proper aria-label with percentage", () => {
      render(<MatchConfidenceGlow confidence={0.82} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveAttribute("aria-label", "Match confidence: 82% (high)");
      expect(indicator).toHaveAttribute("role", "status");
    });
  });

  describe("Badge mode", () => {
    it("should render badge with percentage for high confidence", () => {
      render(<MatchConfidenceGlow confidence={0.9} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute("data-confidence-level", "high");
      expect(screen.getByText("90%")).toBeInTheDocument();
    });

    it("should render badge with percentage for medium confidence", () => {
      render(<MatchConfidenceGlow confidence={0.65} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveAttribute("data-confidence-level", "medium");
      expect(screen.getByText("65%")).toBeInTheDocument();
    });

    it("should render badge even for low confidence", () => {
      render(<MatchConfidenceGlow confidence={0.4} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveAttribute("data-confidence-level", "none");
      expect(screen.getByText("40%")).toBeInTheDocument();
    });

    it("should render badge with 0% for undefined confidence", () => {
      render(<MatchConfidenceGlow showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should include glowing dot indicator in badge", () => {
      const { container } = render(<MatchConfidenceGlow confidence={0.85} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      // Badge should contain an indicator dot
      const dots = container.querySelectorAll(".rounded-full");
      expect(dots.length).toBeGreaterThan(0);
    });

    it("should have proper aria-label in badge mode", () => {
      render(<MatchConfidenceGlow confidence={0.75} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveAttribute("aria-label", "Match confidence: 75% (medium)");
    });
  });

  describe("Size variants", () => {
    it("should apply small size classes", () => {
      render(<MatchConfidenceGlow confidence={0.8} size="sm" />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveClass("w-3", "h-3");
    });

    it("should apply medium size classes (default)", () => {
      render(<MatchConfidenceGlow confidence={0.8} size="md" />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveClass("w-4", "h-4");
    });

    it("should apply large size classes", () => {
      render(<MatchConfidenceGlow confidence={0.8} size="lg" />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveClass("w-6", "h-6");
    });

    it("should apply size-specific text classes in badge mode", () => {
      render(<MatchConfidenceGlow confidence={0.8} size="sm" showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("text-xs");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to indicator", () => {
      render(<MatchConfidenceGlow confidence={0.8} className="custom-class" />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveClass("custom-class");
    });

    it("should apply custom className to badge", () => {
      render(<MatchConfidenceGlow confidence={0.8} showBadge className="custom-class" />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("custom-class");
    });
  });

  describe("Confidence level styling", () => {
    it("should apply high confidence styling (green)", () => {
      render(<MatchConfidenceGlow confidence={0.9} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("border-green-500", "bg-green-100", "text-green-700");
    });

    it("should apply medium confidence styling (yellow)", () => {
      render(<MatchConfidenceGlow confidence={0.7} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("border-yellow-500", "bg-yellow-100", "text-yellow-700");
    });

    it("should apply low/none confidence styling (gray)", () => {
      render(<MatchConfidenceGlow confidence={0.3} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("border-gray-300", "bg-gray-100", "text-gray-700");
    });

    it("should have glow effect for high confidence", () => {
      render(<MatchConfidenceGlow confidence={0.9} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator.className).toContain("shadow-[0_0_8px_rgba(34,197,94,0.5)]");
    });

    it("should have glow effect for medium confidence", () => {
      render(<MatchConfidenceGlow confidence={0.7} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator.className).toContain("shadow-[0_0_8px_rgba(234,179,8,0.5)]");
    });
  });

  describe("Hard Line styling", () => {
    it("should use mono font with bold uppercase in badge mode", () => {
      render(<MatchConfidenceGlow confidence={0.8} showBadge />);

      const badge = screen.getByTestId("confidence-badge");
      expect(badge).toHaveClass("font-mono", "font-black", "uppercase", "tracking-wide");
    });

    it("should have border styling", () => {
      render(<MatchConfidenceGlow confidence={0.8} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator.className).toMatch(/border-/);
    });

    it("should have rounded full shape", () => {
      render(<MatchConfidenceGlow confidence={0.8} />);

      const indicator = screen.getByTestId("confidence-indicator");
      expect(indicator).toHaveClass("rounded-full");
    });
  });
});
