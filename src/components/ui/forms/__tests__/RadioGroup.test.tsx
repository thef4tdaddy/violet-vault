import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import RadioGroup from "../RadioGroup";

describe("RadioGroup", () => {
  const basicOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  const optionsWithDescriptions = [
    { value: "option1", label: "Option 1", description: "Description for option 1" },
    { value: "option2", label: "Option 2", description: "Description for option 2" },
  ];

  describe("Rendering", () => {
    it("should render all radio options", () => {
      render(<RadioGroup name="test" options={basicOptions} />);
      
      expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Option 3")).toBeInTheDocument();
    });

    it("should render with group label", () => {
      render(<RadioGroup name="test" options={basicOptions} label="Choose an option" />);
      expect(screen.getByText("Choose an option")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          helperText="Select one option"
        />
      );
      expect(screen.getByText("Select one option")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          error="Please select an option"
        />
      );
      expect(screen.getByText("Please select an option")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });

    it("should render options with descriptions", () => {
      render(<RadioGroup name="test" options={optionsWithDescriptions} />);
      
      expect(screen.getByText("Description for option 1")).toBeInTheDocument();
      expect(screen.getByText("Description for option 2")).toBeInTheDocument();
    });
  });

  describe("Selection Management", () => {
    it("should handle option selection", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          onChange={handleChange}
        />
      );

      const option2 = screen.getByLabelText("Option 2");
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith("option2");
    });

    it("should show selected value", () => {
      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          value="option2"
          onChange={vi.fn()}
        />
      );

      const option1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      const option2 = screen.getByLabelText("Option 2") as HTMLInputElement;
      const option3 = screen.getByLabelText("Option 3") as HTMLInputElement;

      expect(option1.checked).toBe(false);
      expect(option2.checked).toBe(true);
      expect(option3.checked).toBe(false);
    });

    it("should update selection when value prop changes", () => {
      const { rerender } = render(
        <RadioGroup
          name="test"
          options={basicOptions}
          value="option1"
          onChange={vi.fn()}
        />
      );

      let option1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      expect(option1.checked).toBe(true);

      rerender(
        <RadioGroup
          name="test"
          options={basicOptions}
          value="option3"
          onChange={vi.fn()}
        />
      );

      option1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      const option3 = screen.getByLabelText("Option 3") as HTMLInputElement;
      expect(option1.checked).toBe(false);
      expect(option3.checked).toBe(true);
    });

    it("should allow only one selection at a time", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      // Use controlled component to properly test radio behavior
      const { rerender } = render(
        <RadioGroup
          name="test"
          options={basicOptions}
          value="option1"
          onChange={handleChange}
        />
      );

      let option1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      let option2 = screen.getByLabelText("Option 2") as HTMLInputElement;

      expect(option1.checked).toBe(true);
      expect(option2.checked).toBe(false);

      await user.click(option2);
      expect(handleChange).toHaveBeenCalledWith("option2");

      // Update to option2 selected
      rerender(
        <RadioGroup
          name="test"
          options={basicOptions}
          value="option2"
          onChange={handleChange}
        />
      );

      option1 = screen.getByLabelText("Option 1") as HTMLInputElement;
      option2 = screen.getByLabelText("Option 2") as HTMLInputElement;
      expect(option1.checked).toBe(false);
      expect(option2.checked).toBe(true);
    });
  });

  describe("Disabled State", () => {
    it("should disable all options when group is disabled", () => {
      render(
        <RadioGroup
          name="test"
          options={basicOptions}
          disabled
        />
      );

      const option1 = screen.getByLabelText("Option 1");
      const option2 = screen.getByLabelText("Option 2");
      const option3 = screen.getByLabelText("Option 3");

      expect(option1).toBeDisabled();
      expect(option2).toBeDisabled();
      expect(option3).toBeDisabled();
    });

    it("should disable individual options", () => {
      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
        { value: "option3", label: "Option 3" },
      ];

      render(<RadioGroup name="test" options={optionsWithDisabled} />);

      const option1 = screen.getByLabelText("Option 1");
      const option2 = screen.getByLabelText("Option 2");
      const option3 = screen.getByLabelText("Option 3");

      expect(option1).not.toBeDisabled();
      expect(option2).toBeDisabled();
      expect(option3).not.toBeDisabled();
    });

    it("should not call onChange for disabled options", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const optionsWithDisabled = [
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2", disabled: true },
      ];

      render(
        <RadioGroup
          name="test"
          options={optionsWithDisabled}
          onChange={handleChange}
        />
      );

      const option2 = screen.getByLabelText("Option 2");
      await user.click(option2);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Layout", () => {
    it("should render in vertical layout by default", () => {
      const { container } = render(
        <RadioGroup name="test" options={basicOptions} />
      );
      
      // Vertical layout uses space-y-3 class
      const radioContainer = container.querySelector('.space-y-3');
      expect(radioContainer).toBeInTheDocument();
    });

    it("should render in horizontal layout when specified", () => {
      const { container } = render(
        <RadioGroup name="test" options={basicOptions} direction="horizontal" />
      );
      
      // Horizontal layout uses flex
      const radioContainer = container.querySelector('.flex');
      expect(radioContainer).toBeInTheDocument();
    });

    it("should use grid layout for options with descriptions", () => {
      const { container } = render(
        <RadioGroup name="test" options={optionsWithDescriptions} />
      );
      
      // Grid layout for descriptions
      const gridLayouts = container.querySelectorAll('.grid');
      expect(gridLayouts.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should group radios with same name", () => {
      render(<RadioGroup name="test-group" options={basicOptions} />);

      const option1 = screen.getByLabelText("Option 1");
      const option2 = screen.getByLabelText("Option 2");
      const option3 = screen.getByLabelText("Option 3");

      expect(option1).toHaveAttribute("name", "test-group");
      expect(option2).toHaveAttribute("name", "test-group");
      expect(option3).toHaveAttribute("name", "test-group");
    });

    it("should generate unique name when not provided", () => {
      const { container } = render(<RadioGroup options={basicOptions} />);
      const radios = container.querySelectorAll('input[type="radio"]');
      
      const names = Array.from(radios).map(radio => radio.getAttribute("name"));
      expect(names.every(name => name === names[0])).toBe(true);
    });

    it("should connect labels to radios", () => {
      render(<RadioGroup name="test" options={basicOptions} />);

      basicOptions.forEach(option => {
        const label = screen.getByText(option.label);
        const radio = screen.getByLabelText(option.label);
        expect(label).toHaveAttribute("for", radio.id);
      });
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to group container", () => {
      const { container } = render(
        <RadioGroup
          name="test"
          options={basicOptions}
          className="custom-class"
        />
      );
      
      const groupContainer = container.firstChild;
      expect(groupContainer).toHaveClass("custom-class");
    });

    it("should apply custom className to items", () => {
      const { container } = render(
        <RadioGroup
          name="test"
          options={basicOptions}
          itemClassName="item-custom-class"
        />
      );
      
      const items = container.querySelectorAll(".item-custom-class");
      expect(items.length).toBe(basicOptions.length);
    });
  });

  describe("Empty options", () => {
    it("should handle empty options array", () => {
      const { container } = render(<RadioGroup name="test" options={[]} />);
      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios.length).toBe(0);
    });
  });
});
