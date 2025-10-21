/**
 * Constants and utilities for AuthContext
 * Separated to fix React Fast Refresh warnings
 */

import type { UserData } from "../types/auth";

/**
 * Authentication state structure
 */
export interface AuthContextState {
  // Core auth state
  user: UserData | null;
  isAuthenticated: boolean;
  isUnlocked: boolean;

  // Session data
  encryptionKey: CryptoKey | null;
  salt: Uint8Array | null;
  budgetId: string | null;
  lastActivity: number | null;

  // UI state
  isLoading: boolean;
  error: string | null;
}

/**
 * Authentication actions interface
 */
export interface AuthContextActions {
  setAuthenticated: (userData: UserData, sessionData?: SessionData) => void;
  clearAuth: () => void;
  updateUser: (updatedUserData: Partial<UserData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateActivity: () => void;
  lockSession: () => void;
}

/**
 * Session data for authentication
 */
export interface SessionData {
  encryptionKey?: CryptoKey;
  salt?: Uint8Array;
}

/**
 * Complete auth context value type
 */
export interface AuthContextValue extends AuthContextState, AuthContextActions {
  // Computed properties for compatibility
  currentUser: UserData | null;
  hasCurrentUser: boolean;
  hasBudgetId: boolean;
}

// Auth state shape - matches current authStore interface
export const initialAuthState: AuthContextState = {
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
export const createContextValue = (
  authState: AuthContextState,
  actions: AuthContextActions
): AuthContextValue => ({
  // Auth state
  ...authState,

  // Computed properties for compatibility
  currentUser: authState.user,
  hasCurrentUser: !!authState.user,
  hasBudgetId: !!authState.budgetId,

  // Auth actions (for TanStack Query to call)
  ...actions,
});
