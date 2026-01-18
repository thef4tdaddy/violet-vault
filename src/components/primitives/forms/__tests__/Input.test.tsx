import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Input from "../Input";
import "@testing-library/jest-dom";

describe("Input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render input element", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("should forward ref to input element", () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should have correct display name", () => {
      expect(Input.displayName).toBe("Input");
    });
  });

  describe("Base Styling", () => {
    it("should apply base styles", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "w-full",
        "rounded-2xl",
        "bg-white/90",
        "backdrop-blur-sm",
        "border",
        "border-slate-200"
      );
    });

    it("should apply focus styles", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass(
        "focus:outline-none",
        "focus:border-purple-500",
        "focus:ring-4",
        "focus:ring-purple-100"
      );
    });

    it("should apply transition", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("transition-all", "duration-200");
    });
  });

  describe("Error State", () => {
    it("should apply error styles when error is true", () => {
      render(<Input error={true} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border-red-500", "focus:border-red-500", "focus:ring-red-200");
    });

    it("should not apply error styles when error is false", () => {
      render(<Input error={false} />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("focus:border-purple-500", "focus:ring-purple-100");
      expect(input).not.toHaveClass("border-red-500");
    });

    it("should not apply error styles by default", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveClass("border-red-500");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Input disabled />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("disabled:bg-slate-100", "disabled:cursor-not-allowed");
    });

    it("should not accept input when disabled", async () => {
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Hello");

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Left Icon", () => {
    it("should render left icon when provided", () => {
      const { container } = render(<Input leftIcon="Lock" />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should apply left padding when left icon is present", () => {
      render(<Input leftIcon="Lock" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pl-11");
    });

    it("should not apply left padding when no left icon", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pl-4");
      expect(input).not.toHaveClass("pl-11");
    });

    it("should position left icon correctly", () => {
      const { container } = render(<Input leftIcon="Lock" />);
      const iconContainer = container.querySelector(".absolute.left-4");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("pointer-events-none");
    });
  });

  describe("Right Icon", () => {
    it("should render right icon when provided", () => {
      const { container } = render(<Input rightIcon="Eye" />);
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should apply right padding when right icon is present", () => {
      render(<Input rightIcon="Eye" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pr-11");
    });

    it("should not apply right padding when no right icon", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pr-4");
      expect(input).not.toHaveClass("pr-11");
    });

    it("should position right icon correctly", () => {
      const { container } = render(<Input rightIcon="Eye" />);
      const iconContainer = container.querySelector(".absolute.right-4");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe("Right Icon Click", () => {
    it("should call onRightIconClick when right icon is clicked", () => {
      const handleClick = vi.fn();
      const { container } = render(<Input rightIcon="Eye" onRightIconClick={handleClick} />);

      const iconContainer = container.querySelector(".absolute.right-4");
      if (iconContainer) {
        fireEvent.click(iconContainer);
      }

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should make right icon clickable when callback is provided", () => {
      const { container } = render(<Input rightIcon="Eye" onRightIconClick={() => {}} />);
      const iconContainer = container.querySelector(".absolute.right-4");
      expect(iconContainer).toHaveClass("cursor-pointer", "hover:text-purple-600");
    });

    it("should not make right icon clickable when no callback", () => {
      const { container } = render(<Input rightIcon="Eye" />);
      const iconContainer = container.querySelector(".absolute.right-4");
      expect(iconContainer).toHaveClass("pointer-events-none");
      expect(iconContainer).not.toHaveClass("cursor-pointer");
    });

    it("should handle keyboard events on right icon", () => {
      const handleClick = vi.fn();
      const { container } = render(<Input rightIcon="Eye" onRightIconClick={handleClick} />);

      const iconContainer = container.querySelector(".absolute.right-4");
      if (iconContainer) {
        fireEvent.keyDown(iconContainer, { key: "Enter" });
      }

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle space key on right icon", () => {
      const handleClick = vi.fn();
      const { container } = render(<Input rightIcon="Eye" onRightIconClick={handleClick} />);

      const iconContainer = container.querySelector(".absolute.right-4");
      if (iconContainer) {
        fireEvent.keyDown(iconContainer, { key: " " });
      }

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Both Icons", () => {
    it("should render both left and right icons", () => {
      const { container } = render(<Input leftIcon="Lock" rightIcon="Eye" />);
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(2);
    });

    it("should apply both left and right padding", () => {
      render(<Input leftIcon="Lock" rightIcon="Eye" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("pl-11", "pr-11");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
    });

    it("should preserve base classes with custom className", () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class", "w-full", "rounded-2xl");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Input type="email" name="email" autoComplete="email" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("autoComplete", "email");
    });

    it("should handle required attribute", () => {
      render(<Input required />);
      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("should handle readonly attribute", () => {
      render(<Input readOnly />);
      expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("should handle placeholder", () => {
      render(<Input placeholder="Enter password" />);
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
    });
  });

  describe("User Interaction", () => {
    it("should handle text input", async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Hello");

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue("Hello");
    });

    it("should handle value prop", () => {
      render(<Input value="Test Value" onChange={() => {}} />);
      expect(screen.getByRole("textbox")).toHaveValue("Test Value");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle password input with toggle visibility", async () => {
      const { container, rerender } = render(
        <Input type="password" rightIcon="Eye" onRightIconClick={vi.fn()} />
      );

      const input = container.querySelector("input");
      expect(input).toHaveAttribute("type", "password");

      // Simulate type change after icon click
      rerender(<Input type="text" rightIcon="EyeOff" onRightIconClick={vi.fn()} />);

      const inputAfter = container.querySelector("input");
      expect(inputAfter).toHaveAttribute("type", "text");
    });

    it("should handle all props together", () => {
      const handleClick = vi.fn();
      render(
        <Input
          type="email"
          placeholder="Enter email"
          leftIcon="Mail"
          rightIcon="Check"
          onRightIconClick={handleClick}
          error={true}
          disabled={false}
          className="custom"
          value="test@example.com"
          onChange={() => {}}
        />
      );

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom", "pl-11", "pr-11", "border-red-500");
      expect(input).toHaveValue("test@example.com");
      expect(input).toHaveAttribute("type", "email");
    });
  });
});
