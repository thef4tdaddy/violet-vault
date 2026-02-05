import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PerformanceHeader from "../PerformanceHeader";
import "@testing-library/jest-dom";

// Mock getIcon utility
vi.mock("@/utils", () => ({
  getIcon: (name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <div data-testid={`icon-${name}`} className={className}>
        {name}
      </div>
    );
    MockIcon.displayName = `MockIcon-${name}`;
    return MockIcon;
  },
}));

// Mock Button component
vi.mock("@/components/ui", () => ({
  Button: ({
    onClick,
    className,
    children,
  }: {
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
  }) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

describe("PerformanceHeader", () => {
  const mockSetAlertsEnabled = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    });

    it("should render the title", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    });

    it("should render the subtitle", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Real-time financial health tracking")).toBeInTheDocument();
    });

    it("should render Live indicator", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Live")).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render Zap icon for title", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-Zap")).toBeInTheDocument();
    });

    it("should render Clock icon for Live indicator", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-Clock")).toBeInTheDocument();
    });

    it("should render Bell icon when alerts are enabled", () => {
      render(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-Bell")).toBeInTheDocument();
    });

    it("should render BellOff icon when alerts are disabled", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-BellOff")).toBeInTheDocument();
    });

    it("should apply correct className to Zap icon", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const zapIcon = screen.getByTestId("icon-Zap");
      expect(zapIcon).toHaveClass("h-5", "w-5", "text-white");
    });

    it("should apply correct className to Clock icon", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const clockIcon = screen.getByTestId("icon-Clock");
      expect(clockIcon).toHaveClass("h-4", "w-4");
    });

    it("should apply correct className to Bell/BellOff icons", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      expect(screen.getByTestId("icon-Bell")).toHaveClass("h-4", "w-4");

      rerender(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-BellOff")).toHaveClass("h-4", "w-4");
    });
  });

  describe("Button Interactions", () => {
    it("should render alert toggle button", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("button")).toBeInTheDocument();
    });

    it("should call setAlertsEnabled with true when alerts are disabled", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalledWith(true);
      expect(mockSetAlertsEnabled).toHaveBeenCalledTimes(1);
    });

    it("should call setAlertsEnabled with false when alerts are enabled", () => {
      render(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalledWith(false);
      expect(mockSetAlertsEnabled).toHaveBeenCalledTimes(1);
    });

    it("should allow multiple clicks", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalledTimes(3);
    });
  });

  describe("Button Styling", () => {
    it("should apply blue styling when alerts are enabled", () => {
      render(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      expect(button.className).toContain("text-blue-600");
      expect(button.className).toContain("bg-blue-100");
      expect(button.className).toContain("hover:bg-blue-200");
    });

    it("should apply gray styling when alerts are disabled", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      expect(button.className).toContain("text-gray-400");
      expect(button.className).toContain("bg-gray-100");
      expect(button.className).toContain("hover:bg-gray-200");
    });

    it("should apply common button classes", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      expect(button.className).toContain("p-2");
      expect(button.className).toContain("rounded-lg");
      expect(button.className).toContain("transition-colors");
    });
  });

  describe("Layout and Structure", () => {
    it("should render container with correct layout classes", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass("flex", "items-center", "justify-between", "mb-6");
    });

    it("should render title with heading element", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const heading = screen.getByRole("heading", { name: /Performance Monitor/i });
      expect(heading).toBeInTheDocument();
    });

    it("should apply correct styling to title", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const heading = container.querySelector("h3");
      expect(heading).toHaveClass(
        "text-xl",
        "font-semibold",
        "text-gray-900",
        "flex",
        "items-center"
      );
    });

    it("should render icon container with blur effect", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const blurDiv = container.querySelector(".blur-lg");
      expect(blurDiv).toBeInTheDocument();
      expect(blurDiv).toHaveClass(
        "absolute",
        "inset-0",
        "bg-purple-500",
        "rounded-xl",
        "opacity-30"
      );
    });

    it("should render icon container with proper structure", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const iconContainer = container.querySelector(".relative.mr-3");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should render icon badge with purple background", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const iconBadge = container.querySelector(".bg-purple-500.p-2");
      expect(iconBadge).toBeInTheDocument();
      expect(iconBadge).toHaveClass("relative", "rounded-xl");
    });

    it("should render controls section with correct layout", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const controlsContainer = container.querySelector(".flex.items-center.gap-2");
      expect(controlsContainer).toBeInTheDocument();
    });

    it("should render Live indicator with correct styling", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const liveIndicator = container.querySelector(".text-sm.text-gray-500");
      expect(liveIndicator).toBeInTheDocument();
      expect(liveIndicator).toHaveClass("flex", "items-center", "gap-1");
    });
  });

  describe("Conditional Rendering", () => {
    it("should change button appearance based on alertsEnabled prop", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      let button = screen.getByTestId("button");
      expect(button.className).toContain("text-gray-400");

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      button = screen.getByTestId("button");
      expect(button.className).toContain("text-blue-600");
    });

    it("should toggle icon between Bell and BellOff", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      expect(screen.getByTestId("icon-BellOff")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-Bell")).not.toBeInTheDocument();

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-Bell")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-BellOff")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid button clicks", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      expect(mockSetAlertsEnabled).toHaveBeenCalledTimes(10);
    });

    it("should toggle alerts state correctly in sequence", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const button = screen.getByTestId("button");
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalledWith(true);

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalledWith(false);
    });

    it("should maintain component stability with different prop combinations", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();

      rerender(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it("should have readable text colors", () => {
      const { container } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      const title = container.querySelector(".text-gray-900");
      const subtitle = container.querySelector(".text-gray-600");
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });

    it("should have focusable button", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      expect(button).toBeInstanceOf(HTMLButtonElement);
    });

    it("should have visual feedback on button state", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      let button = screen.getByTestId("button");
      expect(button.className).toContain("bg-gray-100");

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      button = screen.getByTestId("button");
      expect(button.className).toContain("bg-blue-100");
    });
  });

  describe("Props Validation", () => {
    it("should accept alertsEnabled as true", () => {
      render(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-Bell")).toBeInTheDocument();
    });

    it("should accept alertsEnabled as false", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByTestId("icon-BellOff")).toBeInTheDocument();
    });

    it("should accept setAlertsEnabled as function", () => {
      render(<PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />);
      const button = screen.getByTestId("button");
      fireEvent.click(button);
      expect(mockSetAlertsEnabled).toHaveBeenCalled();
    });
  });

  describe("Component Integration", () => {
    it("should maintain state consistency between renders", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
    });

    it("should preserve all elements on prop changes", () => {
      const { rerender } = render(
        <PerformanceHeader alertsEnabled={false} setAlertsEnabled={mockSetAlertsEnabled} />
      );
      expect(screen.getByText("Live")).toBeInTheDocument();

      rerender(<PerformanceHeader alertsEnabled={true} setAlertsEnabled={mockSetAlertsEnabled} />);
      expect(screen.getByText("Live")).toBeInTheDocument();
    });
  });
});
