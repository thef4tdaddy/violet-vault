import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ChartContainer from "../ChartContainer";

describe("ChartContainer", () => {
  const defaultProps = {
    title: "Test Chart",
    children: <div>Chart Content</div>,
  };

  describe("Rendering", () => {
    it("should render chart container with title", () => {
      render(<ChartContainer {...defaultProps} />);
      expect(screen.getByText("Test Chart")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<ChartContainer {...defaultProps} />);
      expect(screen.getByText("Chart Content")).toBeInTheDocument();
    });

    it("should render subtitle when provided", () => {
      render(<ChartContainer {...defaultProps} subtitle="Test Subtitle" />);
      expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    });

    it("should render actions when provided", () => {
      const actions = <button>Action Button</button>;
      render(<ChartContainer {...defaultProps} actions={actions} />);
      expect(screen.getByText("Action Button")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<ChartContainer {...defaultProps} className="custom-class" />);
      const chartDiv = container.firstChild as HTMLElement;
      expect(chartDiv).toHaveClass("custom-class");
    });

    it("should apply dataTestId when provided", () => {
      render(<ChartContainer {...defaultProps} dataTestId="test-chart" />);
      expect(screen.getByTestId("test-chart")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should render loading state when loading is true", () => {
      render(<ChartContainer {...defaultProps} loading={true} />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should not render children when loading", () => {
      render(<ChartContainer {...defaultProps} loading={true} />);
      expect(screen.queryByText("Chart Content")).not.toBeInTheDocument();
    });

    it("should render title when loading", () => {
      render(<ChartContainer {...defaultProps} loading={true} />);
      expect(screen.getByText("Test Chart")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should render error state when error is provided", () => {
      const error = new Error("Test error");
      render(<ChartContainer {...defaultProps} error={error} />);
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it("should not render children when error exists", () => {
      const error = new Error("Test error");
      render(<ChartContainer {...defaultProps} error={error} />);
      expect(screen.queryByText("Chart Content")).not.toBeInTheDocument();
    });

    it("should handle string error", () => {
      render(<ChartContainer {...defaultProps} error="String error message" />);
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should render empty state when no children", () => {
      render(<ChartContainer {...defaultProps} children={undefined} />);
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should render custom empty message", () => {
      render(
        <ChartContainer
          {...defaultProps}
          children={undefined}
          emptyMessage="Custom empty message"
        />
      );
      expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long titles", () => {
      const longTitle = "A".repeat(200);
      render(<ChartContainer {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle title as ReactNode", () => {
      const titleNode = (
        <div>
          <span>Complex</span> <strong>Title</strong>
        </div>
      );
      render(<ChartContainer {...defaultProps} title={titleNode} />);
      expect(screen.getByText("Complex")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const multipleChildren = (
        <>
          <div>Child 1</div>
          <div>Child 2</div>
        </>
      );
      render(<ChartContainer {...defaultProps} children={multipleChildren} />);
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
    });
  });
});
