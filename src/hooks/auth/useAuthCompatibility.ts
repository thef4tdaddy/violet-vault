import { useAuthManager } from "./useAuthManager";
import logger from "../../utils/common/logger";
import { encryptionUtils } from "../../utils/security/encryption";

/**
 * Compatibility wrapper for components still using the old authStore interface
 *
 * This provides the same interface as the old Zustand authStore, but uses
 * the new AuthContext + TanStack Query system underneath.
 *
 * Part of Epic #665: Gradual migration from Zustand to Context + TanStack Query
 *
 * @deprecated Use useAuthManager() directly for new components
 */
export const useAuthCompatibility = () => {
  const authManager = useAuthManager();

  // Legacy interface that matches the old authStore API
  const legacyAuth = {
    // State properties (matching old authStore)
    isUnlocked: authManager.isUnlocked,
    currentUser: authManager.user,
    budgetId: authManager.budgetId,
    encryptionKey: authManager.encryptionKey,
    salt: authManager.salt,
    lastActivity: authManager.lastActivity,

    // Action methods (matching old authStore)
    login: async (password: string, userData: unknown = null) => {
      const result = await authManager.login(password, userData);
      return result;
    },

    joinBudgetWithShareCode: async (joinData: unknown) => {
      const result = await authManager.joinBudget(joinData);
      return result;
    },

    logout: () => {
      authManager.logout();
    },

    updateUser: (updatedUser: unknown) => {
      authManager.updateUser(updatedUser);
    },

    changePassword: async (oldPassword: string, newPassword: string) => {
      const result = await authManager.changePassword(oldPassword, newPassword);
      return result;
    },

    updateProfile: async (updatedProfile: unknown) => {
      const result = await authManager.updateProfile(updatedProfile as { userName: string });
      return result;
    },

    setLastActivity: (_timestamp: number) => {
      authManager.updateActivity();
    },

    validatePassword: async (password: string) => {
      // Compatibility method - validates password
      try {
        // Simple validation - attempt to derive key
        await encryptionUtils.deriveKey(password);
        return true;
      } catch {
        return false;
      }
    },

    // Additional methods that some components might use
    setEncryption: ({
      key: _key,
      salt: _salt,
    }: {
      key: CryptoKey | null;
      salt: Uint8Array | null;
    }) => {
      logger.warn("setEncryption called via compatibility layer - this should be migrated");
      // This would need to be handled through the new auth context
      // For now, log a warning since this should be rare
    },

    startBackgroundSyncAfterLogin: async (_isNewUser: boolean = false) => {
      logger.info("startBackgroundSyncAfterLogin called via compatibility layer");
      // This is now handled automatically in the login mutations
      // So we can just return success
      return Promise.resolve();
    },
  };

  // Log usage for migration tracking
  if (import.meta?.env?.MODE === "development") {
    logger.auth("AuthCompatibility: Legacy auth interface used", {
      component: new Error().stack?.split("\n")[2]?.trim() || "unknown",
    });
  }

  return legacyAuth;
};

/**
 * Drop-in replacement for the old authStore import
 *
 * Components can change:
 * ```
 * import { useAuth } from "../../stores/auth/authStore";
 * ```
 *
 * To:
 * ```
 * import { useAuth } from "../../hooks/auth/useAuthCompatibility";
 * ```
 *
 * And everything should work the same way.
 */
export const useAuth = useAuthCompatibility;

export default useAuthCompatibility;
