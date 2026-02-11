import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { MetricCard } from "../MetricCard";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Mock getIcon
vi.mock("@/utils", () => ({
  getIcon: vi.fn((iconName: string) => {
    // Return different test IDs for different icons
    if (iconName === "TrendingUp") {
      return ({ className }: { className?: string }) => (
        <svg data-testid="trending-up-icon" className={className}>
          <path d="M0 0" />
        </svg>
      );
    }
    if (iconName === "TrendingDown") {
      return ({ className }: { className?: string }) => (
        <svg data-testid="trending-down-icon" className={className}>
          <path d="M0 0" />
        </svg>
      );
    }
    if (iconName === "Minus") {
      return ({ className }: { className?: string }) => (
        <svg data-testid="minus-icon" className={className}>
          <path d="M0 0" />
        </svg>
      );
    }
    return MockIcon;
  }),
}));

describe("MetricCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with title and value", () => {
      render(<MetricCard title="Total Revenue" value={1234.56} />);
      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("1,235")).toBeInTheDocument(); // Default number format
    });

    it("should render with string value", () => {
      render(<MetricCard title="Status" value="Active" format="custom" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(<MetricCard title="Revenue" value={100} icon="DollarSign" />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    it("should render with subtitle", () => {
      render(<MetricCard title="Revenue" value={100} subtitle="Last 30 days" />);
      expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    });
  });

  describe("Value Formatting", () => {
    it("should format currency correctly", () => {
      render(<MetricCard title="Revenue" value={123456.78} format="currency" />);
      expect(screen.getByText("$123,456.78")).toBeInTheDocument();
    });

    it("should format numbers correctly", () => {
      render(<MetricCard title="Count" value={12345} format="number" />);
      expect(screen.getByText("12,345")).toBeInTheDocument();
    });

    it("should format percentages correctly", () => {
      render(<MetricCard title="Rate" value={12.5} format="percentage" />);
      expect(screen.getByText("12.5%")).toBeInTheDocument();
    });

    it("should use custom formatter when provided", () => {
      const customFormatter = (value: number | string) => `Custom: ${value}`;
      render(
        <MetricCard title="Custom" value={100} format="custom" customFormatter={customFormatter} />
      );
      expect(screen.getByText("Custom: 100")).toBeInTheDocument();
    });

    it("should handle invalid number strings", () => {
      render(<MetricCard title="Test" value="invalid" format="currency" />);
      expect(screen.getByText("invalid")).toBeInTheDocument();
    });
  });

  describe("Change Indicator", () => {
    it("should show positive change with green color", () => {
      render(<MetricCard title="Revenue" value={100} change={5.2} />);
      expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
      expect(screen.getByText("+5.2%")).toBeInTheDocument();
    });

    it("should show negative change with red color", () => {
      render(<MetricCard title="Revenue" value={100} change={-3.1} />);
      expect(screen.getByTestId("trending-down-icon")).toBeInTheDocument();
      expect(screen.getByText("-3.1%")).toBeInTheDocument();
    });

    it("should show zero change with gray color", () => {
      render(<MetricCard title="Revenue" value={100} change={0} />);
      expect(screen.getByTestId("minus-icon")).toBeInTheDocument();
      expect(screen.getByText("0.0%")).toBeInTheDocument();
    });

    it("should not show change indicator when change is undefined", () => {
      render(<MetricCard title="Revenue" value={100} />);
      expect(screen.queryByTestId("trending-up-icon")).not.toBeInTheDocument();
      expect(screen.queryByTestId("trending-down-icon")).not.toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should apply default variant color", () => {
      render(<MetricCard title="Test" value={100} icon="DollarSign" />);
      const iconContainer = screen.getByTestId("metric-card-icon-container");
      expect(iconContainer).toHaveClass("bg-purple-600");
    });

    it("should apply success variant color", () => {
      render(<MetricCard title="Test" value={100} icon="DollarSign" variant="success" />);
      const iconContainer = screen.getByTestId("metric-card-icon-container");
      expect(iconContainer).toHaveClass("bg-emerald-600");
    });

    it("should apply warning variant color", () => {
      render(<MetricCard title="Test" value={100} icon="DollarSign" variant="warning" />);
      const iconContainer = screen.getByTestId("metric-card-icon-container");
      expect(iconContainer).toHaveClass("bg-amber-600");
    });

    it("should apply danger variant color", () => {
      render(<MetricCard title="Test" value={100} icon="DollarSign" variant="danger" />);
      const iconContainer = screen.getByTestId("metric-card-icon-container");
      expect(iconContainer).toHaveClass("bg-red-600");
    });

    it("should apply info variant color", () => {
      render(<MetricCard title="Test" value={100} icon="DollarSign" variant="info" />);
      const iconContainer = screen.getByTestId("metric-card-icon-container");
      expect(iconContainer).toHaveClass("bg-cyan-600");
    });
  });

  describe("Loading State", () => {
    it("should show skeleton when loading", () => {
      const { container } = render(<MetricCard title="Test" value={100} loading={true} />);
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });

    it("should not show actual content when loading", () => {
      render(<MetricCard title="Test" value={100} loading={true} />);
      // The skeleton divs shouldn't have the actual content
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
      expect(screen.queryByText("100")).not.toBeInTheDocument();
    });

    it("should show content when not loading", () => {
      render(<MetricCard title="Test" value={100} loading={false} />);
      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  describe("Clickable", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<MetricCard title="Test" value={100} onClick={handleClick} />);
      const card = screen.getByRole("button", { name: /test/i });

      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be keyboard accessible when clickable", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<MetricCard title="Test" value={100} onClick={handleClick} />);
      const card = screen.getByRole("button", { name: /test/i });

      card.focus();
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Layout", () => {
    it("should render all parts in correct structure", () => {
      render(
        <MetricCard
          title="Total Revenue"
          value={123456.78}
          change={5.2}
          icon="DollarSign"
          variant="success"
          format="currency"
          subtitle="Last 30 days"
        />
      );

      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("$123,456.78")).toBeInTheDocument();
      expect(screen.getByText("+5.2%")).toBeInTheDocument();
      expect(screen.getByText("Last 30 days")).toBeInTheDocument();
      expect(screen.getAllByTestId("mock-icon")).toHaveLength(2);
      expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero value", () => {
      render(<MetricCard title="Test" value={0} format="currency" />);
      expect(screen.getByText("$0.00")).toBeInTheDocument();
    });

    it("should handle negative value", () => {
      render(<MetricCard title="Test" value={-100} format="currency" />);
      expect(screen.getByText("-$100.00")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(<MetricCard title="Test" value={1234567890} format="number" />);
      expect(screen.getByText("1,234,567,890")).toBeInTheDocument();
    });

    it("should handle decimal numbers", () => {
      render(<MetricCard title="Test" value={123.456} format="number" />);
      expect(screen.getByText("123")).toBeInTheDocument(); // Rounds to nearest integer
    });
  });
});
