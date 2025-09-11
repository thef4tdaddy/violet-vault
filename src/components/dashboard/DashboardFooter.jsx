import React from "react";
import { getIcon } from "../../utils";

/**
 * Dashboard Footer - Bottom section with version and links
 *
 * Features:
 * - Version information
 * - Quick links to key sections
 * - Last sync status
 * - Minimal design
 */
const DashboardFooter = () => {
  return (
    <div className="px-6 py-4 mt-8">
      <div className="glassmorphism rounded-lg p-4 border-2 border-black bg-gray-100/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          {/* Version Info */}
          <div className="flex items-center gap-2">
            {React.createElement(getIcon("Zap"), {
              className: "h-4 w-4 text-purple-600",
            })}
            <span>Violet Vault v1.0.0</span>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-4">
            <span className="text-xs">Last sync: Just now</span>
            <div className="flex items-center gap-1">
              {React.createElement(getIcon("CheckCircle"), {
                className: "h-3 w-3 text-green-600",
              })}
              <span className="text-xs">All data saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFooter;
