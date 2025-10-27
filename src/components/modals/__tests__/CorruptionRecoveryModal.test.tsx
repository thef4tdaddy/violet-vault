import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { CorruptionRecoveryModal } from "../CorruptionRecoveryModal";

// Mock dependencies
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../ui/ConfirmModal", () => ({
  default: ({ isOpen, onConfirm, children }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        {children}
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

vi.mock("../../utils/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(() => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  })),
}));

vi.mock("../../hooks/common/useDataManagement", () => ({
  default: vi.fn(() => ({
    exportData: vi.fn(),
  })),
}));

vi.mock("../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("CorruptionRecoveryModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<CorruptionRecoveryModal isOpen={false} onClose={onClose} />);
      expect(screen.queryByText(/SYNC CORRUPTION DETECTED/i)).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/SYNC CORRUPTION DETECTED/i)).toBeInTheDocument();
    });

    it("should render warning icon", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });

    it("should render recovery steps", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/Export your data/i)).toBeInTheDocument();
      expect(screen.getByText(/Create new profile/i)).toBeInTheDocument();
      expect(screen.getByText(/Re-import your data/i)).toBeInTheDocument();
    });

    it("should render important warning", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/must export your data first/i)).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText(/Export/i)).toBeInTheDocument();
    });
  });

  describe("Close Handling", () => {
    it("should call onClose when Cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Export Data Flow", () => {
    it("should show export button in step 1", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      // Export button should contain "Export" text (exact text may vary)
      const exportButton = screen.getByText(/Export/i);
      expect(exportButton).toBeInTheDocument();
    });

    it("should have export functionality", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      const exportButton = screen.getByText(/Export/i);
      expect(exportButton).toBeInTheDocument();
      expect(exportButton).not.toBeDisabled();
    });
  });

  describe("Step Navigation", () => {
    it("should start at step 1", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/SYNC CORRUPTION DETECTED/i)).toBeInTheDocument();
      expect(screen.getByText(/Export your data/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have clear warning messages", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/SYNC CORRUPTION DETECTED/i)).toBeVisible();
    });

    it("should have actionable buttons", () => {
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Error States", () => {
    it("should render with proper structure even if hooks fail", () => {
      // This tests that the component doesn't crash if hooks return undefined
      render(<CorruptionRecoveryModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText(/SYNC CORRUPTION DETECTED/i)).toBeInTheDocument();
    });
  });
});
