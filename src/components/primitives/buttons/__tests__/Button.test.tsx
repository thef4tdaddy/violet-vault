import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";
import "@testing-library/jest-dom";

// Mock the icon utility
vi.mock("@/utils/ui/icons", () => ({
  getIcon: vi.fn((iconName: string) => {
    // Return a mock component for any icon
    const MockIcon = ({ size, className }: { size?: number; className?: string }) => (
      <svg
        data-testid={`icon-${iconName}`}
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <title>{iconName}</title>
      </svg>
    );
    MockIcon.displayName = `MockIcon-${iconName}`;
    return MockIcon;
  }),
}));

// Mock Loader2 from lucide-react
vi.mock("lucide-react", () => ({
  Loader2: ({ size, className }: { size?: number; className?: string }) => (
    <svg
      data-testid="loader-icon"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <title>Loading</title>
    </svg>
  ),
}));

describe("Button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("should render with primary variant", () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole("button", { name: /primary/i });
      expect(button).toHaveClass("bg-gradient-to-br", "from-purple-500", "to-purple-600");
    });

    it("should render with secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button", { name: /secondary/i });
      expect(button).toHaveClass("bg-slate-100", "text-slate-700");
    });

    it("should render with success variant", () => {
      render(<Button variant="success">Success</Button>);
      const button = screen.getByRole("button", { name: /success/i });
      expect(button).toHaveClass("bg-gradient-to-br", "from-emerald-500", "to-emerald-600");
    });

    it("should render with danger variant", () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole("button", { name: /danger/i });
      expect(button).toHaveClass("bg-gradient-to-br", "from-red-500", "to-red-600");
    });

    it("should render with ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button", { name: /ghost/i });
      expect(button).toHaveClass("bg-transparent", "border-transparent");
    });

    it("should render with link variant", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button", { name: /link/i });
      expect(button).toHaveClass("bg-transparent", "text-purple-600");
    });
  });

  describe("Sizes", () => {
    it("should render with small size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button", { name: /small/i });
      expect(button).toHaveClass("px-3", "py-1.5", "text-sm", "rounded-lg");
    });

    it("should render with medium size (default)", () => {
      render(<Button size="md">Medium</Button>);
      const button = screen.getByRole("button", { name: /medium/i });
      expect(button).toHaveClass("px-6", "py-3", "text-base", "rounded-xl");
    });

    it("should render with large size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button", { name: /large/i });
      expect(button).toHaveClass("px-8", "py-4", "text-lg", "rounded-2xl");
    });
  });

  describe("Icon Support", () => {
    it("should render icon on left by default", () => {
      render(<Button icon="Plus">Add</Button>);
      const icon = screen.getByTestId("icon-Plus");
      const button = screen.getByRole("button", { name: /add/i });

      expect(icon).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      // Icon should come before text in DOM
      const children = Array.from(button.childNodes);
      const iconIndex = children.findIndex(
        (node) => (node as HTMLElement).dataset?.testid === "icon-Plus"
      );
      const textNode = children.find((node) => node.textContent === "Add");
      const textIndex = children.indexOf(textNode as ChildNode);

      expect(iconIndex).toBeLessThan(textIndex);
    });

    it("should render icon on right when iconPosition is right", () => {
      render(
        <Button icon="Settings" iconPosition="right">
          Settings
        </Button>
      );
      const icon = screen.getByTestId("icon-Settings");
      const button = screen.getByRole("button", { name: /settings/i });

      expect(icon).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      // Icon should come after text in DOM
      const children = Array.from(button.childNodes);
      const iconIndex = children.findIndex(
        (node) => (node as HTMLElement).dataset?.testid === "icon-Settings"
      );
      const textNode = children.find((node) => node.textContent === "Settings");
      const textIndex = children.indexOf(textNode as ChildNode);

      expect(iconIndex).toBeGreaterThan(textIndex);
    });

    it("should render icon with correct size for sm button", () => {
      render(
        <Button icon="Plus" size="sm">
          Small
        </Button>
      );
      const icon = screen.getByTestId("icon-Plus");
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("should render icon with correct size for md button", () => {
      render(
        <Button icon="Plus" size="md">
          Medium
        </Button>
      );
      const icon = screen.getByTestId("icon-Plus");
      expect(icon).toHaveClass("h-5", "w-5");
    });

    it("should render icon with correct size for lg button", () => {
      render(
        <Button icon="Plus" size="lg">
          Large
        </Button>
      );
      const icon = screen.getByTestId("icon-Plus");
      expect(icon).toHaveClass("h-6", "w-6");
    });

    it("should apply gap class when both icon and children are present", () => {
      render(<Button icon="Plus">Add</Button>);
      const button = screen.getByRole("button", { name: /add/i });
      expect(button).toHaveClass("gap-2");
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading is true", () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByTestId("loader-icon");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide text when loading", () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole("button");
      // Text should not be visible
      expect(button.textContent).not.toContain("Submit");
    });

    it("should hide icon when loading", () => {
      render(
        <Button loading icon="Plus">
          Add
        </Button>
      );
      const icon = screen.queryByTestId("icon-Plus");
      expect(icon).not.toBeInTheDocument();
    });

    it("should disable button when loading", () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should show spinner with correct size for sm button", () => {
      render(
        <Button loading size="sm">
          Loading
        </Button>
      );
      const spinner = screen.getByTestId("loader-icon");
      expect(spinner).toHaveClass("h-4", "w-4");
    });

    it("should show spinner with correct size for md button", () => {
      render(
        <Button loading size="md">
          Loading
        </Button>
      );
      const spinner = screen.getByTestId("loader-icon");
      expect(spinner).toHaveClass("h-5", "w-5");
    });

    it("should show spinner with correct size for lg button", () => {
      render(
        <Button loading size="lg">
          Loading
        </Button>
      );
      const spinner = screen.getByTestId("loader-icon");
      expect(spinner).toHaveClass("h-6", "w-6");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should apply opacity class when disabled", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:opacity-60");
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );
      const button = screen.getByRole("button");
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Full Width", () => {
    it("should apply full width class when fullWidth is true", () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });

    it("should not apply full width class by default", () => {
      render(<Button>Not Full Width</Button>);
      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("w-full");
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );
      const button = screen.getByRole("button");
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Click me
        </Button>
      );
      const button = screen.getByRole("button");
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Ref Forwarding", () => {
    it("should forward ref correctly", () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Additional Props", () => {
    it("should spread additional props to button element", () => {
      render(
        <Button data-testid="custom-button" aria-label="Custom Button">
          Button
        </Button>
      );
      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("aria-label", "Custom Button");
    });

    it("should apply custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should merge custom className with default classes", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("inline-flex");
      expect(button).toHaveClass("items-center");
    });
  });
});
