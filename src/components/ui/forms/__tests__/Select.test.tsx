import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Select from "../Select";

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  describe("Rendering", () => {
    it("should render with options array", () => {
      render(<Select label="Choose" options={options} />);
      const select = screen.getByLabelText("Choose");
      expect(select).toBeInTheDocument();
      expect(select.querySelectorAll("option")).toHaveLength(3);
    });

    it("should render with label", () => {
      render(<Select label="Category" options={options} />);
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
    });

    it("should render with placeholder", () => {
      render(<Select label="Choose" options={options} placeholder="Select an option" />);
      expect(screen.getByText("Select an option")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <Select
          label="Category"
          options={options}
          helperText="Choose a category from the list"
        />
      );
      expect(screen.getByText("Choose a category from the list")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <Select
          label="Category"
          options={options}
          error="Category is required"
        />
      );
      expect(screen.getByText("Category is required")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <Select
          label="Category"
          options={options}
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });

    it("should render with children when no options provided", () => {
      render(
        <Select label="Custom">
          <option value="custom1">Custom 1</option>
          <option value="custom2">Custom 2</option>
        </Select>
      );
      const select = screen.getByLabelText("Custom");
      expect(select.querySelectorAll("option")).toHaveLength(2);
    });
  });

  describe("Option Selection", () => {
    it("should handle option selection", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          label="Choose"
          options={options}
          onChange={handleChange}
        />
      );

      const select = screen.getByLabelText("Choose");
      await user.selectOptions(select, "option2");

      expect(handleChange).toHaveBeenCalled();
      expect((select as HTMLSelectElement).value).toBe("option2");
    });

    it("should work as controlled component", () => {
      const { rerender } = render(
        <Select
          label="Choose"
          options={options}
          value="option1"
          onChange={vi.fn()}
        />
      );

      const select = screen.getByLabelText("Choose") as HTMLSelectElement;
      expect(select.value).toBe("option1");

      rerender(
        <Select
          label="Choose"
          options={options}
          value="option3"
          onChange={vi.fn()}
        />
      );
      expect(select.value).toBe("option3");
    });

    it("should support defaultValue for uncontrolled mode", () => {
      render(
        <Select
          label="Choose"
          options={options}
          defaultValue="option2"
        />
      );

      const select = screen.getByLabelText("Choose") as HTMLSelectElement;
      expect(select.value).toBe("option2");
    });
  });

  describe("Placeholder", () => {
    it("should render placeholder as disabled option", () => {
      render(
        <Select
          label="Choose"
          options={options}
          placeholder="Select an option"
        />
      );

      const placeholderOption = screen.getByText("Select an option") as HTMLOptionElement;
      expect(placeholderOption).toBeDisabled();
      expect(placeholderOption.value).toBe("");
    });

    it("should include placeholder in option count", () => {
      render(
        <Select
          label="Choose"
          options={options}
          placeholder="Select..."
        />
      );

      const select = screen.getByLabelText("Choose");
      // 3 options + 1 placeholder
      expect(select.querySelectorAll("option")).toHaveLength(4);
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Select label="Choose" options={options} disabled />);
      const select = screen.getByLabelText("Choose");
      expect(select).toBeDisabled();
    });

    it("should not allow selection when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          label="Choose"
          options={options}
          disabled
          onChange={handleChange}
        />
      );

      const select = screen.getByLabelText("Choose");
      await user.selectOptions(select, "option2");

      expect(handleChange).not.toHaveBeenCalled();
    });

    it("should apply error styling when error prop is provided", () => {
      render(<Select label="Choose" options={options} error="Error" />);
      const select = screen.getByLabelText("Choose");
      expect(select).toHaveClass("border-red-500");
    });
  });

  describe("Accessibility", () => {
    it("should connect label to select with htmlFor", () => {
      render(<Select label="Test Label" options={options} id="test-select" />);
      const label = screen.getByText("Test Label");
      const select = screen.getByLabelText("Test Label");
      expect(label).toHaveAttribute("for", "test-select");
      expect(select).toHaveAttribute("id", "test-select");
    });

    it("should generate unique id when not provided", () => {
      const { container } = render(<Select label="Select 1" options={options} />);
      const select1 = container.querySelector("select");
      
      const { container: container2 } = render(<Select label="Select 2" options={options} />);
      const select2 = container2.querySelector("select");

      expect(select1?.id).toBeTruthy();
      expect(select2?.id).toBeTruthy();
      expect(select1?.id).not.toBe(select2?.id);
    });

    it("should support required attribute", () => {
      render(<Select label="Choose" options={options} required />);
      const select = screen.getByLabelText("Choose");
      expect(select).toHaveAttribute("required");
    });

    it("should support aria attributes", () => {
      render(
        <Select
          label="Choose"
          options={options}
          aria-describedby="description"
        />
      );
      const select = screen.getByLabelText("Choose");
      expect(select).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Options with different value types", () => {
    it("should handle numeric values", () => {
      const numericOptions = [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
        { value: 3, label: "Three" },
      ];

      render(<Select label="Number" options={numericOptions} />);
      const select = screen.getByLabelText("Number");
      const optionElements = select.querySelectorAll("option");
      
      expect(optionElements[0]).toHaveValue("1");
      expect(optionElements[1]).toHaveValue("2");
      expect(optionElements[2]).toHaveValue("3");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to select", () => {
      render(<Select label="Test" options={options} className="custom-class" />);
      const select = screen.getByLabelText("Test");
      expect(select).toHaveClass("custom-class");
    });

    it("should preserve default classes with custom className", () => {
      render(<Select label="Test" options={options} className="custom-class" />);
      const select = screen.getByLabelText("Test");
      expect(select).toHaveClass("custom-class");
      expect(select).toHaveClass("w-full");
      expect(select).toHaveClass("p-3");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to select element", () => {
      const ref = vi.fn();
      render(<Select label="Test" options={options} ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement));
    });
  });

  describe("Empty options", () => {
    it("should handle empty options array", () => {
      const { container } = render(<Select label="Empty" options={[]} />);
      const select = container.querySelector("select");
      expect(select?.querySelectorAll("option")).toHaveLength(0);
    });
  });
});
