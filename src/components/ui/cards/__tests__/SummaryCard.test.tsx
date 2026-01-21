import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import SummaryCard from "../SummaryCard";

// Mock icon component
const MockIcon = ({ className }: { className?: string }) => (
  <svg data-testid="mock-icon" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe("SummaryCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with label and value", () => {
      render(<SummaryCard label="Total Transactions" value={425} />);
      expect(screen.getByText("Total Transactions")).toBeInTheDocument();
      expect(screen.getByText("425")).toBeInTheDocument();
    });

    it("should render with string value", () => {
      render(<SummaryCard label="Status" value="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(<SummaryCard icon={MockIcon} label="Budget" value="$100" />);
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });
  });

  describe("Subtext", () => {
    it("should render subtext when provided", () => {
      render(<SummaryCard label="Budget" value="$500" subtext="Updated today" />);
      expect(screen.getByText("Updated today")).toBeInTheDocument();
    });

    it("should not render subtext when not provided", () => {
      render(<SummaryCard label="Budget" value="$500" />);
      expect(screen.queryByText("Updated today")).not.toBeInTheDocument();
    });
  });

  describe("Colors", () => {
    it("should apply blue gradient by default", () => {
      const { container } = render(<SummaryCard label="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("from-blue-500", "to-blue-600");
    });

    it("should apply purple gradient", () => {
      const { container } = render(<SummaryCard label="Test" value="100" color="purple" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("from-purple-500", "to-purple-600");
    });

    it("should apply green gradient", () => {
      const { container } = render(<SummaryCard label="Test" value="100" color="green" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("from-green-500", "to-green-600");
    });

    it("should apply red gradient", () => {
      const { container } = render(<SummaryCard label="Test" value="100" color="red" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("from-red-500", "to-red-600");
    });

    it("should support all color variants", () => {
      const colors = [
        "red",
        "orange",
        "amber",
        "yellow",
        "green",
        "emerald",
        "teal",
        "cyan",
        "blue",
        "indigo",
        "purple",
        "pink",
        "gray",
      ] as const;

      colors.forEach((color) => {
        const { container } = render(<SummaryCard label="Test" value="100" color={color} />);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass(`from-${color}-500`, `to-${color}-600`);
      });
    });
  });

  describe("onClick Interactivity", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn();
      render(<SummaryCard label="Clickable" value="100" onClick={handleClick} />);

      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should have button role when clickable", () => {
      render(<SummaryCard label="Clickable" value="100" onClick={() => {}} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should not have button role when not clickable", () => {
      render(<SummaryCard label="Static" value="100" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should have cursor-pointer class when clickable", () => {
      const { container } = render(
        <SummaryCard label="Clickable" value="100" onClick={() => {}} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should not have cursor-pointer class when not clickable", () => {
      const { container } = render(<SummaryCard label="Static" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should be focusable when clickable", () => {
      render(<SummaryCard label="Focusable" value="100" onClick={() => {}} />);
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should not be focusable when not clickable", () => {
      const { container } = render(<SummaryCard label="Static" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("should trigger onClick on Enter key", async () => {
      const handleClick = vi.fn();
      render(<SummaryCard label="Keyboard" value="100" onClick={handleClick} />);

      const card = screen.getByRole("button");
      card.focus();
      await userEvent.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should trigger onClick on Space key", async () => {
      const handleClick = vi.fn();
      render(<SummaryCard label="Keyboard" value="100" onClick={handleClick} />);

      const card = screen.getByRole("button");
      card.focus();
      await userEvent.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Alert State", () => {
    it("should apply alert ring when alert is true", () => {
      const { container } = render(<SummaryCard label="Alert" value="!" alert />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("ring-2", "ring-white", "ring-opacity-50");
    });

    it("should not apply alert ring by default", () => {
      const { container } = render(<SummaryCard label="Normal" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass("ring-2");
    });
  });

  describe("Custom className", () => {
    it("should merge custom className", () => {
      const { container } = render(
        <SummaryCard label="Test" value="100" className="custom-class" />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("Styling", () => {
    it("should have gradient background", () => {
      const { container } = render(<SummaryCard label="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("bg-linear-to-br");
    });

    it("should have transition effects", () => {
      const { container } = render(<SummaryCard label="Test" value="100" />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("transition-all", "duration-200");
    });

    it("should have hover effects when clickable", () => {
      const { container } = render(<SummaryCard label="Test" value="100" onClick={() => {}} />);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass("hover:shadow-lg", "hover:scale-105");
    });
  });
});
