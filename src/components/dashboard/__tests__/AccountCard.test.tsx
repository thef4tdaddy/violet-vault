import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import AccountCard from "../AccountCard";

// Mock getIcon utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn((name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className}>
        <title>{name}</title>
      </svg>
    );
    return MockIcon;
  }),
}));

// Mock UI components
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} data-testid="action-button" {...props}>
      {children}
    </button>
  ),
  StylizedButtonText: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe("AccountCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Checking account card", () => {
    it("should render checking account with positive balance", () => {
      render(<AccountCard type="checking" balance={2500.5} subtitle="5 recent transactions" />);

      expect(screen.getByTestId("account-card-checking")).toBeInTheDocument();
      expect(screen.getByText(/CHECKING ACCOUNT/i)).toBeInTheDocument();
      expect(screen.getByText("$2500.50")).toBeInTheDocument();
      expect(screen.getByText("5 recent transactions")).toBeInTheDocument();
      expect(screen.getByTestId("icon-CreditCard")).toBeInTheDocument();
    });

    it("should not display action button when not provided", () => {
      render(<AccountCard type="checking" balance={2500.5} />);

      expect(screen.queryByTestId("action-button")).not.toBeInTheDocument();
    });
  });

  describe("Savings account card", () => {
    it("should render savings account with correct icon", () => {
      render(<AccountCard type="savings" balance={5000} subtitle="Savings goals tracked" />);

      expect(screen.getByTestId("account-card-savings")).toBeInTheDocument();
      expect(screen.getByText(/SAVINGS ACCOUNT/i)).toBeInTheDocument();
      expect(screen.getByText("$5000.00")).toBeInTheDocument();
      expect(screen.getByTestId("icon-PiggyBank")).toBeInTheDocument();
    });
  });

  describe("Unassigned cash card", () => {
    it("should render unassigned card with positive balance", () => {
      render(
        <AccountCard
          type="unassigned"
          balance={300}
          subtitle="Available for allocation"
          isWarning={false}
        />
      );

      expect(screen.getByTestId("account-card-unassigned")).toBeInTheDocument();
      expect(screen.getByText(/UNASSIGNED CASH/i)).toBeInTheDocument();
      expect(screen.getByText("$300.00")).toBeInTheDocument();
      expect(screen.getByTestId("icon-DollarSign")).toBeInTheDocument();
    });

    it("should render with warning state for high balance", () => {
      render(
        <AccountCard
          type="unassigned"
          balance={750}
          subtitle="High balance - consider allocating"
          isWarning={true}
        />
      );

      expect(screen.getByTestId("account-card-unassigned")).toBeInTheDocument();
      expect(screen.getByText("$750.00")).toBeInTheDocument();
    });

    it("should display action button when provided", async () => {
      const handleAction = vi.fn();
      render(
        <AccountCard
          type="unassigned"
          balance={300}
          action={{
            label: "Allocate Funds",
            onClick: handleAction,
            icon: "ArrowRight",
          }}
        />
      );

      const actionButton = screen.getByTestId("action-button");
      expect(actionButton).toBeInTheDocument();
      expect(screen.getByText("Allocate Funds")).toBeInTheDocument();

      await userEvent.click(actionButton);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Negative balance handling", () => {
    it("should display negative balance with warning indicator", () => {
      render(<AccountCard type="unassigned" balance={-150} subtitle="Needs attention" />);

      expect(screen.getByText("-$150.00")).toBeInTheDocument();
      expect(screen.getByText("Overspent")).toBeInTheDocument();
      expect(screen.getByTestId("icon-AlertTriangle")).toBeInTheDocument();
    });

    it("should handle negative checking balance", () => {
      render(<AccountCard type="checking" balance={-500} />);

      expect(screen.getByText("-$500.00")).toBeInTheDocument();
      expect(screen.getByText("Overspent")).toBeInTheDocument();
    });
  });

  describe("Loading state", () => {
    it("should render loading skeleton when isLoading is true", () => {
      const { container } = render(<AccountCard type="checking" balance={0} isLoading={true} />);

      // Should not render actual content
      expect(screen.queryByText(/CHECKING ACCOUNT/i)).not.toBeInTheDocument();

      // Should render skeleton with animation and accessibility attributes
      const skeleton = container.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass("bg-white");
      expect(skeleton).toHaveClass("border-2");
      expect(skeleton).toHaveClass("border-black");
      expect(skeleton).toHaveAttribute("aria-label", "Loading account information");
      expect(skeleton).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Subtitle handling", () => {
    it("should render subtitle when provided", () => {
      render(
        <AccountCard type="checking" balance={1000} subtitle="Manual entry" isWarning={false} />
      );

      expect(screen.getByText("Manual entry")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Info")).toBeInTheDocument();
    });

    it("should not render subtitle section when not provided", () => {
      render(<AccountCard type="checking" balance={1000} />);

      expect(screen.queryByTestId("icon-Info")).not.toBeInTheDocument();
    });
  });

  describe("Zero balance", () => {
    it("should handle zero balance correctly", () => {
      render(<AccountCard type="checking" balance={0} />);

      expect(screen.getByText("$0.00")).toBeInTheDocument();
      expect(screen.queryByText("Overspent")).not.toBeInTheDocument();
    });
  });

  describe("Action button with icon", () => {
    it("should render action button with custom icon", async () => {
      const handleAction = vi.fn();
      render(
        <AccountCard
          type="unassigned"
          balance={500}
          action={{
            label: "Allocate",
            onClick: handleAction,
            icon: "ArrowRight",
          }}
        />
      );

      expect(screen.getByTestId("icon-ArrowRight")).toBeInTheDocument();
      expect(screen.getByText("Allocate")).toBeInTheDocument();

      await userEvent.click(screen.getByTestId("action-button"));
      expect(handleAction).toHaveBeenCalled();
    });

    it("should render action button without icon", () => {
      const handleAction = vi.fn();
      render(
        <AccountCard
          type="unassigned"
          balance={500}
          action={{
            label: "View Details",
            onClick: handleAction,
          }}
        />
      );

      expect(screen.getByText("View Details")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-ArrowRight")).not.toBeInTheDocument();
    });
  });

  describe("Decimal precision", () => {
    it("should display balance with two decimal places", () => {
      render(<AccountCard type="checking" balance={1234.5} />);

      expect(screen.getByText("$1234.50")).toBeInTheDocument();
    });

    it("should round balance to two decimal places", () => {
      render(<AccountCard type="checking" balance={999.999} />);

      expect(screen.getByText("$1000.00")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper test IDs for each account type", () => {
      const { rerender } = render(<AccountCard type="checking" balance={1000} />);
      expect(screen.getByTestId("account-card-checking")).toBeInTheDocument();

      rerender(<AccountCard type="savings" balance={1000} />);
      expect(screen.getByTestId("account-card-savings")).toBeInTheDocument();

      rerender(<AccountCard type="unassigned" balance={1000} />);
      expect(screen.getByTestId("account-card-unassigned")).toBeInTheDocument();
    });
  });

  describe("Warning state visual differences", () => {
    it("should apply warning styling for high unassigned cash", () => {
      const { container } = render(
        <AccountCard type="unassigned" balance={750} isWarning={true} />
      );

      // Check for purple gradient classes (warning state)
      const card = container.querySelector("[data-testid='account-card-unassigned']");
      expect(card?.className).toContain("from-purple-50");
      expect(card?.className).toContain("to-purple-100");
    });

    it("should apply default styling for normal unassigned cash", () => {
      const { container } = render(
        <AccountCard type="unassigned" balance={100} isWarning={false} />
      );

      // Check for gray gradient classes (default state)
      const card = container.querySelector("[data-testid='account-card-unassigned']");
      expect(card?.className).toContain("from-gray-50");
      expect(card?.className).toContain("to-gray-100");
    });
  });
});
