import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import StatCard from "../StatCard";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe("StatCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with title and value", () => {
      render(<StatCard title="Total Budget" value="$5,200" />);
      expect(screen.getByText("Total Budget")).toBeInTheDocument();
      expect(screen.getByText("$5,200")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(<StatCard icon={MockIcon} title="Budget" value="$100" />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("should render with numeric value", () => {
      render(<StatCard title="Count" value={42} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("Description", () => {
    it("should render description when provided", () => {
      render(<StatCard title="Budget" value="$500" description="Monthly limit" />);
      expect(screen.getByText("Monthly limit")).toBeInTheDocument();
    });

    it("should not render description when not provided", () => {
      render(<StatCard title="Budget" value="$500" />);
      expect(screen.queryByText("Monthly limit")).not.toBeInTheDocument();
    });
  });

  describe("Colors", () => {
    it("should apply blue color by default", () => {
      const { container } = render(<StatCard title="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-blue-50");
    });

    it("should apply purple color", () => {
      const { container } = render(<StatCard title="Test" value="100" color="purple" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-purple-50");
    });

    it("should apply green color", () => {
      const { container } = render(<StatCard title="Test" value="100" color="green" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-green-50");
    });

    it("should apply red color", () => {
      const { container } = render(<StatCard title="Test" value="100" color="red" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-red-50");
    });

    it("should fall back to blue for unknown color", () => {
      const { container } = render(
        <StatCard title="Test" value="100" color={"unknown" as never} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-blue-50");
    });
  });

  describe("Icon Styling", () => {
    it("should apply correct icon color class", () => {
      render(<StatCard icon={MockIcon} title="Test" value="100" color="purple" />);
      const icon = screen.getByTestId("mock-icon");
      expect(icon).toHaveClass("text-purple-600");
    });

    it("should apply correct icon size", () => {
      render(<StatCard icon={MockIcon} title="Test" value="100" />);
      const icon = screen.getByTestId("mock-icon");
      expect(icon).toHaveClass("h-6", "w-6");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      const { container } = render(<StatCard title="Test" value="100" className="custom-class" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Layout", () => {
    it("should have centered text", () => {
      const { container } = render(<StatCard title="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("text-center");
    });

    it("should have border styling", () => {
      const { container } = render(<StatCard title="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("border", "border-gray-200");
    });
  });
});
