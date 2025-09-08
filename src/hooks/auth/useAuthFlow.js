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

        // Budget ID migration support - try new format first, fallback to legacy
        const modernBudgetId = await encryptionUtils.generateBudgetId(password);
        const legacyBudgetId = await encryptionUtils.generateLegacyBudgetId(password);
        
        let finalBudgetId = modernBudgetId;
        
        // Check if there's cloud data with legacy budget ID that we need to migrate
        // This happens when users have data from before device-unique budget IDs
        try {
          const { chunkedSyncService } = await import("../../services/chunkedSyncService");
          const { key: encryptionKey } = await encryptionUtils.deriveKey(password);
          
          // Try to access cloud data with modern budget ID first
          await chunkedSyncService.initialize(modernBudgetId, encryptionKey);
          const cloudData = await chunkedSyncService.loadFromCloud();
          
          if (!cloudData) {
            // No data with modern ID, try legacy ID
            logger.auth("No cloud data found with modern budget ID, trying legacy format");
            await chunkedSyncService.initialize(legacyBudgetId, encryptionKey);
            const legacyCloudData = await chunkedSyncService.loadFromCloud();
            
            if (legacyCloudData) {
              logger.auth("Found cloud data with legacy budget ID - using legacy format for compatibility");
              finalBudgetId = legacyBudgetId;
            }
          }
        } catch (error) {
          logger.warn("Budget ID migration check failed, using modern format", error);
        }

        logger.auth("🔍 DEBUG: useAuthFlow budget ID investigation", {
          originalUserDataBudgetId: userData.budgetId || "none",
          modernBudgetId,
          legacyBudgetId, 
          finalBudgetId,
          userDataKeys: Object.keys(userData),
          envMode: import.meta?.env?.MODE || "unknown",
        });

        const userDataWithId = {
          ...userData,
          budgetId: finalBudgetId,
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
