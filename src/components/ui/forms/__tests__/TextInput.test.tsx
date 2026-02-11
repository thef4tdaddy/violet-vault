import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TextInput from "../TextInput";

describe("TextInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render input element", () => {
      render(<TextInput placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<TextInput label="Email" />);
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should forward ref to input element", () => {
      const ref = vi.fn();
      render(<TextInput ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Label", () => {
    it("should associate label with input using generated id", () => {
      render(<TextInput label="Username" />);
      const label = screen.getByText("Username");
      const input = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", input.id);
    });

    it("should use custom id when provided", () => {
      render(<TextInput label="Custom" id="custom-id" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Error State", () => {
    it("should display error message when error prop is provided", () => {
      render(<TextInput error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should apply error styling to input", () => {
      render(<TextInput error="Error" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500", "focus:ring-red-500");
    });

    it("should not display helper text when error is present", () => {
      render(<TextInput error="Error" helperText="Helper text" />);
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text when provided", () => {
      render(<TextInput helperText="This is helpful" />);
      expect(screen.getByText("This is helpful")).toBeInTheDocument();
    });

    it("should not display helper text when error is present", () => {
      render(<TextInput helperText="Helper" error="Error message" />);
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });
  });

  describe("Icon", () => {
    it("should render icon when provided", () => {
      render(<TextInput icon={<span data-testid="icon">🔍</span>} />);
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("should apply padding for icon", () => {
      render(<TextInput icon={<span>🔍</span>} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pl-10");
    });

    it("should not apply icon padding when no icon", () => {
      render(<TextInput />);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveClass("pl-10");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<TextInput disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<TextInput disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("disabled:bg-gray-100", "disabled:cursor-not-allowed");
    });
  });

  describe("User Interaction", () => {
    it("should handle text input", async () => {
      const handleChange = vi.fn();
      render(<TextInput onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Hello");

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue("Hello");
    });

    it("should not accept input when disabled", async () => {
      const handleChange = vi.fn();
      render(<TextInput disabled onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Hello");

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<TextInput className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<TextInput type="email" name="email" autoComplete="email" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("autoComplete", "email");
    });

    it("should handle required attribute", () => {
      render(<TextInput required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should handle readonly attribute", () => {
      render(<TextInput readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });
  });

  describe("Focus Styling", () => {
    it("should have focus ring styles", () => {
      render(<TextInput />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("focus:ring-2", "focus:ring-offset-2");
    });
  });

  describe("DisplayName", () => {
    it("should have correct display name", () => {
      expect(TextInput.displayName).toBe("TextInput");
    });
  });
});
