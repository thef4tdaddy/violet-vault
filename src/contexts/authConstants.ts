/**
 * Constants and utilities for AuthContext
 * Separated to fix React Fast Refresh warnings
 */

// Auth state shape - matches current authStore interface
export const initialAuthState = {
  // Core auth state
  user: null,
  isAuthenticated: false,
  isUnlocked: false,

  // Session data
  encryptionKey: null,
  salt: null,
  budgetId: null,
  lastActivity: null,

  // UI state
  isLoading: false,
  error: null,
};

// Helper to create context value
export const createContextValue = (authState, actions) => ({
  // Auth state
  ...authState,

  // Computed properties for compatibility
  currentUser: authState.user,
  hasCurrentUser: !!authState.user,
  hasBudgetId: !!authState.budgetId,

  // Auth actions (for TanStack Query to call)
  ...actions,
});
