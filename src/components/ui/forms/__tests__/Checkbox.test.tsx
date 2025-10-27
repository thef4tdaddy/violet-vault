import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Checkbox from "../Checkbox";

describe("Checkbox", () => {
  describe("Rendering", () => {
    it("should render checkbox without label", () => {
      const { container } = render(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("should render with helper text", () => {
      render(
        <Checkbox
          label="Subscribe"
          helperText="You can unsubscribe anytime"
        />
      );
      expect(screen.getByText("You can unsubscribe anytime")).toBeInTheDocument();
    });

    it("should render with error message", () => {
      render(
        <Checkbox
          label="Accept terms"
          error="You must accept the terms"
        />
      );
      expect(screen.getByText("You must accept the terms")).toBeInTheDocument();
    });

    it("should not show helper text when error is present", () => {
      render(
        <Checkbox
          label="Accept terms"
          helperText="Please read carefully"
          error="Required field"
        />
      );
      expect(screen.getByText("Required field")).toBeInTheDocument();
      expect(screen.queryByText("Please read carefully")).not.toBeInTheDocument();
    });
  });

  describe("Toggle Behavior", () => {
    it("should toggle when clicked", async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Test Checkbox" />);

      const checkbox = screen.getByLabelText("Test Checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);

      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it("should toggle when label is clicked", async () => {
      const user = userEvent.setup();
      render(<Checkbox label="Test Checkbox" />);

      const checkbox = screen.getByLabelText("Test Checkbox") as HTMLInputElement;
      const label = screen.getByText("Test Checkbox");
      
      expect(checkbox.checked).toBe(false);
      await user.click(label);
      expect(checkbox.checked).toBe(true);
    });

    it("should call onChange handler with event", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox label="Test" onChange={handleChange} />);

      const checkbox = screen.getByLabelText("Test");
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
      expect(handleChange.mock.calls[0][0].target.checked).toBe(true);
    });

    it("should call onCheckedChange handler with boolean", async () => {
      const user = userEvent.setup();
      const handleCheckedChange = vi.fn();

      render(<Checkbox label="Test" onCheckedChange={handleCheckedChange} />);

      const checkbox = screen.getByLabelText("Test");
      await user.click(checkbox);

      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);

      await user.click(checkbox);
      expect(handleCheckedChange).toHaveBeenCalledTimes(2);
      expect(handleCheckedChange).toHaveBeenCalledWith(false);
    });

    it("should call both onChange and onCheckedChange", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleCheckedChange = vi.fn();

      render(
        <Checkbox
          label="Test"
          onChange={handleChange}
          onCheckedChange={handleCheckedChange}
        />
      );

      const checkbox = screen.getByLabelText("Test");
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("Controlled Component", () => {
    it("should work as controlled component", () => {
      const { rerender } = render(
        <Checkbox label="Test" checked={false} onChange={vi.fn()} />
      );

      const checkbox = screen.getByLabelText("Test") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      rerender(<Checkbox label="Test" checked={true} onChange={vi.fn()} />);
      expect(checkbox.checked).toBe(true);
    });

    it("should support defaultChecked for uncontrolled mode", () => {
      render(<Checkbox label="Test" defaultChecked={true} />);
      const checkbox = screen.getByLabelText("Test") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Checkbox label="Test" disabled />);
      const checkbox = screen.getByLabelText("Test");
      expect(checkbox).toBeDisabled();
    });

    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Checkbox label="Test" disabled onChange={handleChange} />);

      const checkbox = screen.getByLabelText("Test") as HTMLInputElement;
      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox.checked).toBe(false);
    });
  });

  describe("Accessibility", () => {
    it("should connect label to checkbox with htmlFor", () => {
      render(<Checkbox label="Test Label" id="test-checkbox" />);
      const label = screen.getByText("Test Label");
      const checkbox = screen.getByLabelText("Test Label");
      expect(label).toHaveAttribute("for", "test-checkbox");
      expect(checkbox).toHaveAttribute("id", "test-checkbox");
    });

    it("should generate unique id when not provided", () => {
      const { container } = render(<Checkbox label="Checkbox 1" />);
      const checkbox1 = container.querySelector("input");
      
      const { container: container2 } = render(<Checkbox label="Checkbox 2" />);
      const checkbox2 = container2.querySelector("input");

      expect(checkbox1?.id).toBeTruthy();
      expect(checkbox2?.id).toBeTruthy();
      expect(checkbox1?.id).not.toBe(checkbox2?.id);
    });

    it("should support required attribute", () => {
      render(<Checkbox label="Test" required />);
      const checkbox = screen.getByLabelText("Test");
      expect(checkbox).toHaveAttribute("required");
    });

    it("should support aria attributes", () => {
      render(
        <Checkbox
          label="Test"
          aria-label="Custom label"
          aria-describedby="description"
        />
      );
      const checkbox = screen.getByLabelText("Test");
      expect(checkbox).toHaveAttribute("aria-label", "Custom label");
      expect(checkbox).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to checkbox", () => {
      render(<Checkbox label="Test" className="custom-class" />);
      const checkbox = screen.getByLabelText("Test");
      expect(checkbox).toHaveClass("custom-class");
    });

    it("should preserve default classes with custom className", () => {
      render(<Checkbox label="Test" className="custom-class" />);
      const checkbox = screen.getByLabelText("Test");
      expect(checkbox).toHaveClass("custom-class");
      expect(checkbox).toHaveClass("w-4");
      expect(checkbox).toHaveClass("h-4");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to checkbox element", () => {
      const ref = vi.fn();
      render(<Checkbox label="Test" ref={ref} />);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
    });
  });
});
