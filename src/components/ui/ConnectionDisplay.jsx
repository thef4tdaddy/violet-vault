import React from "react";
import { X } from "lucide-react";

/**
 * Shared component for displaying connected entity relationships in modals
 * Provides consistent styling and behavior across debt, envelope, and bill modals
 */
const ConnectionDisplay = ({
  title = "Connected",
  icon: IconComponent,
  onDisconnect,
  children,
  isVisible = true,
  className = "",
}) => {
  if (!isVisible) return null;

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6 mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <label className="block text-lg font-bold text-green-800 flex items-center">
          {IconComponent && <IconComponent className="h-6 w-6 mr-3" />}
          🔗 {title}
        </label>
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Disconnect
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

/**
 * Sub-component for displaying individual connection items
 */
export const ConnectionItem = ({
  icon: IconComponent,
  title,
  details,
  badge,
  badgeColor = "green",
}) => {
  const badgeColors = {
    green: "text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full",
    blue: "text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full",
    purple: "text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full",
  };

  return (
    <div className="flex items-center p-3 bg-white rounded-lg border border-green-200">
      {IconComponent && <IconComponent className="h-5 w-5 mr-3 text-green-600" />}
      <div className="flex-1">
        <div className="font-medium text-green-800">{title}</div>
        {details && <div className="text-sm text-green-700">{details}</div>}
      </div>
      {badge && (
        <div className={badgeColors[badgeColor] || badgeColors.green}>
          {badge}
        </div>
      )}
    </div>
  );
};

/**
 * Sub-component for connection info/help text
 */
export const ConnectionInfo = ({ children, className = "" }) => (
  <div className={`mt-3 p-3 bg-green-100 border border-green-300 rounded-lg ${className}`}>
    <p className="text-sm text-green-700 font-medium">{children}</p>
  </div>
);

export default ConnectionDisplay;