// src/utils/version.js
import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// Cache for milestone data
let milestoneCache = {
  data: null,
  timestamp: null,
  ttl: 10 * 60 * 1000, // 10 minutes cache
};

// Fetch target version from GitHub milestones API
export const fetchTargetVersion = async () => {
  // Check cache first
  const now = Date.now();
  if (milestoneCache.data && milestoneCache.timestamp && 
      (now - milestoneCache.timestamp) < milestoneCache.ttl) {
    return milestoneCache.data;
  }

  try {
    // Use our Cloudflare Worker endpoint to fetch milestones
    const endpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT?.replace('/report-issue', '/milestones') 
                  || 'https://violet-vault-bug-reporter.fragrant-fog-c708.workers.dev/milestones';
    
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.success && data.current?.version) {
      // Cache the result
      milestoneCache = {
        data: data.current.version,
        timestamp: now,
      };
      return data.current.version;
    } else if (data.fallback?.version) {
      return data.fallback.version;
    }
  } catch (error) {
    console.warn('Failed to fetch milestone data:', error);
  }
  
  // Fallback logic if API fails
  return getTargetVersionFallback();
};

// Fallback target version detection (used when API is unavailable)
const getTargetVersionFallback = () => {
  const currentVersion = APP_VERSION;
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // Smart fallback based on current version
  if (major === 1 && minor === 6) {
    return '1.8.0'; // Known current milestone
  } else if (major === 1 && minor === 8) {
    return '1.9.0'; // Next milestone after 1.8.0
  } else {
    // Generic fallback: increment minor version
    return `${major}.${minor + 1}.0`;
  }
};

// Branch and environment detection (sync version for immediate use)
export const getBranchInfo = (targetVersion = null) => {
  // Check environment variables first
  const appEnv = import.meta.env.VITE_APP_ENV;
  const isDev = import.meta.env.DEV;
  const fallbackVersion = targetVersion || getTargetVersionFallback();
  
  // Determine branch type and future version
  if (appEnv === 'development' || isDev) {
    return {
      branch: 'develop',
      environment: 'development',
      futureVersion: fallbackVersion,
      isDevelopment: true,
    };
  } else if (appEnv === 'staging') {
    return {
      branch: 'staging',
      environment: 'staging',
      futureVersion: fallbackVersion,
      isDevelopment: false,
    };
  } else {
    return {
      branch: 'main',
      environment: 'production',
      futureVersion: null,
      isDevelopment: false,
    };
  }
};

// Format version for display with branch differentiation (sync - immediate)
export const getVersionInfo = (targetVersion = null) => {
  const branchInfo = getBranchInfo(targetVersion);
  
  let displayVersion = APP_VERSION;
  let environmentLabel = '';
  
  // Add branch-specific version formatting
  if (branchInfo.isDevelopment && branchInfo.futureVersion) {
    displayVersion = `${branchInfo.futureVersion}-dev`;
    environmentLabel = '🚧 Development Build';
  } else if (branchInfo.environment === 'staging') {
    displayVersion = `${APP_VERSION}-staging`;
    environmentLabel = '🔄 Staging Build';
  } else {
    environmentLabel = '✅ Production';
  }
  
  return {
    version: displayVersion,
    baseVersion: APP_VERSION,
    name: APP_NAME,
    displayName: "VioletVault",
    buildDate: new Date().toISOString().split("T")[0],
    branch: branchInfo.branch,
    environment: branchInfo.environment,
    environmentLabel,
    isDevelopment: branchInfo.isDevelopment,
    futureVersion: branchInfo.futureVersion,
  };
};

// Async version that fetches from GitHub API
export const getVersionInfoAsync = async () => {
  try {
    const targetVersion = await fetchTargetVersion();
    return getVersionInfo(targetVersion);
  } catch (error) {
    console.warn('Failed to fetch async version info, using fallback:', error);
    return getVersionInfo();
  }
};
