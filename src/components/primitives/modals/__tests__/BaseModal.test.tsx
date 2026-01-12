import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BaseModal from "../BaseModal";

describe("BaseModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset body scroll state to prevent test pollution
    document.body.style.overflow = "";
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<BaseModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<BaseModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render children content", () => {
      render(<BaseModal {...defaultProps} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("should apply small size class", () => {
      render(<BaseModal {...defaultProps} size="sm" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-sm");
    });

    it("should apply medium size class (default)", () => {
      render(<BaseModal {...defaultProps} />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-md");
    });

    it("should apply large size class", () => {
      render(<BaseModal {...defaultProps} size="lg" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-lg");
    });

    it("should apply extra large size class", () => {
      render(<BaseModal {...defaultProps} size="xl" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-xl");
    });

    it("should apply full size class", () => {
      render(<BaseModal {...defaultProps} size="full" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("max-w-full");
    });
  });

  describe("Close Behavior", () => {
    it("should call onClose when overlay is clicked", async () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} />);

      const overlay = screen.getByRole("dialog");
      await userEvent.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when modal content is clicked", async () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByText("Modal Content"));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose on overlay click when closeOnOverlayClick is false", async () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />);

      const overlay = screen.getByRole("dialog");
      await userEvent.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Navigation", () => {
    it("should call onClose when Escape key is pressed", () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose on Escape when closeOnEscape is false", () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Close Button", () => {
    it("should render close button when showCloseButton is true", () => {
      render(<BaseModal {...defaultProps} showCloseButton />);
      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
    });

    it("should not render close button by default", () => {
      render(<BaseModal {...defaultProps} />);
      expect(screen.queryByLabelText("Close modal")).not.toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<BaseModal {...defaultProps} onClose={onClose} showCloseButton />);

      await userEvent.click(screen.getByLabelText("Close modal"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have dialog role", () => {
      render(<BaseModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal attribute", () => {
      render(<BaseModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should apply custom className", () => {
      render(<BaseModal {...defaultProps} className="custom-class" />);
      const modal = screen.getByRole("dialog").querySelector("div");
      expect(modal).toHaveClass("custom-class");
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when modal is open", () => {
      render(<BaseModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when modal is closed", () => {
      const { rerender } = render(<BaseModal {...defaultProps} />);
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<BaseModal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe("");
    });
  });
});
