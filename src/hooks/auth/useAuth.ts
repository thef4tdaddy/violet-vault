import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSecurityManager } from "./useSecurityManager";
import logger from "@/utils/core/common/logger";
import localStorageService from "@/services/storage/localStorageService";
import { encryptionUtils } from "@/utils/platform/security/encryption";
import {
  startBackgroundSyncAfterLogin,
  deriveLoginEncryptionKey,
  handleNewUserSetup,
  processJoinBudget,
} from "./authHelpers";
import type {
  LoginResult,
  LogoutResult,
  UpdateProfileInput,
  UpdateProfileResult,
  LoginVariables,
  JoinBudgetVariables,
} from "./useAuth.types";

/**
 * Unified Auth Hook
 *
 * This is the primary entry point for all authentication state and operations.
 * It combines the AuthContext state with TanStack Query mutations.
 */
// eslint-disable-next-line max-lines-per-function
export const useAuth = () => {
  const context = useAuthContext();
  const queryClient = useQueryClient();
  const securityManager = useSecurityManager();

  // --- Mutations ---

  /**
   * Login Mutation
   */
  const loginMutation = useMutation<LoginResult, Error, LoginVariables>({
    mutationFn: async ({
      password,
      userData,
      overrideBudgetId,
      overrideSalt,
      overrideEncryptedData,
      overrideIv,
    }) => {
      logger.auth("Login attempt started.", { hasOverrideBudgetId: !!overrideBudgetId });
      if (userData) {
        return await handleNewUserSetup(userData, password);
      } else {
        // Handle existing user login
        const savedData = localStorageService.getBudgetData();
        if (!savedData) {
          return {
            success: false,
            error: "No budget data found.",
            code: "NO_DATA_FOUND",
          };
        }
        const { salt: savedSalt, encryptedData: savedEncryptedData, iv: savedIv } = savedData;
        const savedProfile = localStorageService.getUserProfile();
        const saltToUse = overrideSalt || savedSalt;
        const encryptedDataToUse = overrideEncryptedData || savedEncryptedData;
        const ivToUse = overrideIv || savedIv;

        const { key, salt: usedSalt } = await deriveLoginEncryptionKey(
          password,
          saltToUse,
          savedProfile?.shareCode
        );

        try {
          const decryptedData = await encryptionUtils.decrypt(encryptedDataToUse, key, ivToUse);
          const userToUse = decryptedData.currentUser;

          if (overrideBudgetId) {
            userToUse.budgetId = overrideBudgetId;
            logger.auth("Budget ID overridden by caller", { overrideBudgetId });
          }

          return {
            success: true,
            user: userToUse,
            sessionData: { encryptionKey: key, salt: usedSalt },
          };
        } catch {
          logger.auth("Password validation failed");
          return { success: false, error: "Invalid password." };
        }
      }
    },
    onMutate: () => context.setLoading(true),
    onSuccess: async (result) => {
      if (result.success && result.user && result.sessionData) {
        context.setAuthenticated(result.user, result.sessionData);
        if (result.sessionData.encryptionKey) {
          await startBackgroundSyncAfterLogin(
            result.user.budgetId as string,
            result.sessionData.encryptionKey,
            result.isNewUser || false
          );
        }
      } else {
        context.setError(result.error ?? "Login failed");
      }
      context.setLoading(false);
    },
    onError: (error) => {
      context.setError(error.message);
      context.setLoading(false);
    },
  });

  /**
   * Logout Mutation
   */
  const logoutMutation = useMutation<LogoutResult, Error, void>({
    mutationFn: async () => {
      logger.auth("Logging out.");
      return { success: true };
    },
    onSuccess: () => {
      context.clearAuth();
      queryClient.clear();
    },
  });

  /**
   * Join Budget Mutation
   */
  const joinBudgetMutation = useMutation<LoginResult, Error, JoinBudgetVariables>({
    mutationFn: async (joinData) => {
      return await processJoinBudget(joinData);
    },
    onMutate: () => context.setLoading(true),
    onSuccess: (result) => {
      if (result.success && result.user) {
        context.setAuthenticated(result.user, result.sessionData);
      } else {
        context.setError(result.error ?? "Join failed");
      }
      context.setLoading(false);
    },
  });

  /**
   * Update Profile Mutation
   */
  const updateProfileMutation = useMutation<UpdateProfileResult, Error, UpdateProfileInput>({
    mutationFn: async (updatedProfile) => {
      try {
        if (!context.encryptionKey || !context.salt) {
          return { success: false, error: "Not authenticated." };
        }

        localStorageService.setUserProfile({
          userName: updatedProfile.userName ?? "",
          userColor: updatedProfile.userColor ?? "",
        });

        const savedData = localStorageService.getBudgetData();
        if (savedData) {
          const { encryptedData, iv } = savedData;
          const decryptedData = await encryptionUtils.decrypt(
            encryptedData,
            context.encryptionKey,
            iv
          );
          const updatedData = { ...decryptedData, currentUser: updatedProfile };
          const encrypted = await encryptionUtils.encrypt(updatedData, context.encryptionKey);
          localStorageService.setBudgetData({
            encryptedData: encrypted.data,
            salt: Array.from(context.salt),
            iv: encrypted.iv,
          });
        }
        return { success: true, profile: updatedProfile };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Update failed" };
      }
    },
    onSuccess: (result) => {
      if (result.success && result.profile) {
        context.updateUser(result.profile);
      }
    },
  });

  /**
   * Change Password Mutation
   */
  const changePasswordMutation = useMutation<
    { success: boolean; newKey?: CryptoKey; newSalt?: Uint8Array; error?: string },
    Error,
    { oldPassword: string; newPassword: string }
  >({
    mutationFn: async ({ oldPassword, newPassword }) => {
      try {
        const savedData = localStorageService.getBudgetData();
        if (!savedData) return { success: false, error: "No data." };

        const { encryptedData, iv } = savedData;
        const oldKeyData = await encryptionUtils.deriveKey(oldPassword);
        const decryptedData = await encryptionUtils.decrypt(encryptedData, oldKeyData.key, iv);

        const { key: newKey, salt: newSalt } = await encryptionUtils.generateKey(newPassword);
        const encrypted = await encryptionUtils.encrypt(decryptedData, newKey);

        localStorageService.setBudgetData({
          encryptedData: encrypted.data,
          salt: Array.from(newSalt),
          iv: encrypted.iv,
        });

        return { success: true, newKey, newSalt };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Password change failed",
        };
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        context.setAuthenticated(context.user!, {
          encryptionKey: result.newKey!,
          salt: result.newSalt!,
        });
      } else {
        context.setError(result.error ?? "Failed to change password");
      }
    },
  });

  return {
    // State from context
    ...context,
    isAuthenticated: context.isAuthenticated && context.isUnlocked,

    // Actions (Mutations)
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    joinBudget: joinBudgetMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,

    // Auth Gateway utility
    shouldShowAuthGateway: () => !(context.isAuthenticated && context.isUnlocked),

    // Security Context & Manager for compatibility
    securityContext: {
      encryptionKey: context.encryptionKey,
      budgetId: context.budgetId,
      salt: context.salt,
      hasValidKeys: !!(context.encryptionKey && context.budgetId),
    },
    securityManager,
    isLocked: securityManager.isLocked,
    unlockSession: securityManager.unlockSession,
    securityEvents: securityManager.securityEvents,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isJoining: joinBudgetMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,

    // Status
    loginError: loginMutation.error,
  };
};

export default useAuth;
