import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import JoinBudgetModal from "../JoinBudgetModal";
import userEvent from "@testing-library/user-event";

// Mock all hooks
vi.mock("@/hooks/sharing/useShareCodeValidation", () => ({
  useShareCodeValidation: vi.fn(() => ({
    shareInfo: null,
    creatorInfo: null,
    isValidating: false,
    validateShareCode: vi.fn(),
    resetValidation: vi.fn(),
  })),
}));

vi.mock("@/hooks/sharing/useBudgetJoining", () => ({
  useBudgetJoining: vi.fn(() => ({
    isJoining: false,
    joinBudget: vi.fn(),
  })),
}));

vi.mock("@/hooks/sharing/useQRCodeProcessing", () => ({
  useQRCodeProcessing: vi.fn(() => ({
    handleQRScan: vi.fn(),
  })),
}));

vi.mock("@/utils/security/shareCodeUtils", () => ({
  shareCodeUtils: {
    validateShareCode: vi.fn(() => true),
  },
}));

vi.mock("@/utils/sharing/colorUtils", () => ({
  generateRandomColor: vi.fn(() => "#ff0000"),
}));

// Mock child components
vi.mock("@/components/sharing/steps/ShareCodeStep", () => ({
  default: ({ shareCode, setShareCode, onValidate, isValidating, shareInfo }) => (
    <div data-testid="share-code-step">
      <input
        data-testid="share-code-input"
        value={shareCode}
        onChange={(e) => setShareCode(e.target.value)}
      />
      <button onClick={onValidate} disabled={isValidating}>
        {isValidating ? "Validating..." : "Validate Share Code"}
      </button>
      {shareInfo && <div data-testid="share-info">Share Info Available</div>}
    </div>
  ),
}));

vi.mock("@/components/sharing/steps/UserSetupStep", () => ({
  default: ({
    userName,
    userColor,
    password,
    setUserName,
    setPassword,
    onJoin,
    onBack,
    isJoining,
    onGenerateRandomColor,
  }) => (
    <div data-testid="user-setup-step">
      <input
        data-testid="user-name-input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <input
        data-testid="user-color-input"
        value={userColor}
        onChange={() => {}} // Mock allows editing but doesn't update state
      />
      <button data-testid="random-color-button" onClick={onGenerateRandomColor}>
        Random Color
      </button>
      <input
        data-testid="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={onBack}>Back</button>
      <button onClick={onJoin} disabled={isJoining}>
        {isJoining ? "Joining..." : "Join Budget"}
      </button>
    </div>
  ),
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/utils", () => ({
  renderIcon: vi.fn(() => <div>Icon</div>),
}));

describe("JoinBudgetModal", () => {
  const mockOnClose = vi.fn();
  const mockOnJoinSuccess = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onJoinSuccess: mockOnJoinSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location
    delete window.location;
    window.location = { search: "" } as any;
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<JoinBudgetModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId("share-code-step")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<JoinBudgetModal {...defaultProps} />);
      expect(screen.getByTestId("share-code-step")).toBeInTheDocument();
    });

    it("should render ShareCodeStep on step 1", () => {
      render(<JoinBudgetModal {...defaultProps} />);
      expect(screen.getByTestId("share-code-step")).toBeInTheDocument();
      expect(screen.queryByTestId("user-setup-step")).not.toBeInTheDocument();
    });

    it("should render UserSetupStep on step 2", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });
    });
  });

  describe("Share Code Validation", () => {
    it("should allow entering a share code", async () => {
      render(<JoinBudgetModal {...defaultProps} />);

      const input = screen.getByTestId("share-code-input");
      await userEvent.type(input, "TEST123");

      expect(input).toHaveValue("TEST123");
    });

    it("should call validateShareCode when validate button is clicked", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: null,
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      render(<JoinBudgetModal {...defaultProps} />);

      const input = screen.getByTestId("share-code-input");
      await userEvent.type(input, "TEST123");

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      expect(mockValidateShareCode).toHaveBeenCalledWith("TEST123");
    });

    it("should show validating state", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: null,
        creatorInfo: null,
        isValidating: true,
        validateShareCode: vi.fn(),
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      render(<JoinBudgetModal {...defaultProps} />);

      expect(screen.getByText("Validating...")).toBeInTheDocument();
    });

    it("should display share info when code is valid", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);
      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });
    });
  });

  describe("User Setup", () => {
    beforeEach(async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);
    });

    it("should allow entering user name", async () => {
      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });

      const nameInput = screen.getByTestId("user-name-input");
      await userEvent.type(nameInput, "John Doe");

      expect(nameInput).toHaveValue("John Doe");
    });

    it("should allow entering password", async () => {
      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });

      const passwordInput = screen.getByTestId("password-input");
      await userEvent.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });

    it("should allow setting user color", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);
      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });

      const colorInput = screen.getByTestId("user-color-input");
      expect(colorInput).toBeInTheDocument();
      expect(colorInput).toHaveValue("#a855f7"); // Default color
    });

    it("should go back to step 1 when back button is clicked", async () => {
      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });

      const backButton = screen.getByText("Back");
      await userEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByTestId("share-code-step")).toBeInTheDocument();
      });
    });
  });

  describe("Budget Joining", () => {
    it("should call joinBudget when join button is clicked", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const { useBudgetJoining } = await import("@/hooks/sharing/useBudgetJoining");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);
      const mockJoinBudget = vi.fn();

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      vi.mocked(useBudgetJoining).mockReturnValue({
        isJoining: false,
        joinBudget: mockJoinBudget,
      } as ReturnType<typeof useBudgetJoining>);

      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByTestId("user-setup-step")).toBeInTheDocument();
      });

      const joinButton = screen.getByText("Join Budget");
      await userEvent.click(joinButton);

      expect(mockJoinBudget).toHaveBeenCalledWith({
        shareCode: "",
        password: "",
        userName: "",
        userColor: "#a855f7",
        onJoinSuccess: mockOnJoinSuccess,
        onClose: mockOnClose,
      });
    });

    it("should show joining state", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const { useBudgetJoining } = await import("@/hooks/sharing/useBudgetJoining");
      const mockValidateShareCode = vi.fn().mockResolvedValue(true);

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: { budgetName: "Test Budget" },
        creatorInfo: null,
        isValidating: false,
        validateShareCode: mockValidateShareCode,
        resetValidation: vi.fn(),
      } as ReturnType<typeof useShareCodeValidation>);

      vi.mocked(useBudgetJoining).mockReturnValue({
        isJoining: true,
        joinBudget: vi.fn(),
      } as ReturnType<typeof useBudgetJoining>);

      render(<JoinBudgetModal {...defaultProps} />);

      const validateButton = screen.getByText("Validate Share Code");
      await userEvent.click(validateButton);

      await waitFor(() => {
        expect(screen.getByText("Joining...")).toBeInTheDocument();
      });
    });
  });

  describe("State Reset", () => {
    it("should reset state when modal closes", async () => {
      const { useShareCodeValidation } = await import("@/hooks/sharing/useShareCodeValidation");
      const mockResetValidation = vi.fn();

      vi.mocked(useShareCodeValidation).mockReturnValue({
        shareInfo: null,
        creatorInfo: null,
        isValidating: false,
        validateShareCode: vi.fn(),
        resetValidation: mockResetValidation,
      } as ReturnType<typeof useShareCodeValidation>);

      const { rerender } = render(<JoinBudgetModal {...defaultProps} />);

      rerender(<JoinBudgetModal {...defaultProps} isOpen={false} />);

      expect(mockResetValidation).toHaveBeenCalled();
    });
  });
});
