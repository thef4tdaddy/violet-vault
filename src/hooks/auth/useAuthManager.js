import { useAuth } from "../../contexts/AuthContext";
import {
  useLoginMutation,
  useJoinBudgetMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from "./useAuthQueries";
import {
  createLoginOperation,
  createJoinBudgetOperation,
  createLogoutOperation,
  createChangePasswordOperation,
  createUpdateProfileOperation,
  createLockSessionOperation,
  createUpdateActivityOperation,
} from "./authOperations";

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

  // Create auth operations
  const login = createLoginOperation(loginMutation);
  const joinBudget = createJoinBudgetOperation(joinBudgetMutation);
  const logout = createLogoutOperation(logoutMutation);
  const changePassword = createChangePasswordOperation(changePasswordMutation, authContext);
  const updateProfile = createUpdateProfileOperation(updateProfileMutation);
  const lockSession = createLockSessionOperation(authContext);
  const updateActivity = createUpdateActivityOperation(authContext);

  // Create legacy compatibility interface
  const legacyInterface = {
    isUnlocked: authContext.isUnlocked,
    currentUser: authContext.user,
    budgetId: authContext.budgetId,
    encryptionKey: authContext.encryptionKey,
    salt: authContext.salt,
    lastActivity: authContext.lastActivity,
    login,
    joinBudgetWithShareCode: joinBudget,
    logout,
    changePassword,
    updateProfile,
    updateUser: authContext.updateUser,
    setLastActivity: updateActivity,
    lockApp: lockSession,
    handleSetup: login,
    handleLogout: logout,
    handleChangePassword: changePassword,
    handleUpdateProfile: updateProfile,
  };

  return {
    // New interface (preferred)
    ...authContext,
    login,
    joinBudget,
    logout,
    changePassword,
    updateProfile,
    lockSession,
    updateActivity,

    // Computed state
    isAuthenticated,
    isLoading,
    hasError: !!authContext.error,

    // Utilities
    shouldShowAuthGateway: () => !isAuthenticated,
    createPasswordValidator: (password) => ({
      password,
      enabled: !!password && password.length > 0,
    }),
    securityContext: {
      encryptionKey: authContext.encryptionKey,
      budgetId: authContext.budgetId,
      salt: authContext.salt,
      hasValidKeys: !!(authContext.encryptionKey && authContext.budgetId),
    },
    _legacy: legacyInterface,
  };
};

export default useAuthManager;
