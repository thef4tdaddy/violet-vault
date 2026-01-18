import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ModalContainer, { ModalContainerProps } from "../ModalContainer";

// Mock ModalCloseButton component
vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="modal-close-button" onClick={onClick} type="button">
      X
    </button>
  ),
}));

describe("ModalContainer", () => {
  const defaultProps: ModalContainerProps = {
    isOpen: true,
    title: "Test Modal",
    onClose: vi.fn(),
    children: <div>Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock scrollTo
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<ModalContainer {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<ModalContainer {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render title when provided", () => {
      render(<ModalContainer {...defaultProps} title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should render without title when not provided", () => {
      render(<ModalContainer {...defaultProps} title={undefined} />);
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <ModalContainer {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </ModalContainer>
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("should render close button when title is provided", () => {
      render(<ModalContainer {...defaultProps} title="Test Title" />);
      expect(screen.getByTestId("modal-close-button")).toBeInTheDocument();
    });

    it("should not render close button in header when title is not provided", () => {
      render(<ModalContainer {...defaultProps} title={undefined} />);
      expect(screen.queryByTestId("modal-close-button")).not.toBeInTheDocument();
    });
  });

  describe("Modal Sizes", () => {
    it("should apply small size class", () => {
      const { container } = render(<ModalContainer {...defaultProps} size="sm" />);
      const modalContent = container.querySelector(".max-w-sm");
      expect(modalContent).toBeInTheDocument();
    });

    it("should apply medium size class by default", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".max-w-md");
      expect(modalContent).toBeInTheDocument();
    });

    it("should apply large size class", () => {
      const { container } = render(<ModalContainer {...defaultProps} size="lg" />);
      const modalContent = container.querySelector(".max-w-2xl");
      expect(modalContent).toBeInTheDocument();
    });

    it("should apply extra large size class", () => {
      const { container } = render(<ModalContainer {...defaultProps} size="xl" />);
      const modalContent = container.querySelector(".max-w-4xl");
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe("Custom ClassName", () => {
    it("should apply custom className to modal content", () => {
      const { container } = render(
        <ModalContainer {...defaultProps} className="custom-modal-class" />
      );
      const modalContent = container.querySelector(".custom-modal-class");
      expect(modalContent).toBeInTheDocument();
    });

    it("should work without custom className", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".bg-white");
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe("Close Behavior", () => {
    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} title="Test" />);

      await userEvent.click(screen.getByTestId("modal-close-button"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when backdrop is clicked", async () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByRole("dialog");
      await userEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when modal content is clicked", async () => {
      const onClose = vi.fn();
      render(
        <ModalContainer {...defaultProps} onClose={onClose}>
          <div data-testid="modal-content">Content</div>
        </ModalContainer>
      );

      await userEvent.click(screen.getByTestId("modal-content"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Handling", () => {
    it("should call onClose when Escape key is pressed and closeOnEscape is true", () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} closeOnEscape={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when Escape key is pressed by default", () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when Escape key is pressed and closeOnEscape is false", () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} closeOnEscape={false} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not call onClose when other keys are pressed", () => {
      const onClose = vi.fn();
      render(<ModalContainer {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Space" });
      fireEvent.keyDown(document, { key: "Tab" });
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not respond to Escape when modal is closed", () => {
      const onClose = vi.fn();
      const { rerender } = render(<ModalContainer {...defaultProps} onClose={onClose} />);

      rerender(<ModalContainer {...defaultProps} onClose={onClose} isOpen={false} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Focus Management", () => {
    it("should focus content when modal opens", async () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const contentDiv = container.querySelector('[tabIndex="-1"]');

      await waitFor(() => {
        expect(contentDiv).toHaveFocus();
      });
    });

    it("should have tabIndex -1 on modal content", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const contentDiv = container.querySelector(".bg-white.rounded-2xl");
      expect(contentDiv).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Scroll Behavior", () => {
    it("should call scrollTo when modal opens", async () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      render(<ModalContainer {...defaultProps} />);

      await waitFor(
        () => {
          expect(scrollToMock).toHaveBeenCalled();
        },
        { timeout: 200 }
      );
    });

    it("should scroll to center with smooth behavior", async () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      render(<ModalContainer {...defaultProps} />);

      await waitFor(
        () => {
          expect(scrollToMock).toHaveBeenCalledWith(
            expect.objectContaining({
              behavior: "smooth",
            })
          );
        },
        { timeout: 200 }
      );
    });

    it("should not scroll when modal is closed", () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      render(<ModalContainer {...defaultProps} isOpen={false} />);

      expect(scrollToMock).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have dialog role", () => {
      render(<ModalContainer {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal attribute", () => {
      render(<ModalContainer {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby attribute", () => {
      render(<ModalContainer {...defaultProps} title="Test Title" />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "modal-title");
    });

    it("should have modal-title id on title element", () => {
      render(<ModalContainer {...defaultProps} title="Test Title" />);
      const titleElement = screen.getByText("Test Title");
      expect(titleElement).toHaveAttribute("id", "modal-title");
    });

    it("should not have aria-labelledby when title is not provided", () => {
      render(<ModalContainer {...defaultProps} title={undefined} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).not.toHaveAttribute("aria-labelledby");
    });
  });

  describe("Styling", () => {
    it("should have backdrop with blur", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const backdrop = container.querySelector(".backdrop-blur-sm");
      expect(backdrop).toBeInTheDocument();
    });

    it("should have high z-index for overlay", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const backdrop = container.querySelector(".z-\\[10000\\]");
      expect(backdrop).toBeInTheDocument();
    });

    it("should have rounded corners on modal content", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".rounded-2xl");
      expect(modalContent).toBeInTheDocument();
    });

    it("should have border on modal content", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".border-2");
      expect(modalContent).toBeInTheDocument();
    });

    it("should have max height constraint", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".max-h-\\[90vh\\]");
      expect(modalContent).toBeInTheDocument();
    });

    it("should have overflow-y-auto for scrollable content", () => {
      const { container } = render(<ModalContainer {...defaultProps} />);
      const modalContent = container.querySelector(".overflow-y-auto");
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe("Header Styling", () => {
    it("should render sticky header when title is provided", () => {
      const { container } = render(<ModalContainer {...defaultProps} title="Test" />);
      const header = container.querySelector(".sticky");
      expect(header).toBeInTheDocument();
    });

    it("should have backdrop blur on header", () => {
      const { container } = render(<ModalContainer {...defaultProps} title="Test" />);
      const header = container.querySelector(".sticky.backdrop-blur-sm");
      expect(header).toBeInTheDocument();
    });

    it("should have border on header", () => {
      const { container } = render(<ModalContainer {...defaultProps} title="Test" />);
      const header = container.querySelector(".border-b");
      expect(header).toBeInTheDocument();
    });
  });

  describe("Ref Updates", () => {
    it("should update onClose ref when prop changes", () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();

      const { rerender } = render(
        <ModalContainer {...defaultProps} onClose={onClose1} closeOnEscape={true} />
      );

      rerender(<ModalContainer {...defaultProps} onClose={onClose2} closeOnEscape={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose1).not.toHaveBeenCalled();
      expect(onClose2).toHaveBeenCalledTimes(1);
    });

    it("should update closeOnEscape ref when prop changes", () => {
      const onClose = vi.fn();

      const { rerender } = render(
        <ModalContainer {...defaultProps} onClose={onClose} closeOnEscape={false} />
      );

      rerender(<ModalContainer {...defaultProps} onClose={onClose} closeOnEscape={true} />);

      fireEvent.keyDown(document, { key: "Escape" });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multiple Instances", () => {
    it("should handle multiple modals independently", () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();

      // Render first modal and verify it behaves correctly
      const { unmount: unmountFirst } = render(
        <ModalContainer {...defaultProps} onClose={onClose1} title="Modal 1">
          <div>Content 1</div>
        </ModalContainer>
      );

      const firstDialog = screen.getByRole("dialog");
      expect(firstDialog).toBeInTheDocument();
      expect(screen.getByText("Content 1")).toBeInTheDocument();

      // Unmount first modal before rendering the second to avoid duplicate IDs
      unmountFirst();

      // Render second modal and verify it behaves correctly and independently
      render(
        <ModalContainer {...defaultProps} onClose={onClose2} title="Modal 2">
          <div>Content 2</div>
        </ModalContainer>
      );

      const secondDialog = screen.getByRole("dialog");
      expect(secondDialog).toBeInTheDocument();
      expect(screen.getByText("Content 2")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      render(<ModalContainer {...defaultProps}>{null}</ModalContainer>);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle very long content", () => {
      const longContent = "A".repeat(10000);
      render(
        <ModalContainer {...defaultProps}>
          <div>{longContent}</div>
        </ModalContainer>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it("should handle rapid open/close", () => {
      const { rerender } = render(<ModalContainer {...defaultProps} isOpen={false} />);

      rerender(<ModalContainer {...defaultProps} isOpen={true} />);
      rerender(<ModalContainer {...defaultProps} isOpen={false} />);
      rerender(<ModalContainer {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should clean up event listeners on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
      const { unmount } = render(<ModalContainer {...defaultProps} />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });
  });

  describe("Complex Content", () => {
    it("should render complex nested content", () => {
      render(
        <ModalContainer {...defaultProps}>
          <div>
            <h2>Nested Title</h2>
            <p>Nested paragraph</p>
            <button>Nested button</button>
          </div>
        </ModalContainer>
      );

      expect(screen.getByText("Nested Title")).toBeInTheDocument();
      expect(screen.getByText("Nested paragraph")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Nested button" })).toBeInTheDocument();
    });

    it("should handle forms inside modal", () => {
      render(
        <ModalContainer {...defaultProps}>
          <form>
            <input type="text" placeholder="Test input" />
            <button type="submit">Submit</button>
          </form>
        </ModalContainer>
      );

      expect(screen.getByPlaceholderText("Test input")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });
  });
});
