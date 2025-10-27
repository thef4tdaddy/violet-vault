import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoadingSpinner from "../LoadingSpinner";

// Mock the icon utility
vi.mock("../../utils/icons", () => ({
  renderIcon: vi.fn((name: string, props: any) => (
    <span data-testid={`icon-${name}`} className={props?.className}>
      {name}
    </span>
  )),
}));

describe("LoadingSpinner", () => {
  describe("Rendering", () => {
    it("should render with default message", () => {
      render(<LoadingSpinner />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render with custom message", () => {
      render(<LoadingSpinner message="Fetching data..." />);
      expect(screen.getByText("Fetching data...")).toBeInTheDocument();
    });

    it("should render 'Please wait...' helper text", () => {
      render(<LoadingSpinner />);
      const allWaitText = screen.getAllByText("Please wait...");
      // Should find at least one instance
      expect(allWaitText.length).toBeGreaterThan(0);
    });

    it("should render with glassmorphism styling", () => {
      const { container } = render(<LoadingSpinner />);
      const glassmorphismDiv = container.querySelector(".glassmorphism");
      expect(glassmorphismDiv).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply glassmorphism styling", () => {
      const { container } = render(<LoadingSpinner />);
      const glassmorphismDiv = container.querySelector(".glassmorphism");
      expect(glassmorphismDiv).toBeInTheDocument();
    });

    it("should have animation class", () => {
      const { container } = render(<LoadingSpinner />);
      const animatedIcon = container.querySelector(".animate-spin");
      expect(animatedIcon).toBeInTheDocument();
    });

    it("should have proper text styling", () => {
      render(<LoadingSpinner message="Test message" />);
      const message = screen.getByText("Test message");
      expect(message).toHaveClass("text-lg");
      expect(message).toHaveClass("font-semibold");
    });
  });

  describe("Accessibility", () => {
    it("should be visible and accessible", () => {
      render(<LoadingSpinner message="Loading data" />);
      const message = screen.getByText("Loading data");
      expect(message).toBeVisible();
    });
  });

  describe("Multiple instances", () => {
    it("should render multiple instances with different messages", () => {
      const { rerender } = render(<LoadingSpinner message="Loading step 1" />);
      expect(screen.getByText("Loading step 1")).toBeInTheDocument();

      rerender(<LoadingSpinner message="Loading step 2" />);
      expect(screen.getByText("Loading step 2")).toBeInTheDocument();
    });
  });
});
