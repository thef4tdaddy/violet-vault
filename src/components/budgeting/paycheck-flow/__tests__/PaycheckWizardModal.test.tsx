/**
 * Paycheck Wizard Modal Tests
 * Part of Issue #1785: Wizard Modal Container
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PaycheckWizardModal } from "../PaycheckWizardModal";
import { usePaycheckFlowStore } from "@/stores/ui/paycheckFlowStore";

// Mock Framer Motion to avoid animation complexities in tests
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("PaycheckWizardModal", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      usePaycheckFlowStore.setState({
        isOpen: false,
        currentStep: 0,
        paycheckAmountCents: null,
        selectedStrategy: null,
        allocations: [],
      });
    });

    // Clear document.body.style.overflow
    document.body.style.overflow = "";
  });

  describe("Modal Visibility", () => {
    it("should not render when isOpen is false", () => {
      render(<PaycheckWizardModal />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have correct aria attributes when open", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "paycheck-wizard-title");
    });
  });

  describe("Step Display", () => {
    it("should display the correct step title", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 0 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("heading", { name: /enter paycheck amount/i })).toBeInTheDocument();
    });

    it("should display step 1 title when on step 1", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("heading", { name: /allocate funds/i })).toBeInTheDocument();
    });

    it("should display step 2 title when on step 2", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 2 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("heading", { name: /review & confirm/i })).toBeInTheDocument();
    });

    it("should display step 3 title when on step 3", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 3 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("heading", { name: /success!/i })).toBeInTheDocument();
    });
  });

  describe("Step Indicator", () => {
    it("should highlight the current step", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      render(<PaycheckWizardModal />);

      const step2 = screen.getByLabelText(/step 2:/i);
      expect(step2).toHaveClass("bg-fuchsia-500");
    });

    it("should show checkmarks for completed steps", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 2 });
      });

      render(<PaycheckWizardModal />);

      const step1 = screen.getByLabelText(/step 1:/i);
      expect(step1).toHaveTextContent("✓");
      expect(step1).toHaveClass("bg-green-500");

      const step2 = screen.getByLabelText(/step 2:/i);
      expect(step2).toHaveTextContent("✓");
      expect(step2).toHaveClass("bg-green-500");
    });

    it("should show step numbers for future steps", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 0 });
      });

      render(<PaycheckWizardModal />);

      const step2 = screen.getByLabelText(/step 2:/i);
      expect(step2).toHaveTextContent("2");

      const step3 = screen.getByLabelText(/step 3:/i);
      expect(step3).toHaveTextContent("3");
    });
  });

  describe("Navigation Buttons", () => {
    it("should not show BACK button on first step", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 0 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();
    });

    it("should show BACK button on second step", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("should show CONTINUE button on non-last steps", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 0 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });

    it("should not show CONTINUE button on last step", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 3 });
      });

      render(<PaycheckWizardModal />);

      expect(screen.queryByRole("button", { name: /continue/i })).not.toBeInTheDocument();
    });

    it("should call nextStep when CONTINUE is clicked", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 0 });
      });

      const user = userEvent.setup();
      render(<PaycheckWizardModal />);

      const continueButton = screen.getByRole("button", { name: /continue/i });
      await user.click(continueButton);

      expect(usePaycheckFlowStore.getState().currentStep).toBe(1);
    });

    it("should call previousStep when BACK is clicked", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      const user = userEvent.setup();
      render(<PaycheckWizardModal />);

      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      expect(usePaycheckFlowStore.getState().currentStep).toBe(0);
    });
  });

  describe("Close Button", () => {
    it("should show close button", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByLabelText(/close paycheck wizard/i)).toBeInTheDocument();
    });

    it("should call closeWizard when close button is clicked", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      const user = userEvent.setup();
      render(<PaycheckWizardModal />);

      const closeButton = screen.getByLabelText(/close paycheck wizard/i);
      await user.click(closeButton);

      expect(usePaycheckFlowStore.getState().isOpen).toBe(false);
    });

    it("should call closeWizard when backdrop is clicked", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      const user = userEvent.setup();
      const { container } = render(<PaycheckWizardModal />);

      // Click the backdrop (first child of dialog container)
      const backdrop = container.querySelector(".bg-slate-900\\/80");
      if (backdrop) {
        await user.click(backdrop as HTMLElement);
      }

      expect(usePaycheckFlowStore.getState().isOpen).toBe(false);
    });
  });

  describe("ESC Key Handling", () => {
    it("should show confirmation on ESC key press (non-success steps)", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      // Mock window.confirm to return false (user cancels)
      const confirmMock = vi.fn().mockReturnValue(false);
      vi.stubGlobal("confirm", confirmMock);

      render(<PaycheckWizardModal />);

      await act(async () => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        window.dispatchEvent(event);
      });

      expect(confirmMock).toHaveBeenCalled();
      expect(usePaycheckFlowStore.getState().isOpen).toBe(true); // Still open (user cancelled)

      vi.unstubAllGlobals();
    });

    it("should close without confirmation on ESC key press (success step)", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 3 });
      });

      const confirmMock = vi.fn();
      vi.stubGlobal("confirm", confirmMock);

      render(<PaycheckWizardModal />);

      await act(async () => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        window.dispatchEvent(event);
      });

      expect(confirmMock).not.toHaveBeenCalled();
      expect(usePaycheckFlowStore.getState().isOpen).toBe(false);

      vi.unstubAllGlobals();
    });

    it("should close when user confirms ESC dialog", async () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      // Mock window.confirm to return true (user confirms)
      const confirmMock = vi.fn().mockReturnValue(true);
      vi.stubGlobal("confirm", confirmMock);

      render(<PaycheckWizardModal />);

      await act(async () => {
        const event = new KeyboardEvent("keydown", { key: "Escape" });
        window.dispatchEvent(event);
      });

      expect(confirmMock).toHaveBeenCalled();
      expect(usePaycheckFlowStore.getState().isOpen).toBe(false);

      vi.unstubAllGlobals();
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when modal opens", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should restore body scroll when modal closes", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      const { rerender } = render(<PaycheckWizardModal />);

      expect(document.body.style.overflow).toBe("hidden");

      act(() => {
        usePaycheckFlowStore.setState({ isOpen: false });
      });

      rerender(<PaycheckWizardModal />);

      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("State Persistence", () => {
    it("should not reset state when closing (allows resume)", async () => {
      act(() => {
        usePaycheckFlowStore.setState({
          isOpen: true,
          currentStep: 2,
          paycheckAmountCents: 250000,
          selectedStrategy: "smart",
        });
      });

      const user = userEvent.setup();
      render(<PaycheckWizardModal />);

      const closeButton = screen.getByLabelText(/close paycheck wizard/i);
      await user.click(closeButton);

      expect(usePaycheckFlowStore.getState().isOpen).toBe(false);
      expect(usePaycheckFlowStore.getState().currentStep).toBe(2); // Not reset
      expect(usePaycheckFlowStore.getState().paycheckAmountCents).toBe(250000); // Not reset
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have focusable dialog element", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true });
      });

      render(<PaycheckWizardModal />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("tabindex", "-1");

      // Verify the dialog can be focused programmatically
      dialog.focus();
      expect(document.activeElement).toBe(dialog);
    });

    it("should have aria-current on current step", () => {
      act(() => {
        usePaycheckFlowStore.setState({ isOpen: true, currentStep: 1 });
      });

      render(<PaycheckWizardModal />);

      const step2 = screen.getByLabelText(/step 2:/i);
      expect(step2).toHaveAttribute("aria-current", "step");
    });
  });
});
