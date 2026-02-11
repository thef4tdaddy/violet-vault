import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Textarea from "../Textarea";
import "@testing-library/jest-dom";

describe("Textarea", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render textarea element", () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should forward ref to textarea element", () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should have correct display name", () => {
      expect(Textarea.displayName).toBe("Textarea");
    });
  });

  describe("Base Styling", () => {
    it("should apply base styles", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "w-full",
        "rounded-2xl",
        "bg-white/90",
        "backdrop-blur-sm",
        "border",
        "border-slate-200"
      );
    });

    it("should apply focus styles", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass(
        "focus:outline-none",
        "focus:border-purple-500",
        "focus:ring-4",
        "focus:ring-purple-100"
      );
    });

    it("should apply transition", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("transition-all", "duration-200");
    });

    it("should be resizable vertically", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-y");
    });
  });

  describe("Error State", () => {
    it("should apply error styles when error is true", () => {
      render(<Textarea error={true} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("border-red-500", "focus:border-red-500", "focus:ring-red-200");
    });

    it("should not apply error styles when error is false", () => {
      render(<Textarea error={false} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("focus:border-purple-500", "focus:ring-purple-100");
      expect(textarea).not.toHaveClass("border-red-500");
    });

    it("should not apply error styles by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).not.toHaveClass("border-red-500");
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
      expect(textarea).toHaveClass("disabled:bg-slate-100", "disabled:cursor-not-allowed");
    });

    it("should not accept input when disabled", async () => {
      const handleChange = vi.fn();
      render(<Textarea disabled onChange={handleChange} />);

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Hello");

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class");
    });

    it("should preserve base classes with custom className", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom-class", "w-full", "rounded-2xl");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Textarea name="notes" autoComplete="off" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("name", "notes");
      expect(textarea).toHaveAttribute("autoComplete", "off");
    });

    it("should handle required attribute", () => {
      render(<Textarea required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should handle readonly attribute", () => {
      render(<Textarea readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("should handle placeholder", () => {
      render(<Textarea placeholder="Enter notes" />);
      expect(screen.getByPlaceholderText("Enter notes")).toBeInTheDocument();
    });

    it("should handle rows attribute", () => {
      render(<Textarea rows={5} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
    });

    it("should handle cols attribute", () => {
      render(<Textarea cols={50} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("cols", "50");
    });

    it("should handle maxLength attribute", () => {
      render(<Textarea maxLength={100} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "100");
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

    it("should handle multiline text input", async () => {
      render(<Textarea />);

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "Line 1{Enter}Line 2{Enter}Line 3");

      expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
    });

    it("should handle value prop", () => {
      render(<Textarea value="Test Value" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("Test Value");
    });

    it("should handle defaultValue prop", () => {
      render(<Textarea defaultValue="Default Text" />);
      expect(screen.getByRole("textbox")).toHaveValue("Default Text");
    });
  });

  describe("Resize Behavior", () => {
    it("should be resizable by default", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("resize-y");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props together", () => {
      render(
        <Textarea
          name="description"
          placeholder="Enter description"
          error={true}
          disabled={false}
          className="custom"
          value="Test content"
          onChange={() => {}}
          rows={4}
          maxLength={500}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("custom", "border-red-500");
      expect(textarea).toHaveValue("Test content");
      expect(textarea).toHaveAttribute("name", "description");
      expect(textarea).toHaveAttribute("rows", "4");
      expect(textarea).toHaveAttribute("maxLength", "500");
    });

    it("should handle empty textarea", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("should handle long text content", async () => {
      const longText = "A".repeat(1000);
      render(<Textarea />);

      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, longText);

      expect(textarea).toHaveValue(longText);
    });
  });
});
