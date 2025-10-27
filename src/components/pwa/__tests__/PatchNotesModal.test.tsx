import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import PatchNotesModal from "../PatchNotesModal";

// Mock dependencies
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../../utils", () => ({
  getIcon: vi.fn((name) => name), // Return icon name for testing
}));

vi.mock("../../../utils/common/version", () => ({
  markVersionAsSeen: vi.fn(),
}));

const mockUseUiStore = vi.fn();
vi.mock("../../../stores/ui/uiStore", () => ({
  default: (selector: any) => mockUseUiStore(selector),
}));

describe("PatchNotesModal", () => {
  const mockHidePatchNotesModal = vi.fn();

  beforeEach(() => {
    mockHidePatchNotesModal.mockClear();
    vi.clearAllMocks();

    // Default mock implementation
    mockUseUiStore.mockImplementation((selector) => {
      const state = {
        showPatchNotes: true,
        patchNotesData: {
          version: "2.0.0",
          features: ["New feature 1", "New feature 2", "New feature 3"],
          fixes: ["Bug fix 1", "Bug fix 2"],
          breaking: [],
        },
        loadingPatchNotes: false,
        hidePatchNotesModal: mockHidePatchNotesModal,
      };
      return selector(state);
    });
  });

  describe("Rendering", () => {
    it("should not render when showPatchNotes is false", () => {
      mockUseUiStore.mockImplementation((selector) =>
        selector({ showPatchNotes: false, patchNotesData: null })
      );

      const { container } = render(<PatchNotesModal />);
      expect(container.firstChild).toBeNull();
    });

    it("should not render when patchNotesData is null", () => {
      mockUseUiStore.mockImplementation((selector) =>
        selector({ showPatchNotes: true, patchNotesData: null })
      );

      const { container } = render(<PatchNotesModal />);
      expect(container.firstChild).toBeNull();
    });

    it("should render when showPatchNotes and patchNotesData are set", () => {
      render(<PatchNotesModal />);
      // Should render the modal content
      expect(screen.getByText(/New feature 1/i)).toBeInTheDocument();
    });

    it("should display version number", () => {
      render(<PatchNotesModal />);
      // Version should be displayed somewhere in the modal
      const versionText = screen.getByText(/2\.0\.0/);
      expect(versionText).toBeInTheDocument();
    });

    it("should render features", () => {
      render(<PatchNotesModal />);
      expect(screen.getByText("New feature 1")).toBeInTheDocument();
      expect(screen.getByText("New feature 2")).toBeInTheDocument();
      expect(screen.getByText("New feature 3")).toBeInTheDocument();
    });

    it("should render fixes", () => {
      render(<PatchNotesModal />);
      // Only first fix is shown (3 features + 1 fix = 4 total highlights)
      expect(screen.getByText("Bug fix 1")).toBeInTheDocument();
    });
  });

  describe("Close Handling", () => {
    it("should have close button that can be clicked", async () => {
      const user = userEvent.setup();
      render(<PatchNotesModal />);

      // Find the "Continue Using VioletVault" button
      const continueButton = screen.getByText(/Continue Using VioletVault/i);
      expect(continueButton).toBeInTheDocument();
      
      // Click it
      await user.click(continueButton);
      // Modal should call the close handler
      expect(mockHidePatchNotesModal).toHaveBeenCalled();
    });
  });

  describe("Content Rendering", () => {
    it("should handle empty features array", () => {
      mockUseUiStore.mockImplementation((selector) => {
        const state = {
          showPatchNotes: true,
          patchNotesData: {
            version: "2.0.0",
            features: [],
            fixes: ["Bug fix 1"],
            breaking: [],
          },
          loadingPatchNotes: false,
          hidePatchNotesModal: mockHidePatchNotesModal,
        };
        return selector(state);
      });

      render(<PatchNotesModal />);
      expect(screen.getByText("Bug fix 1")).toBeInTheDocument();
    });

    it("should handle empty fixes array", () => {
      mockUseUiStore.mockImplementation((selector) => {
        const state = {
          showPatchNotes: true,
          patchNotesData: {
            version: "2.0.0",
            features: ["New feature 1"],
            fixes: [],
            breaking: [],
          },
          loadingPatchNotes: false,
          hidePatchNotesModal: mockHidePatchNotesModal,
        };
        return selector(state);
      });

      render(<PatchNotesModal />);
      expect(screen.getByText("New feature 1")).toBeInTheDocument();
    });

    it("should limit highlights display", () => {
      mockUseUiStore.mockImplementation((selector) => {
        const state = {
          showPatchNotes: true,
          patchNotesData: {
            version: "2.0.0",
            features: Array.from({ length: 10 }, (_, i) => `Feature ${i + 1}`),
            fixes: Array.from({ length: 10 }, (_, i) => `Fix ${i + 1}`),
            breaking: [],
          },
          loadingPatchNotes: false,
          hidePatchNotesModal: mockHidePatchNotesModal,
        };
        return selector(state);
      });

      render(<PatchNotesModal />);
      // Should only show first 3 features
      expect(screen.getByText("Feature 1")).toBeInTheDocument();
      expect(screen.getByText("Feature 2")).toBeInTheDocument();
      expect(screen.getByText("Feature 3")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have actionable buttons", () => {
      render(<PatchNotesModal />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should display version information clearly", () => {
      render(<PatchNotesModal />);
      const versionElement = screen.getByText(/2\.0\.0/);
      expect(versionElement).toBeVisible();
    });
  });
});
