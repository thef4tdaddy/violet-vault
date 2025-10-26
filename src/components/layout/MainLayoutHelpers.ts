/**
 * Helper functions for MainLayout component
 * Extracted to reduce complexity
 */

/**
 * Extract user information for Firebase sync
 */
export const getUserForSync = (currentUser: unknown) => {
  if (!currentUser) return null;

  return {
    uid: ((currentUser as Record<string, unknown>)?.uid as string) || "unknown",
    email: ((currentUser as Record<string, unknown>)?.email as string) || undefined,
  };
};

/**
 * Extract layout data fields
 */
export const extractLayoutData = (layoutData: unknown) => {
  return {
    budget: (layoutData as Record<string, unknown>)?.budget,
    totalBiweeklyNeed: (layoutData as Record<string, unknown>)?.totalBiweeklyNeed,
    paycheckHistory: (layoutData as Record<string, unknown>)?.paycheckHistory,
  };
};

/**
 * Extract auth-related data
 */
export const extractAuthData = (auth: unknown) => {
  const authRecord = auth as Record<string, unknown>;
  return {
    securityContext: authRecord?.securityContext,
    isUnlocked: authRecord?.isUnlocked as boolean,
  };
};

/**
 * Extract onboarding state
 */
export const extractOnboardingState = (state: unknown) => {
  const stateRecord = state as Record<string, unknown>;
  const isOnboarded = stateRecord?.isOnboarded;
  return typeof isOnboarded === "boolean" ? isOnboarded : false;
};

/**
 * Check if security has been acknowledged
 */
export const hasSecurityAcknowledgement = (): boolean => {
  // eslint-disable-next-line no-restricted-syntax
  return !!localStorage.getItem("localDataSecurityAcknowledged");
};
