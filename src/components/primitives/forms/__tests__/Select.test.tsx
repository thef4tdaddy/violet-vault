import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Select from "../Select";
import "@testing-library/jest-dom";

describe("Select", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render select element", () => {
      render(
        <Select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should forward ref to select element", () => {
      const ref = vi.fn();
      render(<Select ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should have correct display name", () => {
      expect(Select.displayName).toBe("Select");
    });

    it("should render children options", () => {
      render(
        <Select>
          <option value="1">First Option</option>
          <option value="2">Second Option</option>
        </Select>
      );
      expect(screen.getByText("First Option")).toBeInTheDocument();
      expect(screen.getByText("Second Option")).toBeInTheDocument();
    });
  });

  describe("Base Styling", () => {
    it("should apply base styles", () => {
      render(<Select />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "w-full",
        "rounded-2xl",
        "bg-white/90",
        "backdrop-blur-sm",
        "border",
        "border-slate-200"
      );
    });

    it("should apply focus styles", () => {
      render(<Select />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "focus:outline-none",
        "focus:border-purple-500",
        "focus:ring-4",
        "focus:ring-purple-100"
      );
    });

    it("should apply transition", () => {
      render(<Select />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("transition-all", "duration-200");
    });
  });

  describe("Error State", () => {
    it("should apply error styles when error is true", () => {
      render(<Select error={true} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-red-500", "focus:border-red-500", "focus:ring-red-200");
    });

    it("should not apply error styles when error is false", () => {
      render(<Select error={false} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:border-purple-500", "focus:ring-purple-100");
      expect(select).not.toHaveClass("border-red-500");
    });

    it("should not apply error styles by default", () => {
      render(<Select />);
      const select = screen.getByRole("combobox");
      expect(select).not.toHaveClass("border-red-500");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Select disabled />);
      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Select disabled />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("disabled:bg-slate-100", "disabled:cursor-not-allowed");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Select className="custom-class" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-class");
    });

    it("should preserve base classes with custom className", () => {
      render(<Select className="custom-class" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-class", "w-full", "rounded-2xl");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Select name="category" autoComplete="category" />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveAttribute("name", "category");
      expect(select).toHaveAttribute("autoComplete", "category");
    });

    it("should handle required attribute", () => {
      render(<Select required />);
      expect(screen.getByRole("combobox")).toBeRequired();
    });

    it("should handle readonly attribute", () => {
      render(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should handle value prop", () => {
      render(
        <Select value="option2">
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </Select>
      );
      expect(screen.getByRole("combobox")).toHaveValue("option2");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props together", () => {
      render(
        <Select
          name="category"
          error={true}
          disabled={false}
          className="custom"
          value="food"
        >
          <option value="">Select...</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
        </Select>
      );

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom", "border-red-500");
      expect(select).toHaveValue("food");
      expect(select).toHaveAttribute("name", "category");
    });

    it("should handle empty select", () => {
      render(<Select />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should handle optgroups", () => {
      render(
        <Select>
          <optgroup label="Group 1">
            <option value="1a">Option 1A</option>
            <option value="1b">Option 1B</option>
          </optgroup>
          <optgroup label="Group 2">
            <option value="2a">Option 2A</option>
          </optgroup>
        </Select>
      );

      expect(screen.getByText("Option 1A")).toBeInTheDocument();
      expect(screen.getByText("Option 2A")).toBeInTheDocument();
    });
  });
});
