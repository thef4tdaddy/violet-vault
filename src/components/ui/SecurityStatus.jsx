import React from "react";
import { Lock, Unlock, Clock, Shield, Activity } from "lucide-react";

/**
 * Shared security status component for displaying security state information
 * Provides consistent status indicators across security interfaces
 *
 * @param {boolean} isLocked - Current lock state
 * @param {number} eventCount - Number of security events
 * @param {string} autoLockStatus - Auto-lock timing information
 * @param {Array} statusItems - Additional status items to display
 * @param {string} variant - 'detailed' | 'compact' for different display modes
 */
const SecurityStatus = ({
  isLocked,
  eventCount = 0,
  autoLockStatus,
  statusItems = [],
  variant = "detailed",
  className = "",
}) => {
  const isDetailed = variant === "detailed";

  // Standard status items that are always shown
  const defaultStatusItems = [
    {
      label: "Session Status",
      value: isLocked ? "Locked" : "Active",
      icon: isLocked ? Lock : Unlock,
      color: isLocked ? "text-red-600" : "text-green-600",
    },
    {
      label: "Security Events",
      value: `${eventCount} recorded`,
      icon: Activity,
      color: "text-gray-600",
    },
  ];

  // Add auto-lock status if provided
  if (autoLockStatus && !isLocked) {
    defaultStatusItems.splice(1, 0, {
      label: "Auto-lock in",
      value: autoLockStatus,
      icon: Clock,
      color: "text-orange-600",
    });
  }

  // Combine with any additional status items
  const allStatusItems = [...defaultStatusItems, ...statusItems];

  const containerClasses = `
    ${isDetailed ? "bg-gray-50 p-4 rounded-lg border-2 border-black" : "p-2"}
    ${className}
  `.trim();

  const headerClasses = isDetailed
    ? "font-medium text-gray-900 mb-3 flex items-center gap-2"
    : "font-medium text-gray-700 mb-2 flex items-center gap-1";

  const itemClasses = isDetailed
    ? "flex justify-between text-sm space-y-2"
    : "flex justify-between text-xs space-y-1";

  return (
    <div className={containerClasses}>
      {isDetailed && (
        <h4 className={headerClasses}>
          <Shield className="h-4 w-4 text-blue-500" />
          Current Security Status
        </h4>
      )}

      <div className={itemClasses}>
        {allStatusItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                {Icon && <Icon className="h-3 w-3 text-gray-500" />}
                {item.label}:
              </span>
              <span className={`font-medium ${item.color}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SecurityStatus;
