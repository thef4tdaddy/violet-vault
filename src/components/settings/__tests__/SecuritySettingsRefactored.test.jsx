import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SecuritySettings from "../SecuritySettingsRefactored";

// Mock the custom hook
jest.mock("../../../hooks/security/useSecuritySettingsLogic", () => ({
  useSecuritySettingsLogic: jest.fn(() => ({
    isLocked: false,
    securitySettings: {
      autoLockEnabled: true,
      autoLockTimeout: 30,
      lockOnPageHide: false,
      securityLoggingEnabled: true,
      clipboardClearTimeout: 60,
    },
    securityEvents: [
      { id: 1, type: "LOGIN", description: "User logged in", timestamp: Date.now() },
    ],
    showEvents: false,
    showClearConfirm: false,
    handleSettingChange: jest.fn(),
    exportSecurityEvents: jest.fn(),
    timeUntilAutoLock: jest.fn(() => "Active"),
    toggleEventsDisplay: jest.fn(),
    showClearConfirmDialog: jest.fn(),
    hideClearConfirmDialog: jest.fn(),
    confirmClearEvents: jest.fn(),
  })),
}));

// Mock all section components
jest.mock("../sections/SecurityStatusSection", () => {
  return function SecurityStatusSection() {
    return <div data-testid="security-status-section">Security Status Section</div>;
  };
});

jest.mock("../sections/AutoLockSettingsSection", () => {
  return function AutoLockSettingsSection() {
    return <div data-testid="auto-lock-section">Auto Lock Section</div>;
  };
});

jest.mock("../sections/ClipboardSecuritySection", () => {
  return function ClipboardSecuritySection() {
    return <div data-testid="clipboard-section">Clipboard Section</div>;
  };
});

jest.mock("../sections/SecurityLoggingSection", () => {
  return function SecurityLoggingSection() {
    return <div data-testid="logging-section">Logging Section</div>;
  };
});

jest.mock("../sections/SecurityActionsSection", () => {
  return function SecurityActionsSection() {
    return <div data-testid="actions-section">Actions Section</div>;
  };
});

jest.mock("../modals/ClearConfirmationModal", () => {
  return function ClearConfirmationModal() {
    return <div data-testid="clear-modal">Clear Confirmation Modal</div>;
  };
});

describe("SecuritySettings (Refactored)", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    render(<SecuritySettings isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText("SECURITY SETTINGS")).not.toBeInTheDocument();
  });

  it("should render all sections when open", () => {
    render(<SecuritySettings {...defaultProps} />);

    expect(screen.getByText("SECURITY SETTINGS")).toBeInTheDocument();
    expect(screen.getByTestId("security-status-section")).toBeInTheDocument();
    expect(screen.getByTestId("auto-lock-section")).toBeInTheDocument();
    expect(screen.getByTestId("clipboard-section")).toBeInTheDocument();
    expect(screen.getByTestId("logging-section")).toBeInTheDocument();
    expect(screen.getByTestId("actions-section")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(<SecuritySettings isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should display correct header content", () => {
    render(<SecuritySettings {...defaultProps} />);

    expect(screen.getByText("SECURITY SETTINGS")).toBeInTheDocument();
    expect(screen.getByText("🔐 Configure app security and privacy options")).toBeInTheDocument();
  });

  it("should apply correct styling classes", () => {
    const { container } = render(<SecuritySettings {...defaultProps} />);

    // Check for glassmorphism and styling classes
    expect(container.querySelector(".glassmorphism")).toBeInTheDocument();
    expect(container.querySelector(".border-2")).toBeInTheDocument();
    expect(container.querySelector(".backdrop-blur-3xl")).toBeInTheDocument();
  });

  it("should have proper structure and layout", () => {
    render(<SecuritySettings {...defaultProps} />);

    // Verify the modal structure
    const modal = screen.getByText("SECURITY SETTINGS").closest(".glassmorphism");
    expect(modal).toHaveClass("rounded-3xl");
    expect(modal).toHaveClass("border-2", "border-black");
  });
});
