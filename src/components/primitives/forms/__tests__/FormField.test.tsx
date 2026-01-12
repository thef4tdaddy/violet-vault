import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FormField } from "../FormField";
import "@testing-library/jest-dom";

describe("FormField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render label", () => {
      render(
        <FormField label="Email Address">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <FormField label="Test">
          <input data-testid="test-input" type="text" />
        </FormField>
      );
      expect(screen.getByTestId("test-input")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(
        <FormField label="Test" className="custom-class">
          <input type="text" />
        </FormField>
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Required Indicator", () => {
    it("should show required indicator when required is true", () => {
      render(
        <FormField label="Email" required>
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText("Email").parentElement;
      expect(label?.textContent).toContain("*");
    });

    it("should not show required indicator when required is false", () => {
      render(
        <FormField label="Email" required={false}>
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText("Email").parentElement;
      expect(label?.textContent).not.toContain("*");
    });

    it("should not show required indicator by default", () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText("Email").parentElement;
      expect(label?.textContent).not.toContain("*");
    });

    it("should style required indicator with red color", () => {
      render(
        <FormField label="Email" required>
          <input type="email" />
        </FormField>
      );
      const asterisk = screen.getByText("*");
      expect(asterisk).toHaveClass("text-red-500");
    });
  });

  describe("Hint Text", () => {
    it("should display hint text when provided", () => {
      render(
        <FormField label="Email" hint="We'll never share your email">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText("We'll never share your email")).toBeInTheDocument();
    });

    it("should not display hint text when not provided", () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>
      );
      expect(screen.queryByText(/never share/i)).not.toBeInTheDocument();
    });

    it("should style hint text correctly", () => {
      render(
        <FormField label="Email" hint="Hint text">
          <input type="email" />
        </FormField>
      );
      const hint = screen.getByText("Hint text");
      expect(hint).toHaveClass("text-xs", "text-slate-500", "mb-2");
    });
  });

  describe("Error Message", () => {
    it("should display error message when provided", () => {
      render(
        <FormField label="Email" error="This field is required">
          <input type="email" />
        </FormField>
      );
      expect(screen.getByText("This field is required")).toBeInTheDocument();
    });

    it("should not display error message when not provided", () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>
      );
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });

    it("should display error icon with error message", () => {
      const { container } = render(
        <FormField label="Email" error="Error message">
          <input type="email" />
        </FormField>
      );
      // Check for AlertCircle icon (lucide-react renders as svg)
      const errorContainer = screen.getByText("Error message").parentElement;
      const svg = errorContainer?.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should style error message correctly", () => {
      render(
        <FormField label="Email" error="Error message">
          <input type="email" />
        </FormField>
      );
      const error = screen.getByText("Error message").parentElement;
      expect(error).toHaveClass("text-xs", "text-red-600", "mt-1", "flex", "items-center", "gap-1");
    });
  });

  describe("Label Association", () => {
    it("should associate label with input using htmlFor", () => {
      render(
        <FormField label="Email" htmlFor="email-input">
          <input id="email-input" type="email" />
        </FormField>
      );
      const label = screen.getByText("Email");
      expect(label).toHaveAttribute("for", "email-input");
    });

    it("should not set for attribute when htmlFor is not provided", () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText("Email");
      expect(label).not.toHaveAttribute("for");
    });
  });

  describe("Layout and Styling", () => {
    it("should apply label styling", () => {
      render(
        <FormField label="Email">
          <input type="email" />
        </FormField>
      );
      const label = screen.getByText("Email");
      expect(label).toHaveClass("block", "text-sm", "font-medium", "text-slate-700", "mb-1");
    });

    it("should render all elements in correct order", () => {
      const { container } = render(
        <FormField label="Email" hint="Hint" error="Error" required>
          <input type="email" />
        </FormField>
      );
      const elements = Array.from(container.querySelectorAll("label, p, input"));
      expect(elements[0].tagName).toBe("LABEL"); // Label first
      expect(elements[1].tagName).toBe("P"); // Hint second
      expect(elements[2].tagName).toBe("INPUT"); // Input third
      expect(elements[3].tagName).toBe("P"); // Error last
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle all props together", () => {
      render(
        <FormField
          label="Email Address"
          hint="Enter your email"
          error="Invalid email"
          required
          htmlFor="email"
          className="custom-field"
        >
          <input id="email" type="email" />
        </FormField>
      );

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("Enter your email")).toBeInTheDocument();
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should render with complex children", () => {
      render(
        <FormField label="Custom">
          <div>
            <input type="text" data-testid="input-1" />
            <input type="text" data-testid="input-2" />
          </div>
        </FormField>
      );
      expect(screen.getByTestId("input-1")).toBeInTheDocument();
      expect(screen.getByTestId("input-2")).toBeInTheDocument();
    });
  });
});
