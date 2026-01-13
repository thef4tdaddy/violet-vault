import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FormSection } from "../FormSection";
import "@testing-library/jest-dom";

describe("FormSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render title", () => {
      render(
        <FormSection title="Basic Information">
          <div>Content</div>
        </FormSection>
      );
      expect(screen.getByText("Basic Information")).toBeInTheDocument();
    });

    it("should render subtitle when provided", () => {
      render(
        <FormSection title="Basic Information" subtitle="Enter the core details">
          <div>Content</div>
        </FormSection>
      );
      expect(screen.getByText("Enter the core details")).toBeInTheDocument();
    });

    it("should not render subtitle when not provided", () => {
      render(
        <FormSection title="Basic Information">
          <div>Content</div>
        </FormSection>
      );
      expect(screen.queryByText(/core details/i)).not.toBeInTheDocument();
    });

    it("should render children", () => {
      render(
        <FormSection title="Section">
          <div data-testid="child-content">Child Content</div>
        </FormSection>
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(
        <FormSection title="Section" className="custom-class">
          <div>Content</div>
        </FormSection>
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Styling", () => {
    it("should apply title styling", () => {
      render(
        <FormSection title="Title">
          <div>Content</div>
        </FormSection>
      );
      const title = screen.getByText("Title");
      expect(title).toHaveClass("text-lg", "font-semibold", "text-slate-900");
    });

    it("should apply subtitle styling", () => {
      render(
        <FormSection title="Title" subtitle="Subtitle">
          <div>Content</div>
        </FormSection>
      );
      const subtitle = screen.getByText("Subtitle");
      expect(subtitle).toHaveClass("text-sm", "text-slate-600", "mt-1");
    });

    it("should render divider", () => {
      const { container } = render(
        <FormSection title="Title">
          <div>Content</div>
        </FormSection>
      );
      const divider = container.querySelector(".border-t-2.border-slate-100");
      expect(divider).toBeInTheDocument();
    });

    it("should apply spacing to children", () => {
      const { container } = render(
        <FormSection title="Title">
          <div>Child 1</div>
          <div>Child 2</div>
        </FormSection>
      );
      const contentContainer = container.querySelector(".space-y-4");
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe("Non-Collapsible Behavior", () => {
    it("should show content by default when not collapsible", () => {
      render(
        <FormSection title="Title" collapsible={false}>
          <div data-testid="content">Content</div>
        </FormSection>
      );
      expect(screen.getByTestId("content")).toBeVisible();
    });

    it("should not show chevron icon when not collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={false}>
          <div>Content</div>
        </FormSection>
      );
      const chevron = container.querySelector("svg");
      expect(chevron).not.toBeInTheDocument();
    });

    it("should not have cursor-pointer when not collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={false}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector(".flex.items-center");
      expect(header).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Collapsible Behavior", () => {
    it("should show chevron icon when collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true}>
          <div>Content</div>
        </FormSection>
      );
      const chevron = container.querySelector("svg");
      expect(chevron).toBeInTheDocument();
    });

    it("should have cursor-pointer when collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector(".cursor-pointer");
      expect(header).toBeInTheDocument();
    });

    it("should be expanded by default when defaultExpanded is true", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div data-testid="content">Content</div>
        </FormSection>
      );
      const chevron = container.querySelector("svg");
      expect(chevron).toHaveClass("rotate-180");
    });

    it("should be collapsed when defaultExpanded is false", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={false}>
          <div>Content</div>
        </FormSection>
      );
      const chevron = container.querySelector("svg");
      expect(chevron).not.toHaveClass("rotate-180");
    });

    it("should toggle on header click", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );

      const header = container.querySelector(".cursor-pointer");
      const chevron = container.querySelector("svg");

      // Initially expanded
      expect(chevron).toHaveClass("rotate-180");

      // Click to collapse
      if (header) {
        fireEvent.click(header);
      }
      expect(chevron).not.toHaveClass("rotate-180");

      // Click to expand
      if (header) {
        fireEvent.click(header);
      }
      expect(chevron).toHaveClass("rotate-180");
    });

    it("should toggle on Enter key", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );

      const header = container.querySelector(".cursor-pointer");
      const chevron = container.querySelector("svg");

      // Initially expanded
      expect(chevron).toHaveClass("rotate-180");

      // Press Enter to collapse
      if (header) {
        fireEvent.keyDown(header, { key: "Enter" });
      }
      expect(chevron).not.toHaveClass("rotate-180");
    });

    it("should toggle on Space key", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );

      const header = container.querySelector(".cursor-pointer");
      const chevron = container.querySelector("svg");

      // Initially expanded
      expect(chevron).toHaveClass("rotate-180");

      // Press Space to collapse
      if (header) {
        fireEvent.keyDown(header, { key: " " });
      }
      expect(chevron).not.toHaveClass("rotate-180");
    });

    it("should not toggle on other keys", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );

      const header = container.querySelector(".cursor-pointer");
      const chevron = container.querySelector("svg");

      // Initially expanded
      expect(chevron).toHaveClass("rotate-180");

      // Press other key
      if (header) {
        fireEvent.keyDown(header, { key: "a" });
      }
      // Should still be expanded
      expect(chevron).toHaveClass("rotate-180");
    });
  });

  describe("Animation", () => {
    it("should apply transition classes", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true}>
          <div>Content</div>
        </FormSection>
      );
      const contentArea = container.querySelector(".overflow-hidden.transition-all");
      expect(contentArea).toBeInTheDocument();
    });

    it("should change max-height when collapsed", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={false}>
          <div>Content</div>
        </FormSection>
      );
      const contentArea = container.querySelector(".overflow-hidden");
      expect(contentArea).toHaveClass("max-h-0", "opacity-0");
    });

    it("should change max-height when expanded", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );
      const contentArea = container.querySelector(".overflow-hidden");
      expect(contentArea).toHaveClass("max-h-[5000px]", "opacity-100");
    });
  });

  describe("Accessibility", () => {
    it("should have button role when collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector('[role="button"]');
      expect(header).toBeInTheDocument();
    });

    it("should have tabindex when collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector('[tabindex="0"]');
      expect(header).toBeInTheDocument();
    });

    it("should not have button role when not collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={false}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector('[role="button"]');
      expect(header).not.toBeInTheDocument();
    });

    it("should not have tabindex when not collapsible", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={false}>
          <div>Content</div>
        </FormSection>
      );
      const header = container.querySelector('[tabindex="0"]');
      expect(header).not.toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle multiple children with proper spacing", () => {
      render(
        <FormSection title="Title">
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </FormSection>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
      expect(screen.getByTestId("child-3")).toBeInTheDocument();
    });

    it("should handle all props together", () => {
      const { container } = render(
        <FormSection
          title="Personal Information"
          subtitle="Please provide your details"
          collapsible={true}
          defaultExpanded={true}
          className="custom-section"
        >
          <div data-testid="form-content">Form fields here</div>
        </FormSection>
      );

      expect(screen.getByText("Personal Information")).toBeInTheDocument();
      expect(screen.getByText("Please provide your details")).toBeInTheDocument();
      expect(screen.getByTestId("form-content")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("custom-section");

      const chevron = container.querySelector("svg");
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass("rotate-180");
    });

    it("should maintain state through multiple toggles", () => {
      const { container } = render(
        <FormSection title="Title" collapsible={true} defaultExpanded={true}>
          <div>Content</div>
        </FormSection>
      );

      const header = container.querySelector(".cursor-pointer");
      const chevron = container.querySelector("svg");

      // Expanded
      expect(chevron).toHaveClass("rotate-180");

      // Toggle 1 - Collapse
      if (header) fireEvent.click(header);
      expect(chevron).not.toHaveClass("rotate-180");

      // Toggle 2 - Expand
      if (header) fireEvent.click(header);
      expect(chevron).toHaveClass("rotate-180");

      // Toggle 3 - Collapse
      if (header) fireEvent.click(header);
      expect(chevron).not.toHaveClass("rotate-180");
    });
  });
});
