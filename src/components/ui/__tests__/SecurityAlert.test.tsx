import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SecurityAlert from "../SecurityAlert";

// Mock getIcon utility
vi.mock("@/utils/ui/icons", () => ({
  getIcon: vi.fn((name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
    return MockIcon;
  }),
}));

describe("SecurityAlert", () => {
  const defaultProps = {
    message: "This is a test alert",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render alert message", () => {
      render(<SecurityAlert {...defaultProps} />);
      expect(screen.getByText("This is a test alert")).toBeInTheDocument();
    });

    it("should render with info type by default", () => {
      render(<SecurityAlert {...defaultProps} />);
      expect(screen.getByTestId("icon-Info")).toBeInTheDocument();
    });

    it("should render error type", () => {
      render(<SecurityAlert {...defaultProps} type="error" />);
      expect(screen.getByTestId("icon-AlertCircle")).toBeInTheDocument();
    });

    it("should render warning type", () => {
      render(<SecurityAlert {...defaultProps} type="warning" />);
      expect(screen.getByTestId("icon-AlertTriangle")).toBeInTheDocument();
    });

    it("should render success type", () => {
      render(<SecurityAlert {...defaultProps} type="success" />);
      expect(screen.getByTestId("icon-CheckCircle")).toBeInTheDocument();
    });

    it("should render info type", () => {
      render(<SecurityAlert {...defaultProps} type="info" />);
      expect(screen.getByTestId("icon-Info")).toBeInTheDocument();
    });
  });

  describe("Conditional Styling", () => {
    it("should apply error styling", () => {
      const { container } = render(<SecurityAlert {...defaultProps} type="error" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("text-red-800", "bg-red-50");
    });

    it("should apply warning styling", () => {
      const { container } = render(<SecurityAlert {...defaultProps} type="warning" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("text-orange-800", "bg-orange-50");
    });

    it("should apply success styling", () => {
      const { container } = render(<SecurityAlert {...defaultProps} type="success" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("text-green-800", "bg-green-50");
    });

    it("should apply info styling", () => {
      const { container } = render(<SecurityAlert {...defaultProps} type="info" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("text-blue-800", "bg-blue-50");
    });

    it("should apply fullscreen variant styling for error", () => {
      const { container } = render(
        <SecurityAlert {...defaultProps} type="error" variant="fullscreen" />
      );
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("text-red-300", "bg-red-500");
    });

    it("should apply standard variant styling by default", () => {
      const { container } = render(<SecurityAlert {...defaultProps} type="error" />);
      const alert = container.firstChild as HTMLElement;
      // Note: Component includes border-2 border-black which overrides border-red-200 from color scheme
      expect(alert).toHaveClass("text-red-800", "bg-red-50", "border-2", "border-black");
    });
  });

  describe("Custom Icons", () => {
    it("should render custom icon when provided", () => {
      const CustomIcon = ({ className }: { className?: string }) => (
        <svg data-testid="custom-icon" className={className}>
          <rect width="20" height="20" />
        </svg>
      );
      render(<SecurityAlert {...defaultProps} icon={CustomIcon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should use custom icon over default type icon", () => {
      const CustomIcon = ({ className }: { className?: string }) => (
        <svg data-testid="custom-icon" className={className}>
          <rect width="20" height="20" />
        </svg>
      );
      render(<SecurityAlert {...defaultProps} type="error" icon={CustomIcon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-AlertCircle")).not.toBeInTheDocument();
    });
  });

  describe("Dismissible Functionality", () => {
    it("should render dismiss button when dismissible is true", () => {
      render(<SecurityAlert {...defaultProps} dismissible={true} onDismiss={vi.fn()} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should not render dismiss button when dismissible is false", () => {
      render(<SecurityAlert {...defaultProps} dismissible={false} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      render(<SecurityAlert {...defaultProps} dismissible={true} onDismiss={onDismiss} />);

      await userEvent.click(screen.getByRole("button"));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not render dismiss button if onDismiss is not provided", () => {
      render(<SecurityAlert {...defaultProps} dismissible={true} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render standard variant by default", () => {
      const { container } = render(<SecurityAlert {...defaultProps} />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("border-2");
    });

    it("should render fullscreen variant", () => {
      const { container } = render(<SecurityAlert {...defaultProps} variant="fullscreen" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("bg-opacity-20");
    });

    it("should apply different icon colors for fullscreen variant", () => {
      render(<SecurityAlert {...defaultProps} type="error" variant="fullscreen" />);
      const icon = screen.getByTestId("icon-AlertCircle");
      expect(icon).toHaveClass("text-red-300");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty message", () => {
      render(<SecurityAlert {...defaultProps} message="" />);
      expect(screen.queryByText("This is a test alert")).not.toBeInTheDocument();
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(500);
      render(<SecurityAlert {...defaultProps} message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters in message", () => {
      const specialMessage = "Alert & <Special> 'Characters'";
      render(<SecurityAlert {...defaultProps} message={specialMessage} />);
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle custom className", () => {
      const { container } = render(<SecurityAlert {...defaultProps} className="custom-class" />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("custom-class");
    });

    it("should handle multiple onDismiss calls", async () => {
      const onDismiss = vi.fn();
      render(<SecurityAlert {...defaultProps} dismissible={true} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole("button");
      await userEvent.click(dismissButton);
      await userEvent.click(dismissButton);
      await userEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(3);
    });

    it("should handle undefined type gracefully", () => {
      render(<SecurityAlert {...defaultProps} type={undefined} />);
      expect(screen.getByTestId("icon-Info")).toBeInTheDocument();
    });

    it("should handle undefined variant gracefully", () => {
      const { container } = render(<SecurityAlert {...defaultProps} variant={undefined} />);
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("border-2");
    });

    it("should combine multiple CSS classes correctly", () => {
      const { container } = render(
        <SecurityAlert
          {...defaultProps}
          type="error"
          variant="fullscreen"
          className="extra-class"
        />
      );
      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("extra-class", "text-red-300", "bg-red-500");
    });
  });

  describe("Accessibility", () => {
    it("should have dismiss button when dismissible", () => {
      render(<SecurityAlert {...defaultProps} dismissible={true} onDismiss={vi.fn()} />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Multiline Messages", () => {
    it("should handle messages with HTML-like content", () => {
      const htmlLikeMessage = "<div>Not actual HTML</div>";
      render(<SecurityAlert {...defaultProps} message={htmlLikeMessage} />);
      expect(screen.getByText(htmlLikeMessage)).toBeInTheDocument();
    });
  });
});
