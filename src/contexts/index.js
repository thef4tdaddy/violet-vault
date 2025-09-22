/**
 * Context exports - React Context providers and hooks
 *
 * Following the new architecture pattern:
 * - React Context for auth state
 * - TanStack Query for auth operations
 * - Zustand for UI state only
 */

export { AuthProvider, useAuth } from "./AuthContext";
