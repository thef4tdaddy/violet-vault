import logger from "../../utils/common/logger";

interface LoginResult {
  success: boolean;
  user?: {
    userName?: string;
  };
  error?: string;
  newKey?: string;
  newSalt?: string;
}

interface MutationResult {
  mutateAsync: (data: unknown) => Promise<LoginResult>;
}

interface AuthContextType {
  user: unknown;
  setAuthenticated: (user: unknown, credentials: { encryptionKey?: string; salt?: string }) => void;
  lockSession: () => void;
  updateActivity: () => void;
}

interface JoinBudgetData {
  budgetId?: string;
  sharedBy?: string;
}

interface UserData {
  userName?: string;
}

/**
 * Auth operation functions for useAuthManager
 * Separated to reduce function complexity and improve maintainability
 */

/**
 * Login with password and optional user data (for new users)
 */
export const createLoginOperation =
  (loginMutation: MutationResult) =>
  async (password: string, userData: UserData | null = null): Promise<LoginResult> => {
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
        return result;
      } else {
        logger.auth("AuthManager: Login failed", { error: result.error });
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      logger.error("AuthManager: Login error", error);
      return { success: false, error: errorMessage };
    }
  };

/**
 * Join budget with share code
 */
export const createJoinBudgetOperation =
  (joinBudgetMutation: MutationResult) =>
  async (joinData: JoinBudgetData): Promise<LoginResult> => {
    try {
      logger.auth("AuthManager: Starting budget join", {
        budgetId: joinData.budgetId?.substring(0, 8) + "...",
        sharedBy: joinData.sharedBy,
      });

      const result = await joinBudgetMutation.mutateAsync(joinData);

      if (result.success) {
        logger.auth("AuthManager: Budget join successful");
        return result;
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join budget";
      logger.error("AuthManager: Budget join error", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

/**
 * Logout user and clear session
 */
export const createLogoutOperation =
  (logoutMutation: MutationResult) => async (): Promise<LoginResult> => {
    try {
      logger.auth("AuthManager: Starting logout");
      await logoutMutation.mutateAsync({});
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
  (changePasswordMutation: MutationResult, authContext: AuthContextType) =>
  async (oldPassword: string, newPassword: string): Promise<LoginResult> => {
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
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      logger.error("AuthManager: Password change error", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

/**
 * Update user profile
 */
export const createUpdateProfileOperation =
  (updateProfileMutation: MutationResult) =>
  async (updatedProfile: Record<string, unknown>): Promise<LoginResult> => {
    try {
      logger.auth("AuthManager: Starting profile update", {
        userName: (updatedProfile as UserData).userName,
      });

      const result = await updateProfileMutation.mutateAsync(updatedProfile);

      if (result.success) {
        logger.auth("AuthManager: Profile update successful");
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      logger.error("AuthManager: Profile update error", error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

/**
 * Lock the current session (keep user data but require re-auth)
 */
export const createLockSessionOperation = (authContext: AuthContextType) => (): void => {
  logger.auth("AuthManager: Locking session");
  authContext.lockSession();
};

/**
 * Update last activity timestamp
 */
export const createUpdateActivityOperation = (authContext: AuthContextType) => (): void => {
  authContext.updateActivity();
};
