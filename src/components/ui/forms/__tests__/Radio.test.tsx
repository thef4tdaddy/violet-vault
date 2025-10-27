import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Radio from "../Radio";

describe("Radio", () => {
  describe("Rendering", () => {
    it("should render radio button without label", () => {
      const { container } = render(<Radio name="test" value="option1" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Radio name="test" value="option1" label="Option 1" />);
      expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          helperText="Additional information"
        />
      );
      expect(screen.getByText("Additional information")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          error="This option is not available"
        />
      );
      expect(screen.getByText("This option is not available")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          helperText="Helper text"
          error="Error message"
        />
      );
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
    });

    it("should render with description in grid layout", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          description="This is a description"
        />
      );
      expect(screen.getByText("This is a description")).toBeInTheDocument();
    });
  });

  describe("Selection Behavior", () => {
    it("should handle radio selection", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          onChange={handleChange}
        />
      );

      const radio = screen.getByLabelText("Option 1");
      await user.click(radio);

      expect(handleChange).toHaveBeenCalled();
    });

    it("should work with label click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          onChange={handleChange}
        />
      );

      const label = screen.getByText("Option 1");
      await user.click(label);

      expect(handleChange).toHaveBeenCalled();
    });

    it("should be controlled with checked prop", () => {
      const { rerender } = render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          checked={false}
          onChange={vi.fn()}
        />
      );

      const radio = screen.getByLabelText("Option 1") as HTMLInputElement;
      expect(radio.checked).toBe(false);

      rerender(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          checked={true}
          onChange={vi.fn()}
        />
      );
      expect(radio.checked).toBe(true);
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(
        <Radio name="test" value="option1" label="Option 1" disabled />
      );
      const radio = screen.getByLabelText("Option 1");
      expect(radio).toBeDisabled();
    });

    it("should not handle selection when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          disabled
          onChange={handleChange}
        />
      );

      const radio = screen.getByLabelText("Option 1");
      await user.click(radio);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should connect label to radio with htmlFor", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Test Label"
          id="test-radio"
        />
      );
      const label = screen.getByText("Test Label");
      const radio = screen.getByLabelText("Test Label");
      expect(label).toHaveAttribute("for", "test-radio");
      expect(radio).toHaveAttribute("id", "test-radio");
    });

    it("should generate unique id when not provided", () => {
      const { container } = render(<Radio name="test" value="option1" label="Radio 1" />);
      const radio1 = container.querySelector("input");
      
      const { container: container2 } = render(<Radio name="test" value="option2" label="Radio 2" />);
      const radio2 = container2.querySelector("input");

      expect(radio1?.id).toBeTruthy();
      expect(radio2?.id).toBeTruthy();
      expect(radio1?.id).not.toBe(radio2?.id);
    });

    it("should support name attribute for grouping", () => {
      render(
        <div>
          <Radio name="group1" value="option1" label="Option 1" />
          <Radio name="group1" value="option2" label="Option 2" />
        </div>
      );

      const radio1 = screen.getByLabelText("Option 1");
      const radio2 = screen.getByLabelText("Option 2");

      expect(radio1).toHaveAttribute("name", "group1");
      expect(radio2).toHaveAttribute("name", "group1");
    });

    it("should support aria attributes", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          aria-describedby="description"
        />
      );
      const radio = screen.getByLabelText("Option 1");
      expect(radio).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to radio", () => {
      render(
        <Radio
          name="test"
          value="option1"
          label="Option 1"
          className="custom-class"
        />
      );
      const radio = screen.getByLabelText("Option 1");
      expect(radio).toHaveClass("custom-class");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to radio element", () => {
      const ref = vi.fn();
      render(<Radio name="test" value="option1" label="Option 1" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });
});
