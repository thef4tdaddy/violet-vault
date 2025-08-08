// src/utils/version.js
import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

// Enhanced cache for milestone data with localStorage persistence
// Optimized for Saturday milestone updates - cache expires Sunday to catch new milestones
let milestoneCache = {
  data: null,
  timestamp: null,
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days cache (milestones updated Saturdays)
};

// Cache key for localStorage
const CACHE_KEY = 'violet-vault-milestone-cache';

// Initialize cache from localStorage on load
const initializeCache = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      // Only use cached data if it's still valid
      if (parsed.timestamp && (now - parsed.timestamp) < milestoneCache.ttl) {
        milestoneCache = parsed;
        console.log('📦 Loaded milestone cache from localStorage:', milestoneCache.data);
        return true;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (error) {
    console.warn('Failed to load milestone cache:', error);
  }
  return false;
};

// Save cache to localStorage
const saveCache = (data) => {
  try {
    milestoneCache = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(milestoneCache));
    console.log('💾 Cached milestone data:', data);
  } catch (error) {
    console.warn('Failed to save milestone cache:', error);
  }
};

// Fetch target version from GitHub milestones API with smart caching
export const fetchTargetVersion = async () => {
  // Initialize cache from localStorage if not already done
  if (!milestoneCache.timestamp) {
    initializeCache();
  }

  // Check in-memory cache first
  const now = Date.now();
  if (milestoneCache.data && milestoneCache.timestamp && 
      (now - milestoneCache.timestamp) < milestoneCache.ttl) {
    console.log('🎯 Using cached milestone version:', milestoneCache.data);
    return milestoneCache.data;
  }

  console.log('🔄 Fetching fresh milestone data from API...');

  try {
    // Use our Cloudflare Worker endpoint to fetch milestones
    const endpoint = import.meta.env.VITE_BUG_REPORT_ENDPOINT?.replace('/report-issue', '/milestones') 
                  || 'https://violet-vault-bug-reporter.fragrant-fog-c708.workers.dev/milestones';
    
    const response = await fetch(endpoint, {
      // Add cache-control headers to prevent browser caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.current?.version) {
      // Save to cache
      saveCache(data.current.version);
      console.log('✅ Fetched milestone version from API:', data.current.version);
      return data.current.version;
    } else if (data.fallback?.version) {
      // Use fallback but don't cache it (so we retry next time)
      console.log('⚠️ Using fallback version:', data.fallback.version);
      return data.fallback.version;
    }
  } catch (error) {
    console.warn('❌ Failed to fetch milestone data:', error);
  }
  
  // Fallback logic if API fails
  const fallbackVersion = getTargetVersionFallback();
  console.log('🔄 Using local fallback version:', fallbackVersion);
  return fallbackVersion;
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

// Utility functions for cache management
export const clearVersionCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    milestoneCache = { data: null, timestamp: null, ttl: 7 * 24 * 60 * 60 * 1000 };
    console.log('🗑️ Milestone cache cleared');
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

export const getCacheStatus = () => {
  const now = Date.now();
  const isValid = milestoneCache.data && milestoneCache.timestamp && 
                  (now - milestoneCache.timestamp) < milestoneCache.ttl;
  
  const timeUntilExpiry = isValid ? (milestoneCache.timestamp + milestoneCache.ttl - now) : 0;
  const daysUntilExpiry = Math.round(timeUntilExpiry / (24 * 60 * 60 * 1000));
  const hoursUntilExpiry = Math.round(timeUntilExpiry / (60 * 60 * 1000));
  
  return {
    hasData: !!milestoneCache.data,
    isValid,
    version: milestoneCache.data,
    cachedAt: milestoneCache.timestamp ? new Date(milestoneCache.timestamp) : null,
    expiresAt: milestoneCache.timestamp ? new Date(milestoneCache.timestamp + milestoneCache.ttl) : null,
    daysUntilExpiry: isValid ? daysUntilExpiry : 0,
    hoursUntilExpiry: isValid ? hoursUntilExpiry : 0,
    // Legacy support
    minutesUntilExpiry: isValid ? Math.round(timeUntilExpiry / (60 * 1000)) : 0,
  };
};
