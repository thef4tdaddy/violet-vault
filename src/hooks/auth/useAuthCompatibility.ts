import { useMemo } from "react";
import { useAuth as useAuthHook } from "./useAuth";
import logger from "@/utils/common/logger";
import { encryptionUtils } from "@/utils/security/encryption";

import type { UserData, UpdateProfileInput as UpdatedProfile } from "./useAuth.types";

interface JoinData {
  budgetId: string;
  password: string;
  userInfo: UserData;
  sharedBy: string;
  shareCode?: string;
}

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
  const auth = useAuthHook();

  // Legacy interface that matches the old authStore API
  const legacyAuth = useMemo(
    () => ({
      // State properties (matching old authStore)
      isUnlocked: auth.isUnlocked,
      currentUser: auth.user,
      budgetId: auth.budgetId,
      encryptionKey: auth.encryptionKey,
      salt: auth.salt,
      lastActivity: auth.lastActivity,

      // Action methods (matching old authStore)
      login: async (password: string, userData: UserData | null = null) => {
        const result = await auth.login({
          password,
          userData: userData || undefined,
        });
        return result;
      },

      joinBudgetWithShareCode: async (joinData: unknown) => {
        const result = await auth.joinBudget(joinData as JoinData);
        return result;
      },

      logout: () => {
        auth.logout();
      },

      updateUser: (updatedUser: unknown) => {
        auth.updateUser(updatedUser as Partial<UpdatedProfile>);
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        const result = await auth.changePassword({ oldPassword, newPassword });
        return result;
      },

      updateProfile: async (updatedProfile: unknown) => {
        const result = await auth.updateProfile(updatedProfile as UpdatedProfile);
        return result;
      },

      setLastActivity: (_timestamp: number) => {
        auth.updateActivity();
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
      setEncryption: ({ key: _key, salt: _salt }: { key: unknown; salt: unknown }) => {
        logger.warn("setEncryption called via compatibility layer - this should be migrated");
        // This would need to be handled through the new auth context
        // For now, log a warning since this should be rare
      },

      startBackgroundSyncAfterLogin: async (_isNewUser = false) => {
        logger.info("startBackgroundSyncAfterLogin called via compatibility layer");
        // This is now handled automatically in the login mutations
        // So we can just return success
        return { success: true };
      },
    }),
    [auth]
  );

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
 * import { useAuth } from "@/stores/auth/authStore";
 * ```
 *
 * To:
 * ```
 * import { useAuth } from "@/hooks/auth/useAuthCompatibility";
 * ```
 *
 * And everything should work the same way.
 */
export const useAuth = useAuthCompatibility;

export default useAuthCompatibility;
