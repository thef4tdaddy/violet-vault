import React, { useState, useEffect } from "react";
import { getVersionInfo, getVersionInfoAsync } from "../../utils/version";

/**
 * Version footer component with branch differentiation
 * Shows different styling and info for dev/staging/production builds
 * Fetches target version from GitHub milestones API when in development
 */
const VersionFooter = () => {
  const [versionInfo, setVersionInfo] = useState(() => getVersionInfo());
  const [isLoadingMilestone, setIsLoadingMilestone] = useState(false);

  useEffect(() => {
    // Only fetch from API if we're in development
    if (versionInfo.isDevelopment) {
      setIsLoadingMilestone(true);
      getVersionInfoAsync()
        .then(updatedInfo => {
          setVersionInfo(updatedInfo);
          setIsLoadingMilestone(false);
        })
        .catch(error => {
          console.warn('Failed to fetch milestone info:', error);
          setIsLoadingMilestone(false);
        });
    }
  }, [versionInfo.isDevelopment]);

  // Dynamic styling based on environment
  const getEnvironmentStyles = () => {
    if (versionInfo.isDevelopment) {
      return {
        container: "glassmorphism rounded-2xl p-4 max-w-md mx-auto border-l-4 border-orange-400",
        title: "font-semibold text-orange-600",
        version: "text-orange-700 font-mono",
        label: "text-orange-600 text-xs font-medium",
      };
    } else if (versionInfo.environment === 'staging') {
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
    <div className="mt-8 text-center">
      <div className={styles.container}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className={styles.title}>{versionInfo.displayName}</span>
          <span className={styles.version}>v{versionInfo.version}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className={styles.label}>{versionInfo.environmentLabel}</span>
          {versionInfo.isDevelopment && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              → v{versionInfo.baseVersion} targeting v1.8.0
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          Built on {versionInfo.buildDate} with ❤️ for secure budgeting
        </p>
        
        {versionInfo.isDevelopment && (
          <p className="text-xs text-orange-600 mt-1 font-medium">
            Development build from {versionInfo.branch} branch
          </p>
        )}
      </div>
    </div>
  );
};

export default VersionFooter;
