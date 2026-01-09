import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ConfirmModal from "../ConfirmModal";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => ({ className }: { className?: string }) => (
    <svg data-testid="mock-icon" className={className}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )),
}));

vi.mock("@/utils/ui/touchFeedback", () => ({
  useTouchFeedback: vi.fn(() => ({
    onClick: (handler: () => void) => handler,
    onTouchStart: vi.fn(),
    className: "",
  })),
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

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<ConfirmModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render default title", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(<ConfirmModal {...defaultProps} title="Delete Item?" />);
      expect(screen.getByText("Delete Item?")).toBeInTheDocument();
    });

    it("should render default message", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText("Are you sure you want to continue?")).toBeInTheDocument();
    });

    it("should render custom message", () => {
      render(<ConfirmModal {...defaultProps} message="This will remove all data." />);
      expect(screen.getByText("This will remove all data.")).toBeInTheDocument();
    });
  });

  describe("Button Labels", () => {
    it("should render default confirm button label", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });

    it("should render custom confirm button label", () => {
      render(<ConfirmModal {...defaultProps} confirmLabel="Delete" />);
      expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    });

    it("should render default cancel button label", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("should render custom cancel button label", () => {
      render(<ConfirmModal {...defaultProps} cancelLabel="Go Back" />);
      expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    it("should call onConfirm when confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should call onCancel when close button is clicked", async () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

      await userEvent.click(screen.getByTestId("close-button"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("Destructive Mode", () => {
    it("should show warning text when destructive", () => {
      render(<ConfirmModal {...defaultProps} destructive />);
      expect(screen.getByText("This action cannot be undone")).toBeInTheDocument();
    });

    it("should not show warning text when not destructive", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.queryByText("This action cannot be undone")).not.toBeInTheDocument();
    });

    it("should apply red styling when destructive", () => {
      render(<ConfirmModal {...defaultProps} destructive />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-red-600");
    });

    it("should apply blue styling when not destructive", () => {
      render(<ConfirmModal {...defaultProps} />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-blue-600");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<ConfirmModal {...defaultProps} isLoading />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("should disable buttons when loading", () => {
      render(<ConfirmModal {...defaultProps} isLoading />);
      expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("should not disable buttons when not loading", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Confirm" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should call onCancel when Escape key is pressed", () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should not call onCancel on Escape when loading", () => {
      const onCancel = vi.fn();
      render(<ConfirmModal {...defaultProps} onCancel={onCancel} isLoading />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onCancel).not.toHaveBeenCalled();
    });

    it("should focus cancel button on open", () => {
      render(<ConfirmModal {...defaultProps} />);
      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      expect(cancelButton).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("should have dialog role", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal attribute", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby attribute", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "confirm-modal-title");
    });

    it("should have aria-describedby attribute", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-describedby",
        "confirm-modal-description"
      );
    });
  });

  describe("Children", () => {
    it("should render children content", () => {
      render(
        <ConfirmModal {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </ConfirmModal>
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });
  });

  describe("Custom Icon", () => {
    it("should render custom icon when provided", () => {
      const CustomIcon = ({ className }: { className?: string }) => (
        <svg data-testid="custom-icon" className={className}>
          <rect width="20" height="20" />
        </svg>
      );
      render(<ConfirmModal {...defaultProps} icon={CustomIcon} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });
});
