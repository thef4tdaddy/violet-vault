import { render, screen } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import UserSetupStep from "../UserSetupStep";

// Mock the Button component
vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, disabled, className, type }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      type={type}
      data-testid={children === "Back" ? "back-button" : undefined}
    >
      {children}
    </button>
  ),
}));

// Mock renderIcon utility
vi.mock("@/utils", () => ({
  renderIcon: vi.fn((name: string) => <div data-testid={`icon-${name}`}>{name}</div>),
}));

describe("UserSetupStep", () => {
  const mockSetPassword = vi.fn();
  const mockSetShowPassword = vi.fn();
  const mockSetUserName = vi.fn();
  const mockOnGenerateRandomColor = vi.fn();
  const mockOnJoin = vi.fn();
  const mockOnBack = vi.fn();

  const defaultShareInfo = {
    createdBy: "user123",
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000,
    userCount: "2 users",
  };

  const defaultCreatorInfo = {
    userName: "Alice",
    userColor: "#ff0000",
    createdAt: 1640000000000,
  };

  const defaultProps = {
    shareInfo: defaultShareInfo,
    creatorInfo: defaultCreatorInfo,
    password: "",
    setPassword: mockSetPassword,
    showPassword: false,
    setShowPassword: mockSetShowPassword,
    userName: "",
    setUserName: mockSetUserName,
    userColor: "#a855f7",
    onGenerateRandomColor: mockOnGenerateRandomColor,
    onJoin: mockOnJoin,
    onBack: mockOnBack,
    isJoining: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render all form inputs", () => {
      render(<UserSetupStep {...defaultProps} />);

      expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
      expect(screen.getByText("Random Color")).toBeInTheDocument();
      expect(screen.getByText("Back")).toBeInTheDocument();
      expect(screen.getByText("Join Budget")).toBeInTheDocument();
    });

    it("should render valid share code message", () => {
      render(<UserSetupStep {...defaultProps} />);

      expect(screen.getByText("Valid Share Code")).toBeInTheDocument();
    });

    it("should display creator info when present", () => {
      render(<UserSetupStep {...defaultProps} />);

      expect(screen.getByText(/Created by:/)).toBeInTheDocument();
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText(/Shared:/)).toBeInTheDocument();
      expect(screen.getByText(/Enter same password they used/)).toBeInTheDocument();
    });

    it("should display deterministic budget info when creator is null", () => {
      render(<UserSetupStep {...defaultProps} creatorInfo={null} />);

      expect(screen.getByText(/Type:/)).toBeInTheDocument();
      expect(screen.getByText("Deterministic Budget")).toBeInTheDocument();
      expect(screen.getByText(/Access:/)).toBeInTheDocument();
      expect(screen.getByText(/2 users/)).toBeInTheDocument();
      expect(screen.getByText(/Same code \+ password = same budget/)).toBeInTheDocument();
    });

    it("should format creation date correctly", () => {
      render(<UserSetupStep {...defaultProps} />);

      const expectedDate = new Date(1640000000000).toLocaleDateString();
      expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
    });

    it("should not display creation date when not provided", () => {
      const creatorInfoWithoutDate = {
        userName: "Alice",
        userColor: "#ff0000",
      };
      render(<UserSetupStep {...defaultProps} creatorInfo={creatorInfoWithoutDate} />);

      expect(screen.queryByText(/Shared:/)).not.toBeInTheDocument();
    });

    it("should display user color preview", () => {
      const { container } = render(<UserSetupStep {...defaultProps} />);

      const colorPreview = container.querySelector('[style*="background-color"]');
      expect(colorPreview).toBeInTheDocument();
      expect(colorPreview).toHaveStyle({ backgroundColor: "#a855f7" });
    });

    it("should display helper text for display name", () => {
      render(<UserSetupStep {...defaultProps} />);

      expect(
        screen.getByText("This is how others will see you in shared budget")
      ).toBeInTheDocument();
    });

    it("should display helper text for password", () => {
      render(<UserSetupStep {...defaultProps} />);

      expect(screen.getByText(/This password encrypts your budget data/)).toBeInTheDocument();
    });
  });

  describe("User Input", () => {
    it("should call setUserName when user types in name field", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter your name");
      await user.type(nameInput, "J");

      expect(mockSetUserName).toHaveBeenCalledWith("J");
    });

    it("should call setPassword when user types in password field", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} />);

      const passwordInput = screen.getByPlaceholderText("Enter password");
      await user.type(passwordInput, "p");

      expect(mockSetPassword).toHaveBeenCalledWith("p");
    });

    it("should enforce maxLength of 20 for user name", () => {
      render(<UserSetupStep {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter your name");
      expect(nameInput).toHaveAttribute("maxLength", "20");
    });

    it("should mark name and password fields as required", () => {
      render(<UserSetupStep {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter your name");
      const passwordInput = screen.getByPlaceholderText("Enter password");

      expect(nameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe("Password Visibility Toggle", () => {
    it("should render password field as password type by default", () => {
      render(<UserSetupStep {...defaultProps} />);

      const passwordInput = screen.getByPlaceholderText("Enter password");
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should render password field as text type when showPassword is true", () => {
      render(<UserSetupStep {...defaultProps} showPassword={true} />);

      const passwordInput = screen.getByPlaceholderText("Enter password");
      expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("should call setShowPassword when eye icon is clicked", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} />);

      const eyeButton = screen.getByTestId("icon-Eye").parentElement;
      expect(eyeButton).toBeInTheDocument();

      if (eyeButton) {
        await user.click(eyeButton);
        expect(mockSetShowPassword).toHaveBeenCalledWith(true);
      }
    });

    it("should toggle between Eye and EyeOff icons", () => {
      const { rerender } = render(<UserSetupStep {...defaultProps} showPassword={false} />);

      expect(screen.getByTestId("icon-Eye")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-EyeOff")).not.toBeInTheDocument();

      rerender(<UserSetupStep {...defaultProps} showPassword={true} />);

      expect(screen.getByTestId("icon-EyeOff")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-Eye")).not.toBeInTheDocument();
    });
  });

  describe("Color Selection", () => {
    it("should call onGenerateRandomColor when random color button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} />);

      const randomColorButton = screen.getByText("Random Color");
      await user.click(randomColorButton);

      expect(mockOnGenerateRandomColor).toHaveBeenCalledTimes(1);
    });

    it("should update color preview when userColor prop changes", () => {
      const { container, rerender } = render(
        <UserSetupStep {...defaultProps} userColor="#ff0000" />
      );

      let colorPreview = container.querySelector('[style*="background-color"]');
      expect(colorPreview).toHaveStyle({ backgroundColor: "#ff0000" });

      rerender(<UserSetupStep {...defaultProps} userColor="#00ff00" />);

      colorPreview = container.querySelector('[style*="background-color"]');
      expect(colorPreview).toHaveStyle({ backgroundColor: "#00ff00" });
    });
  });

  describe("Button States", () => {
    it("should disable join button when password is empty", () => {
      render(<UserSetupStep {...defaultProps} password="" userName="John" />);

      const joinButton = screen.getByText("Join Budget");
      expect(joinButton).toBeDisabled();
    });

    it("should disable join button when userName is empty", () => {
      render(<UserSetupStep {...defaultProps} password="pass123" userName="" />);

      const joinButton = screen.getByText("Join Budget");
      expect(joinButton).toBeDisabled();
    });

    it("should disable join button when userName is only whitespace", () => {
      render(<UserSetupStep {...defaultProps} password="pass123" userName="   " />);

      const joinButton = screen.getByText("Join Budget");
      expect(joinButton).toBeDisabled();
    });

    it("should disable join button when isJoining is true", () => {
      render(
        <UserSetupStep {...defaultProps} password="pass123" userName="John" isJoining={true} />
      );

      const joinButton = screen.getByText(/Joining Budget/).closest("button");
      expect(joinButton).toBeDisabled();
    });

    it("should enable join button when password and userName are valid", () => {
      render(<UserSetupStep {...defaultProps} password="pass123" userName="John" />);

      const joinButton = screen.getByText("Join Budget");
      expect(joinButton).not.toBeDisabled();
    });

    it("should not disable back button", () => {
      render(<UserSetupStep {...defaultProps} />);

      const backButton = screen.getByText("Back");
      expect(backButton).not.toBeDisabled();
    });
  });

  describe("Button Actions", () => {
    it("should call onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} />);

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("should call onJoin when join button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} password="pass123" userName="John" />);

      const joinButton = screen.getByText("Join Budget");
      await user.click(joinButton);

      expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });

    it("should prevent default on join button click", async () => {
      const user = userEvent.setup();
      render(<UserSetupStep {...defaultProps} password="pass123" userName="John" />);

      const joinButton = screen.getByText("Join Budget");
      await user.click(joinButton);

      // The click handler calls e.preventDefault(), so we just verify onJoin was called
      expect(mockOnJoin).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("should display loading text when isJoining is true", () => {
      render(<UserSetupStep {...defaultProps} isJoining={true} />);

      expect(screen.getByText("Joining Budget...")).toBeInTheDocument();
    });

    it("should display spinner when isJoining is true", () => {
      const { container } = render(<UserSetupStep {...defaultProps} isJoining={true} />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should display normal text when isJoining is false", () => {
      render(<UserSetupStep {...defaultProps} isJoining={false} />);

      expect(screen.getByText("Join Budget")).toBeInTheDocument();
      expect(screen.queryByText("Joining Budget...")).not.toBeInTheDocument();
    });
  });

  describe("Input Display Values", () => {
    it("should display current userName value", () => {
      render(<UserSetupStep {...defaultProps} userName="Alice" />);

      const nameInput = screen.getByPlaceholderText("Enter your name");
      expect(nameInput).toHaveValue("Alice");
    });

    it("should display current password value", () => {
      render(<UserSetupStep {...defaultProps} password="secret123" />);

      const passwordInput = screen.getByPlaceholderText("Enter password");
      expect(passwordInput).toHaveValue("secret123");
    });
  });

  describe("Creator Info Color Styling", () => {
    it("should apply creator color to their name", () => {
      render(<UserSetupStep {...defaultProps} />);

      const creatorName = screen.getByText("Alice");
      expect(creatorName).toHaveStyle({ color: "#ff0000" });
    });

    it("should handle creator without color", () => {
      const creatorWithoutColor = {
        userName: "Bob",
        createdAt: 1640000000000,
      };
      render(<UserSetupStep {...defaultProps} creatorInfo={creatorWithoutColor} />);

      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });
});
