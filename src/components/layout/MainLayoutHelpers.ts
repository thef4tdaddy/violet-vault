import { useLayoutData } from "@/hooks/platform/ux/layout/useLayoutData";
import type { useAuth } from "@/hooks/auth/useAuth";
import type { UserData } from "@/types/auth";

/**
 * Helper functions for MainLayout component
 * Extracted to reduce complexity
 */

type AuthHookType = ReturnType<typeof useAuth>;
type ExtractUserType = AuthHookType["user"];

/**
 * Interface for user data used in sync services
 */
export interface SyncUser {
  uid: string;
  email?: string;
  userName?: string;
  userColor?: string;
  joinedVia?: string;
  sharedBy?: string;
  shareCode?: string;
  [key: string]: unknown;
}

/**
 * Interface that matches the actual structure of UserData with potential extra fields
 */
interface ExtendedUserData extends UserData {
  uid?: string;
  email?: string;
  joinedVia?: "shareCode" | "link" | "standard" | null;
}

/**
 * Extract user information for Firebase sync
 */
export const getUserForSync = (currentUser: ExtractUserType): SyncUser | null => {
  if (!currentUser) return null;

  const user = currentUser as ExtendedUserData;

  return {
    uid: user.uid || "unknown",
    email: user.email || undefined,
    userName: user.userName,
    userColor: user.userColor,
    joinedVia: user.joinedVia ?? undefined,
    sharedBy: user.sharedBy,
    shareCode: user.shareCode,
  };
};

/**
 * Extract layout data fields
 */
export const extractLayoutData = (layoutData: ReturnType<typeof useLayoutData>) => {
  return {
    budget: layoutData?.budget,
    totalBiweeklyNeed: layoutData?.totalBiweeklyNeed,
    paycheckHistory: layoutData?.paycheckHistory,
  };
};

/**
 * Extract auth-related data
 */
export const extractAuthData = (auth: ReturnType<typeof useAuth>) => {
  return {
    securityContext: auth?.securityContext,
    isUnlocked: auth?.isUnlocked as boolean,
  };
};

/**
 * Check if security has been acknowledged
 * Note: localStorage access is restricted in this codebase but needed here for security acknowledgement
 */
export const hasSecurityAcknowledgement = (): boolean => {
  try {
    // eslint-disable-next-line no-restricted-syntax
    return !!localStorage.getItem("localDataSecurityAcknowledged");
  } catch {
    // Handle environments where localStorage is not available
    return false;
  }
};
