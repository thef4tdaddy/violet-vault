import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import QuickFundModal from "../QuickFundModal";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => ({ className }: { className?: string }) => (
    <svg data-testid="mock-icon" className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )),
}));

vi.mock("@/hooks/platform/ux/useConfirm", () => ({
  useConfirm: vi.fn(() => vi.fn().mockResolvedValue(true)),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="close-button" onClick={onClick} type="button">
      Close
    </button>
  ),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

vi.mock("@/components/ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/utils/ui/touchFeedback", () => ({
  getButtonClasses: vi.fn((classes: string) => classes),
  withHapticFeedback: vi.fn((fn: () => void) => fn),
}));

describe("QuickFundModal", () => {
  const defaultEnvelope = {
    id: "env-1",
    name: "Groceries",
    color: "#4CAF50",
    currentBalance: 150.0,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    envelope: defaultEnvelope,
    suggestedAmount: 50,
    unassignedCash: 200,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<QuickFundModal {...defaultProps} />);
      // Find the heading with partial match
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<QuickFundModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    });

    it("should not render when envelope is null", () => {
      render(
        <QuickFundModal {...defaultProps} envelope={null as unknown as typeof defaultEnvelope} />
      );
      expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument();
    });

    it("should display envelope name", () => {
      render(<QuickFundModal {...defaultProps} />);
      // Envelope name appears multiple times, use getAllByText
      const groceriesElements = screen.getAllByText("Groceries");
      expect(groceriesElements.length).toBeGreaterThan(0);
    });

    it("should display current envelope balance", () => {
      render(<QuickFundModal {...defaultProps} />);
      expect(screen.getByText("Current: $150.00")).toBeInTheDocument();
    });
  });

  describe("Amount Input", () => {
    it("should initialize with suggested amount", () => {
      render(<QuickFundModal {...defaultProps} />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(50);
    });

    it("should initialize with 0 when no suggested amount", () => {
      render(<QuickFundModal {...defaultProps} suggestedAmount={0} />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(0);
    });

    it("should update amount on input change", async () => {
      render(<QuickFundModal {...defaultProps} />);
      const input = screen.getByRole("spinbutton");

      await userEvent.clear(input);
      await userEvent.type(input, "75");

      expect(input).toHaveValue(75);
    });
  });

  describe("Quick Amount Buttons", () => {
    it("should display quick amount buttons", () => {
      render(<QuickFundModal {...defaultProps} />);
      expect(screen.getByText("$5")).toBeInTheDocument();
      expect(screen.getByText("$10")).toBeInTheDocument();
      expect(screen.getByText("$20")).toBeInTheDocument();
      expect(screen.getByText("$50")).toBeInTheDocument();
    });

    it("should not show quick amounts that exceed unassigned cash", () => {
      render(<QuickFundModal {...defaultProps} unassignedCash={15} />);
      expect(screen.getByText("$5")).toBeInTheDocument();
      expect(screen.getByText("$10")).toBeInTheDocument();
      expect(screen.queryByText("$20")).not.toBeInTheDocument();
      expect(screen.queryByText("$50")).not.toBeInTheDocument();
    });

    it("should set amount when quick amount is clicked", async () => {
      render(<QuickFundModal {...defaultProps} />);
      const quickButton = screen.getByText("$20");

      await userEvent.click(quickButton);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(20);
    });
  });

  describe("Available Balance Display", () => {
    it("should display available unassigned cash", () => {
      render(<QuickFundModal {...defaultProps} />);
      expect(screen.getByText("Available: $200.00")).toBeInTheDocument();
    });
  });

  describe("New Balance Preview", () => {
    it("should show new balance preview when amount > 0", () => {
      render(<QuickFundModal {...defaultProps} suggestedAmount={50} />);
      expect(screen.getByText("New Balance:")).toBeInTheDocument();
      expect(screen.getByText("$200.00")).toBeInTheDocument();
    });
  });

  describe("Close Button", () => {
    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<QuickFundModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByTestId("close-button"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when cancel button is clicked", async () => {
      const onClose = vi.fn();
      render(<QuickFundModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByText("Cancel"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Confirm Action", () => {
    it("should call onConfirm with amount when confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      render(<QuickFundModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

      await userEvent.click(screen.getByText(/Fund \$50\.00/i));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(50);
      });
    });

    it("should not call onConfirm when amount is 0", async () => {
      const onConfirm = vi.fn();
      render(<QuickFundModal {...defaultProps} onConfirm={onConfirm} suggestedAmount={0} />);

      // The button should be disabled when amount is 0
      const confirmButton = screen.getByText(/Fund \$0\.00/i);
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("Insufficient Funds", () => {
    it("should allow setting amount that exceeds unassigned cash", async () => {
      render(<QuickFundModal {...defaultProps} suggestedAmount={300} unassignedCash={200} />);

      // Amount is initialized to suggestedAmount (300) even though it's more than unassigned
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(300);
    });
  });

  describe("Reset on Open", () => {
    it("should reset amount to suggested amount when opened", () => {
      const { rerender } = render(<QuickFundModal {...defaultProps} isOpen={false} />);

      rerender(<QuickFundModal {...defaultProps} isOpen={true} suggestedAmount={75} />);

      const input = screen.getByRole("spinbutton");
      expect(input).toHaveValue(75);
    });
  });

  describe("Envelope Color", () => {
    it("should display envelope color indicator", () => {
      const { container } = render(<QuickFundModal {...defaultProps} />);
      const colorIndicator = container.querySelector('[style*="background-color"]');
      expect(colorIndicator).toBeInTheDocument();
    });
  });
});
