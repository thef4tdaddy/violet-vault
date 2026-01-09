import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { initialAuthState, createContextValue } from "./authConstants";
import type { AuthContextValue, AuthContextState, SessionData } from "./authConstants";
import type { UserData } from "../types/auth";
import {
  initializeAuthFromStorage,
  createSetAuthenticated,
  createClearAuth,
  createUpdateUser,
  createSetLoading,
  createSetError,
  createUpdateActivity,
  createLockSession,
} from "./authUtils";

/**
 * AuthContext - React Context for authentication state management
 *
 * Replaces Zustand authStore with clean Context pattern for:
 * - User authentication state
 * - Session management
 * - Auth-related loading states
 *
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

// Create the context
const AuthContext = createContext<AuthContextValue | null>(null);

// Custom hook to use auth context
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    );
  }

  return context;
};

/**
 * AuthProvider - Provides authentication context to the app
 *
 * Responsibilities:
 * - Manage auth state (user, session, encryption keys)
 * - Initialize from localStorage on app start
 * - Provide auth state and basic setters to components
 * - Handle session persistence
 *
 * Note: Auth operations (login, logout, etc.) are handled by TanStack Query
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthContextState>(initialAuthState);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    initializeAuthFromStorage(setAuthState);
  }, []);

  // Create auth action callbacks with useCallback for optimization
  const setAuthenticated = useCallback((userData: UserData, sessionData: SessionData = {}) => {
    createSetAuthenticated(setAuthState)(userData, sessionData);
  }, []);

  const clearAuth = useCallback(() => {
    createClearAuth(setAuthState)();
  }, []);

  const updateUser = useCallback((updatedUserData: Partial<UserData>) => {
    createUpdateUser(setAuthState)(updatedUserData);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    createSetLoading(setAuthState)(loading);
  }, []);

  const setError = useCallback((error: string | null) => {
    createSetError(setAuthState)(error);
  }, []);

  const updateActivity = useCallback(() => {
    createUpdateActivity(setAuthState)();
  }, []);

  const lockSession = useCallback(() => {
    createLockSession(setAuthState)();
  }, []);

  const actions = {
    setAuthenticated,
    clearAuth,
    updateUser,
    setLoading,
    setError,
    updateActivity,
    lockSession,
  };

  const contextValue = createContextValue(authState, actions);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Export both the hook and context
export default AuthContext;
