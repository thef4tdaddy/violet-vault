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
  theme = "purple", // Default to purple theme for violet branding
}) => {
  if (!isVisible) return null;

  // Theme configurations for different contexts
  const themes = {
    purple: {
      container: "bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-300",
      titleText: "text-purple-800",
      iconColor: "text-purple-600",
    },
    green: {
      container: "bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300", 
      titleText: "text-green-800",
      iconColor: "text-green-600",
    },
    yellow: {
      container: "bg-yellow-50 border border-yellow-200",
      titleText: "text-yellow-800", 
      iconColor: "text-yellow-600",
    },
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <div
      className={`${currentTheme.container} rounded-xl p-6 mb-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <label className={`block text-lg font-bold ${currentTheme.titleText} flex items-center`}>
          {IconComponent && <IconComponent className={`h-6 w-6 mr-3 ${currentTheme.iconColor}`} />}
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
  badgeColor = "purple",
  theme = "purple",
}) => {
  const badgeColors = {
    green: "text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full",
    blue: "text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full",
    purple: "text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full",
    yellow: "text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full",
  };

  const themes = {
    purple: {
      border: "border-purple-200",
      iconColor: "text-purple-600",
      titleColor: "text-purple-800",
      detailColor: "text-purple-700",
    },
    green: {
      border: "border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      detailColor: "text-green-700",
    },
    yellow: {
      border: "border-yellow-200",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      detailColor: "text-yellow-700",
    },
  };

  const currentTheme = themes[theme] || themes.purple;

  return (
    <div className={`flex items-center p-3 bg-white rounded-lg border ${currentTheme.border}`}>
      {IconComponent && <IconComponent className={`h-5 w-5 mr-3 ${currentTheme.iconColor}`} />}
      <div className="flex-1">
        <div className={`font-medium ${currentTheme.titleColor}`}>{title}</div>
        {details && <div className={`text-sm ${currentTheme.detailColor}`}>{details}</div>}
      </div>
      {badge && <div className={badgeColors[badgeColor] || badgeColors.purple}>{badge}</div>}
    </div>
  );
};

/**
 * Sub-component for connection info/help text
 */
export const ConnectionInfo = ({ children, className = "", theme = "purple" }) => {
  const themes = {
    purple: "bg-purple-100 border border-purple-300 text-purple-700",
    green: "bg-green-100 border border-green-300 text-green-700",
    yellow: "bg-yellow-100 border border-yellow-300 text-yellow-700",
  };

  const themeClasses = themes[theme] || themes.purple;

  return (
    <div className={`mt-3 p-3 ${themeClasses} rounded-lg ${className}`}>
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
};

export default ConnectionDisplay;
