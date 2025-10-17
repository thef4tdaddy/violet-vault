import { useCallback } from "react";
import { useAuthManager } from "./useAuthManager";
import logger from "../../utils/common/logger";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import {
  handleExistingUserLogin,
  handleSharedBudgetJoin,
  handleNewUserSetup,
} from "../../utils/auth/authFlowHelpers";
import type { AuthFlowHook, UserData, AuthResult } from "../../types/auth";

/**
 * Custom hook for authentication flow management
 * Extracts authentication logic from Layout component
 */
const useAuthFlow = (): AuthFlowHook => {
  const {
    isUnlocked,
    user: currentUser,
    login,
    logout,
    changePassword,
    updateProfile,
    securityContext: { encryptionKey, budgetId, salt },
  } = useAuthManager();

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  const handleSetup = useCallback(
    async (userDataOrPassword: string | UserData): Promise<AuthResult> => {
      // Handle three scenarios:
      // 1. Existing user login (string password)
      // 2. Shared budget join (object with budgetId)
      // 3. New user setup (object without budgetId)
      const isExistingUser = typeof userDataOrPassword === "string";
      const isSharedBudgetJoin =
        typeof userDataOrPassword === "object" && userDataOrPassword?.budgetId;
      const password = isExistingUser ? userDataOrPassword : userDataOrPassword.password;
      const userData = isExistingUser ? null : userDataOrPassword;

      logger.auth("Layout handleSetup called", {
        hasUserData: !!userData,
        isExistingUser,
        isSharedBudgetJoin,
        hasPassword: !!password,
      });
      logger.auth("🚨 DEBUG VERSION 2: useAuthFlow.js with debug logging is running!");

      try {
        if (isExistingUser) {
          return await handleExistingUserLogin(password!, login);
        }

        if (isSharedBudgetJoin) {
          return await handleSharedBudgetJoin(password!, userData!, login);
        }

        // New user setup flow
        return await handleNewUserSetup(password!, userData!, login);
      } catch (error) {
        logger.error("❌ Setup error:", error);

        // If this is our enhanced password validation error, re-throw it
        if (error instanceof Error && (error as any).code) {
          throw error;
        }

        // Generic error handling
        const message = error instanceof Error ? error.message : "Setup failed";
        showErrorToast(message);
        return {
          success: false,
          error: message,
        };
      }
    },
    [login, showErrorToast]
  );

  const handleLogout = useCallback(() => {
    logger.auth("Logout requested");
    logout();
    showSuccessToast("Logged out successfully");
  }, [logout, showSuccessToast]);

  const handleChangePassword = useCallback(
    async (oldPassword: string, newPassword: string): Promise<AuthResult> => {
      try {
        const result = await changePassword(oldPassword, newPassword);
        if (result.success) {
          showSuccessToast("Password changed successfully");
        } else {
          showErrorToast(result.error || "Failed to change password");
        }
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Password change failed";
        logger.error("Password change error:", error);
        showErrorToast(message);
        return {
          success: false,
          error: message,
        };
      }
    },
    [changePassword, showSuccessToast, showErrorToast]
  );

  const handleUpdateProfile = useCallback(
    async (updatedProfile: Partial<UserData>): Promise<AuthResult> => {
      try {
        const result = await updateProfile(updatedProfile);
        if (result.success) {
          showSuccessToast("Profile updated successfully");
        } else {
          showErrorToast(result.error || "Failed to update profile");
        }
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Profile update failed";
        logger.error("Profile update error:", error);
        showErrorToast(message);
        return {
          success: false,
          error: message,
        };
      }
    },
    [updateProfile, showSuccessToast, showErrorToast]
  );

  return {
    // State
    isUnlocked,
    encryptionKey,
    currentUser,
    budgetId,
    salt,

    // Actions
    handleSetup,
    handleLogout,
    handleChangePassword,
    handleUpdateProfile,
  };
};

export default useAuthFlow;
