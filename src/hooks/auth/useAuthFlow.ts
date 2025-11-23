import { useCallback } from "react";
import { useAuthManager } from "./useAuthManager";
import logger from "../../utils/common/logger";
import { useToastHelpers } from "../../utils/common/toastHelpers";
import {
  handleExistingUserLogin,
  handleSharedBudgetJoin,
  handleNewUserSetup,
} from "../../utils/auth/authFlowHelpers";

// Type definitions
interface UserData {
  budgetId?: string;
  password: string;
  userName?: string;
  userColor?: string;
}

interface UserProfile {
  userName?: string;
  userColor?: string;
  email?: string;
  displayName?: string;
}

interface AuthError extends Error {
  code?: string;
}

/**
 * Custom hook for authentication flow management
 * Extracts authentication logic from Layout component
 */
const useAuthFlow = () => {
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
    async (userDataOrPassword: string | UserData) => {
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
          return await handleExistingUserLogin(password, login);
        }

        if (isSharedBudgetJoin) {
          return await handleSharedBudgetJoin(password, userData, login);
        }

        // New user setup flow
        return await handleNewUserSetup(password, userData, login);
      } catch (error) {
        logger.error("❌ Setup error:", error);

        // If this is our enhanced password validation error, re-throw it
        const authError = error as AuthError;
        if (authError.code === "INVALID_PASSWORD_OFFER_NEW_BUDGET") {
          throw error;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        showErrorToast(`Setup error: ${errorMessage}`, "Setup Error");
      }
    },
    [login, showErrorToast]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleChangePassword = useCallback(
    async (oldPass: string, newPass: string) => {
      const result = await changePassword(oldPass, newPass);
      if (!result.success) {
        showErrorToast(`Password change failed: ${result.error}`, "Password Change Failed");
      } else {
        showSuccessToast("Password updated successfully", "Password Changed");
      }
    },
    [changePassword, showErrorToast, showSuccessToast]
  );

  const handleUpdateProfile = useCallback(
    async (updatedProfile: UserProfile) => {
      const result = await updateProfile(updatedProfile);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [updateProfile]
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
export { useAuthFlow };
