import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Select from "../Select";

describe("Select", () => {
  const defaultOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render select element", () => {
      render(<Select options={defaultOptions} />);
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Select label="Category" options={defaultOptions} />);
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
    });

    it("should forward ref to select element", () => {
      const ref = vi.fn();
      render(<Select ref={ref} options={defaultOptions} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Options", () => {
    it("should render all options", () => {
      render(<Select options={defaultOptions} />);
      expect(screen.getByRole("option", { name: "Option 1" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option 2" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Option 3" })).toBeInTheDocument();
    });

    it("should handle numeric values", () => {
      const numericOptions = [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
      ];
      render(<Select options={numericOptions} />);
      expect(screen.getByRole("option", { name: "One" })).toHaveValue("1");
    });

    it("should render placeholder option when provided", () => {
      render(<Select placeholder="Select an option" options={defaultOptions} />);
      expect(screen.getByRole("option", { name: "Select an option" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Select an option" })).toBeDisabled();
    });

    it("should render children when no options provided", () => {
      render(
        <Select>
          <option value="child1">Child Option 1</option>
          <option value="child2">Child Option 2</option>
        </Select>
      );
      expect(screen.getByRole("option", { name: "Child Option 1" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Child Option 2" })).toBeInTheDocument();
    });
  });

  describe("Label", () => {
    it("should associate label with select using generated id", () => {
      render(<Select label="Type" options={defaultOptions} />);
      const label = screen.getByText("Type");
      const select = screen.getByRole("combobox");
      expect(label).toHaveAttribute("for", select.id);
    });

    it("should use custom id when provided", () => {
      render(<Select label="Custom" id="custom-id" options={defaultOptions} />);
      expect(screen.getByRole("combobox")).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Error State", () => {
    it("should display error message when error prop is provided", () => {
      render(<Select error="Selection required" options={defaultOptions} />);
      expect(screen.getByText("Selection required")).toBeInTheDocument();
    });

    it("should apply error styling to select", () => {
      render(<Select error="Error" options={defaultOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("border-red-500", "focus:ring-red-500");
    });

    it("should not display helper text when error is present", () => {
      render(<Select error="Error" helperText="Helper text" options={defaultOptions} />);
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text when provided", () => {
      render(<Select helperText="Choose wisely" options={defaultOptions} />);
      expect(screen.getByText("Choose wisely")).toBeInTheDocument();
    });

    it("should not display helper text when error is present", () => {
      render(<Select helperText="Helper" error="Error message" options={defaultOptions} />);
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Select disabled options={defaultOptions} />);
      expect(screen.getByRole("combobox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Select disabled options={defaultOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("disabled:bg-gray-100", "disabled:cursor-not-allowed");
    });
  });

  describe("User Interaction", () => {
    it("should handle option selection", async () => {
      const handleChange = vi.fn();
      render(<Select options={defaultOptions} onChange={handleChange} />);

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, "option2");

      expect(handleChange).toHaveBeenCalled();
      expect(select).toHaveValue("option2");
    });

    it("should not change when disabled", async () => {
      const handleChange = vi.fn();
      render(<Select disabled options={defaultOptions} onChange={handleChange} />);

      const select = screen.getByRole("combobox");
      await userEvent.selectOptions(select, "option2").catch(() => {
        // Expected to fail for disabled select
      });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Select className="custom-class" options={defaultOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("custom-class");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Select name="category" data-testid="category-select" options={defaultOptions} />);
      const select = screen.getByTestId("category-select");
      expect(select).toHaveAttribute("name", "category");
    });

    it("should handle required attribute", () => {
      render(<Select required options={defaultOptions} />);
      expect(screen.getByRole("combobox")).toBeRequired();
    });
  });

  describe("Styling", () => {
    it("should have focus ring styles", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("focus:ring-2", "focus:ring-offset-2");
    });

    it("should have appearance none for custom styling", () => {
      render(<Select options={defaultOptions} />);
      const select = screen.getByRole("combobox");
      expect(select).toHaveClass("appearance-none");
    });
  });

  describe("DisplayName", () => {
    it("should have correct display name", () => {
      expect(Select.displayName).toBe("Select");
    });
  });
});
