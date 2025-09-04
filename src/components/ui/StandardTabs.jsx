import React from "react";

/**
 * Standardized tabs component with proper contrast and consistent styling
 * Follows accessibility guidelines with high-contrast text
 * 
 * @param {Array} tabs - Array of tab objects with { id, label, icon, count?, disabled? }
 * @param {string} activeTab - Currently active tab id
 * @param {Function} onTabChange - Callback when tab changes
 * @param {string} size - 'sm' | 'md' | 'lg' for different sizes
 * @param {string} variant - 'underline' | 'pills' | 'buttons' | 'tabs' | 'colored' for different styles
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

  // Color configurations for colored tabs
  const colorConfig = {
    blue: {
      pastel: "bg-blue-100 text-blue-700 border-blue-200",
      bright: "bg-blue-500 text-white border-blue-500",
      count: { pastel: "bg-blue-200 text-blue-800", bright: "bg-blue-400 text-blue-50" }
    },
    green: {
      pastel: "bg-emerald-100 text-emerald-700 border-emerald-200", 
      bright: "bg-emerald-500 text-white border-emerald-500",
      count: { pastel: "bg-emerald-200 text-emerald-800", bright: "bg-emerald-400 text-emerald-50" }
    },
    red: {
      pastel: "bg-red-100 text-red-700 border-red-200",
      bright: "bg-red-500 text-white border-red-500", 
      count: { pastel: "bg-red-200 text-red-800", bright: "bg-red-400 text-red-50" }
    },
    amber: {
      pastel: "bg-amber-100 text-amber-700 border-amber-200",
      bright: "bg-amber-500 text-white border-amber-500",
      count: { pastel: "bg-amber-200 text-amber-800", bright: "bg-amber-400 text-amber-50" }
    },
    purple: {
      pastel: "bg-purple-100 text-purple-700 border-purple-200",
      bright: "bg-purple-500 text-white border-purple-500", 
      count: { pastel: "bg-purple-200 text-purple-800", bright: "bg-purple-400 text-purple-50" }
    },
    cyan: {
      pastel: "bg-cyan-100 text-cyan-700 border-cyan-200",
      bright: "bg-cyan-500 text-white border-cyan-500",
      count: { pastel: "bg-cyan-200 text-cyan-800", bright: "bg-cyan-400 text-cyan-50" }
    },
    gray: {
      pastel: "bg-gray-100 text-gray-700 border-gray-200",
      bright: "bg-gray-600 text-white border-gray-600",
      count: { pastel: "bg-gray-200 text-gray-800", bright: "bg-gray-500 text-gray-50" }
    }
  };

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

      case 'colored':
        // This will be handled per-tab with individual colors
        return "";
      
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

      case 'colored':
        // This will be handled per-tab with individual colors
        return "";
      
      default:
        return isActive 
          ? "bg-blue-100 text-blue-700" 
          : "bg-gray-200 text-gray-800";
    }
  };

  const containerClass = variant === 'underline' 
    ? "border-b border-gray-200" 
    : variant === 'tabs'
    ? "border-b border-gray-200"
    : "";

  const navClass = variant === 'underline' 
    ? "flex space-x-8" 
    : variant === 'tabs' || variant === 'colored'
    ? "flex -mb-px space-x-1"
    : "flex space-x-1";

  return (
    <div className={`${containerClass} ${className}`}>
      <nav className={navClass}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled || false;
          const Icon = tab.icon;

          // Handle colored variant with individual tab colors
          let tabStyles = getVariantStyles(isActive, isDisabled);
          let countStyles = getCountStyles(isActive);

          if (variant === 'colored' && tab.color && !isDisabled) {
            const colors = colorConfig[tab.color] || colorConfig.blue;
            tabStyles = isActive 
              ? `${colors.bright} rounded-t-lg shadow-sm relative z-10 border border-white/20 ring-1 ring-gray-800/10`
              : `${colors.pastel} rounded-t-lg relative border border-white/20 ring-1 ring-gray-800/10 hover:brightness-110 transition-all`;
            
            countStyles = isActive 
              ? colors.count.bright 
              : colors.count.pastel;
          }

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={`
                font-medium ${config.text} ${config.padding} 
                flex items-center gap-2 transition-all duration-200
                ${tabStyles}
              `.trim()}
            >
              {Icon && <Icon className={config.iconSize} />}
              {tab.label}
              {(tab.count !== undefined && tab.count !== null) && (
                <span
                  className={`
                    ml-1 ${config.countPadding} rounded-full ${config.countText} 
                    ${countStyles}
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