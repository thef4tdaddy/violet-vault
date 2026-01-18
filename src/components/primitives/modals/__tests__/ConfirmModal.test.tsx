import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ConfirmModal from "../ConfirmModal";

// Mock getIcon utility
vi.mock("@/utils/ui/icons", () => ({
  getIcon: vi.fn((iconName: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${iconName}`} className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
    return MockIcon;
  }),
}));

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Test Title",
    message: "Test message",
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

    it("should render title", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("should render message", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText("Test message")).toBeInTheDocument();
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

    it("should call onClose when cancel button is clicked", async () => {
      const onClose = vi.fn();
      render(<ConfirmModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variant Styling", () => {
    it("should render danger variant with AlertTriangle icon", () => {
      render(<ConfirmModal {...defaultProps} variant="danger" />);
      expect(screen.getByTestId("icon-AlertTriangle")).toBeInTheDocument();
    });

    it("should render warning variant with AlertCircle icon", () => {
      render(<ConfirmModal {...defaultProps} variant="warning" />);
      expect(screen.getByTestId("icon-AlertCircle")).toBeInTheDocument();
    });

    it("should render info variant with Info icon", () => {
      render(<ConfirmModal {...defaultProps} variant="info" />);
      expect(screen.getByTestId("icon-Info")).toBeInTheDocument();
    });

    it("should render success variant with CheckCircle icon", () => {
      render(<ConfirmModal {...defaultProps} variant="success" />);
      expect(screen.getByTestId("icon-CheckCircle")).toBeInTheDocument();
    });

    it("should apply danger styling", () => {
      render(<ConfirmModal {...defaultProps} variant="danger" />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-red-600");
    });

    it("should apply warning styling", () => {
      render(<ConfirmModal {...defaultProps} variant="warning" />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-amber-600");
    });

    it("should apply info styling (default)", () => {
      render(<ConfirmModal {...defaultProps} />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-blue-600");
    });

    it("should apply success styling", () => {
      render(<ConfirmModal {...defaultProps} variant="success" />);
      const confirmButton = screen.getByRole("button", { name: "Confirm" });
      expect(confirmButton).toHaveClass("bg-green-600");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<ConfirmModal {...defaultProps} loading />);
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("should disable buttons when loading", () => {
      render(<ConfirmModal {...defaultProps} loading />);
      expect(
        screen.getByRole("button", { name: (content) => content.includes("Processing") })
      ).toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    });

    it("should not disable buttons when not loading", () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Confirm" })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
    });

    it("should not call onConfirm when loading and button is clicked", async () => {
      const onConfirm = vi.fn();
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} loading />);

      const button = screen.getByRole("button", {
        name: (content) => content.includes("Processing"),
      });
      await userEvent.click(button);

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Async onConfirm", () => {
    it("should handle async onConfirm", async () => {
      const onConfirm = vi.fn().mockResolvedValue(undefined);
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should handle rejected async onConfirm", async () => {
      const onConfirm = vi.fn().mockRejectedValue(new Error("Test error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(<ConfirmModal {...defaultProps} title="" />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle empty message", () => {
      render(<ConfirmModal {...defaultProps} message="" />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(150);
      render(<ConfirmModal {...defaultProps} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very long message", () => {
      const longMessage = "Message text ".repeat(100);
      render(<ConfirmModal {...defaultProps} message={longMessage} />);
      expect(screen.getByText(/Message text/)).toBeInTheDocument();
    });

    it("should handle special characters in text", () => {
      const specialTitle = "Test & <Title> with 'quotes'";
      const specialMessage = "Message with & < > symbols";
      render(<ConfirmModal {...defaultProps} title={specialTitle} message={specialMessage} />);
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it("should handle undefined callbacks", async () => {
      render(<ConfirmModal {...defaultProps} onConfirm={undefined} onClose={undefined} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle rapid button clicks", async () => {
      const onConfirm = vi.fn();
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

      const button = screen.getByRole("button", { name: "Confirm" });
      await userEvent.click(button);
      await userEvent.click(button);

      expect(onConfirm).toHaveBeenCalled();
    });

    it("should handle both buttons being clicked", async () => {
      const onConfirm = vi.fn();
      const onClose = vi.fn();
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);

      await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
      expect(onConfirm).toHaveBeenCalledTimes(1);

      await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
