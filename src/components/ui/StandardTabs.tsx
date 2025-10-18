import React from "react";

// Configuration constants
const SIZE_CONFIG = {
  sm: {
    text: "text-sm",
    padding: "py-1 px-2",
    iconSize: "h-3 w-3",
    countPadding: "py-0.5 px-1.5",
    countText: "text-xs",
  },
  md: {
    text: "text-sm",
    padding: "py-2 px-3",
    iconSize: "h-4 w-4",
    countPadding: "py-0.5 px-2",
    countText: "text-xs",
  },
  lg: {
    text: "text-base",
    padding: "py-3 px-4",
    iconSize: "h-5 w-5",
    countPadding: "py-1 px-2.5",
    countText: "text-sm",
  },
};

const COLOR_CONFIG = {
  blue: {
    pastel: "bg-blue-100 text-blue-700 border-blue-200",
    bright: "bg-blue-500 text-white border-blue-500",
    count: { pastel: "bg-blue-200 text-blue-800", bright: "bg-blue-400 text-blue-50" },
  },
  green: {
    pastel: "bg-emerald-100 text-emerald-700 border-emerald-200",
    bright: "bg-emerald-500 text-white border-emerald-500",
    count: { pastel: "bg-emerald-200 text-emerald-800", bright: "bg-emerald-400 text-emerald-50" },
  },
  red: {
    pastel: "bg-red-100 text-red-700 border-red-200",
    bright: "bg-red-500 text-white border-red-500",
    count: { pastel: "bg-red-200 text-red-800", bright: "bg-red-400 text-red-50" },
  },
  amber: {
    pastel: "bg-amber-100 text-amber-700 border-amber-200",
    bright: "bg-amber-500 text-white border-amber-500",
    count: { pastel: "bg-amber-200 text-amber-800", bright: "bg-amber-400 text-amber-50" },
  },
  purple: {
    pastel: "bg-purple-100 text-purple-700 border-purple-200",
    bright: "bg-purple-500 text-white border-purple-500",
    count: { pastel: "bg-purple-200 text-purple-800", bright: "bg-purple-400 text-purple-50" },
  },
  cyan: {
    pastel: "bg-cyan-100 text-cyan-700 border-cyan-200",
    bright: "bg-cyan-500 text-white border-cyan-500",
    count: { pastel: "bg-cyan-200 text-cyan-800", bright: "bg-cyan-400 text-cyan-50" },
  },
  gray: {
    pastel: "bg-gray-100 text-gray-700 border-gray-200",
    bright: "bg-gray-600 text-white border-gray-600",
    count: { pastel: "bg-gray-200 text-gray-800", bright: "bg-gray-500 text-gray-50" },
  },
};

// Helper functions
const getVariantStyle = (variant, isActive) => {
  const styles = {
    underline: {
      active: "border-blue-500 text-blue-700 border-b-2",
      inactive: "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 border-b-2",
    },
    pills: {
      active: "bg-blue-100 text-blue-700 rounded-lg",
      inactive: "text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg",
    },
    buttons: {
      active: "bg-blue-600 text-white rounded-md shadow-sm",
      inactive: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-md shadow-sm",
    },
    tabs: {
      active: "bg-white text-blue-700 border-t-2 border-l border-r border-blue-500 rounded-t-lg shadow-sm relative z-10",
      inactive: "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 rounded-t-lg relative",
    },
    colored: { active: "", inactive: "" },
  };
  const variantStyles = styles[variant] || styles.underline;
  return isActive ? variantStyles.active : variantStyles.inactive;
};

const getCountStyle = (variant, isActive) => {
  const styles = {
    underline: { active: "bg-blue-100 text-blue-700", inactive: "bg-gray-200 text-gray-800" },
    pills: { active: "bg-blue-200 text-blue-800", inactive: "bg-gray-300 text-gray-700" },
    buttons: { active: "bg-blue-500 text-blue-100", inactive: "bg-gray-100 text-gray-600" },
    tabs: { active: "bg-blue-100 text-blue-800", inactive: "bg-gray-200 text-gray-700" },
    colored: { active: "", inactive: "" },
  };
  const variantStyles = styles[variant] || styles.underline;
  return isActive ? variantStyles.active : variantStyles.inactive;
};

const getContainerClass = (variant) => {
  return variant === "underline" || variant === "tabs" ? "border-b border-gray-200" : "";
};

const getNavClass = (variant) => {
  if (variant === "underline") return "flex space-x-8";
  if (variant === "tabs" || variant === "colored") return "flex -mb-px space-x-1";
  return "flex space-x-1";
};

const getColoredTabStyles = (isActive, color) => {
  const colors = COLOR_CONFIG[color] || COLOR_CONFIG.blue;
  if (isActive) {
    return `${colors.bright} rounded-t-lg shadow-sm relative z-10`;
  }
  return `${colors.pastel} rounded-t-lg relative hover:brightness-110 transition-all`;
};

const getColoredCountStyles = (isActive, color) => {
  const colors = COLOR_CONFIG[color] || COLOR_CONFIG.blue;
  return isActive ? colors.count.bright : colors.count.pastel;
};

/**
 * Standardized tabs component with proper contrast and consistent styling
 * Follows accessibility guidelines with high-contrast text
 */
const StandardTabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  size = "md",
  variant = "underline",
  className = "",
}) => {
  const config = SIZE_CONFIG[size];

  const getVariantStyles = (isActive, isDisabled) => {
    if (isDisabled) return "cursor-not-allowed opacity-50 text-gray-400";
    return getVariantStyle(variant, isActive);
  };

  const getCountStyles = (isActive) => getCountStyle(variant, isActive);
  const containerClass = getContainerClass(variant);
  const navClass = getNavClass(variant);

  return (
    <div className={`${containerClass} ${className}`}>
      <nav className={navClass}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            config={config}
            variant={variant}
            getVariantStyles={getVariantStyles}
            getCountStyles={getCountStyles}
            onTabChange={onTabChange}
          />
        ))}
      </nav>
    </div>
  );
};

const TabButton = ({ tab, isActive, config, variant, getVariantStyles, getCountStyles, onTabChange }) => {
  const isDisabled = tab.disabled || false;
  const Icon = tab.icon;

  let tabStyles = getVariantStyles(isActive, isDisabled);
  let countStyles = getCountStyles(isActive);

  if (variant === "colored" && tab.color && !isDisabled) {
    tabStyles = getColoredTabStyles(isActive, tab.color);
    countStyles = getColoredCountStyles(isActive, tab.color);
  }

  return (
    <button
      onClick={() => !isDisabled && onTabChange(tab.id)}
      disabled={isDisabled}
      className={`
        font-medium ${config.text} ${config.padding} 
        flex items-center gap-2 transition-all duration-200
        ${tabStyles}
        ${isActive && variant === "colored" ? "border-2 border-black" : ""}
      `.trim()}
      style={isActive && variant === "colored" ? { border: "2px solid black" } : {}}
    >
      {Icon && React.createElement(Icon, { className: config.iconSize })}
      {tab.label}
      {tab.count !== undefined && tab.count !== null && (
        <TabCount count={tab.count} config={config} countStyles={countStyles} />
      )}
    </button>
  );
};

const TabCount = ({ count, config, countStyles }) => (
  <span
    className={`ml-1 ${config.countPadding} rounded-full ${config.countText} ${countStyles}`.trim()}
  >
    {count}
  </span>
);

export default StandardTabs;
