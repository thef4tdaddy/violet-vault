import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useUserSetup } from "../useUserSetup";
import { globalToast } from "../../../stores/ui/toastStore";

// Mock dependencies
vi.mock("../../../stores/ui/toastStore", () => ({
  globalToast: {
    showError: vi.fn(),
  },
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../../utils/auth/shareCodeManager", () => ({
  shareCodeManager: {
    generateShareCode: vi.fn(() => "test-share-code"),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

vi.mock("../useAuthenticationManager", () => ({
  useAuthenticationManager: vi.fn(() => ({
    authOperations: {
      importAndLogin: vi.fn(),
      setupAuth: vi.fn(),
    },
  })),
}));

describe("useUserSetup", () => {
  let mockOnSetupComplete: any;

  beforeEach(() => {
    mockOnSetupComplete = vi.fn();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    (globalToast.showError as any).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values for new user", () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    expect(result.current.step).toBe(1);
    expect(result.current.masterPassword).toBe("");
    expect(result.current.userName).toBe("");
    expect(result.current.userColor).toBe("#a855f7");
    expect(result.current.showPassword).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isReturningUser).toBe(false);
  });

  it("should initialize with saved profile for returning user", () => {
    const savedProfile = {
      userName: "John Doe",
      userColor: "#10b981",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    expect(result.current.userName).toBe("John Doe");
    expect(result.current.userColor).toBe("#10b981");
    expect(result.current.isReturningUser).toBe(true);
  });

  it("should handle malformed saved profile gracefully", () => {
    mockLocalStorage.getItem.mockReturnValue("invalid json");

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    expect(result.current.isReturningUser).toBe(false);
    expect(result.current.userName).toBe("");
  });

  it("should update password correctly", () => {
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("newpassword");
    });

    expect(result.current.masterPassword).toBe("newpassword");
  });

  it("should update name correctly", () => {
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handleNameChange("Jane Smith");
    });

    expect(result.current.userName).toBe("Jane Smith");
  });

  it("should toggle password visibility", () => {
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.showPassword).toBe(true);

    act(() => {
      result.current.togglePasswordVisibility();
    });

    expect(result.current.showPassword).toBe(false);
  });

  it("should proceed to step 2 for new users", async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("password");
    });

    await act(async () => {
      await result.current.handleStep1Continue({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.step).toBe(2);
  });

  it("should attempt login for returning users", async () => {
    const savedProfile = { userName: "John", userColor: "#a855f7" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));
    mockOnSetupComplete.mockResolvedValue();

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("password");
    });

    await act(async () => {
      await result.current.handleStep1Continue({ preventDefault: vi.fn() } as any);
    });

    expect(mockOnSetupComplete).toHaveBeenCalledWith("password");
  });

  it("should show error for returning user with empty password", async () => {
    const savedProfile = { userName: "John", userColor: "#a855f7" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    await act(async () => {
      await result.current.handleStep1Continue({ preventDefault: vi.fn() } as any);
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "Please enter your password",
      "Password Required",
      8000
    );
  });

  it("should handle login failure for returning users", async () => {
    const savedProfile = { userName: "John", userColor: "#a855f7" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));
    mockOnSetupComplete.mockRejectedValue(new Error("Invalid password"));

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("wrongpassword");
    });

    await act(async () => {
      await result.current.handleStep1Continue({ preventDefault: vi.fn() } as any);
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "Incorrect password. Please try again.",
      "Login Failed",
      8000
    );
  });

  it("should handle successful start tracking", async () => {
    mockOnSetupComplete.mockResolvedValue();
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("password");
      result.current.handleNameChange("Jane");
    });

    await act(async () => {
      await result.current.handleStartTrackingClick({
        preventDefault: vi.fn(),
      } as any);
    });

    expect(result.current.step).toBe(3);
    expect(result.current.shareCode).toBe("test-share-code");
    expect(globalToast.showError).not.toHaveBeenCalled();
  });

  it("should validate required fields for start tracking", async () => {
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    await act(async () => {
      await result.current.handleStartTrackingClick({
        preventDefault: vi.fn(),
      } as any);
    });

    expect(globalToast.showError).toHaveBeenCalledWith(
      "Please fill in both password and name",
      "Required Fields",
      8000
    );
  });

  it("should clear saved profile", async () => {
    const savedProfile = { userName: "John", userColor: "#10b981" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    await act(async () => {
      await result.current.clearSavedProfile();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("userProfile");
    expect(result.current.userName).toBe("");
    expect(result.current.userColor).toBe("#a855f7");
    expect(result.current.step).toBe(1);
  });

  it("should switch to change profile mode", () => {
    const savedProfile = { userName: "John", userColor: "#a855f7" };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProfile));

    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.switchToChangeProfile();
    });

    expect(result.current.isReturningUser).toBe(false);
    expect(result.current.step).toBe(2);
  });

  it("should go back to step 1", async () => {
    mockLocalStorage.getItem.mockReturnValue(null); // Ensure new user flow
    const { result } = renderHook(() => useUserSetup(mockOnSetupComplete));

    act(() => {
      result.current.handlePasswordChange("password");
    });

    await act(async () => {
      await result.current.handleStep1Continue({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.step).toBe(2);

    act(() => {
      result.current.goBackToStep1();
    });

    expect(result.current.step).toBe(1);
  });
});
