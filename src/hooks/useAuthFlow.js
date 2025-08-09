import { useCallback } from "react";
import { useAuth } from "../stores/authStore.jsx";
import logger from "../utils/logger";

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
          console.log("✅ Setup completed successfully");
          if (!localStorage.getItem("passwordLastChanged")) {
            localStorage.setItem("passwordLastChanged", Date.now().toString());
          }
        } else {
          console.error("❌ Setup failed:", result.error);
          alert(`Setup failed: ${result.error}`);
        }
      } catch (error) {
        console.error("❌ Setup error:", error);
        alert(`Setup error: ${error.message}`);
      }
    },
    [login]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleChangePassword = useCallback(
    async (oldPass, newPass) => {
      const result = await changePassword(oldPass, newPass);
      if (!result.success) {
        alert(`Password change failed: ${result.error}`);
      } else {
        alert("Password updated successfully.");
      }
    },
    [changePassword]
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
