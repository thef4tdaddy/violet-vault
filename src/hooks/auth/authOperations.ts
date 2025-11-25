import logger from "../../utils/common/logger";
import type { UseMutationResult } from "@tanstack/react-query";

/**
 * Auth operation functions for useAuthManager
 * Separated to reduce function complexity and improve maintainability
 */

export interface LoginData {
  password: string;
  userData?: unknown;
}

export interface LoginResult {
  success: boolean;
  user?: {
    userName?: string;
    userColor?: string;
    uid?: string;
  };
  error?: string;
}

interface JoinBudgetData {
  budgetId: string;
  password: string;
  userInfo: {
    userName?: string;
    email?: string;
    userColor?: string;
    [key: string]: unknown;
  };
  sharedBy: string;
  shareCode?: string;
}

interface JoinBudgetResult {
  success: boolean;
  error?: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

interface ChangePasswordResult {
  success: boolean;
  newKey?: CryptoKey;
  newSalt?: Uint8Array;
  error?: string;
}

export interface UpdateProfileInput {
  userName?: string;
  userColor?: string;
  email?: string;
  displayName?: string;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
  profile?: UpdateProfileInput;
}

export interface AuthContext {
  user?: {
    userName?: string;
    userColor?: string;
    uid?: string;
  };
  setAuthenticated: (user: unknown, credentials: unknown) => void;
  updateActivity: () => void;
  lockSession: () => void;
  updateUser: (updatedUser: unknown) => void;
  [key: string]: unknown;
}

/**
 * Login with password and optional user data (for new users)
 */
export const createLoginOperation =
  (loginMutation: UseMutationResult<LoginResult, Error, LoginData, unknown>) =>
  async (password: string, userData: unknown = null) => {
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
      const err = error as Error;
      return { success: false, error: err.message || "Login failed" };
    }
  };

/**
 * Join budget with share code
 */
export const createJoinBudgetOperation =
  (joinBudgetMutation: UseMutationResult<JoinBudgetResult, Error, JoinBudgetData, unknown>) =>
  async (joinData: JoinBudgetData) => {
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
      const err = error as Error;
      return {
        success: false,
        error: err.message || "Failed to join budget",
      };
    }
  };

/**
 * Logout user and clear session
 */
export const createLogoutOperation =
  (logoutMutation: UseMutationResult<{ success: boolean }, Error, void, unknown>) => async () => {
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
  (
    changePasswordMutation: UseMutationResult<
      ChangePasswordResult,
      Error,
      ChangePasswordData,
      unknown
    >,
    authContext: AuthContext
  ) =>
  async (oldPassword: string, newPassword: string) => {
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
      const err = error as Error;
      return {
        success: false,
        error: err.message || "Failed to change password",
      };
    }
  };

/**
 * Update user profile
 */
export const createUpdateProfileOperation =
  (
    updateProfileMutation: UseMutationResult<
      UpdateProfileResult,
      Error,
      UpdateProfileInput,
      unknown
    >
  ) =>
  async (updatedProfile: UpdateProfileInput) => {
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
      const err = error as Error;
      return {
        success: false,
        error: err.message || "Failed to update profile",
      };
    }
  };

/**
 * Lock the current session (keep user data but require re-auth)
 */
export const createLockSessionOperation = (authContext: AuthContext) => () => {
  logger.auth("AuthManager: Locking session");
  authContext.lockSession();
};

/**
 * Update last activity timestamp
 */
export const createUpdateActivityOperation = (authContext: AuthContext) => () => {
  authContext.updateActivity();
};
