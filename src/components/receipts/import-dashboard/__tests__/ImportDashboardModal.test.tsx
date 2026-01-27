import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import { vi } from "vitest";
import { ImportDashboardModal } from "../ImportDashboardModal";
import { useImportDashboardStore } from "@/stores/ui/importDashboardStore";

// Mock the ImportDashboard component
vi.mock("../ImportDashboard", () => ({
  ImportDashboard: ({ onClose, preloadedFile }: { onClose: () => void; preloadedFile: File | null }) => (
    <div data-testid="import-dashboard-content">
      <button onClick={onClose} data-testid="dashboard-close">
        Dashboard Close
      </button>
      {preloadedFile && <div data-testid="preloaded-file">{preloadedFile.name}</div>}
    </div>
  ),
}));

// Mock ModalCloseButton
vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick, ariaLabel }: { onClick: () => void; ariaLabel?: string }) => (
    <button onClick={onClick} aria-label={ariaLabel} data-testid="modal-close-button">
      X
    </button>
  ),
}));

describe("ImportDashboardModal", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useImportDashboardStore.setState({
        isOpen: false,
        preloadedFile: null,
      });
    });

    // Reset body overflow style
    document.body.style.overflow = "";
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = "";
  });

  describe("visibility", () => {
    it("should not render when isOpen is false", () => {
      render(<ImportDashboardModal />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have correct ARIA attributes", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      const dialog = screen.getByRole("dialog");

      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "import-dashboard-title");
    });
  });

  describe("close functionality", () => {
    it("should close when close button is clicked", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      const closeButton = screen.getByTestId("modal-close-button");

      act(() => {
        fireEvent.click(closeButton);
      });

      expect(useImportDashboardStore.getState().isOpen).toBe(false);
    });

    it("should close when ESC key is pressed", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);

      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });

      expect(useImportDashboardStore.getState().isOpen).toBe(false);
    });

    it("should close when backdrop is clicked", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      const { container } = render(<ImportDashboardModal />);
      // Find the backdrop div (the one with backdrop-blur class)
      const backdrop = container.querySelector(".backdrop-blur-sm") as HTMLElement;

      expect(backdrop).toBeTruthy();

      act(() => {
        fireEvent.click(backdrop);
      });

      expect(useImportDashboardStore.getState().isOpen).toBe(false);
    });

    it("should not close when modal content is clicked", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      const dashboard = screen.getByTestId("import-dashboard-content");

      act(() => {
        fireEvent.click(dashboard);
      });

      expect(useImportDashboardStore.getState().isOpen).toBe(true);
    });

    it("should close when onClose is called from ImportDashboard", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      const dashboardCloseButton = screen.getByTestId("dashboard-close");

      act(() => {
        fireEvent.click(dashboardCloseButton);
      });

      expect(useImportDashboardStore.getState().isOpen).toBe(false);
    });
  });

  describe("body scroll lock", () => {
    it("should lock body scroll when modal opens", () => {
      expect(document.body.style.overflow).toBe("");

      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when modal closes", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      const { unmount } = render(<ImportDashboardModal />);
      expect(document.body.style.overflow).toBe("hidden");

      unmount();

      expect(document.body.style.overflow).toBe("");
    });

    it("should restore body scroll when modal is closed via close button", async () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      const { rerender } = render(<ImportDashboardModal />);
      expect(document.body.style.overflow).toBe("hidden");

      const closeButton = screen.getByTestId("modal-close-button");

      act(() => {
        fireEvent.click(closeButton);
      });

      // Rerender to reflect state change
      rerender(<ImportDashboardModal />);

      await waitFor(() => {
        expect(document.body.style.overflow).toBe("");
      });
    });
  });

  describe("preloaded file", () => {
    it("should pass preloadedFile to ImportDashboard", () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        useImportDashboardStore.getState().open({ preloadFile: mockFile });
      });

      render(<ImportDashboardModal />);

      expect(screen.getByTestId("preloaded-file")).toHaveTextContent("test.jpg");
    });

    it("should not show preloaded file when none is provided", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);

      expect(screen.queryByTestId("preloaded-file")).not.toBeInTheDocument();
    });

    it("should clear preloaded file on close", () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        useImportDashboardStore.getState().open({ preloadFile: mockFile });
      });

      render(<ImportDashboardModal />);
      expect(screen.getByTestId("preloaded-file")).toBeInTheDocument();

      const closeButton = screen.getByTestId("modal-close-button");

      act(() => {
        fireEvent.click(closeButton);
      });

      expect(useImportDashboardStore.getState().preloadedFile).toBeNull();
    });
  });

  describe("keyboard accessibility", () => {
    it("should have proper close button aria-label", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);

      expect(screen.getByLabelText("Close import dashboard")).toBeInTheDocument();
    });

    it("should only close on ESC key, not other keys", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);

      // Try Enter key - should not close
      act(() => {
        fireEvent.keyDown(window, { key: "Enter" });
      });
      expect(useImportDashboardStore.getState().isOpen).toBe(true);

      // Try Space key - should not close
      act(() => {
        fireEvent.keyDown(window, { key: " " });
      });
      expect(useImportDashboardStore.getState().isOpen).toBe(true);

      // Try ESC key - should close
      act(() => {
        fireEvent.keyDown(window, { key: "Escape" });
      });
      expect(useImportDashboardStore.getState().isOpen).toBe(false);
    });
  });

  describe("responsive design", () => {
    it("should render with correct responsive classes", () => {
      act(() => {
        useImportDashboardStore.getState().open();
      });

      render(<ImportDashboardModal />);
      const dialog = screen.getByRole("dialog");
      const modalContent = dialog.querySelector('[tabindex="-1"]');

      expect(modalContent).toHaveClass("w-full", "h-full");
      expect(modalContent).toHaveClass("md:w-[95vw]", "md:h-[90vh]");
      expect(modalContent).toHaveClass("rounded-none", "md:rounded-3xl");
    });
  });
});
