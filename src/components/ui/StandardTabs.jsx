import React from "react";

/**
 * Standardized tabs component with proper contrast and consistent styling
 * Follows accessibility guidelines with high-contrast text
 * 
 * @param {Array} tabs - Array of tab objects with { id, label, icon, count?, disabled? }
 * @param {string} activeTab - Currently active tab id
 * @param {Function} onTabChange - Callback when tab changes
 * @param {string} size - 'sm' | 'md' | 'lg' for different sizes
 * @param {string} variant - 'underline' | 'pills' | 'buttons' for different styles
 */
const StandardTabs = ({ 
  tabs = [], 
  activeTab, 
  onTabChange, 
  size = 'md',
  variant = 'underline',
  className = ""
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      text: "text-sm",
      padding: "py-1 px-2",
      iconSize: "h-3 w-3",
      countPadding: "py-0.5 px-1.5",
      countText: "text-xs"
    },
    md: {
      text: "text-sm", 
      padding: "py-2 px-3",
      iconSize: "h-4 w-4",
      countPadding: "py-0.5 px-2",
      countText: "text-xs"
    },
    lg: {
      text: "text-base",
      padding: "py-3 px-4", 
      iconSize: "h-5 w-5",
      countPadding: "py-1 px-2.5",
      countText: "text-sm"
    }
  };

  const config = sizeConfig[size];

  // Variant-specific styling
  const getVariantStyles = (isActive, isDisabled) => {
    if (isDisabled) {
      return "cursor-not-allowed opacity-50 text-gray-400";
    }

    switch (variant) {
      case 'underline':
        return isActive
          ? "border-blue-500 text-blue-700 border-b-2"
          : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 border-b-2";
      
      case 'pills':
        return isActive
          ? "bg-blue-100 text-blue-700 rounded-lg"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg";
      
      case 'buttons':
        return isActive
          ? "bg-blue-600 text-white rounded-md shadow-sm"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 rounded-md shadow-sm";

      case 'tabs':
        return isActive
          ? "bg-white text-blue-700 border-t-2 border-l border-r border-blue-500 rounded-t-lg shadow-sm relative z-10"
          : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 hover:text-gray-900 rounded-t-lg relative";
      
      default:
        return isActive
          ? "border-blue-500 text-blue-700 border-b-2"
          : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300 border-b-2";
    }
  };

  const getCountStyles = (isActive) => {
    switch (variant) {
      case 'underline':
        return isActive 
          ? "bg-blue-100 text-blue-700" 
          : "bg-gray-200 text-gray-800";
      
      case 'pills':
        return isActive 
          ? "bg-blue-200 text-blue-800" 
          : "bg-gray-300 text-gray-700";
      
      case 'buttons':
        return isActive 
          ? "bg-blue-500 text-blue-100" 
          : "bg-gray-100 text-gray-600";

      case 'tabs':
        return isActive 
          ? "bg-blue-100 text-blue-800" 
          : "bg-gray-200 text-gray-700";
      
      default:
        return isActive 
          ? "bg-blue-100 text-blue-700" 
          : "bg-gray-200 text-gray-800";
    }
  };

  const containerClass = variant === 'underline' 
    ? "border-b border-gray-200" 
    : variant === 'tabs'
    ? "border-b border-gray-300"
    : "";

  const navClass = variant === 'underline' 
    ? "flex space-x-8" 
    : variant === 'tabs'
    ? "flex -mb-px space-x-1"
    : "flex space-x-1";

  return (
    <div className={`${containerClass} ${className}`}>
      <nav className={navClass}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled || false;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                font-medium ${config.text} ${config.padding} 
                flex items-center gap-2 transition-colors
                ${getVariantStyles(isActive, isDisabled)}
              `.trim()}
            >
              {Icon && <Icon className={config.iconSize} />}
              {tab.label}
              {(tab.count !== undefined && tab.count !== null) && (
                <span
                  className={`
                    ml-1 ${config.countPadding} rounded-full ${config.countText} 
                    ${getCountStyles(isActive)}
                  `.trim()}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default StandardTabs;