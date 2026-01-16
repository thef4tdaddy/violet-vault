import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import PromptModal from "../PromptModal";

// Mock dependencies
vi.mock("@/utils", () => ({
  getIcon: vi.fn((name: string) => {
    const MockIcon = ({ className }: { className?: string }) => (
      <svg data-testid={`icon-${name}`} className={className}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    );
    return MockIcon;
  }),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button data-testid="close-button" onClick={onClick}>
      Close
    </button>
  ),
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: vi.fn(() => ({ current: null })),
}));

describe("PromptModal", () => {
  const defaultProps = {
    isOpen: true,
    title: "Test Prompt",
    message: "Enter a value",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when isOpen is true", () => {
      render(<PromptModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<PromptModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should display title", () => {
      render(<PromptModal {...defaultProps} />);
      expect(screen.getByText("Test Prompt")).toBeInTheDocument();
    });

    it("should display message", () => {
      render(<PromptModal {...defaultProps} />);
      expect(screen.getByText("Enter a value")).toBeInTheDocument();
    });

    it("should render input field", () => {
      render(<PromptModal {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render confirm and cancel buttons", () => {
      render(<PromptModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: /Confirm/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    it("should update input value when user types", async () => {
      render(<PromptModal {...defaultProps} />);
      const input = screen.getByRole("textbox");

      await userEvent.type(input, "test value");
      expect(input).toHaveValue("test value");
    });

    it("should initialize with defaultValue", () => {
      render(<PromptModal {...defaultProps} defaultValue="initial value" />);
      expect(screen.getByRole("textbox")).toHaveValue("initial value");
    });

    it("should use placeholder text", () => {
      render(<PromptModal {...defaultProps} placeholder="Enter something..." />);
      expect(screen.getByPlaceholderText("Enter something...")).toBeInTheDocument();
    });

    it("should handle different input types", () => {
      render(<PromptModal {...defaultProps} inputType="email" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should handle password input type", () => {
      render(<PromptModal {...defaultProps} inputType="password" />);
      const input = screen.getByPlaceholderText("");
      expect(input).toHaveAttribute("type", "password");
    });

    it("should handle number input type", () => {
      render(<PromptModal {...defaultProps} inputType="number" />);
      const input = screen.getByRole("spinbutton");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("User Interactions", () => {
    it("should call onConfirm with input value when confirm button is clicked", async () => {
      const onConfirm = vi.fn();
      render(<PromptModal {...defaultProps} onConfirm={onConfirm} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test value");
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(onConfirm).toHaveBeenCalledWith("test value");
    });

    it("should call onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      render(<PromptModal {...defaultProps} onCancel={onCancel} />);

      await userEvent.click(screen.getByRole("button", { name: /Cancel/i }));
      expect(onCancel).toHaveBeenCalledWith(null);
    });

    it("should call onCancel when close button is clicked", async () => {
      const onCancel = vi.fn();
      render(<PromptModal {...defaultProps} onCancel={onCancel} />);

      await userEvent.click(screen.getByTestId("close-button"));
      expect(onCancel).toHaveBeenCalledWith(null);
    });
  });

  describe("Validation", () => {
    it("should show error for required empty field", async () => {
      render(<PromptModal {...defaultProps} isRequired={true} />);

      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));
      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });

    it("should not show error for non-required empty field", async () => {
      const onConfirm = vi.fn();
      render(<PromptModal {...defaultProps} isRequired={false} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));
      expect(onConfirm).toHaveBeenCalledWith("");
    });

    it("should handle custom validation function", async () => {
      const validation = vi.fn(() => ({ valid: false, error: "Custom error message" }));
      render(<PromptModal {...defaultProps} validation={validation} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(validation).toHaveBeenCalledWith("test");
      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("should proceed when custom validation passes", async () => {
      const onConfirm = vi.fn();
      const validation = vi.fn(() => ({ valid: true, error: "" }));
      render(<PromptModal {...defaultProps} validation={validation} onConfirm={onConfirm} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "valid input");
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(validation).toHaveBeenCalledWith("valid input");
      expect(onConfirm).toHaveBeenCalledWith("valid input");
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when loading", () => {
      render(<PromptModal {...defaultProps} isLoading={true} />);
      expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeDisabled();
    });

    it("should not disable buttons when not loading", () => {
      render(<PromptModal {...defaultProps} isLoading={false} />);
      expect(screen.getByRole("button", { name: /Confirm/i })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /Cancel/i })).not.toBeDisabled();
    });
  });

  describe("Custom Labels", () => {
    it("should use custom confirm label", () => {
      render(<PromptModal {...defaultProps} confirmLabel="Submit" />);
      expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    });

    it("should use custom cancel label", () => {
      render(<PromptModal {...defaultProps} cancelLabel="Dismiss" />);
      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long input values", async () => {
      const onConfirm = vi.fn();
      render(<PromptModal {...defaultProps} onConfirm={onConfirm} />);

      const longValue = "A".repeat(500);
      const input = screen.getByRole("textbox");
      await userEvent.type(input, longValue);
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(onConfirm).toHaveBeenCalledWith(longValue);
    });

    it("should handle special characters in input", async () => {
      const onConfirm = vi.fn();
      render(<PromptModal {...defaultProps} onConfirm={onConfirm} />);

      const specialChars = "<>&'\"";
      const input = screen.getByRole("textbox");
      await userEvent.type(input, specialChars);
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(onConfirm).toHaveBeenCalledWith(specialChars);
    });

    it("should handle undefined callbacks", async () => {
      render(<PromptModal {...defaultProps} onConfirm={undefined} onCancel={undefined} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle null icon", () => {
      render(<PromptModal {...defaultProps} icon={null} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should render children content", () => {
      render(
        <PromptModal {...defaultProps}>
          <div data-testid="custom-content">Custom Content</div>
        </PromptModal>
      );
      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });

    it("should clear validation error when input changes", async () => {
      render(<PromptModal {...defaultProps} isRequired={true} />);

      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));
      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "test");

      await waitFor(() => {
        expect(screen.queryByText(/This field is required/i)).not.toBeInTheDocument();
      });
    });

    it("should handle whitespace-only input as empty when required", async () => {
      render(<PromptModal {...defaultProps} isRequired={true} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "   ");
      await userEvent.click(screen.getByRole("button", { name: /Confirm|Processing/i }));

      expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
    });
  });
});
