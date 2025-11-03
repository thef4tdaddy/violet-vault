import React from "react";
import { Select } from "@/components/ui";
import { getIcon } from "../../utils/icons";

export interface FilterConfig {
  key: string;
  type: "select";
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

interface FilterValues {
  search?: string;
  [key: string]: string | undefined;
}

interface StandardFiltersProps {
  filters?: FilterValues;
  onFilterChange: (key: string, value: string) => void;
  filterConfigs?: FilterConfig[];
  showClearButton?: boolean;
  searchPlaceholder?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Standardized compact filtering component with glassmorphism styling
 * Consistent, space-efficient filtering across all pages with proper borders and labeling
 */
const StandardFilters = ({
  filters = {},
  onFilterChange,
  filterConfigs = [],
  showClearButton = true,
  searchPlaceholder = "Search...",
  size = "md",
  className = "",
}: StandardFiltersProps) => {
  const sizeConfig = {
    sm: {
      input: "px-2 py-1 text-sm",
      select: "px-2 py-1 text-sm",
      gap: "gap-2",
    },
    md: {
      input: "px-3 py-1.5 text-sm",
      select: "px-3 py-1.5 text-sm",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  const handleFilterChange = (filterKey: string, value: string) => {
    onFilterChange(filterKey, value);
  };

  const clearAllFilters = () => {
    const clearedFilters: Record<string, string> = {};
    // Set search to empty string
    clearedFilters.search = "";

    // Set all other filters to their default values
    filterConfigs.forEach((filterConfig) => {
      if (filterConfig.type === "select") {
        clearedFilters[filterConfig.key] = filterConfig.defaultValue || "all";
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

    return filterConfigs.some((filterConfig) => {
      if (filterConfig.type === "select") {
        const currentValue = filters[filterConfig.key];
        const defaultValue = filterConfig.defaultValue || "all";
        return currentValue && currentValue !== defaultValue;
      }
      return false;
    });
  };

  return (
    <div
      className={`glassmorphism rounded-lg p-4 border border-white/20 ring-1 ring-gray-800/10 shadow-lg ${className}`}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {React.createElement(getIcon("Filter"), { className: "h-4 w-4" })}
          Filters
        </h3>
        {showClearButton && hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {React.createElement(getIcon("X"), { className: "h-3 w-3" })}
            Clear All
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center ${config.gap}`}>
        {/* Search Input */}
        <div className="relative flex-1 sm:min-w-48 w-full sm:w-auto">
          {React.createElement(getIcon("Search"), {
            className: "absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400",
          })}
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
              {React.createElement(getIcon("X"), { className: "h-3 w-3" })}
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {filterConfigs.map((filterConfig) => {
            if (filterConfig.type === "select") {
              return (
                <Select
                  key={filterConfig.key}
                  value={filters[filterConfig.key] || filterConfig.defaultValue || "all"}
                  onChange={(e) => handleFilterChange(filterConfig.key, e.target.value)}
                  options={filterConfig.options}
                  className={`
                    ${config.select} border border-gray-300 rounded-md
                    focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                    bg-white text-gray-700 w-full sm:w-auto
                  `.trim()}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default StandardFilters;
