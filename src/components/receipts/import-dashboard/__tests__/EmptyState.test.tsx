/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmptyState from "../EmptyState";
import type { ImportMode } from "@/types/import-dashboard.types";

describe("EmptyState", () => {
  describe("Rendering", () => {
    it("should render empty state with all elements", () => {
      render(<EmptyState mode="digital" />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(screen.getByText(/pending receipts/i)).toBeInTheDocument();
    });

    it("should have data-mode attribute", () => {
      render(<EmptyState mode="scan" />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveAttribute("data-mode", "scan");
    });

    it("should render icon for the mode", () => {
      const { container } = render(<EmptyState mode="digital" />);

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });

    it("should apply custom className", () => {
      render(<EmptyState mode="digital" className="custom-class" />);

      const emptyState = screen.getByTestId("empty-state");
      expect(emptyState).toHaveClass("custom-class");
    });
  });

  describe("Digital mode", () => {
    it("should display digital mode title", () => {
      render(<EmptyState mode="digital" />);

      expect(screen.getByText("No Digital Receipts")).toBeInTheDocument();
    });

    it("should display digital mode description", () => {
      render(<EmptyState mode="digital" />);

      expect(
        screen.getByText(
          "No pending receipts from connected apps. New receipts will appear here automatically."
        )
      ).toBeInTheDocument();
    });

    it("should display default action label for digital mode", () => {
      render(<EmptyState mode="digital" onAction={() => {}} />);

      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    it("should display RefreshCw icon for digital mode action", () => {
      const { container } = render(<EmptyState mode="digital" onAction={() => {}} />);

      const button = screen.getByTestId("empty-state-action");
      const icons = button.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Scan mode", () => {
    it("should display scan mode title", () => {
      render(<EmptyState mode="scan" />);

      expect(screen.getByText("No Scanned Receipts")).toBeInTheDocument();
    });

    it("should display scan mode description", () => {
      render(<EmptyState mode="scan" />);

      expect(
        screen.getByText("Upload a receipt image to get started. Drag and drop or use the camera.")
      ).toBeInTheDocument();
    });

    it("should display default action label for scan mode", () => {
      render(<EmptyState mode="scan" onAction={() => {}} />);

      expect(screen.getByText("Scan Receipt")).toBeInTheDocument();
    });

    it("should display Upload icon for scan mode action", () => {
      const { container } = render(<EmptyState mode="scan" onAction={() => {}} />);

      const button = screen.getByTestId("empty-state-action");
      const icons = button.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Action button", () => {
    it("should not render action button when onAction is not provided", () => {
      render(<EmptyState mode="digital" />);

      expect(screen.queryByTestId("empty-state-action")).not.toBeInTheDocument();
    });

    it("should render action button when onAction is provided", () => {
      render(<EmptyState mode="digital" onAction={() => {}} />);

      expect(screen.getByTestId("empty-state-action")).toBeInTheDocument();
    });

    it("should call onAction when button is clicked", () => {
      const mockOnAction = vi.fn();

      render(<EmptyState mode="digital" onAction={mockOnAction} />);

      const button = screen.getByTestId("empty-state-action");
      fireEvent.click(button);

      expect(mockOnAction).toHaveBeenCalledTimes(1);
    });

    it("should use custom action label when provided", () => {
      render(<EmptyState mode="digital" onAction={() => {}} actionLabel="Custom Label" />);

      expect(screen.getByText("Custom Label")).toBeInTheDocument();
      expect(screen.queryByText("Refresh")).not.toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      const mockOnAction = vi.fn();

      render(<EmptyState mode="scan" onAction={mockOnAction} />);

      const button = screen.getByTestId("empty-state-action");
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe("Secondary hint", () => {
    it("should display tip hint", () => {
      render(<EmptyState mode="digital" />);

      expect(screen.getByText("TIP:")).toBeInTheDocument();
      expect(
        screen.getByText("Switch modes using the sidebar to view other receipt sources")
      ).toBeInTheDocument();
    });

    it("should have bold font for TIP label", () => {
      render(<EmptyState mode="digital" />);

      const tipLabel = screen.getByText("TIP:");
      expect(tipLabel).toHaveClass("font-black");
    });
  });

  describe("Hard Line v2.1 styling", () => {
    it("should have thick black borders on icon container", () => {
      const { container } = render(<EmptyState mode="digital" />);

      const iconContainer = container.querySelector(".border-4");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("border-black");
    });

    it("should have shadow offset on icon container", () => {
      const { container } = render(<EmptyState mode="digital" />);

      const iconContainer = container.querySelector(
        ".shadow-\\[8px_8px_0px_0px_rgba\\(0\\,0\\,0\\,1\\)\\]"
      );
      expect(iconContainer).toBeInTheDocument();
    });

    it("should use mono font with bold uppercase text for title", () => {
      render(<EmptyState mode="digital" />);

      const title = screen.getByRole("heading");
      expect(title).toHaveClass("font-mono", "font-black", "uppercase", "tracking-tight");
    });

    it("should use mono font for description", () => {
      render(<EmptyState mode="digital" />);

      const description = screen.getByText(/pending receipts/i);
      expect(description).toHaveClass("font-mono");
    });

    it("should have purple background on icon container", () => {
      const { container } = render(<EmptyState mode="digital" />);

      const iconContainer = container.querySelector(".bg-purple-100");
      expect(iconContainer).toBeInTheDocument();
    });

    it("should have shadow offset on action button", () => {
      render(<EmptyState mode="digital" onAction={() => {}} />);

      const button = screen.getByTestId("empty-state-action");
      expect(button).toHaveClass("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should have hover effect on action button", () => {
      render(<EmptyState mode="digital" onAction={() => {}} />);

      const button = screen.getByTestId("empty-state-action");
      expect(button).toHaveClass("hover:shadow-none");
      expect(button).toHaveClass("hover:translate-x-1");
      expect(button).toHaveClass("hover:translate-y-1");
    });
  });

  describe("Accessibility", () => {
    it("should have aria-hidden on icons", () => {
      const { container } = render(<EmptyState mode="digital" onAction={() => {}} />);

      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute("aria-hidden", "true");
      });
    });

    it("should have focus ring on action button", () => {
      render(<EmptyState mode="digital" onAction={() => {}} />);

      const button = screen.getByTestId("empty-state-action");
      expect(button).toHaveClass("focus:outline-none", "focus:ring-2", "focus:ring-offset-2");
    });
  });

  describe("Icon rendering by mode", () => {
    it("should render Cloud icon for digital mode in icon container", () => {
      const { container } = render(<EmptyState mode="digital" />);

      // Icon container has the large icon
      const iconContainer = container.querySelector(".border-4.bg-purple-100");
      expect(iconContainer).toBeInTheDocument();
      const icon = iconContainer?.querySelector("svg");
      expect(icon).toHaveClass("h-16", "w-16", "text-purple-600");
    });

    it("should render Upload icon for scan mode in icon container", () => {
      const { container } = render(<EmptyState mode="scan" />);

      // Icon container has the large icon
      const iconContainer = container.querySelector(".border-4.bg-purple-100");
      expect(iconContainer).toBeInTheDocument();
      const icon = iconContainer?.querySelector("svg");
      expect(icon).toHaveClass("h-16", "w-16", "text-purple-600");
    });
  });
});
