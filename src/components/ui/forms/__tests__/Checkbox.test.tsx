import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Checkbox from "../Checkbox";

describe("Checkbox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render checkbox element", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
      expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
    });

    it("should forward ref to checkbox element", () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Label", () => {
    it("should associate label with checkbox using generated id", () => {
      render(<Checkbox label="Remember me" />);
      const label = screen.getByText("Remember me");
      const checkbox = screen.getByRole("checkbox");
      expect(label).toHaveAttribute("for", checkbox.id);
    });

    it("should use custom id when provided", () => {
      render(<Checkbox label="Custom" id="custom-id" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Checked State", () => {
    it("should be unchecked by default", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should be checked when checked prop is true", () => {
      render(<Checkbox checked onChange={() => {}} />);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should toggle when clicked", async () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(checkbox).toBeChecked();
    });
  });

  describe("onChange Handlers", () => {
    it("should call onChange with event", async () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      await userEvent.click(screen.getByRole("checkbox"));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange.mock.calls[0][0].target.checked).toBe(true);
    });

    it("should call onCheckedChange with boolean value", async () => {
      const handleCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={handleCheckedChange} />);

      await userEvent.click(screen.getByRole("checkbox"));

      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should call both handlers when both provided", async () => {
      const handleChange = vi.fn();
      const handleCheckedChange = vi.fn();
      render(<Checkbox onChange={handleChange} onCheckedChange={handleCheckedChange} />);

      await userEvent.click(screen.getByRole("checkbox"));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleCheckedChange).toHaveBeenCalledWith(true);
    });
  });

  describe("Error State", () => {
    it("should display error message when error prop is provided", () => {
      render(<Checkbox error="You must accept" />);
      expect(screen.getByText("You must accept")).toBeInTheDocument();
    });

    it("should not display helper text when error is present", () => {
      render(<Checkbox error="Error" helperText="Helper text" />);
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });
  });

  describe("Helper Text", () => {
    it("should display helper text when provided", () => {
      render(<Checkbox helperText="Optional selection" />);
      expect(screen.getByText("Optional selection")).toBeInTheDocument();
    });

    it("should not display helper text when error is present", () => {
      render(<Checkbox helperText="Helper" error="Error message" />);
      expect(screen.queryByText("Helper")).not.toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole("checkbox")).toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
    });

    it("should not toggle when disabled", async () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled onChange={handleChange} />);

      await userEvent.click(screen.getByRole("checkbox"));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      render(<Checkbox className="custom-class" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("custom-class");
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(<Checkbox name="terms" data-testid="terms-checkbox" />);
      const checkbox = screen.getByTestId("terms-checkbox");
      expect(checkbox).toHaveAttribute("name", "terms");
    });

    it("should handle required attribute", () => {
      render(<Checkbox required />);
      expect(screen.getByRole("checkbox")).toBeRequired();
    });

    it("should handle value attribute", () => {
      render(<Checkbox value="accepted" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("value", "accepted");
    });
  });

  describe("Styling", () => {
    it("should have focus ring styles", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("focus:ring");
    });

    it("should have cursor pointer when enabled", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("cursor-pointer");
    });
  });

  describe("DisplayName", () => {
    it("should have correct display name", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });
  });

  describe("Label Interaction", () => {
    it("should toggle checkbox when clicking label", async () => {
      render(<Checkbox label="Click me" />);

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });
});
