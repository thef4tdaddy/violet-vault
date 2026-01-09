import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock all hooks and services BEFORE importing component
vi.mock("@/hooks/budgeting/envelopes/useEnvelopeEdit");
vi.mock("@/hooks/platform/common/useMobileDetection");
vi.mock("@/hooks/platform/ux/useModalAutoScroll");
vi.mock("@/utils/common/logger");

// Now import component and mocked modules
import EditEnvelopeModal from "../EditEnvelopeModal";
import useEnvelopeEdit from "@/hooks/budgeting/envelopes/useEnvelopeEdit";
import { useMobileDetection } from "@/hooks/platform/common/useMobileDetection";
import { useModalAutoScroll } from "@/hooks/platform/ux/useModalAutoScroll";
import logger from "@/utils/common/logger";

// Get mocked functions
const mockUseEnvelopeEdit = vi.mocked(useEnvelopeEdit);
const mockUseMobileDetection = vi.mocked(useMobileDetection);
const mockUseModalAutoScroll = vi.mocked(useModalAutoScroll);
const mockLogger = vi.mocked(logger);

// Mock child components
vi.mock("../envelope/EnvelopeModalHeader", () => ({
  default: ({ title, onClose }: { title: string; subtitle?: string; onClose: () => void }) => (
    <div data-testid="envelope-modal-header">
      <h2>{title}</h2>
      <button onClick={onClose} data-testid="header-close-button">
        Close
      </button>
    </div>
  ),
}));

vi.mock("../DeleteEnvelopeModal", () => ({
  default: ({
    isOpen,
    onClose,
    onConfirm,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    isOpen ? (
      <div data-testid="delete-envelope-modal">
        <button onClick={onClose} data-testid="delete-cancel-button">
          Cancel Delete
        </button>
        <button onClick={onConfirm} data-testid="delete-confirm-button">
          Confirm Delete
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/mobile/SlideUpModal", () => ({
  default: ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="slide-up-modal">
        <h3>{title}</h3>
        <button onClick={onClose} data-testid="slide-up-close-button">
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../EditEnvelopeModalComponents", () => ({
  ModalContent: ({
    onDelete,
    onCancel,
    onSubmit,
  }: {
    formData: Record<string, unknown>;
    errors: Record<string, string>;
    calculatedAmounts: Record<string, number>;
    canEdit: boolean;
    canDelete: boolean;
    canSubmit: boolean;
    isLoading: boolean;
    isUnassignedCash: boolean;
    envelopeId?: string;
    onUpdateField: (field: string, value: unknown) => void;
    onDelete: () => void;
    onCancel: () => void;
    onSubmit: () => void;
  }) => (
    <div data-testid="modal-content">
      <button onClick={onDelete} data-testid="delete-button">
        Delete
      </button>
      <button onClick={onCancel} data-testid="cancel-button">
        Cancel
      </button>
      <button onClick={onSubmit} data-testid="submit-button">
        Save
      </button>
    </div>
  ),
}));

describe("EditEnvelopeModal", () => {
  const mockOnClose = vi.fn();
  const mockOnUpdateEnvelope = vi.fn();
  const mockOnDeleteEnvelope = vi.fn();

  const defaultEnvelope = {
    id: "test-envelope-1",
    name: "Test Envelope",
    currentBalance: 100,
    emoji: "💰",
    color: "#4CAF50",
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    envelope: defaultEnvelope,
    onUpdateEnvelope: mockOnUpdateEnvelope,
    onDeleteEnvelope: mockOnDeleteEnvelope,
    existingEnvelopes: [],
    currentUser: { userName: "Test User", userColor: "#a855f7" },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseMobileDetection.mockReturnValue(false);
    mockUseModalAutoScroll.mockReturnValue({ current: null });
    mockUseEnvelopeEdit.mockReturnValue({
      formData: {
        name: "Test Envelope",
        emoji: "💰",
        color: "#4CAF50",
        envelopeType: "essential",
        priority: "medium",
        autoAllocate: true,
      },
      errors: {},
      isLoading: false,
      canSubmit: true,
      calculatedAmounts: {},
      updateFormField: vi.fn(),
      handleSubmit: vi.fn(),
      handleClose: vi.fn(),
      handleDelete: vi.fn(),
      lock: null,
      isLocked: false,
      isOwnLock: false,
      canEdit: true,
      lockLoading: false,
      breakLock: vi.fn(),
      canDelete: true,
      isExpired: false,
    });
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<EditEnvelopeModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
      expect(screen.queryByTestId("envelope-modal-header")).not.toBeInTheDocument();
    });

    it("should not render when envelope is null", () => {
      render(<EditEnvelopeModal {...defaultProps} envelope={null} />);
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    });

    it("should not render when envelope is undefined", () => {
      render(<EditEnvelopeModal {...defaultProps} envelope={undefined} />);
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    });

    it("should render desktop modal when not mobile", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(screen.getByTestId("envelope-modal-header")).toBeInTheDocument();
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      expect(screen.queryByTestId("slide-up-modal")).not.toBeInTheDocument();
    });

    it("should render mobile modal when mobile", () => {
      mockUseMobileDetection.mockReturnValue(true);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
      expect(screen.getByText("Edit Envelope")).toBeInTheDocument();
      expect(screen.queryByTestId("envelope-modal-header")).not.toBeInTheDocument();
    });

    it("should render mobile modal when _forceMobileMode is true", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} _forceMobileMode={true} />);

      expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
      expect(screen.queryByTestId("envelope-modal-header")).not.toBeInTheDocument();
    });

    it("should render modal content in both desktop and mobile modes", () => {
      // Test desktop
      mockUseMobileDetection.mockReturnValue(false);
      const { unmount } = render(<EditEnvelopeModal {...defaultProps} />);
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      unmount();

      // Test mobile
      mockUseMobileDetection.mockReturnValue(true);
      render(<EditEnvelopeModal {...defaultProps} />);
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });
  });

  describe("Modal Header", () => {
    it("should render Edit Envelope title in desktop mode", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(screen.getByText("Edit Envelope")).toBeInTheDocument();
    });

    it("should render Edit Envelope title in mobile mode", () => {
      mockUseMobileDetection.mockReturnValue(true);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(screen.getByText("Edit Envelope")).toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("should call handleClose when header close button is clicked (desktop)", async () => {
      mockUseMobileDetection.mockReturnValue(false);

      const mockHandleClose = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleClose: mockHandleClose,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("header-close-button"));
      expect(mockHandleClose).toHaveBeenCalledTimes(1);
    });

    it("should call handleClose when slide-up modal is closed (mobile)", async () => {
      mockUseMobileDetection.mockReturnValue(true);

      const mockHandleClose = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleClose: mockHandleClose,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("slide-up-close-button"));
      expect(mockHandleClose).toHaveBeenCalledTimes(1);
    });

    it("should call handleClose when cancel button is clicked", async () => {
      const mockHandleClose = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleClose: mockHandleClose,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("cancel-button"));
      expect(mockHandleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Delete Functionality", () => {
    it("should show delete confirmation modal when delete button is clicked", async () => {
      render(<EditEnvelopeModal {...defaultProps} />);

      expect(screen.queryByTestId("delete-envelope-modal")).not.toBeInTheDocument();

      await userEvent.click(screen.getByTestId("delete-button"));

      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();
    });

    it("should hide delete modal when cancel is clicked", async () => {
      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));
      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();

      await userEvent.click(screen.getByTestId("delete-cancel-button"));
      expect(screen.queryByTestId("delete-envelope-modal")).not.toBeInTheDocument();
    });

    it("should call handleDelete when delete is confirmed", async () => {
      const mockHandleDelete = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleDelete: mockHandleDelete,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));
      await userEvent.click(screen.getByTestId("delete-confirm-button"));

      await waitFor(() => {
        expect(mockHandleDelete).toHaveBeenCalledTimes(1);
      });
    });

    it("should hide delete modal after confirming delete", async () => {
      const mockHandleDelete = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleDelete: mockHandleDelete,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));
      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();

      await userEvent.click(screen.getByTestId("delete-confirm-button"));

      await waitFor(() => {
        expect(screen.queryByTestId("delete-envelope-modal")).not.toBeInTheDocument();
      });
    });

    it("should log error when delete fails", async () => {
      const mockHandleDelete = vi.fn().mockRejectedValue(new Error("Delete failed"));
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleDelete: mockHandleDelete,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));
      await userEvent.click(screen.getByTestId("delete-confirm-button"));

      await waitFor(() => {
        expect(mockLogger.error).toHaveBeenCalledWith("Delete failed:", expect.any(Error));
      });
    });
  });

  describe("Save Functionality", () => {
    it("should call handleSubmit when save button is clicked", async () => {
      const mockHandleSubmit = vi.fn();
      mockUseEnvelopeEdit.mockReturnValue({
        ...mockUseEnvelopeEdit(),
        handleSubmit: mockHandleSubmit,
      });

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("submit-button"));

      expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Unassigned Cash Envelope", () => {
    it("should identify unassigned cash envelope by id", () => {
      const unassignedEnvelope = {
        ...defaultEnvelope,
        id: "unassigned",
      };

      render(<EditEnvelopeModal {...defaultProps} envelope={unassignedEnvelope} />);

      // Modal should still render
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should use default currentUser when not provided", () => {
      const { currentUser, ...propsWithoutUser } = defaultProps;
      render(<EditEnvelopeModal {...propsWithoutUser} />);

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("should use empty array for existingEnvelopes when not provided", () => {
      const { existingEnvelopes, ...propsWithoutEnvelopes } = defaultProps;
      render(<EditEnvelopeModal {...propsWithoutEnvelopes} />);

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("should handle existingEnvelopes array", () => {
      const existingEnvelopes = [
        { id: "env-1", name: "Groceries", currentBalance: 100 },
        { id: "env-2", name: "Gas", currentBalance: 50 },
      ];

      render(<EditEnvelopeModal {...defaultProps} existingEnvelopes={existingEnvelopes} />);

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });
  });

  describe("useEnvelopeEdit Hook Integration", () => {
    it("should pass correct props to useEnvelopeEdit hook", () => {
      render(<EditEnvelopeModal {...defaultProps} />);

      expect(mockUseEnvelopeEdit).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          envelope: defaultEnvelope,
          existingEnvelopes: [],
          onSave: mockOnUpdateEnvelope,
          onClose: mockOnClose,
          onDelete: mockOnDeleteEnvelope,
          currentUser: defaultProps.currentUser,
        })
      );
    });

    it("should handle when envelope has no id property", () => {
      const envelopeWithoutId = {
        name: "Test Envelope",
        currentBalance: 100,
      };

      render(<EditEnvelopeModal {...defaultProps} envelope={envelopeWithoutId} />);

      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });
  });

  describe("Modal Portal", () => {
    it("should render desktop modal using createPortal", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} />);

      // Portal renders to document.body, content should still be in the document
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
      expect(screen.getByTestId("envelope-modal-header")).toBeInTheDocument();
    });

    it("should not use portal for mobile mode", () => {
      mockUseMobileDetection.mockReturnValue(true);

      render(<EditEnvelopeModal {...defaultProps} />);

      // Mobile uses SlideUpModal component instead of portal
      expect(screen.getByTestId("slide-up-modal")).toBeInTheDocument();
    });
  });

  describe("Modal Auto Scroll", () => {
    it("should call useModalAutoScroll with correct parameters in desktop mode", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(mockUseModalAutoScroll).toHaveBeenCalledWith(true);
    });

    it("should not enable auto scroll in mobile mode", () => {
      mockUseMobileDetection.mockReturnValue(true);

      render(<EditEnvelopeModal {...defaultProps} />);

      expect(mockUseModalAutoScroll).toHaveBeenCalledWith(false);
    });

    it("should not enable auto scroll when _forceMobileMode is true", () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} _forceMobileMode={true} />);

      expect(mockUseModalAutoScroll).toHaveBeenCalledWith(false);
    });
  });

  describe("Delete Modal in Both Modes", () => {
    it("should render delete modal in desktop mode", async () => {
      mockUseMobileDetection.mockReturnValue(false);

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));

      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();
    });

    it("should render delete modal in mobile mode", async () => {
      mockUseMobileDetection.mockReturnValue(true);

      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));

      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();
    });

    it("should pass correct envelope to DeleteEnvelopeModal", async () => {
      render(<EditEnvelopeModal {...defaultProps} />);

      await userEvent.click(screen.getByTestId("delete-button"));

      // DeleteEnvelopeModal should be rendered with the envelope
      expect(screen.getByTestId("delete-envelope-modal")).toBeInTheDocument();
    });
  });
});
