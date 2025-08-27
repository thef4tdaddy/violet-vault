import { useCallback } from "react";
import { useAuth } from "../stores/authStore.jsx";
import logger from "../utils/logger";
import { useToastHelpers } from "../utils/toastHelpers";

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
    async (userData) => {
      logger.auth("Layout handleSetup called", { hasUserData: !!userData });
      logger.auth("🚨 DEBUG VERSION 2: useAuthFlow.js with debug logging is running!");
      try {
        // ALWAYS generate budgetId deterministically from password for cross-device sync
        const { encryptionUtils } = await import("../utils/encryption");

        // Debug: Track source of budget ID problem
        const generatedBudgetId = await encryptionUtils.generateBudgetId(userData.password);
        logger.auth("🔍 DEBUG: useAuthFlow budget ID investigation", {
          originalUserDataBudgetId: userData.budgetId || "none",
          generatedBudgetId,
          userDataKeys: Object.keys(userData),
          envMode: import.meta?.env?.MODE || "unknown",
        });

        const userDataWithId = {
          ...userData,
          budgetId: generatedBudgetId,
        };

        logger.auth("Calling login", {
          hasUserData: !!userDataWithId,
          hasPassword: !!userData.password,
          budgetId: userDataWithId.budgetId,
        });

        const result = await login(userData.password, userDataWithId);
        logger.auth("Login result", { success: !!result });

        if (result.success) {
          logger.production("User login successful", { budgetId: userData.budgetId });

          // Budget history is now handled automatically by the Dexie/Cloud Sync system
          logger.auth("✅ Budget history system ready (Dexie-based)");

          if (!localStorage.getItem("passwordLastChanged")) {
            localStorage.setItem("passwordLastChanged", Date.now().toString());
          }
        } else {
          logger.error("❌ Setup failed:", result.error);
          showErrorToast(`Setup failed: ${result.error}`, "Account Setup Failed");
        }
      } catch (error) {
        logger.error("❌ Setup error:", error);
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
