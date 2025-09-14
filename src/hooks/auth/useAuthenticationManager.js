import { useMemo } from "react";
import useAuthFlow from "./useAuthFlow";
import { useSecurityManager } from "./useSecurityManager";
import { useLocalOnlyMode } from "../common/useLocalOnlyMode";

/**
 * Consolidated authentication manager hook
 * Combines auth flow, security management, and local-only mode operations
 * Provides a unified interface for all authentication-related operations
 *
 * @returns {Object} Combined authentication operations and state
 * @example
 * const {
 *   isAuthenticated,
 *   currentUser,
 *   handleSetup,
 *   handleLogout,
 *   lockApp,
 *   securityContext
 * } = useAuthenticationManager();
 */
export const useAuthenticationManager = () => {
  // Core authentication hooks
  const authFlow = useAuthFlow();
  const securityManager = useSecurityManager();
  const { isLocalOnlyMode, localOnlyUser } = useLocalOnlyMode();

  // Determine the effective current user based on mode
  const effectiveUser = useMemo(() => {
    return isLocalOnlyMode ? localOnlyUser : authFlow.currentUser;
  }, [isLocalOnlyMode, localOnlyUser, authFlow.currentUser]);

  // Determine the effective budget ID
  const effectiveBudgetId = useMemo(() => {
    return isLocalOnlyMode ? localOnlyUser?.budgetId : authFlow.budgetId;
  }, [isLocalOnlyMode, localOnlyUser?.budgetId, authFlow.budgetId]);

  // Comprehensive authentication state
  const authenticationState = useMemo(
    () => ({
      // Basic auth state
      isUnlocked: authFlow.isUnlocked,
      isAuthenticated: !!(authFlow.isUnlocked && effectiveUser),
      currentUser: effectiveUser,

      // Mode-specific state
      isLocalOnlyMode,
      localOnlyUser,

      // Security state
      isLocked: securityManager.isLocked,
      canUnlock: !securityManager.isLocked || securityManager.canUnlock,

      // Authentication readiness
      isReady: isLocalOnlyMode
        ? !!localOnlyUser
        : !!(authFlow.isUnlocked && authFlow.currentUser),
    }),
    [
      authFlow.isUnlocked,
      effectiveUser,
      isLocalOnlyMode,
      localOnlyUser,
      securityManager.isLocked,
      securityManager.canUnlock,
      authFlow.currentUser,
    ],
  );

  // Security context for components that need encryption details
  const securityContext = useMemo(
    () => ({
      encryptionKey: authFlow.encryptionKey,
      budgetId: effectiveBudgetId,
      salt: authFlow.salt,
      hasValidKeys: !!(authFlow.encryptionKey && effectiveBudgetId),
    }),
    [authFlow.encryptionKey, effectiveBudgetId, authFlow.salt],
  );

  // Core authentication operations
  const authOperations = useMemo(
    () => ({
      // Setup & Login
      handleSetup: authFlow.handleSetup,
      handleLogout: authFlow.handleLogout,
      handleChangePassword: authFlow.handleChangePassword,

      // Profile Management
      handleUpdateProfile: authFlow.handleUpdateProfile,

      // Security Operations
      lockApp: securityManager.lockApp,
      unlockApp: securityManager.unlockSession,
      checkSecurityStatus: securityManager.checkSecurityStatus,
    }),
    [
      authFlow.handleSetup,
      authFlow.handleLogout,
      authFlow.handleChangePassword,
      authFlow.handleUpdateProfile,
      securityManager.lockApp,
      securityManager.unlockSession,
      securityManager.checkSecurityStatus,
    ],
  );

  return {
    // Authentication state
    ...authenticationState,

    // Security context
    securityContext,

    // Operations
    ...authOperations,

    // Helper methods
    shouldShowAuthGateway: () => {
      if (isLocalOnlyMode) {
        return !localOnlyUser;
      }
      return !authFlow.isUnlocked || !authFlow.currentUser;
    },

    // For components that need the original hooks
    _internal: {
      authFlow,
      securityManager,
      localOnlyMode: { isLocalOnlyMode, localOnlyUser },
    },
  };
};

export default useAuthenticationManager;
