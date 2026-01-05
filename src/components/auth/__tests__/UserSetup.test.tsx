import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import UserSetup from "../UserSetup";
import { useUserSetup as useUserSetupOriginal } from "../../../hooks/auth/useUserSetup";
import { AuthProvider } from "@/contexts/AuthContext";

// Mock the custom hook
vi.mock("../../../hooks/auth/useUserSetup");
vi.mock("@/hooks/auth/useAuthManager", () => ({
  useAuthManager: vi.fn(() => ({
    joinBudget: vi.fn(async () => ({ success: true })),
  })),
}));

// Type cast the mocked hook
const useUserSetup = useUserSetupOriginal as unknown as Mock;

// Mock child components
vi.mock("../components/UserSetupHeader", () => ({
  default: ({
    step,
    isReturningUser,
    userName,
  }: {
    step: number;
    isReturningUser: boolean;
    userName: string;
  }) => (
    <div data-testid="header">
      Header: Step {step}, Returning: {isReturningUser.toString()}, User: {userName}
    </div>
  ),
}));

vi.mock("../components/PasswordInput", () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <input
      data-testid="password-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type="password"
    />
  ),
}));

vi.mock("../components/UserNameInput", () => ({
  default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
    <input data-testid="username-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("../components/ColorPicker", () => ({
  default: ({
    selectedColor,
    onColorChange,
  }: {
    selectedColor: string;
    onColorChange: (val: string) => void;
  }) => (
    <div data-testid="color-picker">
      Color: {selectedColor}
      <button onClick={() => onColorChange("#test")}>Change Color</button>
    </div>
  ),
}));

vi.mock("../components/ReturningUserActions", () => ({
  default: ({
    onSubmit,
    onChangeProfile,
    onStartFresh,
  }: {
    onSubmit: () => void;
    onChangeProfile: () => void;
    onStartFresh: () => void;
  }) => (
    <div data-testid="returning-user-actions">
      <button onClick={onSubmit}>Login</button>
      <button onClick={onChangeProfile}>Change Profile</button>
      <button onClick={onStartFresh}>Start Fresh</button>
    </div>
  ),
}));

vi.mock("../components/StepButtons", () => ({
  default: ({
    step,
    onContinue,
    onBack,
    onStartTracking,
  }: {
    step: number;
    onContinue: () => void;
    onBack: () => void;
    onStartTracking: () => void;
  }) => (
    <div data-testid="step-buttons">
      Step {step} buttons
      {onContinue && <button onClick={onContinue}>Continue</button>}
      {onBack && <button onClick={onBack}>Back</button>}
      {onStartTracking && <button onClick={onStartTracking}>Start Tracking</button>}
    </div>
  ),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    auth: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("UserSetup", () => {
  let mockOnSetupComplete: Mock;
  let mockHookReturn: any;

  beforeEach(() => {
    mockOnSetupComplete = vi.fn();

    mockHookReturn = {
      step: 1,
      masterPassword: "",
      userName: "",
      userColor: "#a855f7",
      showPassword: false,
      isLoading: false,
      isReturningUser: false,
      handleSubmit: vi.fn(),
      handleStep1Continue: vi.fn(),
      handleStartTrackingClick: vi.fn(),
      clearSavedProfile: vi.fn(),
      handlePasswordChange: vi.fn(),
      handleNameChange: vi.fn(),
      togglePasswordVisibility: vi.fn(),
      switchToChangeProfile: vi.fn(),
      goBackToStep1: vi.fn(),
      setUserColor: vi.fn(),
    };

    useUserSetup.mockReturnValue(mockHookReturn);
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  it("should render with correct structure", () => {
    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(document.querySelector("form")).toBeInTheDocument();
    expect(
      screen.getByText("OUR DATA IS ENCRYPTED CLIENT-SIDE FOR MAXIMUM SECURITY")
    ).toBeInTheDocument();
  });

  it("should show password input for step 1", () => {
    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("step-buttons")).toBeInTheDocument();
  });

  it("should show returning user actions when user is returning", () => {
    useUserSetup.mockReturnValue({
      ...mockHookReturn,
      isReturningUser: true,
      userName: "John",
    });

    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(screen.getByTestId("returning-user-actions")).toBeInTheDocument();
    expect(screen.queryByTestId("step-buttons")).not.toBeInTheDocument();
  });

  it("should show profile setup for step 2", () => {
    useUserSetup.mockReturnValue({
      ...mockHookReturn,
      step: 2,
    });

    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(screen.queryByTestId("password-input")).not.toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("color-picker")).toBeInTheDocument();
    expect(screen.getByTestId("step-buttons")).toBeInTheDocument();
  });

  it("should not show step 2 components for returning user", () => {
    useUserSetup.mockReturnValue({
      ...mockHookReturn,
      step: 2,
      isReturningUser: true,
    });

    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(screen.queryByTestId("username-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("color-picker")).not.toBeInTheDocument();
  });

  it("should pass correct props to useUserSetup hook", () => {
    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    expect(useUserSetup).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should pass correct props to header component", () => {
    const mockValues = {
      ...mockHookReturn,
      step: 2,
      isReturningUser: true,
      userName: "Jane",
      userColor: "#10b981",
    };
    useUserSetup.mockReturnValue(mockValues);

    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    const header = screen.getByTestId("header");
    expect(header).toHaveTextContent("Step 2");
    expect(header).toHaveTextContent("Returning: true");
    expect(header).toHaveTextContent("User: Jane");
  });

  it("should apply glassmorphism styling", () => {
    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    const container = document.querySelector(".glassmorphism");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass(
      "rounded-lg",
      "p-6",
      "border-2",
      "border-black",
      "bg-purple-100/40",
      "backdrop-blur-sm"
    );
  });

  it("should have background pattern", () => {
    renderWithAuth(<UserSetup onSetupComplete={mockOnSetupComplete} />);

    const backgroundPattern = document.querySelector('[style*="radial-gradient"]');
    expect(backgroundPattern).toBeInTheDocument();
  });
});
