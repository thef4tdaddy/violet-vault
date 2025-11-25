import { useMemo } from "react";
import useAuthFlow from "./useAuthFlow";
import { useSecurityManager } from "./useSecurityManager";
import { useLocalOnlyMode } from "../common/useLocalOnlyMode";

/**
 * Authentication state interface
 */
interface AuthenticationState {
  isUnlocked: boolean;
  isAuthenticated: boolean;
  currentUser: unknown;
  isLocalOnlyMode: boolean;
  localOnlyUser: unknown;
  isLocked: boolean;
  canUnlock: boolean;
  isReady: boolean;
}

/**
 * Security context interface
 */
interface SecurityContext {
  encryptionKey: CryptoKey | null;
  budgetId: string | null;
  salt: Uint8Array | null;
  hasValidKeys: boolean;
}

/**
 * User data for setup
 */
interface UserData {
  budgetId?: string;
  password: string;
  userName?: string;
  userColor?: string;
}

/**
 * Auth operations interface
 */
interface AuthOperations {
  handleSetup: (userDataOrPassword: string | UserData) => Promise<void>;
  handleLogout: () => void;
  handleChangePassword: (oldPass: string, newPass: string) => Promise<void>;
  handleUpdateProfile: (updatedProfile: unknown) => void;
  lockApp: () => void;
  unlockApp: (_password: string) => void;
  checkSecurityStatus: () => void;
}

/**
 * Return type for useAuthenticationManager
 */
interface UseAuthenticationManagerReturn extends AuthenticationState, AuthOperations {
  securityContext: SecurityContext;
  shouldShowAuthGateway: () => boolean;
  _internal: {
    authFlow: ReturnType<typeof useAuthFlow>;
    securityManager: ReturnType<typeof useSecurityManager>;
    localOnlyMode: { isLocalOnlyMode: boolean; localOnlyUser: unknown };
  };
}

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
export const useAuthenticationManager = (): UseAuthenticationManagerReturn => {
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
  const authenticationState = useMemo<AuthenticationState>(
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
      canUnlock: !securityManager.isLocked || true, // Can always attempt unlock

      // Authentication readiness
      isReady: isLocalOnlyMode ? !!localOnlyUser : !!(authFlow.isUnlocked && authFlow.currentUser),
    }),
    [
      authFlow.isUnlocked,
      effectiveUser,
      isLocalOnlyMode,
      localOnlyUser,
      securityManager.isLocked,
      authFlow.currentUser,
    ]
  );

  // Security context for components that need encryption details
  const securityContext = useMemo<SecurityContext>(
    () => ({
      encryptionKey: authFlow.encryptionKey,
      budgetId: effectiveBudgetId,
      salt: authFlow.salt,
      hasValidKeys: !!(authFlow.encryptionKey && effectiveBudgetId),
    }),
    [authFlow.encryptionKey, effectiveBudgetId, authFlow.salt]
  );

  // Core authentication operations - direct object without useMemo to avoid React Compiler conflicts
  const authOperations: AuthOperations = {
    // Setup & Login
    handleSetup: async (userDataOrPassword: string | UserData): Promise<void> => {
      await authFlow.handleSetup(userDataOrPassword);
    },
    handleLogout: authFlow.handleLogout,
    handleChangePassword: authFlow.handleChangePassword,

    // Profile Management
    handleUpdateProfile: authFlow.handleUpdateProfile,

    // Security Operations
    lockApp: securityManager.lockSession,
    unlockApp: securityManager.unlockSession,
    checkSecurityStatus: () => {
      // Check security status - can be implemented as needed
      securityManager.trackActivity();
    },
  };

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
