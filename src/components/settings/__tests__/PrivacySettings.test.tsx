import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PrivacySettings from "../PrivacySettings";
import { useAllocationAnalyticsStore } from "@/stores/ui/allocationAnalyticsStore";

// Mock dependencies
vi.mock("@/utils/ui/icons", () => ({
  getIcon: () => () => <div data-testid="mock-icon">Icon</div>,
}));

vi.mock("@/hooks/platform/ux/useModalAutoScroll", () => ({
  useModalAutoScroll: () => ({ current: null }),
}));

vi.mock("@/components/ui/ModalCloseButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} data-testid="modal-close-button">
      Close
    </button>
  ),
}));

vi.mock("@/components/privacy/AnalyticsTierCard", () => ({
  default: ({
    tier,
    isSelected,
    onSelect,
  }: {
    tier: { id: string; title: string };
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <button
      data-testid={`tier-card-${tier.id}`}
      onClick={onSelect}
      aria-pressed={isSelected}
    >
      {tier.title}
    </button>
  ),
}));

vi.mock("@/components/privacy/PrivacyExplainerModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="privacy-explainer-modal">
        <button onClick={onClose}>Close Explainer</button>
      </div>
    ) : null,
}));

describe("PrivacySettings", () => {
  beforeEach(() => {
    // Reset store before each test
    useAllocationAnalyticsStore.setState({ analyticsTier: "offline" });
  });

  describe("rendering", () => {
    it("should not render when isOpen is false", () => {
      const { container } = render(<PrivacySettings isOpen={false} onClose={vi.fn()} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when isOpen is true", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/Privacy Settings/i)).toBeInTheDocument();
    });

    it("should render all three tier cards", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("tier-card-offline")).toBeInTheDocument();
      expect(screen.getByTestId("tier-card-private-backend")).toBeInTheDocument();
      expect(screen.getByTestId("tier-card-cloud-sync")).toBeInTheDocument();
    });

    it("should display current tier information", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText("100% Offline")).toBeInTheDocument();
      expect(screen.getByText("Maximum")).toBeInTheDocument();
    });

    it("should show bundle size progress bar", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "25");
    });

    it("should render close button", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByTestId("modal-close-button")).toBeInTheDocument();
    });

    it("should render Learn More and Done buttons", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText("Learn More")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });
  });

  describe("tier selection", () => {
    it("should update tier when offline tier is selected", async () => {
      const user = userEvent.setup();
      useAllocationAnalyticsStore.setState({ analyticsTier: "private-backend" });

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const offlineTierCard = screen.getByTestId("tier-card-offline");
      await user.click(offlineTierCard);

      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("offline");
    });

    it("should update tier when private-backend tier is selected", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const backendTierCard = screen.getByTestId("tier-card-private-backend");
      await user.click(backendTierCard);

      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("private-backend");
    });

    it("should update bundle size when tier changes", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");

      // Initially 25% for offline
      expect(progressBar).toHaveAttribute("aria-valuenow", "25");

      // Switch to private-backend
      const backendTierCard = screen.getByTestId("tier-card-private-backend");
      await user.click(backendTierCard);

      // Wait for state update and re-render
      await waitFor(() => {
        const updatedProgressBar = screen.getByRole("progressbar");
        expect(updatedProgressBar).toHaveAttribute("aria-valuenow", "60");
      });
    });
  });

  describe("privacy explainer modal", () => {
    it("should not show explainer modal initially", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      expect(screen.queryByTestId("privacy-explainer-modal")).not.toBeInTheDocument();
    });

    it("should open explainer modal when Learn More button is clicked", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const learnMoreButton = screen.getByText("Learn More");
      await user.click(learnMoreButton);

      expect(screen.getByTestId("privacy-explainer-modal")).toBeInTheDocument();
    });

    it("should open explainer modal from info banner link", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const infoLink = screen.getByText(/Learn more about what data is sent where/i);
      await user.click(infoLink);

      expect(screen.getByTestId("privacy-explainer-modal")).toBeInTheDocument();
    });

    it("should close explainer modal when close button is clicked", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      // Open explainer
      const learnMoreButton = screen.getByText("Learn More");
      await user.click(learnMoreButton);

      expect(screen.getByTestId("privacy-explainer-modal")).toBeInTheDocument();

      // Close explainer
      const closeExplainerButton = screen.getByText("Close Explainer");
      await user.click(closeExplainerButton);

      await waitFor(() => {
        expect(screen.queryByTestId("privacy-explainer-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("modal interactions", () => {
    it("should call onClose when modal close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PrivacySettings isOpen={true} onClose={onClose} />);

      const closeButton = screen.getByTestId("modal-close-button");
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when Done button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<PrivacySettings isOpen={true} onClose={onClose} />);

      const doneButton = screen.getByText("Done");
      await user.click(doneButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("should have proper aria labels for progress bar", () => {
      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-label", "Bundle size: ~50 KB");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });

    it("should update aria-pressed on tier cards when selection changes", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const offlineTierCard = screen.getByTestId("tier-card-offline");
      const backendTierCard = screen.getByTestId("tier-card-private-backend");

      // Initially offline is selected
      expect(offlineTierCard).toHaveAttribute("aria-pressed", "true");
      expect(backendTierCard).toHaveAttribute("aria-pressed", "false");

      // Switch to private-backend
      await user.click(backendTierCard);

      await waitFor(() => {
        expect(offlineTierCard).toHaveAttribute("aria-pressed", "false");
        expect(backendTierCard).toHaveAttribute("aria-pressed", "true");
      });
    });
  });

  describe("persistence", () => {
    it("should persist tier selection in store", async () => {
      const user = userEvent.setup();

      render(<PrivacySettings isOpen={true} onClose={vi.fn()} />);

      const backendTierCard = screen.getByTestId("tier-card-private-backend");
      await user.click(backendTierCard);

      // Check that store was updated
      const state = useAllocationAnalyticsStore.getState();
      expect(state.analyticsTier).toBe("private-backend");

      // The store's persist middleware will handle localStorage
      // We've already tested that in allocationAnalyticsStore.test.ts
    });
  });
});
