import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import ModalContainer from "../ModalContainer";

describe("ModalContainer", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  afterEach(() => {
    // Clean up any open modals
    document.body.innerHTML = "";
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(
        <ModalContainer isOpen={false} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );
      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Modal content here</div>
        </ModalContainer>
      );
      expect(screen.getByText("Modal content here")).toBeInTheDocument();
    });

    it("should render without title", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose}>
          <div>Content without title</div>
        </ModalContainer>
      );
      expect(screen.getByText("Content without title")).toBeInTheDocument();
    });
  });

  describe("Modal Sizes", () => {
    it("should apply small size class", () => {
      const { container } = render(
        <ModalContainer isOpen={true} onClose={onClose} size="sm">
          <div>Small modal</div>
        </ModalContainer>
      );
      const modal = container.querySelector(".max-w-sm");
      expect(modal).toBeInTheDocument();
    });

    it("should apply medium size class by default", () => {
      const { container } = render(
        <ModalContainer isOpen={true} onClose={onClose}>
          <div>Default modal</div>
        </ModalContainer>
      );
      const modal = container.querySelector(".max-w-md");
      expect(modal).toBeInTheDocument();
    });

    it("should apply large size class", () => {
      const { container } = render(
        <ModalContainer isOpen={true} onClose={onClose} size="lg">
          <div>Large modal</div>
        </ModalContainer>
      );
      const modal = container.querySelector(".max-w-2xl");
      expect(modal).toBeInTheDocument();
    });

    it("should apply extra large size class", () => {
      const { container } = render(
        <ModalContainer isOpen={true} onClose={onClose} size="xl">
          <div>Extra large modal</div>
        </ModalContainer>
      );
      const modal = container.querySelector(".max-w-4xl");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Close Handling", () => {
    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when backdrop is clicked", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      // Click the backdrop (the outer div with glassmorphism)
      const backdrop = container.querySelector('[class*="fixed inset-0"]');
      if (backdrop) {
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it("should not call onClose when modal content is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      const content = screen.getByText("Content");
      await user.click(content);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Support", () => {
    it("should close on Escape key by default", async () => {
      const user = userEvent.setup();
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not close on Escape when closeOnEscape is false", async () => {
      const user = userEvent.setup();
      render(
        <ModalContainer
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
          closeOnEscape={false}
        >
          <div>Content</div>
        </ModalContainer>
      );

      await user.keyboard("{Escape}");
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to modal content", () => {
      const { container } = render(
        <ModalContainer
          isOpen={true}
          onClose={onClose}
          className="custom-modal-class"
        >
          <div>Content</div>
        </ModalContainer>
      );

      const modalContent = container.querySelector(".custom-modal-class");
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper modal structure", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Accessible Modal">
          <div>Content</div>
        </ModalContainer>
      );

      expect(screen.getByText("Accessible Modal")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("should provide close button for accessibility", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      const closeButton = screen.getByRole("button");
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("State transitions", () => {
    it("should handle open to closed transition", () => {
      const { rerender } = render(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();

      rerender(
        <ModalContainer isOpen={false} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
    });

    it("should handle closed to open transition", () => {
      const { rerender } = render(
        <ModalContainer isOpen={false} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();

      rerender(
        <ModalContainer isOpen={true} onClose={onClose} title="Test Modal">
          <div>Content</div>
        </ModalContainer>
      );

      expect(screen.getByText("Test Modal")).toBeInTheDocument();
    });
  });

  describe("Complex content", () => {
    it("should render complex nested content", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Complex Modal">
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <button>Action Button</button>
          </div>
        </ModalContainer>
      );

      expect(screen.getByText("Paragraph 1")).toBeInTheDocument();
      expect(screen.getByText("Paragraph 2")).toBeInTheDocument();
      expect(screen.getByText("Action Button")).toBeInTheDocument();
    });

    it("should handle form elements inside modal", () => {
      render(
        <ModalContainer isOpen={true} onClose={onClose} title="Form Modal">
          <form>
            <input type="text" placeholder="Name" />
            <button type="submit">Submit</button>
          </form>
        </ModalContainer>
      );

      expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });
  });
});
