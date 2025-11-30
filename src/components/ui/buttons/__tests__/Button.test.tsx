import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Button from "../Button";

describe("Button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render button with children text", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: "Click Me" })).toBeInTheDocument();
    });

    it("should render button without children (icon only)", () => {
      render(<Button icon={<span data-testid="icon">🔥</span>} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("should forward ref to button element", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("should render primary variant by default", () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("should render destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-600");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("should render icon variant", () => {
      render(<Button variant="icon">Icon</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("p-3");
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border-gray-300");
    });
  });

  describe("Colors", () => {
    it("should apply red color", () => {
      render(<Button color="red">Red</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-500");
    });

    it("should apply purple color", () => {
      render(<Button color="purple">Purple</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-purple-600");
    });

    it("should apply green color", () => {
      render(<Button color="green">Green</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-green-600");
    });

    it("should apply gradient color", () => {
      render(<Button color="gradient">Gradient</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gradient-to-r");
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-3", "py-2");
    });

    it("should apply medium size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-2");
    });

    it("should apply large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-6", "py-3");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should hide icon when loading", () => {
      render(
        <Button loading icon={<span data-testid="icon">🔥</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    });

    it("should not be disabled when not loading", () => {
      render(<Button>Not Loading</Button>);
      expect(screen.getByRole("button")).not.toBeDisabled();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should apply disabled styles", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:opacity-50", "disabled:cursor-not-allowed");
    });

    it("should not trigger onClick when disabled", async () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Full Width", () => {
    it("should apply full width class when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);
      expect(screen.getByRole("button")).toHaveClass("w-full");
    });

    it("should not apply full width by default", () => {
      render(<Button>Normal Width</Button>);
      expect(screen.getByRole("button")).not.toHaveClass("w-full");
    });
  });

  describe("Floating Button", () => {
    it("should apply floating styles when floating is true", () => {
      render(<Button floating>Float</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-full", "shadow-lg", "fixed");
    });

    it("should not apply size classes when floating", () => {
      render(
        <Button floating size="sm">
          Float
        </Button>
      );
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("px-3");
    });
  });

  describe("Icon Support", () => {
    it("should render icon alongside children", () => {
      render(<Button icon={<span data-testid="icon">🔥</span>}>With Icon</Button>);
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("With Icon")).toBeInTheDocument();
    });
  });

  describe("Click Handling", () => {
    it("should call onClick handler when clicked", async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Custom className", () => {
    it("should merge custom className with generated classes", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("font-semibold"); // Base class still present
    });
  });

  describe("HTML Attributes", () => {
    it("should pass through HTML attributes", () => {
      render(
        <Button type="submit" data-testid="submit-btn">
          Submit
        </Button>
      );
      const button = screen.getByTestId("submit-btn");
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("DisplayName", () => {
    it("should have correct display name", () => {
      expect(Button.displayName).toBe("Button");
    });
  });
});
