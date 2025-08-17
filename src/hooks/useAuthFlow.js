import { useCallback } from "react";
import { useAuth } from "../stores/authStore.jsx";
import { useBudgetStore } from "../stores/budgetStore.js";
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

  const budgetStore = useBudgetStore();
  const { showSuccessToast, showErrorToast } = useToastHelpers();

  const handleSetup = useCallback(
    async (userData) => {
      logger.auth("Layout handleSetup called", { hasUserData: !!userData });
      try {
        // Generate budgetId from password for cross-device sync
        const { encryptionUtils } = await import("../utils/encryption");
        const userDataWithId = {
          ...userData,
          budgetId: userData.budgetId || encryptionUtils.generateBudgetId(userData.password),
        };

        logger.auth("Calling login", {
          hasUserData: !!userDataWithId,
          hasPassword: !!userData.password,
          budgetId: userDataWithId.budgetId,
        });

        const result = await login(userData.password, userDataWithId);
        logger.auth("Login result", { success: !!result });

        if (result.success) {
          logger.info("✅ Setup completed successfully");

          // Initialize budget history with the user's password
          try {
            await budgetStore.initializeBudgetHistory(userData.password);
            logger.auth("Budget history initialized on login");
          } catch (historyError) {
            logger.error("Failed to initialize budget history on login", historyError);
            // Don't fail login if history initialization fails
          }

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
    [login, budgetStore, showErrorToast]
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
