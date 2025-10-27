import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import TextInput from "../TextInput";

describe("TextInput", () => {
  describe("Rendering", () => {
    it("should render with basic props", () => {
      render(<TextInput placeholder="Enter text" />);
      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<TextInput label="Email" placeholder="Enter email" />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <TextInput
          label="Password"
          placeholder="Enter password"
          helperText="Must be at least 8 characters"
        />
      );
      expect(screen.getByText("Must be at least 8 characters")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      const icon = <span data-testid="test-icon">🔍</span>;
      render(<TextInput icon={icon} placeholder="Search" />);
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <TextInput
          label="Email"
          placeholder="Enter email"
          error="Invalid email format"
        />
      );
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <TextInput
          label="Email"
          placeholder="Enter email"
          helperText="Enter a valid email"
          error="Invalid email"
        />
      );
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.queryByText("Enter a valid email")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <TextInput
          label="Name"
          placeholder="Enter name"
          onChange={handleChange}
        />
      );

      const input = screen.getByLabelText("Name");
      await user.type(input, "John");

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue("John");
    });

    it("should accept controlled value", () => {
      const { rerender } = render(
        <TextInput label="Name" value="Jane" onChange={vi.fn()} />
      );

      const input = screen.getByLabelText("Name");
      expect(input).toHaveValue("Jane");

      rerender(<TextInput label="Name" value="Jane Doe" onChange={vi.fn()} />);
      expect(input).toHaveValue("Jane Doe");
    });

    it("should handle focus events", async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <TextInput
          label="Test Input"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByLabelText("Test Input");
      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<TextInput label="Name" disabled />);
      const input = screen.getByLabelText("Name");
      expect(input).toBeDisabled();
    });

    it("should not accept input when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <TextInput
          label="Name"
          disabled
          onChange={handleChange}
        />
      );

      const input = screen.getByLabelText("Name");
      await user.type(input, "text");

      expect(handleChange).not.toHaveBeenCalled();
      expect(input).toHaveValue("");
    });

    it("should apply error styling when error prop is provided", () => {
      render(<TextInput label="Email" error="Invalid email" />);
      const input = screen.getByLabelText("Email");
      expect(input).toHaveClass("border-red-500");
    });
  });

  describe("Accessibility", () => {
    it("should connect label to input with htmlFor", () => {
      render(<TextInput label="Test Label" id="test-input" />);
      const label = screen.getByText("Test Label");
      const input = screen.getByLabelText("Test Label");
      expect(label).toHaveAttribute("for", "test-input");
      expect(input).toHaveAttribute("id", "test-input");
    });

    it("should generate unique id when not provided", () => {
      const { container } = render(<TextInput label="Input 1" />);
      const input1 = container.querySelector("input");
      
      const { container: container2 } = render(<TextInput label="Input 2" />);
      const input2 = container2.querySelector("input");

      expect(input1?.id).toBeTruthy();
      expect(input2?.id).toBeTruthy();
      expect(input1?.id).not.toBe(input2?.id);
    });

    it("should support all standard input attributes", () => {
      render(
        <TextInput
          label="Test"
          type="email"
          required
          maxLength={50}
          minLength={3}
          pattern="[a-z]+"
          autoComplete="email"
        />
      );

      const input = screen.getByLabelText("Test");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("maxlength", "50");
      expect(input).toHaveAttribute("minlength", "3");
      expect(input).toHaveAttribute("pattern", "[a-z]+");
      expect(input).toHaveAttribute("autocomplete", "email");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to input", () => {
      render(<TextInput label="Test" className="custom-class" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveClass("custom-class");
    });

    it("should preserve default classes with custom className", () => {
      render(<TextInput label="Test" className="custom-class" />);
      const input = screen.getByLabelText("Test");
      expect(input).toHaveClass("custom-class");
      expect(input).toHaveClass("w-full");
      expect(input).toHaveClass("p-3");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to input element", () => {
      const ref = vi.fn();
      render(<TextInput label="Test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });
});
