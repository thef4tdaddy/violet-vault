import { useState, useEffect } from "react";
import { getVersionInfo, getVersionInfoAsync, getCacheStatus } from "@/utils/common/version";
import logger from "@/utils/common/logger";

/**
 * Version footer component with branch differentiation
 * Shows different styling and info for dev/staging/production builds
 * Fetches target version from GitHub milestones API when in development (with smart caching)
 */
const VersionFooter = () => {
  const [versionInfo, setVersionInfo] = useState(() => getVersionInfo());
  const [isLoadingMilestone, setIsLoadingMilestone] = useState(false);
  const [cacheInfo, setCacheInfo] = useState(() => getCacheStatus());

  useEffect(() => {
    // Only fetch from API if we're in development and don't have valid cache
    if (versionInfo.isDevelopment) {
      const currentCache = getCacheStatus();
      setCacheInfo(currentCache);

      // Only fetch if we don't have valid cached data
      if (!currentCache.isValid) {
        logger.debug("🔄 No valid cache, fetching milestone data...");
        setIsLoadingMilestone(true);
        getVersionInfoAsync()
          .then((updatedInfo) => {
            if (updatedInfo !== null && updatedInfo !== undefined) {
              setVersionInfo(updatedInfo);
            }
            setCacheInfo(getCacheStatus()); // Update cache status
            setIsLoadingMilestone(false);
          })
          .catch((error: unknown) => {
            logger.warn("Failed to fetch milestone info: " + String(error));
            setIsLoadingMilestone(false);
          });
      } else {
        logger.debug(
          `🎯 Using cached milestone (expires in ${currentCache.daysUntilExpiry > 0 ? currentCache.daysUntilExpiry + " days" : currentCache.hoursUntilExpiry + " hours"})`
        );
        // Use cached version
        getVersionInfoAsync().then((updatedInfo) => {
          if (updatedInfo !== null && updatedInfo !== undefined) {
            setVersionInfo(updatedInfo);
          }
        });
      }
    }
  }, [versionInfo.isDevelopment]);

  // Dynamic styling based on environment
  const getEnvironmentStyles = () => {
    if (versionInfo.environment === "development") {
      return {
        container: "glassmorphism rounded-2xl p-4 max-w-md mx-auto border-l-4 border-orange-400",
        title: "font-semibold text-orange-600",
        version: "text-orange-700 font-mono",
        label: "text-orange-600 text-xs font-medium",
      };
    } else if (versionInfo.environment === "preview") {
      return {
        container: "glassmorphism rounded-2xl p-4 max-w-md mx-auto border-l-4 border-blue-400",
        title: "font-semibold text-blue-600",
        version: "text-blue-700 font-mono",
        label: "text-blue-600 text-xs font-medium",
      };
    } else {
      return {
        container: "glassmorphism rounded-2xl p-4 max-w-md mx-auto border-l-4 border-green-400",
        title: "font-semibold text-purple-600",
        version: "text-gray-700 font-mono",
        label: "text-green-600 text-xs font-medium",
      };
    }
  };

  const styles = getEnvironmentStyles();

  return (
    <div className="mt-8 mb-8 text-center px-4">
      <div className={styles.container}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className={styles.title}>{versionInfo.displayName}</span>
          <span className={styles.version}>v{versionInfo.version}</span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={styles.label}>{versionInfo.environmentLabel}</span>
          {versionInfo.isDevelopment && versionInfo.futureVersion && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              → v{versionInfo.baseVersion} targeting v{versionInfo.futureVersion}
            </span>
          )}
          {versionInfo.environment === "production" && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              v{versionInfo.packageVersion} (package.json)
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          {versionInfo.isDevelopment
            ? `Last updated: ${versionInfo.buildDate}`
            : `Released: ${versionInfo.buildDate}`}
          {versionInfo.commitHash && versionInfo.commitHash !== "unknown" && (
            <span className="ml-1 font-mono">({versionInfo.commitHash})</span>
          )}
          <br />
          Built with ❤️ for secure budgeting
        </p>

        {versionInfo.isDevelopment && (
          <div className="mt-1">
            <p className="text-xs text-orange-600 font-medium">
              Development build from {versionInfo.branch} branch
            </p>
            {versionInfo.commitMessage && versionInfo.commitMessage !== "Build without git" && (
              <p className="text-xs text-orange-500 mt-1 italic truncate">
                "{versionInfo.commitMessage}"
              </p>
            )}
            {cacheInfo.isValid && (
              <p className="text-xs text-orange-400 mt-1">
                📦 Cached milestone (expires in{" "}
                {cacheInfo.daysUntilExpiry > 0
                  ? `${cacheInfo.daysUntilExpiry}d`
                  : `${cacheInfo.hoursUntilExpiry}h`}
                )
              </p>
            )}
            {isLoadingMilestone && (
              <p className="text-xs text-orange-500 mt-1 animate-pulse">
                🔄 Fetching milestone data...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { VersionFooter };
