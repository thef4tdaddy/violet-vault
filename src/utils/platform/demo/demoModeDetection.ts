/**
 * Demo Mode Detection Utility
 *
 * Detects when the application is running in Demo Mode to enable
 * in-memory storage and prevent data persistence.
 *
 * Demo mode is active when:
 * - URL path starts with `/demo`
 * - Query parameter `?demo=true` is present
 */

/**
 * Check if the application is currently in Demo Mode
 * @returns true if demo mode is active, false otherwise
 */
export const isDemoMode = (): boolean => {
  // Server-side rendering check
  if (typeof window === "undefined") {
    return false;
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // Check if path starts with /demo
  const isDemoPath = pathname.startsWith("/demo");

  // Check for demo query parameter
  const hasDemoParam = searchParams.get("demo") === "true";

  return isDemoPath || hasDemoParam;
};

/**
 * Get demo mode configuration
 * @returns Configuration object for demo mode
 */
export const getDemoModeConfig = () => {
  const isDemo = isDemoMode();

  return {
    isDemoMode: isDemo,
    // In demo mode, use in-memory storage
    useInMemoryStorage: isDemo,
    // In demo mode, skip Firebase sync
    skipFirebaseSync: isDemo,
    // In demo mode, auto-seed data
    autoSeedData: isDemo,
    // Database name for demo mode
    databaseName: isDemo ? "VioletVaultDemo" : "VioletVault",
  };
};

/**
 * React hook to detect demo mode
 * Note: This is a simple function wrapper, not a true React hook
 * For reactive updates, wrap with useMemo in components
 */
export const useDemoMode = () => {
  return getDemoModeConfig();
};
