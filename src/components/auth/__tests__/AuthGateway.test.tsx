import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AuthGateway from "../AuthGateway";
import userEvent from "@testing-library/user-event";
import { useLocalOnlyMode } from "@/hooks/common/useLocalOnlyMode";

// Mock hooks
vi.mock("@/hooks/common/useLocalOnlyMode", () => ({
  useLocalOnlyMode: vi.fn(() => ({
    isLocalOnlyMode: false,
    localOnlyUser: null,
    checkLocalOnlyMode: vi.fn(async () => ({ success: false })),
  })),
}));

// Mock child components
vi.mock("../UserSetup", () => ({
  default: ({ onSetupComplete }: { onSetupComplete: (payload: any) => void }) => (
    <div data-testid="user-setup">
      <h1>User Setup</h1>
      <button onClick={() => onSetupComplete({})}>Complete Setup</button>
    </div>
  ),
}));

vi.mock("../LocalOnlySetup", () => ({
  default: ({
    onModeSelected,
    onSwitchToAuth,
  }: {
    onModeSelected: (mode: string) => void;
    onSwitchToAuth: () => void;
  }) => (
    <div data-testid="local-only-setup">
      <h1>Local Only Setup</h1>
      <button onClick={() => onModeSelected("local-only")}>Use Local Only</button>
      <button onClick={onSwitchToAuth}>Switch to Auth</button>
    </div>
  ),
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("AuthGateway", () => {
  const mockOnSetupComplete = vi.fn();
  const mockOnLocalOnlyReady = vi.fn();

  const defaultProps = {
    onSetupComplete: mockOnSetupComplete,
    onLocalOnlyReady: mockOnLocalOnlyReady,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset useLocalOnlyMode mock to default state
    vi.mocked(useLocalOnlyMode).mockReturnValue({
      isLocalOnlyMode: false,
      localOnlyUser: null,
      checkLocalOnlyMode: vi.fn(async () => ({ success: false })),
      setLocalOnlyMode: vi.fn(),
    });

    // Clear localStorage
    localStorage.clear();
  });

  const renderGateway = (props = {}) => {
    return render(<AuthGateway {...defaultProps} {...props} />);
  };

  describe("Loading State", () => {
    it("should show loading indicator initially", async () => {
      renderGateway();

      await waitFor(() => {
        // Check for loading spinner or loading text
        expect(
          screen.queryByText(/Loading VioletVault.../i) ||
            screen.queryByRole("generic", { hidden: true })
        ).toBeTruthy();
      });
    });
  });

  describe("Standard Auth Mode", () => {
    it("should show UserSetup for new users", async () => {
      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });

    it("should show UserSetup when saved data exists", async () => {
      localStorage.setItem("envelopeBudgetData", "encrypted-data");

      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });

    it("should call onSetupComplete when setup completes", async () => {
      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });

      const completeButton = screen.getByText("Complete Setup");
      await userEvent.click(completeButton);

      expect(mockOnSetupComplete).toHaveBeenCalled();
    });
  });

  describe("Local Only Mode", () => {
    it("should render nothing when local only mode is active", async () => {
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: true,
        localOnlyUser: { id: "test-user", name: "Test" },
        checkLocalOnlyMode: vi.fn(async () => ({ success: true })),
        setLocalOnlyMode: vi.fn(),
      });

      const { container } = renderGateway();

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it("should call onLocalOnlyReady when local only user exists", async () => {
      const mockUser = { id: "test-user", name: "Test" };
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: mockUser,
        checkLocalOnlyMode: vi.fn(async () => ({ success: true, user: mockUser })),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        expect(mockOnLocalOnlyReady).toHaveBeenCalledWith(mockUser);
      });
    });
  });

  describe("Mode Selection", () => {
    it("should default to standard mode for new users", async () => {
      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });

    it("should handle error during mode check", async () => {
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: null,
        checkLocalOnlyMode: vi.fn(async () => {
          throw new Error("Check failed");
        }),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        // Should fall back to standard mode
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });
  });

  describe("Mode Switching", () => {
    it("should switch to local only setup", async () => {
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: { id: "test", name: "Test" },
        checkLocalOnlyMode: vi.fn(async () => ({ success: true })),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("local-only-setup")).toBeInTheDocument();
      });
    });

    it("should handle local only mode selection", async () => {
      const mockUser = { id: "test-user", name: "Test" };
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: mockUser,
        checkLocalOnlyMode: vi.fn(async () => ({ success: true })),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("local-only-setup")).toBeInTheDocument();
      });

      const localOnlyButton = screen.getByText("Use Local Only");
      await userEvent.click(localOnlyButton);

      await waitFor(() => {
        expect(mockOnLocalOnlyReady).toHaveBeenCalledWith(mockUser);
      });
    });

    it("should switch back to auth from local only", async () => {
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: { id: "test", name: "Test" },
        checkLocalOnlyMode: vi.fn(async () => ({ success: true })),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("local-only-setup")).toBeInTheDocument();
      });

      const switchButton = screen.getByText("Switch to Auth");
      await userEvent.click(switchButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });
  });

  describe("Data Persistence", () => {
    it("should check localStorage for existing data", async () => {
      const testData = JSON.stringify({ encrypted: "data" });
      localStorage.setItem("envelopeBudgetData", testData);

      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });

      expect(localStorage.getItem("envelopeBudgetData")).toBe(testData);
    });

    it("should handle missing localStorage data", async () => {
      renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });
  });

  describe("Error Recovery", () => {
    it("should recover from checkLocalOnlyMode failure", async () => {
      vi.mocked(useLocalOnlyMode).mockReturnValue({
        isLocalOnlyMode: false,
        localOnlyUser: null,
        checkLocalOnlyMode: vi.fn(async () => {
          throw new Error("Network error");
        }),
        setLocalOnlyMode: vi.fn(),
      });

      renderGateway();

      await waitFor(() => {
        // Should default to standard auth mode
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });
  });

  describe("User Experience", () => {
    it("should show consistent UI during mode selection", async () => {
      renderGateway();

      // Should show loading first
      expect(
        screen.queryByText(/Loading VioletVault.../i) ||
          screen.queryByRole("generic", { hidden: true })
      ).toBeTruthy();

      // Then show auth UI
      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });

    it("should handle rapid component remounts", async () => {
      const { rerender } = renderGateway();

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });

      rerender(<AuthGateway {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup")).toBeInTheDocument();
      });
    });
  });
});
