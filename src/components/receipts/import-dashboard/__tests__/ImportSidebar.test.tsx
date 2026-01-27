/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ImportSidebar from "../ImportSidebar";
import type { ImportMode } from "@/types/import-dashboard.types";

describe("ImportSidebar", () => {
  const mockOnModeChange = vi.fn();

  const defaultProps = {
    selectedMode: "digital" as ImportMode,
    onModeChange: mockOnModeChange,
  };

  beforeEach(() => {
    mockOnModeChange.mockClear();
  });

  describe("Rendering", () => {
    it("should render both mode buttons", () => {
      render(<ImportSidebar {...defaultProps} />);

      expect(screen.getByTestId("import-mode-digital")).toBeInTheDocument();
      expect(screen.getByTestId("import-mode-scan")).toBeInTheDocument();
    });

    it("should render with correct labels", () => {
      render(<ImportSidebar {...defaultProps} />);

      expect(screen.getByText("Digital")).toBeInTheDocument();
      expect(screen.getByText("Scan")).toBeInTheDocument();
    });

    it("should render icons for each mode", () => {
      const { container } = render(<ImportSidebar {...defaultProps} />);

      // Both icons should be present (Cloud and Upload from lucide-react)
      const icons = container.querySelectorAll("svg");
      expect(icons).toHaveLength(2);
    });

    it("should apply custom className", () => {
      const { container } = render(<ImportSidebar {...defaultProps} className="custom-class" />);

      const sidebar = screen.getByTestId("import-sidebar");
      expect(sidebar).toHaveClass("custom-class");
    });

    it("should have responsive layout classes", () => {
      render(<ImportSidebar {...defaultProps} />);
      const sidebar = screen.getByTestId("import-sidebar");

      // Mobile: Row layout, fixed at bottom
      expect(sidebar).toHaveClass("flex-row", "md:flex-col");
      expect(sidebar).toHaveClass("justify-around", "md:justify-start");
      expect(sidebar).toHaveClass("border-t-2", "md:border-t-0");
    });
  });

  describe("Active state styling", () => {
    it("should highlight the active mode (digital)", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      const scanButton = screen.getByTestId("import-mode-scan");

      // Active button should have purple background (from color="purple" prop)
      expect(digitalButton).toHaveClass("bg-purple-600");
      expect(digitalButton).toHaveAttribute("aria-pressed", "true");

      // Inactive button should have transparent background (from variant="ghost")
      expect(scanButton).toHaveClass("bg-transparent");
      expect(scanButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should highlight the active mode (scan)", () => {
      render(<ImportSidebar selectedMode="scan" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      const scanButton = screen.getByTestId("import-mode-scan");

      // Active button should have purple background
      expect(scanButton).toHaveClass("bg-purple-600");
      expect(scanButton).toHaveAttribute("aria-pressed", "true");

      // Inactive button should have transparent background
      expect(digitalButton).toHaveClass("bg-transparent");
      expect(digitalButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should disable the active mode button", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      const scanButton = screen.getByTestId("import-mode-scan");

      expect(digitalButton).toBeDisabled();
      expect(scanButton).not.toBeDisabled();
    });
  });

  describe("Mode switching", () => {
    it("should call onModeChange when clicking inactive mode", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const scanButton = screen.getByTestId("import-mode-scan");
      fireEvent.click(scanButton);

      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
      expect(mockOnModeChange).toHaveBeenCalledWith("scan");
    });

    it("should not call onModeChange when clicking active mode", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      fireEvent.click(digitalButton);

      expect(mockOnModeChange).not.toHaveBeenCalled();
    });

    it("should switch from digital to scan", () => {
      const { rerender } = render(
        <ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />
      );

      const scanButton = screen.getByTestId("import-mode-scan");
      fireEvent.click(scanButton);

      expect(mockOnModeChange).toHaveBeenCalledWith("scan");

      // Simulate the mode change
      rerender(<ImportSidebar selectedMode="scan" onModeChange={mockOnModeChange} />);

      const scanButtonAfter = screen.getByTestId("import-mode-scan");
      expect(scanButtonAfter).toHaveClass("bg-purple-600");
      expect(scanButtonAfter).toBeDisabled();
    });
  });

  describe("Pending counts", () => {
    it("should display count badges when provided", () => {
      render(<ImportSidebar {...defaultProps} pendingCounts={{ digital: 5, scan: 3 }} />);

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should not display badges when counts are zero", () => {
      render(<ImportSidebar {...defaultProps} pendingCounts={{ digital: 0, scan: 0 }} />);

      // No count badges should be visible
      const badges = screen.queryByLabelText(/pending.*receipts/i);
      expect(badges).not.toBeInTheDocument();

      // Mobile dots should also not be visible
      const dots = screen
        .queryAllByRole("none", { hidden: true })
        .filter((el) => el.classList.contains("bg-red-500"));
      expect(dots).toHaveLength(0);
    });

    it("should display badge for only one mode if other is zero", () => {
      render(<ImportSidebar {...defaultProps} pendingCounts={{ digital: 7, scan: 0 }} />);

      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    it("should have accessible aria-label for count badges", () => {
      render(<ImportSidebar {...defaultProps} pendingCounts={{ digital: 5, scan: 3 }} />);

      expect(screen.getByLabelText("5 pending digital receipts")).toBeInTheDocument();
      expect(screen.getByLabelText("3 pending scan receipts")).toBeInTheDocument();
    });

    it("should use default counts of zero when not provided", () => {
      render(<ImportSidebar {...defaultProps} />);

      // No badges should be visible with default zero counts
      const badges = screen.queryByLabelText(/pending.*receipts/i);
      expect(badges).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper aria-pressed attributes", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      const scanButton = screen.getByTestId("import-mode-scan");

      expect(digitalButton).toHaveAttribute("aria-pressed", "true");
      expect(scanButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should have aria-hidden on icons", () => {
      const { container } = render(<ImportSidebar {...defaultProps} />);

      const icons = container.querySelectorAll("svg");
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute("aria-hidden", "true");
      });
    });

    it("should be keyboard navigable", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const scanButton = screen.getByTestId("import-mode-scan");

      // Focus the button
      scanButton.focus();
      expect(document.activeElement).toBe(scanButton);

      // Buttons respond to click events (which are triggered by Enter/Space keys in browsers)
      fireEvent.click(scanButton);
      expect(mockOnModeChange).toHaveBeenCalledWith("scan");
    });
  });

  describe("Hard Line v2.1 styling", () => {
    it("should have thick black borders", () => {
      render(<ImportSidebar {...defaultProps} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      expect(digitalButton).toHaveClass("hard-border");
    });

    it("should have shadow offset on active mode", () => {
      render(<ImportSidebar selectedMode="digital" onModeChange={mockOnModeChange} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      expect(digitalButton).toHaveClass("shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]");
    });

    it("should use mono font with bold uppercase text", () => {
      render(<ImportSidebar {...defaultProps} />);

      const digitalButton = screen.getByTestId("import-mode-digital");
      const label = digitalButton.querySelector("span");
      expect(label).toHaveClass("font-mono", "font-black", "uppercase", "tracking-tight");
    });
  });
});
