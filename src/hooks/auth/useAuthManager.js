import { useAuth } from "../../contexts/AuthContext";
import {
  useLoginMutation,
  useJoinBudgetMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  usePasswordValidation,
} from "./useAuthQueries";
import logger from "../../utils/common/logger";

/**
 * Unified auth manager hook that combines AuthContext and TanStack Query operations
 *
 * This replaces the old useAuthenticationManager and provides a clean interface
 * for all auth operations using the new Context + TanStack Query architecture.
 *
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */
export const useAuthManager = () => {
  // Get auth state from context
  const authContext = useAuth();

  // Get TanStack Query mutations
  const loginMutation = useLoginMutation();
  const joinBudgetMutation = useJoinBudgetMutation();
  const logoutMutation = useLogoutMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  // Computed state for easier access
  const isAuthenticated = authContext.isAuthenticated && authContext.isUnlocked;
  const isLoading =
    authContext.isLoading ||
    loginMutation.isPending ||
    joinBudgetMutation.isPending ||
    logoutMutation.isPending;

  // Enhanced auth operations with better error handling
  const authOperations = {
    /**
     * Login with password and optional user data (for new users)
     */
    login: async (password, userData = null) => {
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
    },

    /**
     * Join budget with share code
     */
    joinBudget: async (joinData) => {
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
    },

    /**
     * Logout user and clear session
     */
    logout: async () => {
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
    },

    /**
     * Change user password
     */
    changePassword: async (oldPassword, newPassword) => {
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
    },

    /**
     * Update user profile
     */
    updateProfile: async (updatedProfile) => {
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
    },

    /**
     * Lock the current session (keep user data but require re-auth)
     */
    lockSession: () => {
      logger.auth("AuthManager: Locking session");
      authContext.lockSession();
    },

    /**
     * Update last activity timestamp
     */
    updateActivity: () => {
      authContext.updateActivity();
    },
  };

  // Password validation helper (note: components should call usePasswordValidation directly)
  const createPasswordValidator = (password) => {
    // This is just a reference to the hook - components should call usePasswordValidation directly
    return { password, enabled: !!password && password.length > 0 };
  };

  // Legacy compatibility interface for gradual migration
  const legacyInterface = {
    // State mappings for components that haven't been updated yet
    isUnlocked: authContext.isUnlocked,
    currentUser: authContext.user,
    budgetId: authContext.budgetId,
    encryptionKey: authContext.encryptionKey,
    salt: authContext.salt,
    lastActivity: authContext.lastActivity,

    // Method mappings
    login: authOperations.login,
    joinBudgetWithShareCode: authOperations.joinBudget,
    logout: authOperations.logout,
    changePassword: authOperations.changePassword,
    updateProfile: authOperations.updateProfile,
    updateUser: authContext.updateUser,
    setLastActivity: authOperations.updateActivity,
    lockApp: authOperations.lockSession,

    // Additional compatibility
    handleSetup: authOperations.login,
    handleLogout: authOperations.logout,
    handleChangePassword: authOperations.changePassword,
    handleUpdateProfile: authOperations.updateProfile,
  };

  return {
    // New interface (preferred)
    ...authContext,
    ...authOperations,

    // Computed state
    isAuthenticated,
    isLoading,
    hasError: !!authContext.error,

    // Utilities
    createPasswordValidator,

    // Helper methods
    shouldShowAuthGateway: () => !isAuthenticated,

    // Security context for components that need encryption details
    securityContext: {
      encryptionKey: authContext.encryptionKey,
      budgetId: authContext.budgetId,
      salt: authContext.salt,
      hasValidKeys: !!(authContext.encryptionKey && authContext.budgetId),
    },

    // Legacy compatibility (for gradual migration)
    _legacy: legacyInterface,

    // Debug info in development
    _debug:
      import.meta?.env?.MODE === "development"
        ? {
            authContext,
            mutations: {
              login: loginMutation,
              joinBudget: joinBudgetMutation,
              logout: logoutMutation,
              changePassword: changePasswordMutation,
              updateProfile: updateProfileMutation,
            },
          }
        : undefined,
  };
};

export default useAuthManager;
