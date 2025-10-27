import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Textarea from "../Textarea";

describe("Textarea", () => {
  describe("Rendering", () => {
    it("should render with basic props", () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText("Enter text");
      expect(textarea).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Textarea label="Description" placeholder="Enter description" />);
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter description")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <Textarea
          label="Comments"
          placeholder="Enter comments"
          helperText="Maximum 500 characters"
        />
      );
      expect(screen.getByText("Maximum 500 characters")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <Textarea
          label="Description"
          placeholder="Enter description"
          error="Description is required"
        />
      );
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <Textarea
          label="Description"
          placeholder="Enter description"
          helperText="Enter at least 10 characters"
          error="Too short"
        />
      );
      expect(screen.getByText("Too short")).toBeInTheDocument();
      expect(screen.queryByText("Enter at least 10 characters")).not.toBeInTheDocument();
    });

    it("should render with custom rows", () => {
      render(<Textarea label="Comments" rows={10} />);
      const textarea = screen.getByLabelText("Comments");
      expect(textarea).toHaveAttribute("rows", "10");
    });
  });

  describe("User Interactions", () => {
    it("should handle value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <Textarea
          label="Description"
          placeholder="Enter description"
          onChange={handleChange}
        />
      );

      const textarea = screen.getByLabelText("Description");
      await user.type(textarea, "Test description");

      expect(handleChange).toHaveBeenCalled();
      expect(textarea).toHaveValue("Test description");
    });

    it("should accept controlled value", () => {
      const { rerender } = render(
        <Textarea label="Description" value="Initial text" onChange={vi.fn()} />
      );

      const textarea = screen.getByLabelText("Description");
      expect(textarea).toHaveValue("Initial text");

      rerender(<Textarea label="Description" value="Updated text" onChange={vi.fn()} />);
      expect(textarea).toHaveValue("Updated text");
    });

    it("should handle focus events", async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      const handleBlur = vi.fn();

      render(
        <Textarea
          label="Test Textarea"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const textarea = screen.getByLabelText("Test Textarea");
      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalled();

      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    it("should support multiline text", async () => {
      const user = userEvent.setup();
      render(<Textarea label="Comments" />);

      const textarea = screen.getByLabelText("Comments");
      const multilineText = "Line 1\nLine 2\nLine 3";
      await user.type(textarea, multilineText);

      expect(textarea).toHaveValue(multilineText);
    });
  });

  describe("States", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Textarea label="Description" disabled />);
      const textarea = screen.getByLabelText("Description");
      expect(textarea).toBeDisabled();
    });

    it("should not accept input when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Textarea
          label="Description"
          disabled
          onChange={handleChange}
        />
      );

      const textarea = screen.getByLabelText("Description");
      await user.type(textarea, "text");

      expect(handleChange).not.toHaveBeenCalled();
      expect(textarea).toHaveValue("");
    });

    it("should apply error styling when error prop is provided", () => {
      render(<Textarea label="Description" error="Invalid input" />);
      const textarea = screen.getByLabelText("Description");
      expect(textarea).toHaveClass("border-red-500");
    });

    it("should support readonly attribute", () => {
      render(<Textarea label="Description" readOnly value="Read-only text" />);
      const textarea = screen.getByLabelText("Description");
      expect(textarea).toHaveAttribute("readonly");
    });
  });

  describe("Accessibility", () => {
    it("should connect label to textarea with htmlFor", () => {
      render(<Textarea label="Test Label" id="test-textarea" />);
      const label = screen.getByText("Test Label");
      const textarea = screen.getByLabelText("Test Label");
      expect(label).toHaveAttribute("for", "test-textarea");
      expect(textarea).toHaveAttribute("id", "test-textarea");
    });

    it("should generate unique id when not provided", () => {
      const { container } = render(<Textarea label="Textarea 1" />);
      const textarea1 = container.querySelector("textarea");
      
      const { container: container2 } = render(<Textarea label="Textarea 2" />);
      const textarea2 = container2.querySelector("textarea");

      expect(textarea1?.id).toBeTruthy();
      expect(textarea2?.id).toBeTruthy();
      expect(textarea1?.id).not.toBe(textarea2?.id);
    });

    it("should support all standard textarea attributes", () => {
      render(
        <Textarea
          label="Test"
          required
          maxLength={500}
          minLength={10}
          autoComplete="off"
        />
      );

      const textarea = screen.getByLabelText("Test");
      expect(textarea).toHaveAttribute("required");
      expect(textarea).toHaveAttribute("maxlength", "500");
      expect(textarea).toHaveAttribute("minlength", "10");
      expect(textarea).toHaveAttribute("autocomplete", "off");
    });

    it("should support aria attributes", () => {
      render(
        <Textarea
          label="Test"
          aria-label="Custom label"
          aria-describedby="description"
        />
      );
      const textarea = screen.getByLabelText("Test");
      expect(textarea).toHaveAttribute("aria-label", "Custom label");
      expect(textarea).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to textarea", () => {
      render(<Textarea label="Test" className="custom-class" />);
      const textarea = screen.getByLabelText("Test");
      expect(textarea).toHaveClass("custom-class");
    });

    it("should preserve default classes with custom className", () => {
      render(<Textarea label="Test" className="custom-class" />);
      const textarea = screen.getByLabelText("Test");
      expect(textarea).toHaveClass("custom-class");
      expect(textarea).toHaveClass("w-full");
      expect(textarea).toHaveClass("p-3");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to textarea element", () => {
      const ref = vi.fn();
      render(<Textarea label="Test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
    });
  });

  describe("Character limits", () => {
    it("should respect maxLength attribute", async () => {
      const user = userEvent.setup();
      render(<Textarea label="Short" maxLength={10} />);

      const textarea = screen.getByLabelText("Short") as HTMLTextAreaElement;
      await user.type(textarea, "This is a very long text that exceeds the limit");

      expect(textarea.value.length).toBeLessThanOrEqual(10);
    });
  });
});
