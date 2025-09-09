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
      // Handle three scenarios:
      // 1. Existing user login (string password)
      // 2. Shared budget join (object with budgetId)
      // 3. New user setup (object without budgetId)
      const isExistingUser = typeof userDataOrPassword === "string";
      const isSharedBudgetJoin =
        typeof userDataOrPassword === "object" && userDataOrPassword?.budgetId;
      const password = isExistingUser
        ? userDataOrPassword
        : userDataOrPassword.password;
      const userData = isExistingUser ? null : userDataOrPassword;

      logger.auth("Layout handleSetup called", {
        hasUserData: !!userData,
        isExistingUser,
        isSharedBudgetJoin,
        hasPassword: !!password,
      });
      logger.auth(
        "🚨 DEBUG VERSION 2: useAuthFlow.js with debug logging is running!",
      );
      try {
        // For existing users and shared budget joins, use existing data
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

        // For shared budget joins, use the provided budgetId without generating new one
        if (isSharedBudgetJoin) {
          logger.auth("Shared budget join - using provided budgetId", {
            budgetId: userData.budgetId?.substring(0, 10) + "...",
            sharedBy: userData.sharedBy,
          });

          const result = await login(password, userData);
          logger.auth("Shared budget join result", { success: !!result });

          if (result.success) {
            logger.production("Shared budget join successful", {
              budgetId: userData.budgetId?.substring(0, 8) + "...",
            });
            return result;
          } else {
            logger.error("❌ Shared budget join failed:", result.error);
            const error = new Error(result.error);
            error.code = result.code;
            throw error;
          }
        }

        // New user path - generate budgetId and setup new account
        const { encryptionUtils } = await import(
          "../../utils/security/encryption"
        );

        // NEW: Use provided share code for deterministic budget ID
        // This replaces the device-specific system with user-controlled share codes

        // Use the share code that was generated and shown to the user in Step 3
        const shareCode = userData.shareCode;
        if (!shareCode) {
          throw new Error(
            "Share code missing from user data - should be provided by setup flow",
          );
        }
        const budgetId = await encryptionUtils.generateBudgetId(
          password,
          shareCode,
        );

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
    [login, showErrorToast],
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleChangePassword = useCallback(
    async (oldPass, newPass) => {
      const result = await changePassword(oldPass, newPass);
      if (!result.success) {
        showErrorToast(
          `Password change failed: ${result.error}`,
          "Password Change Failed",
        );
      } else {
        showSuccessToast("Password updated successfully", "Password Changed");
      }
    },
    [changePassword, showErrorToast, showSuccessToast],
  );

  const handleUpdateProfile = useCallback(
    async (updatedProfile) => {
      const result = await updateProfile(updatedProfile);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [updateProfile],
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
