import { useCallback } from "react";
import { useAuth } from "../../stores/auth/authStore.jsx";
import logger from "../../utils/common/logger";
import { useToastHelpers } from "../../utils/common/toastHelpers";

/**
 * Custom hook for authentication flow management
 * Extracts authentication logic from Layout component
 */
const useAuthFlow = () => {
  const {
    isUnlocked,
    encryptionKey,
    currentUser,
    login,
    logout,
    budgetId,
    salt,
    changePassword,
    updateProfile,
  } = useAuth();

  const { showSuccessToast, showErrorToast } = useToastHelpers();

  const handleSetup = useCallback(
    async (userDataOrPassword) => {
      // Handle both new user (object) and existing user (string) scenarios
      const isExistingUser = typeof userDataOrPassword === "string";
      const password = isExistingUser ? userDataOrPassword : userDataOrPassword.password;
      const userData = isExistingUser ? null : userDataOrPassword;

      logger.auth("Layout handleSetup called", {
        hasUserData: !!userData,
        isExistingUser,
        hasPassword: !!password,
      });
      logger.auth("🚨 DEBUG VERSION 2: useAuthFlow.js with debug logging is running!");
      try {
        // For existing users, skip budgetId generation and go straight to login
        if (isExistingUser) {
          logger.auth("Existing user login - calling login with password only");
          const result = await login(password, null);
          logger.auth("Existing user login result", { success: !!result });

          if (result.success) {
            logger.production("Existing user login successful");
            return result;
          } else {
            logger.error("❌ Existing user login failed:", result.error);
            const error = new Error(result.error);
            error.code = result.code;
            error.canCreateNew = result.canCreateNew;
            error.suggestion = result.suggestion;
            throw error;
          }
        }

        // New user path - generate budgetId and setup new account
        const { encryptionUtils } = await import("../../utils/security/encryption");

        // NEW: Generate share code and deterministic budget ID
        // This replaces the device-specific system with user-controlled share codes
        const { shareCodeUtils } = await import("../../utils/security/shareCodeUtils");

        // For new users, generate a fresh share code
        const shareCode = shareCodeUtils.generateShareCode();
        const budgetId = await encryptionUtils.generateBudgetId(password, shareCode);

        logger.auth("🔍 Generated new budget with share code system", {
          budgetIdPreview: budgetId.substring(0, 10) + "...",
          shareCodePreview: shareCode.split(" ").slice(0, 2).join(" ") + " ...",
          userDataKeys: Object.keys(userData),
          envMode: import.meta?.env?.MODE || "unknown",
        });

        // Store share code for user display
        userData.shareCode = shareCode;

        const userDataWithId = {
          ...userData,
          budgetId: budgetId,
        };

        logger.auth("Calling login", {
          hasUserData: !!userDataWithId,
          hasPassword: !!password,
          budgetId: userDataWithId.budgetId,
        });

        const result = await login(password, userDataWithId);
        logger.auth("Login result", { success: !!result });

        if (result.success) {
          logger.production("User login successful", {
            budgetId: userData.budgetId,
          });

          // Budget history is now handled automatically by the Dexie/Cloud Sync system
          logger.auth("✅ Budget history system ready (Dexie-based)");

          if (!localStorage.getItem("passwordLastChanged")) {
            localStorage.setItem("passwordLastChanged", Date.now().toString());
          }
        } else {
          logger.error("❌ Setup failed:", result.error);
          // Throw error so useUserSetup can handle enhanced password validation UI
          const error = new Error(result.error);
          error.code = result.code;
          error.canCreateNew = result.canCreateNew;
          error.suggestion = result.suggestion;
          throw error;
        }
      } catch (error) {
        logger.error("❌ Setup error:", error);

        // If this is our enhanced password validation error, re-throw it
        if (error.code === "INVALID_PASSWORD_OFFER_NEW_BUDGET") {
          throw error;
        }

        showErrorToast(`Setup error: ${error.message}`, "Setup Error");
      }
    },
    [login, showErrorToast]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleChangePassword = useCallback(
    async (oldPass, newPass) => {
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
    async (updatedProfile) => {
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
