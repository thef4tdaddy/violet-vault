import React from "react";
import { Search, X, Filter } from "lucide-react";

/**
 * Standardized compact filtering component
 * Consistent, space-efficient filtering across all pages
 * 
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback for filter changes
 * @param {Array} filterConfigs - Array of filter configurations
 * @param {boolean} showClearButton - Show clear all filters button
 * @param {string} searchPlaceholder - Placeholder text for search
 * @param {string} size - 'sm' | 'md' for sizing
 */
const StandardFilters = ({
  filters = {},
  onFilterChange,
  filterConfigs = [],
  showClearButton = true,
  searchPlaceholder = "Search...",
  size = "md",
  className = ""
}) => {
  const sizeConfig = {
    sm: {
      input: "px-2 py-1 text-sm",
      select: "px-2 py-1 text-sm",
      button: "px-2 py-1 text-xs",
      gap: "gap-2"
    },
    md: {
      input: "px-3 py-1.5 text-sm", 
      select: "px-3 py-1.5 text-sm",
      button: "px-3 py-1.5 text-xs",
      gap: "gap-3"
    }
  };

  const config = sizeConfig[size];

  const handleFilterChange = (filterKey, value) => {
    onFilterChange(filterKey, value);
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    // Set search to empty string
    clearedFilters.search = "";
    
    // Set all other filters to their default values
    filterConfigs.forEach(filterConfig => {
      if (filterConfig.type === 'select') {
        clearedFilters[filterConfig.key] = filterConfig.defaultValue || 'all';
      }
    });

    // Apply all cleared filters at once
    Object.entries(clearedFilters).forEach(([key, value]) => {
      handleFilterChange(key, value);
    });
  };

  // Check if any filters are active (not default values)
  const hasActiveFilters = () => {
    if (filters.search && filters.search.trim() !== "") return true;
    
    return filterConfigs.some(filterConfig => {
      if (filterConfig.type === 'select') {
        const currentValue = filters[filterConfig.key];
        const defaultValue = filterConfig.defaultValue || 'all';
        return currentValue && currentValue !== defaultValue;
      }
      return false;
    });
  };

  return (
    <div className={`flex items-center ${config.gap} py-3 border-b border-gray-200 bg-white ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className={`
            w-full pl-8 ${config.input} 
            border border-gray-300 rounded-md
            focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            bg-white
          `.trim()}
        />
        {filters.search && (
          <button
            onClick={() => handleFilterChange("search", "")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      {filterConfigs.map((filterConfig) => {
        if (filterConfig.type === 'select') {
          return (
            <select
              key={filterConfig.key}
              value={filters[filterConfig.key] || filterConfig.defaultValue || 'all'}
              onChange={(e) => handleFilterChange(filterConfig.key, e.target.value)}
              className={`
                ${config.select} border border-gray-300 rounded-md
                focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                bg-white text-gray-700
              `.trim()}
            >
              {filterConfig.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
        return null;
      })}

      {/* Clear Filters Button */}
      {showClearButton && hasActiveFilters() && (
        <button
          onClick={clearAllFilters}
          className={`
            ${config.button} text-gray-500 hover:text-gray-700 
            border border-gray-300 rounded-md hover:bg-gray-50
            flex items-center gap-1 whitespace-nowrap
          `.trim()}
        >
          <Filter className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
};

export default StandardFilters;