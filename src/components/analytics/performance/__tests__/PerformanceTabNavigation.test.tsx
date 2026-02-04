import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PerformanceTabNavigation from "../PerformanceTabNavigation";
import "@testing-library/jest-dom";

// Mock getIcon
vi.mock("../../../../utils", () => ({
  getIcon: () => (props: { className?: string }) => (
    <svg className={props.className} data-testid="mock-icon" />
  ),
}));

describe("PerformanceTabNavigation", () => {
  const mockSetSelectedMetric = vi.fn();

  const defaultProps = {
    selectedMetric: "overview",
    setSelectedMetric: mockSetSelectedMetric,
    alertsCount: 3,
    recommendationsCount: 5,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all three tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Alerts")).toBeInTheDocument();
      expect(screen.getByText("Tips")).toBeInTheDocument();
    });

    it("should render tab buttons with correct roles", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
    });

    it("should render icons for all tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const icons = screen.getAllByTestId("mock-icon");
      expect(icons).toHaveLength(3);
    });

    it("should render container with correct base classes", () => {
      const { container } = render(<PerformanceTabNavigation {...defaultProps} />);

      const containerDiv = container.querySelector(".flex.border-b.border-gray-200");
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("Tab Selection and Active State", () => {
    it("should apply active styles to overview tab when selected", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="overview" />);

      const overviewButton = screen.getByText("Overview").closest("button");
      expect(overviewButton).toHaveClass("border-purple-500", "text-purple-600");
    });

    it("should apply active styles to alerts tab when selected", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="alerts" />);

      const alertsButton = screen.getByText("Alerts").closest("button");
      expect(alertsButton).toHaveClass("border-purple-500", "text-purple-600");
    });

    it("should apply active styles to recommendations tab when selected", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="recommendations" />);

      const tipsButton = screen.getByText("Tips").closest("button");
      expect(tipsButton).toHaveClass("border-purple-500", "text-purple-600");
    });

    it("should apply inactive styles to non-selected tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="overview" />);

      const alertsButton = screen.getByText("Alerts").closest("button");
      const tipsButton = screen.getByText("Tips").closest("button");

      expect(alertsButton).toHaveClass("border-transparent", "text-gray-500");
      expect(tipsButton).toHaveClass("border-transparent", "text-gray-500");
    });
  });

  describe("Tab Interaction", () => {
    it("should call setSelectedMetric with 'overview' when overview tab is clicked", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const overviewButton = screen.getByText("Overview").closest("button");
      fireEvent.click(overviewButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledWith("overview");
      expect(mockSetSelectedMetric).toHaveBeenCalledTimes(1);
    });

    it("should call setSelectedMetric with 'alerts' when alerts tab is clicked", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const alertsButton = screen.getByText("Alerts").closest("button");
      fireEvent.click(alertsButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledWith("alerts");
      expect(mockSetSelectedMetric).toHaveBeenCalledTimes(1);
    });

    it("should call setSelectedMetric with 'recommendations' when tips tab is clicked", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const tipsButton = screen.getByText("Tips").closest("button");
      fireEvent.click(tipsButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledWith("recommendations");
      expect(mockSetSelectedMetric).toHaveBeenCalledTimes(1);
    });

    it("should allow clicking already selected tab", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="overview" />);

      const overviewButton = screen.getByText("Overview").closest("button");
      fireEvent.click(overviewButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledWith("overview");
    });
  });

  describe("Badge/Count Display", () => {
    it("should display alerts count badge when count > 0", () => {
      render(<PerformanceTabNavigation {...defaultProps} alertsCount={3} />);

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should display recommendations count badge when count > 0", () => {
      render(<PerformanceTabNavigation {...defaultProps} recommendationsCount={5} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should not display badge when alerts count is 0", () => {
      render(<PerformanceTabNavigation {...defaultProps} alertsCount={0} />);

      // Should only have recommendationsCount (5) in the document, not alerts count
      const badges = screen.queryAllByText("0");
      expect(badges).toHaveLength(0);
    });

    it("should not display badge when recommendations count is 0", () => {
      render(
        <PerformanceTabNavigation {...defaultProps} alertsCount={0} recommendationsCount={0} />
      );

      // No badges should be visible
      const alertsButton = screen.getByText("Alerts").closest("button");
      const tipsButton = screen.getByText("Tips").closest("button");

      expect(alertsButton?.querySelector(".bg-red-100")).not.toBeInTheDocument();
      expect(tipsButton?.querySelector(".bg-red-100")).not.toBeInTheDocument();
    });

    it("should display both badges when both counts > 0", () => {
      render(
        <PerformanceTabNavigation {...defaultProps} alertsCount={3} recommendationsCount={5} />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should not display badge for overview tab", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const overviewButton = screen.getByText("Overview").closest("button");
      expect(overviewButton?.querySelector(".bg-red-100")).not.toBeInTheDocument();
    });

    it("should display large count numbers correctly", () => {
      render(
        <PerformanceTabNavigation {...defaultProps} alertsCount={99} recommendationsCount={150} />
      );

      expect(screen.getByText("99")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
    });
  });

  describe("Badge Styling", () => {
    it("should apply correct badge styling", () => {
      render(<PerformanceTabNavigation {...defaultProps} alertsCount={3} />);

      const badge = screen.getByText("3");
      expect(badge).toHaveClass(
        "bg-red-100",
        "text-red-600",
        "px-2",
        "py-1",
        "rounded-full",
        "text-xs"
      );
    });
  });

  describe("Button Styling", () => {
    it("should apply base button classes to all tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass(
          "px-4",
          "py-2",
          "text-sm",
          "font-medium",
          "border-b-2",
          "flex",
          "items-center",
          "gap-2"
        );
      });
    });

    it("should include hover classes for inactive tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="overview" />);

      const alertsButton = screen.getByText("Alerts").closest("button");
      expect(alertsButton).toHaveClass("hover:text-gray-700");
    });
  });

  describe("Icon Rendering", () => {
    it("should render icons with correct className", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const icons = screen.getAllByTestId("mock-icon");
      icons.forEach((icon) => {
        expect(icon).toHaveClass("h-4", "w-4");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle negative count values by not displaying badge", () => {
      render(
        <PerformanceTabNavigation {...defaultProps} alertsCount={-1} recommendationsCount={-5} />
      );

      expect(screen.queryByText("-1")).not.toBeInTheDocument();
      expect(screen.queryByText("-5")).not.toBeInTheDocument();
    });

    it("should handle undefined count values", () => {
      const props = {
        ...defaultProps,
        alertsCount: undefined as unknown as number,
        recommendationsCount: undefined as unknown as number,
      };

      render(<PerformanceTabNavigation {...props} />);
      expect(screen.getByText("Alerts")).toBeInTheDocument();
      expect(screen.getByText("Tips")).toBeInTheDocument();
    });

    it("should handle empty string as selectedMetric", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="" />);

      // No tab should have active styling
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("border-transparent");
      });
    });

    it("should handle invalid selectedMetric value", () => {
      render(<PerformanceTabNavigation {...defaultProps} selectedMetric="invalid" />);

      // No tab should have active styling
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("border-transparent");
      });
    });

    it("should handle very large count numbers", () => {
      render(
        <PerformanceTabNavigation
          {...defaultProps}
          alertsCount={99999}
          recommendationsCount={100000}
        />
      );

      expect(screen.getByText("99999")).toBeInTheDocument();
      expect(screen.getByText("100000")).toBeInTheDocument();
    });
  });

  describe("Multiple Clicks", () => {
    it("should handle multiple rapid clicks on same tab", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const overviewButton = screen.getByText("Overview").closest("button");
      fireEvent.click(overviewButton!);
      fireEvent.click(overviewButton!);
      fireEvent.click(overviewButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledTimes(3);
      expect(mockSetSelectedMetric).toHaveBeenCalledWith("overview");
    });

    it("should handle switching between tabs", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const overviewButton = screen.getByText("Overview").closest("button");
      const alertsButton = screen.getByText("Alerts").closest("button");
      const tipsButton = screen.getByText("Tips").closest("button");

      fireEvent.click(overviewButton!);
      fireEvent.click(alertsButton!);
      fireEvent.click(tipsButton!);

      expect(mockSetSelectedMetric).toHaveBeenCalledTimes(3);
      expect(mockSetSelectedMetric).toHaveBeenNthCalledWith(1, "overview");
      expect(mockSetSelectedMetric).toHaveBeenNthCalledWith(2, "alerts");
      expect(mockSetSelectedMetric).toHaveBeenNthCalledWith(3, "recommendations");
    });
  });

  describe("Accessibility", () => {
    it("should have all tabs accessible via keyboard", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.tagName).toBe("BUTTON");
      });
    });

    it("should maintain tab order in DOM", () => {
      render(<PerformanceTabNavigation {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons[0]).toHaveTextContent("Overview");
      expect(buttons[1]).toHaveTextContent("Alerts");
      expect(buttons[2]).toHaveTextContent("Tips");
    });
  });

  describe("Component Structure", () => {
    it("should render tabs in correct order", () => {
      const { container } = render(<PerformanceTabNavigation {...defaultProps} />);

      const buttons = container.querySelectorAll("button");
      expect(buttons[0]).toHaveTextContent("Overview");
      expect(buttons[1]).toHaveTextContent("Alerts");
      expect(buttons[2]).toHaveTextContent("Tips");
    });

    it("should maintain flex layout structure", () => {
      const { container } = render(<PerformanceTabNavigation {...defaultProps} />);

      const flexContainer = container.querySelector(".flex");
      expect(flexContainer).toHaveClass("border-b", "border-gray-200", "mb-6");
    });
  });
});
