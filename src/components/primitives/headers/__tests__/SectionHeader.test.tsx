import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SectionHeader from "../SectionHeader";
import "@testing-library/jest-dom";

describe("SectionHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render title", () => {
      render(<SectionHeader title="Test Section" />);
      expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(<SectionHeader title="Test Section" className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should apply default border and spacing classes", () => {
      const { container } = render(<SectionHeader title="Test Section" />);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("border-b-2", "border-slate-100", "pb-3", "mb-4");
    });
  });

  describe("Count Badge", () => {
    it("should render count badge when provided", () => {
      render(<SectionHeader title="Test Section" count={5} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render count badge with zero", () => {
      render(<SectionHeader title="Test Section" count={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should render count badge with large numbers", () => {
      render(<SectionHeader title="Test Section" count={999} />);
      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("should not render count badge when undefined", () => {
      render(<SectionHeader title="Test Section" />);
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    it("should not render count badge when null", () => {
      render(<SectionHeader title="Test Section" count={null as unknown as number} />);
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });

    it("should apply correct badge styling", () => {
      render(<SectionHeader title="Test Section" count={5} />);
      const badge = screen.getByText("5");
      expect(badge).toHaveClass(
        "bg-purple-100",
        "text-purple-700",
        "rounded-full",
        "px-2.5",
        "py-0.5",
        "text-sm",
        "font-medium"
      );
    });
  });

  describe("Actions", () => {
    it("should render actions when provided", () => {
      render(<SectionHeader title="Test Section" actions={<button>View All</button>} />);
      expect(screen.getByText("View All")).toBeInTheDocument();
    });

    it("should render multiple action buttons", () => {
      render(
        <SectionHeader
          title="Test Section"
          actions={
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          }
        />
      );
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("should not render actions when not provided", () => {
      const { container } = render(<SectionHeader title="Test Section" />);
      const buttons = container.querySelectorAll("button");
      expect(buttons).toHaveLength(0);
    });

    it("should render actions with custom components", () => {
      const CustomAction = () => <div>Custom Action</div>;
      render(<SectionHeader title="Test Section" actions={<CustomAction />} />);
      expect(screen.getByText("Custom Action")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("should apply flex layout classes", () => {
      const { container } = render(<SectionHeader title="Test Section" />);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass("flex", "items-center", "justify-between");
    });

    it("should have left side with title and count", () => {
      render(<SectionHeader title="Test Section" count={5} />);
      const title = screen.getByText("Test Section");
      const count = screen.getByText("5");
      expect(title).toBeInTheDocument();
      expect(count).toBeInTheDocument();
    });
  });

  describe("Typography Styles", () => {
    it("should apply correct title styles", () => {
      render(<SectionHeader title="Test Section" />);
      const title = screen.getByText("Test Section");
      expect(title).toHaveClass("text-lg", "font-semibold", "text-slate-900");
    });
  });

  describe("Complete Example", () => {
    it("should render all elements together", () => {
      render(
        <SectionHeader
          title="Upcoming Bills"
          count={5}
          actions={<button>View All</button>}
          className="custom-section"
        />
      );

      expect(screen.getByText("Upcoming Bills")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("View All")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      render(<SectionHeader title="" />);
      const title = screen.getByRole("heading");
      expect(title).toHaveTextContent("");
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(100);
      render(<SectionHeader title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle negative count", () => {
      render(<SectionHeader title="Test Section" count={-5} />);
      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("should handle title with special characters", () => {
      render(<SectionHeader title="Test & Section <>" />);
      expect(screen.getByText("Test & Section <>")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading role", () => {
      render(<SectionHeader title="Test Section" />);
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
    });

    it("should have semantic heading element", () => {
      render(<SectionHeader title="Test Section" />);
      const heading = screen.getByText("Test Section");
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("Component Structure", () => {
    it("should maintain proper nesting", () => {
      const { container } = render(
        <SectionHeader title="Test Section" count={5} actions={<button>Action</button>} />
      );
      const header = container.firstChild as HTMLElement;
      const leftSide = header.firstChild as HTMLElement;
      const rightSide = header.lastChild as HTMLElement;

      expect(leftSide).toHaveClass("flex", "items-center", "gap-3");
      expect(rightSide).toHaveClass("flex", "items-center", "gap-2");
    });
  });
});
