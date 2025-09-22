import logger from "../utils/common/logger";
import { initialAuthState } from "./authConstants";

/**
 * Utility functions for AuthContext
 * Separated to fix React Fast Refresh warnings and reduce function complexity
 */

// Helper function to initialize auth state from localStorage
export const initializeAuthFromStorage = async (setAuthState) => {
  try {
    logger.auth("AuthContext: Initializing auth state from localStorage");

    // Check for saved user profile
    const savedProfile = localStorage.getItem("userProfile");
    const savedBudgetData = localStorage.getItem("envelopeBudgetData");

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      logger.auth("AuthContext: Found saved profile", {
        userName: profile.userName,
        hasColor: !!profile.userColor,
      });

      // Set initial state indicating user has local data but needs to unlock
      setAuthState((prev) => ({
        ...prev,
        user: {
          userName: profile.userName,
          userColor: profile.userColor,
        },
        isAuthenticated: false, // Not authenticated until password entered
        isUnlocked: false,
        isLoading: false,
      }));
    } else if (savedBudgetData) {
      // Has budget data but no profile - legacy state
      logger.auth(
        "AuthContext: Found budget data without profile - legacy state",
      );
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: false,
        isUnlocked: false,
        isLoading: false,
      }));
    } else {
      // New user - no saved data
      logger.auth("AuthContext: No saved data - new user state");
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  } catch (error) {
    logger.error("AuthContext: Failed to initialize auth state", error);
    setAuthState((prev) => ({
      ...prev,
      isLoading: false,
      error: "Failed to initialize authentication",
    }));
  }
};

// Auth action factories (create plain functions, not hooks)
export const createSetAuthenticated =
  (setAuthState) =>
  (userData, sessionData = {}) => {
    logger.auth("AuthContext: Setting authenticated user", {
      userName: userData.userName,
      budgetId: userData.budgetId?.substring(0, 8) + "...",
      hasEncryptionKey: !!sessionData.encryptionKey,
    });

    setAuthState((prev) => ({
      ...prev,
      user: userData,
      isAuthenticated: true,
      isUnlocked: true,
      budgetId: userData.budgetId,
      encryptionKey: sessionData.encryptionKey || null,
      salt: sessionData.salt || null,
      lastActivity: Date.now(),
      error: null,
    }));
  };

export const createClearAuth = (setAuthState) => () => {
  logger.auth("AuthContext: Clearing auth state");
  setAuthState(initialAuthState);
};

export const createUpdateUser = (setAuthState) => (updatedUserData) => {
  logger.auth("AuthContext: Updating user data", {
    userName: updatedUserData.userName,
  });

  setAuthState((prev) => ({
    ...prev,
    user: {
      ...prev.user,
      ...updatedUserData,
    },
  }));
};

export const createSetLoading = (setAuthState) => (loading) => {
  setAuthState((prev) => ({
    ...prev,
    isLoading: loading,
  }));
};

export const createSetError = (setAuthState) => (error) => {
  setAuthState((prev) => ({
    ...prev,
    error,
    isLoading: false,
  }));
};

export const createUpdateActivity = (setAuthState) => () => {
  setAuthState((prev) => ({
    ...prev,
    lastActivity: Date.now(),
  }));
};

export const createLockSession = (setAuthState) => () => {
  logger.auth("AuthContext: Locking session");
  setAuthState((prev) => ({
    ...prev,
    isUnlocked: false,
    encryptionKey: null,
    lastActivity: null,
  }));
};
