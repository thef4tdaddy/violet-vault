import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Textarea from "../Textarea";

describe("Textarea", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render textarea element", () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Textarea label="Description" />);
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("should forward ref to textarea element", () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Label", () => {
    it("should associate label with textarea using generated id", () => {
      render(<Textarea label="Notes" />);
      const label = screen.getByText("Notes");
      const textarea = screen.getByRole("textbox");
      expect(label).toHaveAttribute("for", textarea.id);
    });

    it("should use custom id when provided", () => {
      render(<Textarea label="Custom" id="custom-id" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Error State", () => {
    it("should display error message when error prop is provided", () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should apply error styling to textarea", () => {
      render(<Textarea error="Error" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-red-500", "focus:ring-red-500");
    });

    it("should not display helper text when error is present", () => {
      render(<Textarea error="Error" helperText="Helper text" />);
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text when provided", () => {
      render(<Textarea helperText="Maximum 500 characters" />);
      expect(screen.getByText("Maximum 500 characters")).toBeInTheDocument();
    });

    it("should not display helper text when error is present", () => {
      render(<Textarea helperText="Helper" error="Error message" />);
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Textarea disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("disabled:bg-gray-100", "disabled:cursor-not-allowed");
    });
  });

  describe("User Interaction", () => {
    it("should handle text input", async () => {
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Hello World");

      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue("Hello World");
    });

    it("should not accept input when disabled", async () => {
      const handleChange = vi.fn();
      render(<Textarea disabled onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Hello");

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Rows Configuration", () => {
    it("should respect rows prop", () => {
      render(<Textarea rows={6} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "6");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Textarea name="description" data-testid="description-textarea" />);
      const textarea = screen.getByTestId("description-textarea");
      expect(textarea).toHaveAttribute("name", "description");
    });

    it("should handle required attribute", () => {
      render(<Textarea required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should handle readonly attribute", () => {
      render(<Textarea readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("should handle maxLength attribute", () => {
      render(<Textarea maxLength={500} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "500");
    });
  });

  describe("Styling", () => {
    it("should have focus ring styles", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("focus:ring-2", "focus:ring-offset-2");
    });

    it("should be non-resizable by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("DisplayName", () => {
    it("should have correct display name", () => {
      expect(Textarea.displayName).toBe("Textarea");
    });
  });
});
