import { renderHook, act } from "@testing-library/react";
import { useAuthFlow } from "../useAuthFlow";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import {
  handleExistingUserLogin,
  handleSharedBudgetJoin,
  handleNewUserSetup,
} from "@/utils/platform/auth/authFlowHelpers";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/hooks/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/utils/core/common/toastHelpers", () => ({
  useToastHelpers: vi.fn(),
}));

vi.mock("@/utils/platform/auth/authFlowHelpers", () => ({
  handleExistingUserLogin: vi.fn(),
  handleSharedBudgetJoin: vi.fn(),
  handleNewUserSetup: vi.fn(),
}));

vi.mock("@/utils/core/common/logger", () => ({
  default: {
    auth: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useAuthFlow", () => {
  const mockAuth = {
    isUnlocked: false,
    user: { uid: "test-user" },
    login: vi.fn(),
    logout: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
    securityContext: {
      encryptionKey: "mock-key",
      budgetId: "mock-budget",
      salt: "mock-salt",
    },
  };

  const mockToast = {
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue(mockAuth);
    (useToastHelpers as any).mockReturnValue(mockToast);
  });

  it("should expose correct state from useAuth", () => {
    const { result } = renderHook(() => useAuthFlow());

    expect(result.current.isUnlocked).toBe(mockAuth.isUnlocked);
    expect(result.current.currentUser).toEqual(mockAuth.user);
    expect(result.current.encryptionKey).toBe(mockAuth.securityContext.encryptionKey);
  });

  describe("handleSetup", () => {
    it("should call handleExistingUserLogin for string input", async () => {
      const { result } = renderHook(() => useAuthFlow());
      const password = "test-password";

      await act(async () => {
        await result.current.handleSetup(password);
      });

      expect(handleExistingUserLogin).toHaveBeenCalledWith(password, mockAuth.login);
    });

    it("should call handleSharedBudgetJoin for object with budgetId", async () => {
      const { result } = renderHook(() => useAuthFlow());
      const userData = { password: "pw", budgetId: "shared-budget", email: "test@ex.com" };

      await act(async () => {
        await result.current.handleSetup(userData);
      });

      expect(handleSharedBudgetJoin).toHaveBeenCalledWith("pw", userData, mockAuth.login);
    });

    it("should call handleNewUserSetup for object without budgetId", async () => {
      const { result } = renderHook(() => useAuthFlow());
      const userData = { password: "pw", email: "test@ex.com" };

      await act(async () => {
        await result.current.handleSetup(userData);
      });

      expect(handleNewUserSetup).toHaveBeenCalledWith("pw", userData, mockAuth.login);
    });

    it("should show error toast on failure", async () => {
      const errorMsg = "Something went wrong";
      (handleExistingUserLogin as any).mockRejectedValue(new Error(errorMsg));

      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        await result.current.handleSetup("wrong-pw");
      });

      expect(mockToast.showErrorToast).toHaveBeenCalledWith(
        expect.stringContaining(errorMsg),
        "Setup Error"
      );
    });

    it("should not show error toast for INVALID_PASSWORD_OFFER_NEW_BUDGET code", async () => {
      const error: any = new Error("Custom error");
      error.code = "INVALID_PASSWORD_OFFER_NEW_BUDGET";
      (handleExistingUserLogin as any).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        try {
          await result.current.handleSetup("wrong-pw");
        } catch (e) {
          // Expected
        }
      });

      expect(mockToast.showErrorToast).not.toHaveBeenCalled();
    });
  });

  describe("handleLogout", () => {
    it("should call logout", () => {
      const { result } = renderHook(() => useAuthFlow());

      act(() => {
        result.current.handleLogout();
      });

      expect(mockAuth.logout).toHaveBeenCalled();
    });
  });

  describe("handleChangePassword", () => {
    it("should call changePassword and show success toast on success", async () => {
      mockAuth.changePassword.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        await result.current.handleChangePassword("old", "new");
      });

      expect(mockAuth.changePassword).toHaveBeenCalledWith({
        oldPassword: "old",
        newPassword: "new",
      });
      expect(mockToast.showSuccessToast).toHaveBeenCalledWith(
        "Password updated successfully",
        "Password Changed"
      );
    });

    it("should show error toast on failure", async () => {
      mockAuth.changePassword.mockResolvedValue({ success: false, error: "Wrong old password" });
      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        await result.current.handleChangePassword("old", "new");
      });

      expect(mockToast.showErrorToast).toHaveBeenCalledWith(
        expect.stringContaining("Wrong old password"),
        "Password Change Failed"
      );
    });
  });

  describe("handleUpdateProfile", () => {
    it("should call updateProfile successfully", async () => {
      mockAuth.updateProfile.mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        await result.current.handleUpdateProfile({ displayName: "New Name" });
      });

      expect(mockAuth.updateProfile).toHaveBeenCalledWith({ displayName: "New Name" });
    });

    it("should throw error if update fails", async () => {
      mockAuth.updateProfile.mockResolvedValue({ success: false, error: "Profile update failed" });
      const { result } = renderHook(() => useAuthFlow());

      await expect(
        act(async () => {
          await result.current.handleUpdateProfile({ displayName: "New Name" });
        })
      ).rejects.toThrow("Profile update failed");
    });
  });

  describe("SyncMutex integration", () => {
    it("should serialize multiple concurrent handleSetup calls", async () => {
      const executionOrder: string[] = [];

      (handleExistingUserLogin as any).mockImplementation(async (password: string) => {
        executionOrder.push(`start-${password}`);
        // Simulate async work
        await new Promise((resolve) => setTimeout(resolve, 50));
        executionOrder.push(`end-${password}`);
        return { success: true };
      });

      const { result } = renderHook(() => useAuthFlow());

      // Fire multiple concurrent calls
      await act(async () => {
        await Promise.all([
          result.current.handleSetup("password1"),
          result.current.handleSetup("password2"),
          result.current.handleSetup("password3"),
        ]);
      });

      // Verify operations were serialized (each start is followed by its own end)
      expect(executionOrder).toEqual([
        "start-password1",
        "end-password1",
        "start-password2",
        "end-password2",
        "start-password3",
        "end-password3",
      ]);
    });

    it("should serialize handleChangePassword when handleSetup is in progress", async () => {
      const executionOrder: string[] = [];

      (handleExistingUserLogin as any).mockImplementation(async () => {
        executionOrder.push("setup-start");
        await new Promise((resolve) => setTimeout(resolve, 50));
        executionOrder.push("setup-end");
        return { success: true };
      });

      mockAuth.changePassword.mockImplementation(async () => {
        executionOrder.push("password-change-start");
        await new Promise((resolve) => setTimeout(resolve, 50));
        executionOrder.push("password-change-end");
        return { success: true };
      });

      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        // Start both operations concurrently
        await Promise.all([
          result.current.handleSetup("password"),
          result.current.handleChangePassword("old", "new"),
        ]);
      });

      // Verify handleChangePassword waited for handleSetup to complete
      expect(executionOrder).toEqual([
        "setup-start",
        "setup-end",
        "password-change-start",
        "password-change-end",
      ]);
    });

    it("should release mutex lock even when operation throws error", async () => {
      const executionOrder: string[] = [];

      (handleExistingUserLogin as any)
        .mockImplementationOnce(async () => {
          executionOrder.push("first-start");
          await new Promise((resolve) => setTimeout(resolve, 30));
          executionOrder.push("first-error");
          throw new Error("First operation failed");
        })
        .mockImplementationOnce(async () => {
          executionOrder.push("second-start");
          await new Promise((resolve) => setTimeout(resolve, 30));
          executionOrder.push("second-success");
          return { success: true };
        });

      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        // Both calls execute, first shows error toast, second succeeds
        await Promise.all([
          result.current.handleSetup("password1"),
          result.current.handleSetup("password2"),
        ]);
      });

      // Verify second operation executed after first one failed
      // First operation error was caught and toast shown, but mutex was released
      expect(executionOrder).toEqual([
        "first-start",
        "first-error",
        "second-start",
        "second-success",
      ]);

      // Verify both operations were attempted
      expect(handleExistingUserLogin).toHaveBeenCalledTimes(2);

      // Verify error toast was shown for the first operation
      expect(mockToast.showErrorToast).toHaveBeenCalledWith(
        expect.stringContaining("First operation failed"),
        "Setup Error"
      );
    });

    it("should allow different operations to be serialized", async () => {
      const executionOrder: string[] = [];

      (handleExistingUserLogin as any).mockImplementation(async () => {
        executionOrder.push("setup-start");
        await new Promise((resolve) => setTimeout(resolve, 30));
        executionOrder.push("setup-end");
        return { success: true };
      });

      mockAuth.updateProfile.mockImplementation(async () => {
        executionOrder.push("profile-start");
        await new Promise((resolve) => setTimeout(resolve, 30));
        executionOrder.push("profile-end");
        return { success: true };
      });

      const { result } = renderHook(() => useAuthFlow());

      await act(async () => {
        // Fire multiple different operations concurrently
        await Promise.all([
          result.current.handleSetup("password"),
          result.current.handleUpdateProfile({ displayName: "Test" }),
        ]);
      });

      // Verify operations were serialized
      expect(executionOrder).toEqual(["setup-start", "setup-end", "profile-start", "profile-end"]);
    });
  });
});
