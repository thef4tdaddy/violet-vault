import logger from "../../utils/common/logger";

/**
 * Auth operation functions for useAuthManager
 * Separated to reduce function complexity and improve maintainability
 */

/**
 * Login with password and optional user data (for new users)
 */
export const createLoginOperation =
  (loginMutation: {
    mutateAsync: (args: {
      password: string;
      userData: unknown | null;
    }) => Promise<{
      success: boolean;
      user?: { userName?: string };
      error?: string;
      [key: string]: unknown;
    }>;
  }) =>
  async (password: string, userData: unknown | null = null) => {
    try {
      logger.auth("AuthManager: Starting login", {
        hasPassword: !!password,
        hasUserData: !!userData,
        isNewUser: !!userData,
      });

      const result = await loginMutation.mutateAsync({ password, userData });

      if (result.success) {
        logger.auth("AuthManager: Login successful", {
          userName: result.user?.userName,
          isNewUser: !!userData,
        });
        return { success: true, data: result };
      } else {
        logger.auth("AuthManager: Login failed", { error: result.error });
        return { success: false, error: result.error, ...result };
      }
    } catch (error) {
      logger.error("AuthManager: Login error", error);
      return { success: false, error: error.message || "Login failed" };
    }
  };

/**
 * Join budget with share code
 */
export const createJoinBudgetOperation =
  (joinBudgetMutation: {
    mutateAsync: (joinData: {
      budgetId?: string;
      sharedBy?: string;
      [key: string]: unknown;
    }) => Promise<unknown>;
  }) =>
  async (joinData: { budgetId?: string; sharedBy?: string; [key: string]: unknown }) => {
    try {
      logger.auth("AuthManager: Starting budget join", {
        budgetId: joinData.budgetId?.substring(0, 8) + "...",
        sharedBy: joinData.sharedBy,
      });

      const result = await joinBudgetMutation.mutateAsync(joinData);

      if (result.success) {
        logger.auth("AuthManager: Budget join successful");
        return { success: true, data: result };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error("AuthManager: Budget join error", error);
      return {
        success: false,
        error: error.message || "Failed to join budget",
      };
    }
  };

/**
 * Logout user and clear session
 */
export const createLogoutOperation = (logoutMutation) => async () => {
  try {
    logger.auth("AuthManager: Starting logout");
    await logoutMutation.mutateAsync();
    logger.auth("AuthManager: Logout successful");
    return { success: true };
  } catch (error) {
    logger.error("AuthManager: Logout error", error);
    // Still return success since auth state is cleared
    return { success: true };
  }
};

/**
 * Change user password
 */
export const createChangePasswordOperation =
  (changePasswordMutation, authContext) => async (oldPassword, newPassword) => {
    try {
      logger.auth("AuthManager: Starting password change");
      const result = await changePasswordMutation.mutateAsync({
        oldPassword,
        newPassword,
      });

      if (result.success) {
        logger.auth("AuthManager: Password change successful");
        // Update encryption context if needed
        authContext.setAuthenticated(authContext.user, {
          encryptionKey: result.newKey,
          salt: result.newSalt,
        });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error("AuthManager: Password change error", error);
      return {
        success: false,
        error: error.message || "Failed to change password",
      };
    }
  };

/**
 * Update user profile
 */
export const createUpdateProfileOperation = (updateProfileMutation) => async (updatedProfile) => {
  try {
    logger.auth("AuthManager: Starting profile update", {
      userName: updatedProfile.userName,
    });

    const result = await updateProfileMutation.mutateAsync(updatedProfile);

    if (result.success) {
      logger.auth("AuthManager: Profile update successful");
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    logger.error("AuthManager: Profile update error", error);
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
};

/**
 * Lock the current session (keep user data but require re-auth)
 */
export const createLockSessionOperation = (authContext) => () => {
  logger.auth("AuthManager: Locking session");
  authContext.lockSession();
};

/**
 * Update last activity timestamp
 */
export const createUpdateActivityOperation = (authContext) => () => {
  authContext.updateActivity();
};
