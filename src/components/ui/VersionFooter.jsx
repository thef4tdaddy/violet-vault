import React from "react";
import { getVersionInfo } from "../../utils/version";

/**
 * Version footer component
 * Extracted from Layout.jsx for better organization
 */
const VersionFooter = () => {
  const versionInfo = getVersionInfo();

  return (
    <div className="mt-8 text-center">
      <div className="glassmorphism rounded-2xl p-4 max-w-md mx-auto">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-purple-600">{versionInfo.displayName}</span> v
          {versionInfo.version}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Built on {versionInfo.buildDate} with ❤️ for secure budgeting
        </p>
      </div>
    </div>
  );
};

export default VersionFooter;
