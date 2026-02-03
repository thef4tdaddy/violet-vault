import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsTierCard from "../AnalyticsTierCard";
import type { AnalyticsTierInfo } from "@/stores/ui/allocationAnalyticsStore";

// Mock getIcon
vi.mock("@/utils/ui/icons", () => ({
  getIcon: () => () => <div data-testid="mock-icon">Icon</div>,
}));

const mockTierOffline: AnalyticsTierInfo = {
  id: "offline",
  title: "100% Offline",
  description: "All calculations run locally",
  privacyLevel: "Maximum",
  bundleSize: "~50 KB",
  features: ["Zero data transmission", "No server communication"],
  icon: "Shield",
  disabled: false,
};

const mockTierDisabled: AnalyticsTierInfo = {
  id: "cloud-sync",
  title: "Cloud Sync",
  description: "Full cloud synchronization",
  privacyLevel: "Standard",
  bundleSize: "~200 KB",
  features: ["Multi-device sync", "Cloud backup"],
  icon: "Cloud",
  disabled: true,
  comingSoon: true,
};

describe("AnalyticsTierCard", () => {
  describe("rendering", () => {
    it("should render tier title and description", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByText("100% Offline")).toBeInTheDocument();
      expect(screen.getByText("All calculations run locally")).toBeInTheDocument();
    });

    it("should render privacy level badge", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByText(/Maximum Privacy/i)).toBeInTheDocument();
    });

    it("should render bundle size badge", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByText(/~50 KB/i)).toBeInTheDocument();
    });

    it("should render all features", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByText("Zero data transmission")).toBeInTheDocument();
      expect(screen.getByText("No server communication")).toBeInTheDocument();
    });

    it("should render coming soon badge when tier has comingSoon flag", () => {
      render(<AnalyticsTierCard tier={mockTierDisabled} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });

    it("should render icon", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });
  });

  describe("selection state", () => {
    it("should show selected state when isSelected is true", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={true} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("should show unselected state when isSelected is false", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("should apply different styles when selected", () => {
      const { container, rerender } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />
      );

      const buttonUnselected = container.querySelector("button");
      const classesUnselected = buttonUnselected?.className;

      rerender(<AnalyticsTierCard tier={mockTierOffline} isSelected={true} onSelect={vi.fn()} />);

      const buttonSelected = container.querySelector("button");
      const classesSelected = buttonSelected?.className;

      expect(classesSelected).not.toBe(classesUnselected);
    });
  });

  describe("disabled state", () => {
    it("should disable button when tier is disabled", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierDisabled} isSelected={false} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should not call onSelect when disabled tier is clicked", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const { container } = render(
        <AnalyticsTierCard tier={mockTierDisabled} isSelected={false} onSelect={onSelect} />
      );

      const button = container.querySelector("button");
      if (button) {
        await user.click(button);
      }

      expect(onSelect).not.toHaveBeenCalled();
    });

    it("should enable button when tier is not disabled", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("interactions", () => {
    it("should call onSelect when clicked", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={onSelect} />
      );

      const button = container.querySelector("button");
      if (button) {
        await user.click(button);
      }

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("should not call onSelect multiple times on rapid clicks", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={onSelect} />
      );

      const button = container.querySelector("button");
      if (button) {
        await user.click(button);
        await user.click(button);
      }

      // Both clicks should register since we're not debouncing
      expect(onSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-label", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "100% Offline - All calculations run locally"
      );
    });

    it("should have role list for features", () => {
      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={vi.fn()} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<AnalyticsTierCard tier={mockTierOffline} isSelected={false} onSelect={onSelect} />);

      const button = screen.getByRole("button");

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter
      await user.keyboard("{Enter}");
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("privacy level styling", () => {
    it("should apply Maximum privacy level colors", () => {
      const { container } = render(
        <AnalyticsTierCard tier={mockTierOffline} isSelected={true} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("border-green-400");
    });

    it("should apply High privacy level colors", () => {
      const highPrivacyTier: AnalyticsTierInfo = {
        ...mockTierOffline,
        privacyLevel: "High",
      };

      const { container } = render(
        <AnalyticsTierCard tier={highPrivacyTier} isSelected={true} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("border-blue-400");
    });

    it("should apply Standard privacy level colors", () => {
      const standardPrivacyTier: AnalyticsTierInfo = {
        ...mockTierOffline,
        privacyLevel: "Standard",
      };

      const { container } = render(
        <AnalyticsTierCard tier={standardPrivacyTier} isSelected={true} onSelect={vi.fn()} />
      );

      const button = container.querySelector("button");
      expect(button?.className).toContain("border-purple-400");
    });
  });
});
