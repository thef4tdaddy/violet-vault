import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import Button from "../Button";

describe("Button", () => {
  describe("Rendering", () => {
    it("should render with children", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      const icon = <span data-testid="test-icon">🔍</span>;
      render(<Button icon={icon}>Search</Button>);
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    it("should render icon without children", () => {
      const icon = <span data-testid="test-icon">✓</span>;
      render(<Button icon={icon} />);
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render primary variant", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText("Primary");
      expect(button).toHaveClass("bg-blue-500");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByText("Secondary");
      expect(button).toHaveClass("bg-gray-200");
    });

    it("should render destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByText("Delete");
      expect(button).toHaveClass("bg-red-600");
    });

    it("should render icon variant", () => {
      const icon = <span data-testid="icon">✓</span>;
      render(<Button variant="icon" icon={icon} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-transparent");
    });

    it("should render ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByText("Ghost");
      expect(button).toHaveClass("bg-transparent");
    });

    it("should render outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByText("Outline");
      expect(button).toHaveClass("border-2");
    });
  });

  describe("Colors", () => {
    it("should render with red color", () => {
      render(<Button variant="primary" color="red">Red Button</Button>);
      const button = screen.getByText("Red Button");
      expect(button).toHaveClass("bg-red-500");
    });

    it("should render with orange color", () => {
      render(<Button variant="primary" color="orange">Orange Button</Button>);
      const button = screen.getByText("Orange Button");
      expect(button).toHaveClass("bg-orange-500");
    });

    it("should render with purple color", () => {
      render(<Button variant="primary" color="purple">Purple Button</Button>);
      const button = screen.getByText("Purple Button");
      expect(button).toHaveClass("bg-purple-600");
    });

    it("should render with green color", () => {
      render(<Button variant="primary" color="green">Green Button</Button>);
      const button = screen.getByText("Green Button");
      expect(button).toHaveClass("bg-green-600");
    });

    it("should render with gradient color", () => {
      render(<Button variant="primary" color="gradient">Gradient Button</Button>);
      const button = screen.getByText("Gradient Button");
      expect(button).toHaveClass("bg-gradient-to-r");
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByText("Small");
      expect(button).toHaveClass("px-3");
      expect(button).toHaveClass("py-2");
      expect(button).toHaveClass("text-sm");
    });

    it("should render medium size by default", () => {
      render(<Button>Medium</Button>);
      const button = screen.getByText("Medium");
      expect(button).toHaveClass("px-4");
      expect(button).toHaveClass("py-2");
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByText("Large");
      expect(button).toHaveClass("px-6");
      expect(button).toHaveClass("py-3");
      expect(button).toHaveClass("text-base");
    });
  });

  describe("Click Handling", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByText("Click me");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not trigger click when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick} disabled>Disabled</Button>);

      const button = screen.getByText("Disabled");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText("Disabled");
      expect(button).toBeDisabled();
    });

    it("should apply disabled styles", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByText("Disabled");
      expect(button).toHaveClass("disabled:opacity-50");
      expect(button).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      const { container } = render(<Button loading>Loading</Button>);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide icon when loading", () => {
      const icon = <span data-testid="test-icon">🔍</span>;
      render(<Button loading icon={icon}>Loading</Button>);
      expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
    });

    it("should be disabled when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByText("Loading");
      expect(button).toBeDisabled();
    });

    it("should not trigger click when loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button loading onClick={handleClick}>Loading</Button>);

      const button = screen.getByText("Loading");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Full Width", () => {
    it("should render full width when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByText("Full Width");
      expect(button).toHaveClass("w-full");
    });

    it("should not be full width by default", () => {
      render(<Button>Normal</Button>);
      const button = screen.getByText("Normal");
      expect(button).not.toHaveClass("w-full");
    });
  });

  describe("Floating", () => {
    it("should render as floating button", () => {
      const icon = <span data-testid="icon">+</span>;
      render(<Button floating icon={icon} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("rounded-full");
      expect(button).toHaveClass("fixed");
      expect(button).toHaveClass("shadow-lg");
    });

    it("should not apply size classes to floating button", () => {
      const icon = <span data-testid="icon">+</span>;
      render(<Button floating icon={icon} size="lg" />);
      const button = screen.getByRole("button");
      // Floating buttons have p-3, not px-6 py-3
      expect(button).not.toHaveClass("px-6");
    });
  });

  describe("Accessibility", () => {
    it("should support type attribute", () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByText("Submit");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should support aria attributes", () => {
      render(
        <Button aria-label="Close dialog" aria-pressed="true">
          X
        </Button>
      );
      const button = screen.getByText("X");
      expect(button).toHaveAttribute("aria-label", "Close dialog");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should have button role", () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Custom className", () => {
    it("should apply custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByText("Custom");
      expect(button).toHaveClass("custom-class");
    });

    it("should preserve base classes with custom className", () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByText("Custom");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("font-semibold");
      expect(button).toHaveClass("transition-all");
    });
  });

  describe("Ref forwarding", () => {
    it("should forward ref to button element", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Test</Button>);
      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe("Standard HTML button attributes", () => {
    it("should support form attribute", () => {
      render(<Button form="my-form">Submit</Button>);
      const button = screen.getByText("Submit");
      expect(button).toHaveAttribute("form", "my-form");
    });

    it("should support name attribute", () => {
      render(<Button name="action">Action</Button>);
      const button = screen.getByText("Action");
      expect(button).toHaveAttribute("name", "action");
    });

    it("should support value attribute", () => {
      render(<Button value="submit">Submit</Button>);
      const button = screen.getByText("Submit");
      expect(button).toHaveAttribute("value", "submit");
    });
  });
});
