import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import logger from "@/utils/core/common/logger";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import { SyncMutex } from "@/utils/features/sync/SyncMutex";
import {
  handleExistingUserLogin,
  handleSharedBudgetJoin,
  handleNewUserSetup,
} from "@/utils/platform/auth/authFlowHelpers";

import type { UserData, UpdateProfileInput as UserProfile } from "./useAuth.types";

interface AuthError extends Error {
  code?: string;
}

/**
 * Custom hook for authentication flow management
 * Extracts authentication logic from Layout component
 * Uses SyncMutex to prevent concurrent auth operations
 */
const useAuthFlow = () => {
  const auth = useAuth();
  const {
    isUnlocked,
    user: currentUser,
    login,
    logout,
    changePassword,
    updateProfile,
    securityContext: { encryptionKey, budgetId, salt },
  } = auth;

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  // Create a dedicated mutex for auth operations to prevent race conditions
  const authMutex = useMemo(() => new SyncMutex("AuthFlow"), []);

  const handleSetup = useCallback(
    async (userDataOrPassword: string | UserData) => {
      return authMutex.execute(async () => {
        // Handle three scenarios:
        // 1. Existing user login (string password)
        // 2. Shared budget join (object with budgetId)
        // 3. New user setup (object without budgetId)
        const isExistingUser = typeof userDataOrPassword === "string";
        const isSharedBudgetJoin =
          typeof userDataOrPassword === "object" && userDataOrPassword?.budgetId;
        const password = isExistingUser ? userDataOrPassword : userDataOrPassword.password || "";
        const userData = isExistingUser ? undefined : userDataOrPassword;

        logger.auth("Layout handleSetup called", {
          hasUserData: !!userData,
          isExistingUser,
          isSharedBudgetJoin,
          hasPassword: !!password,
        });

        if (!password) {
          throw new Error("Password is required");
        }
        logger.auth("🚨 DEBUG VERSION 2: useAuthFlow.js with debug logging is running!");

        try {
          if (isExistingUser) {
            return await handleExistingUserLogin(password, login);
          }

          if (isSharedBudgetJoin && userData) {
            return await handleSharedBudgetJoin(password, userData, login);
          }

          // New user setup flow - userData is guaranteed to be non-null here
          if (userData) {
            return await handleNewUserSetup(password, userData, login);
          }
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
      }, "handleSetup");
    },
    [authMutex, login, showErrorToast]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleChangePassword = useCallback(
    async (oldPass: string, newPass: string) => {
      return authMutex.execute(async () => {
        const result = await changePassword({ oldPassword: oldPass, newPassword: newPass });
        if (!result.success) {
          showErrorToast(`Password change failed: ${result.error}`, "Password Change Failed");
        } else {
          showSuccessToast("Password updated successfully", "Password Changed");
        }
      }, "handleChangePassword");
    },
    [authMutex, changePassword, showErrorToast, showSuccessToast]
  );

  const handleUpdateProfile = useCallback(
    async (updatedProfile: UserProfile) => {
      return authMutex.execute(async () => {
        const result = await updateProfile(updatedProfile);
        if (!result.success) {
          throw new Error(result.error);
        }
      }, "handleUpdateProfile");
    },
    [authMutex, updateProfile]
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
