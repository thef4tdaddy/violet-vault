// src/utils/version.js
import packageJson from "../../package.json";
import logger from "./logger";

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// Enhanced cache for release-please version data with localStorage persistence
// Optimized for Saturday releases - cache expires Sunday to catch new release PRs
let versionCache = {
  data: null,
  timestamp: null,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days cache (releases updated Saturdays)
};

// Cache key for localStorage
const CACHE_KEY = "violet-vault-version-cache";

// Initialize cache from localStorage on load
const initializeCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();

      // Only use cached data if it's still valid
      if (parsed.timestamp && now - parsed.timestamp < versionCache.ttl) {
        versionCache = parsed;
        logger.debug("Loaded version cache from localStorage", {
          version: versionCache.data,
        });
        return true;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (error) {
    logger.warn("Failed to load milestone cache:", error);
  }
  return false;
};

// Save cache to localStorage
const saveCache = (data) => {
  try {
    versionCache = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(versionCache));
    logger.debug("Cached version data", { version: data });
  } catch (error) {
    logger.warn("Failed to save version cache:", error);
  }
};

// Fetch target version from release-please API with smart caching
export const fetchTargetVersion = async () => {
  // Initialize cache from localStorage if not already done
  if (!versionCache.timestamp) {
    initializeCache();
  }

  // Check in-memory cache first
  const now = Date.now();
  if (
    versionCache.data &&
    versionCache.timestamp &&
    now - versionCache.timestamp < versionCache.ttl
  ) {
    logger.debug("Using cached target version", { version: versionCache.data });
    return versionCache.data;
  }

  logger.debug("Fetching fresh release-please data from API");

  try {
    // Use our Cloudflare Worker endpoint to fetch release-please data (more accurate than milestones)
    const endpoint =
      import.meta.env.VITE_BUG_REPORT_ENDPOINT?.replace("/report-issue", "/releases") ||
      "https://violet-vault-bug-reporter.fragrant-fog-c708.workers.dev/releases";

    const response = await fetch(endpoint, {
      // Add cache-control headers to prevent browser caching
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = await response.json();

    if (data.success && data.nextVersion) {
      // Save to cache
      saveCache(data.nextVersion);
      logger.info("Fetched next version from release-please", {
        version: data.nextVersion,
      });
      return data.nextVersion;
    } else if (data.fallback?.nextVersion) {
      // Use fallback but don't cache it (so we retry next time)
      logger.warn("Using fallback next version", {
        version: data.fallback.nextVersion,
      });
      return data.fallback.nextVersion;
    }
  } catch (error) {
    logger.warn("Failed to fetch milestone data", error);
  }

  // Fallback logic if API fails
  const fallbackVersion = getTargetVersionFallback();
  logger.debug("Using local fallback version", { version: fallbackVersion });
  return fallbackVersion;
};

// Get actual commit date from git (injected at build time)
const getActualCommitDate = () => {
  // Try git commit date first (injected by Vite build)
  const gitCommitDate = import.meta.env.VITE_GIT_COMMIT_DATE;
  if (gitCommitDate) {
    return new Date(gitCommitDate).toISOString().split("T")[0];
  }

  // Fallback to Vercel git environment variables
  const vercelCommitDate = import.meta.env.VITE_VERCEL_GIT_COMMIT_AUTHOR_DATE;
  if (vercelCommitDate) {
    return new Date(vercelCommitDate).toISOString().split("T")[0];
  }

  // Final fallback: use build time if available
  const buildTime = import.meta.env.VITE_BUILD_TIME;
  if (buildTime) {
    return new Date(buildTime).toISOString().split("T")[0];
  }

  // Last resort: use a static date based on branch and version
  const versionDates = {
    "1.8.0": "2025-08-16", // Actual v1.8.0 release date
    "1.9.0": "2025-08-17", // Current development
    "1.10.0": "2025-09-01", // Planned future release
  };

  return versionDates[APP_VERSION] || new Date().toISOString().split("T")[0];
};

// Fallback target version detection (used when API is unavailable)
const getTargetVersionFallback = () => {
  const currentVersion = APP_VERSION;
  const [major, minor] = currentVersion.split(".").map(Number);

  // Smart fallback based on current version
  if (major === 1 && minor === 6) {
    return "1.8.0"; // Known completed milestone (legacy support)
  } else if (major === 1 && minor === 8) {
    return "1.9.0"; // Current target milestone (v1.8.0 completed)
  } else if (major === 1 && minor === 9) {
    return "1.10.0"; // Next milestone after 1.9.0
  } else {
    // Generic fallback: increment minor version
    return `${major}.${minor + 1}.0`;
  }
};

// Branch and environment detection with actual git branch info
export const getBranchInfo = (targetVersion = null) => {
  // Get actual git branch from build-time injection
  const actualGitBranch = import.meta.env.VITE_GIT_BRANCH;

  // Check multiple environment detection methods
  const appEnv = import.meta.env.VITE_APP_ENV;
  const isDev = import.meta.env.DEV;

  // Vercel environment detection
  const vercelEnv = import.meta.env.VITE_VERCEL_ENV; // production, preview, development
  const isVercelProduction = vercelEnv === "production";
  const isVercelPreview = vercelEnv === "preview";

  // Alternative detection: Check for Vercel URL patterns as fallback
  const isVercelDeploy =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes(".vercel.app"));
  const isMainBranchOnVercel =
    isVercelDeploy &&
    window.location.hostname.startsWith("violet-vault-") &&
    !window.location.hostname.includes("git-");
  const isPreviewBranchOnVercel =
    isVercelDeploy &&
    (window.location.hostname.includes("git-") || window.location.hostname.includes("-git-"));

  // Other common environment indicators
  const nodeEnv = import.meta.env.NODE_ENV;

  const fallbackVersion = targetVersion || getTargetVersionFallback();

  // Determine branch: Use actual git branch if available, otherwise fall back to environment detection
  let branch = actualGitBranch || "unknown";

  // Environment detection priority:
  // 1. Local development (npm run dev)
  // 2. Vercel Preview (PR/branch deploys)
  // 3. Vercel Production (main branch deploy)

  if (isDev || appEnv === "development") {
    return {
      branch: branch,
      environment: "development",
      futureVersion: fallbackVersion,
      isDevelopment: true,
      platform: "local",
    };
  } else if (isVercelPreview || isPreviewBranchOnVercel || appEnv === "preview") {
    return {
      branch: branch || "develop", // Default to develop for preview
      environment: "preview",
      futureVersion: fallbackVersion,
      isDevelopment: true, // Preview shows dev features
      platform: "vercel-preview",
    };
  } else if (
    isVercelProduction ||
    isMainBranchOnVercel ||
    appEnv === "production" ||
    nodeEnv === "production"
  ) {
    return {
      branch: branch || "main", // Default to main for production
      environment: "production",
      futureVersion: null,
      isDevelopment: false,
      platform: isVercelProduction ? "vercel-production" : "production",
    };
  } else {
    // Default to production for safety
    return {
      branch: branch || "main",
      environment: "production",
      futureVersion: null,
      isDevelopment: false,
      platform: "unknown",
    };
  }
};

// Format version for display with branch differentiation (sync - immediate)
export const getVersionInfo = (targetVersion = null) => {
  const branchInfo = getBranchInfo(targetVersion);

  let displayVersion = APP_VERSION; // Always start with package.json version
  let environmentLabel = "";

  // Add branch-specific version formatting
  if (branchInfo.environment === "development") {
    displayVersion = branchInfo.futureVersion
      ? `${branchInfo.futureVersion}-dev`
      : `${APP_VERSION}-dev`;
    environmentLabel = "🚧 Development Build";
  } else if (branchInfo.environment === "preview") {
    displayVersion = branchInfo.futureVersion
      ? `${branchInfo.futureVersion}-preview`
      : `${APP_VERSION}-preview`;
    environmentLabel = "🔄 Preview Build";
  } else {
    // Production: Use actual package.json version (always authoritative)
    displayVersion = APP_VERSION;
    environmentLabel = "✅ Production";
  }

  // Get actual commit date (injected at build time)
  const commitDate = getActualCommitDate(branchInfo);

  return {
    version: displayVersion,
    baseVersion: APP_VERSION, // Always from package.json
    name: APP_NAME,
    displayName: "VioletVault",
    buildDate: commitDate, // Now shows actual git commit date
    branch: branchInfo.branch,
    environment: branchInfo.environment,
    environmentLabel,
    isDevelopment: branchInfo.isDevelopment,
    futureVersion: branchInfo.futureVersion,
    packageVersion: APP_VERSION, // Explicitly show package.json version
  };
};

// Async version that fetches from GitHub API
export const getVersionInfoAsync = async () => {
  try {
    const targetVersion = await fetchTargetVersion();
    return getVersionInfo(targetVersion);
  } catch (error) {
    logger.warn("Failed to fetch async version info, using fallback:", error);
    return getVersionInfo();
  }
};

// Utility functions for cache management
export const clearVersionCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    versionCache = {
      data: null,
      timestamp: null,
      ttl: 7 * 24 * 60 * 60 * 1000,
    };
    logger.debug("Version cache cleared");
  } catch (error) {
    logger.warn("Failed to clear cache:", error);
  }
};

export const getCacheStatus = () => {
  const now = Date.now();
  const isValid =
    versionCache.data && versionCache.timestamp && now - versionCache.timestamp < versionCache.ttl;

  const timeUntilExpiry = isValid ? versionCache.timestamp + versionCache.ttl - now : 0;
  const daysUntilExpiry = Math.round(timeUntilExpiry / (24 * 60 * 60 * 1000));
  const hoursUntilExpiry = Math.round(timeUntilExpiry / (60 * 60 * 1000));

  return {
    hasData: !!versionCache.data,
    isValid,
    version: versionCache.data,
    cachedAt: versionCache.timestamp ? new Date(versionCache.timestamp) : null,
    expiresAt: versionCache.timestamp ? new Date(versionCache.timestamp + versionCache.ttl) : null,
    daysUntilExpiry: isValid ? daysUntilExpiry : 0,
    hoursUntilExpiry: isValid ? hoursUntilExpiry : 0,
    // Legacy support
    minutesUntilExpiry: isValid ? Math.round(timeUntilExpiry / (60 * 1000)) : 0,
  };
};

// Development utility for testing version transitions
export const simulateVersionTransition = (newTargetVersion) => {
  logger.debug("Simulating version transition", {
    targetVersion: newTargetVersion,
  });
  clearVersionCache();

  // Temporarily override the cache with new version for testing
  try {
    versionCache = {
      data: newTargetVersion,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(versionCache));
    logger.debug("Cached new target version", { version: newTargetVersion });
  } catch (error) {
    logger.warn("Failed to save simulated cache:", error);
  }

  logger.info("Simulated transition complete. Run getVersionInfoAsync() to test.");
  return newTargetVersion;
};

// Quick check for current milestone status
export const getCurrentMilestoneInfo = async () => {
  const versionInfo = await getVersionInfoAsync();
  const cacheStatus = getCacheStatus();

  return {
    currentBaseVersion: versionInfo.baseVersion,
    targetVersion: versionInfo.futureVersion,
    displayVersion: versionInfo.version,
    isDevelopment: versionInfo.isDevelopment,
    cacheValid: cacheStatus.isValid,
    cacheExpiresIn:
      cacheStatus.daysUntilExpiry > 0
        ? `${cacheStatus.daysUntilExpiry} days`
        : `${cacheStatus.hoursUntilExpiry} hours`,
  };
};
