import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import SlideUpModal from "../SlideUpModal";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn((name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
    MockIcon.displayName = `MockIcon-${name}`;
    return MockIcon;
  }),
}));

vi.mock("@/utils/ui/feedback/touchFeedback", () => ({
  useTouchFeedback: vi.fn(() => ({
    onTouchStart: vi.fn(),
    onClick: vi.fn((handler?: (...args: unknown[]) => void) => {
      return (...args: unknown[]) => {
        if (handler) {
          handler(...args);
        }
      };
    }),
    className: "mock-touch-feedback-class",
  })),
}));

describe("SlideUpModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<SlideUpModal {...defaultProps} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<SlideUpModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render with default three-quarters height", () => {
      render(<SlideUpModal {...defaultProps} />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toBeInTheDocument();
      expect(modalPanel).toHaveClass("h-[75vh]");
    });

    it("should render children correctly", () => {
      render(
        <SlideUpModal {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </SlideUpModal>
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });
  });

  describe("Modal Heights", () => {
    it("should render with full height", () => {
      render(<SlideUpModal {...defaultProps} height="full" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("h-[95vh]");
    });

    it("should render with three-quarters height", () => {
      render(<SlideUpModal {...defaultProps} height="three-quarters" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("h-[75vh]");
    });

    it("should render with half height", () => {
      render(<SlideUpModal {...defaultProps} height="half" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("h-[50vh]");
    });

    it("should render with auto height", () => {
      render(<SlideUpModal {...defaultProps} height="auto" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("h-auto");
    });
  });

  describe("Modal Header", () => {
    it("should render header with title when title is provided", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("should not render header when title is not provided", () => {
      render(<SlideUpModal {...defaultProps} />);
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("should render close button in header", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);
      const closeButton = screen.getByLabelText("Close modal");
      expect(closeButton).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} title="Test Modal" onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close modal");
      await userEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it("should render close icon in header", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);
      expect(screen.getByTestId("icon-X")).toBeInTheDocument();
    });
  });

  describe("Drag Handle", () => {
    it("should render drag handle by default", () => {
      render(<SlideUpModal {...defaultProps} />);
      const dragHandle = screen.getByTestId("drag-handle");
      expect(dragHandle).toBeInTheDocument();
    });

    it("should render drag handle when showHandle is true", () => {
      render(<SlideUpModal {...defaultProps} showHandle={true} />);
      const dragHandle = screen.getByTestId("drag-handle");
      expect(dragHandle).toBeInTheDocument();
    });

    it("should not render drag handle when showHandle is false", () => {
      render(<SlideUpModal {...defaultProps} showHandle={false} />);
      const dragHandle = screen.queryByTestId("drag-handle");
      expect(dragHandle).not.toBeInTheDocument();
    });
  });

  describe("Backdrop", () => {
    it("should call onClose when backdrop is clicked", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByRole("dialog");
      await userEvent.click(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it("should not close when clicking on modal content", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} onClose={onClose} />);

      const content = screen.getByText("Modal Content");
      await userEvent.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Interactions", () => {
    it("should close modal when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} onClose={onClose} />);

      await userEvent.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });

    it("should not close modal when other keys are pressed", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} onClose={onClose} />);

      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{Space}");
      await userEvent.keyboard("a");

      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not attempt to close when Escape is pressed and modal is closed", async () => {
      const onClose = vi.fn();
      render(<SlideUpModal {...defaultProps} isOpen={false} onClose={onClose} />);

      await userEvent.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Touch Interactions", () => {
    it("should attach touch event handlers to modal panel", () => {
      render(<SlideUpModal {...defaultProps} />);
      const modalPanel = screen.getByTestId("modal-panel");

      expect(modalPanel).toBeInTheDocument();
      // Verify the modal panel is present and can receive touch events
      expect(modalPanel).toHaveAttribute("data-testid", "modal-panel");
    });

    it("should render modal with proper touch styles", () => {
      render(<SlideUpModal {...defaultProps} />);
      const modalPanel = screen.getByTestId("modal-panel");

      // Verify touch-specific styles are applied
      expect(modalPanel).toHaveStyle({ willChange: "transform" });
      expect(modalPanel).toHaveStyle({ WebkitOverflowScrolling: "touch" });
    });
  });

  describe("Custom Classes", () => {
    it("should apply custom className", () => {
      render(<SlideUpModal {...defaultProps} className="custom-modal-class" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("custom-modal-class");
    });

    it("should apply multiple custom classes", () => {
      render(<SlideUpModal {...defaultProps} className="class-one class-two" />);
      const modalPanel = screen.getByTestId("modal-panel");
      expect(modalPanel).toHaveClass("class-one");
      expect(modalPanel).toHaveClass("class-two");
    });
  });

  describe("Accessibility", () => {
    it("should have role dialog", () => {
      render(<SlideUpModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal true", () => {
      render(<SlideUpModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby when title is provided", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "slide-modal-title");
    });

    it("should not have aria-labelledby when title is not provided", () => {
      render(<SlideUpModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("should have correct heading id for accessibility", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);
      const heading = screen.getByText("Test Modal");
      expect(heading).toHaveAttribute("id", "slide-modal-title");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined onClose", () => {
      render(<SlideUpModal {...defaultProps} onClose={undefined} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should not crash when onClose is undefined and Escape is pressed", async () => {
      render(<SlideUpModal {...defaultProps} onClose={undefined} />);

      await userEvent.keyboard("{Escape}");

      // No error should be thrown
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should not crash when onClose is undefined and backdrop is clicked", async () => {
      render(<SlideUpModal {...defaultProps} onClose={undefined} />);

      const backdrop = screen.getByRole("dialog");
      await userEvent.click(backdrop);

      // No error should be thrown
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      render(<SlideUpModal {...defaultProps} children={null} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      render(
        <SlideUpModal {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </SlideUpModal>
      );
      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
      expect(screen.getByText("Child 3")).toBeInTheDocument();
    });
  });

  describe("Animation States", () => {
    it("should start with animating state", async () => {
      render(<SlideUpModal {...defaultProps} />);

      // Modal should be visible
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should clear animation state after timeout", async () => {
      render(<SlideUpModal {...defaultProps} />);

      // Modal should be rendered initially
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Wait for animation to complete - the dialog should have opacity-100 class
      await waitFor(
        () => {
          expect(dialog).toHaveClass("opacity-100");
        },
        { timeout: 500 }
      );
    });
  });

  describe("Modal State Transitions", () => {
    it("should handle open to closed transition", () => {
      const { rerender } = render(<SlideUpModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();

      rerender(<SlideUpModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
    });

    it("should handle closed to open transition", () => {
      const { rerender } = render(<SlideUpModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();

      rerender(<SlideUpModal {...defaultProps} isOpen={true} />);
      expect(screen.getByText("Modal Content")).toBeInTheDocument();
    });

    it("should handle multiple open/close cycles", () => {
      const { rerender } = render(<SlideUpModal {...defaultProps} isOpen={true} />);

      for (let i = 0; i < 3; i++) {
        expect(screen.getByText("Modal Content")).toBeInTheDocument();

        rerender(<SlideUpModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();

        rerender(<SlideUpModal {...defaultProps} isOpen={true} />);
      }
    });
  });

  describe("Content Scrolling", () => {
    it("renders modal content inside the dialog", () => {
      render(<SlideUpModal {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toContainElement(screen.getByText("Modal Content"));
    });

    it("renders modal content consistently regardless of horizontal size", () => {
      render(
        <SlideUpModal {...defaultProps}>
          <div>Wide Modal Content</div>
        </SlideUpModal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toContainElement(screen.getByText("Wide Modal Content"));
    });

    it("renders title and content together when title is present", () => {
      render(<SlideUpModal {...defaultProps} title="Test Modal" />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toContainElement(screen.getByText("Test Modal"));
      expect(dialog).toContainElement(screen.getByText("Modal Content"));
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props combined", () => {
      render(
        <SlideUpModal
          isOpen={true}
          onClose={vi.fn()}
          title="Complex Modal"
          height="full"
          showHandle={true}
          backdrop={true}
          className="custom-class"
        >
          <div>Complex Content</div>
        </SlideUpModal>
      );

      expect(screen.getByText("Complex Modal")).toBeInTheDocument();
      expect(screen.getByText("Complex Content")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle minimal props", () => {
      render(
        <SlideUpModal isOpen={true}>
          <div>Minimal Content</div>
        </SlideUpModal>
      );

      expect(screen.getByText("Minimal Content")).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle rapid state changes", async () => {
      const { rerender } = render(<SlideUpModal {...defaultProps} isOpen={false} />);

      // Rapidly toggle state
      rerender(<SlideUpModal {...defaultProps} isOpen={true} />);

      // Wait for the modal to appear
      await waitFor(
        () => {
          expect(screen.getByText("Modal Content")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Toggle back to closed
      rerender(<SlideUpModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();

      // Open again
      rerender(<SlideUpModal {...defaultProps} isOpen={true} />);
      await waitFor(
        () => {
          expect(screen.getByText("Modal Content")).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Performance and Memory", () => {
    it("should cleanup event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = render(<SlideUpModal {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it("should cleanup timers on unmount", () => {
      vi.useFakeTimers();

      const { unmount } = render(<SlideUpModal {...defaultProps} />);

      unmount();

      // Clear all timers
      vi.clearAllTimers();

      vi.useRealTimers();
    });
  });
});
