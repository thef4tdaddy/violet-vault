import React from "react";
import { getIcon } from "../../utils/icons";

export type FilterType = "select";
export type FilterSize = "sm" | "md";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  type: FilterType;
  options: FilterOption[];
  defaultValue?: string;
}

export interface FilterValues {
  search?: string;
  [key: string]: any;
}

export interface StandardFiltersProps<T extends FilterValues = FilterValues> {
  filters: T;
  onFilterChange: (filterKey: keyof T, value: any) => void;
  filterConfigs?: FilterConfig[];
  showClearButton?: boolean;
  searchPlaceholder?: string;
  size?: FilterSize;
  className?: string;
}

/**
 * Standardized compact filtering component with glassmorphism styling
 * Consistent, space-efficient filtering across all pages with proper borders and labeling
 *
 * Generic type T allows for strongly typed filter values
 */
function StandardFilters<T extends FilterValues = FilterValues>({
  filters = {} as T,
  onFilterChange,
  filterConfigs = [],
  showClearButton = true,
  searchPlaceholder = "Search...",
  size = "md",
  className = "",
}: StandardFiltersProps<T>) {
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

  const handleFilterChange = (filterKey: keyof T, value: any) => {
    onFilterChange(filterKey, value);
  };

  const clearAllFilters = () => {
    const clearedFilters: Partial<T> = {};
    // Set search to empty string
    clearedFilters.search = "" as any;

    // Set all other filters to their default values
    filterConfigs.forEach((filterConfig) => {
      if (filterConfig.type === "select") {
        (clearedFilters as any)[filterConfig.key] = filterConfig.defaultValue || "all";
      }
    });

    // Apply all cleared filters at once
    Object.entries(clearedFilters).forEach(([key, value]) => {
      handleFilterChange(key as keyof T, value);
    });
  };

  // Check if any filters are active (not default values)
  const hasActiveFilters = (): boolean => {
    if (filters.search && filters.search.trim() !== "") return true;

    return filterConfigs.some((filterConfig) => {
      if (filterConfig.type === "select") {
        const currentValue = filters[filterConfig.key as keyof T];
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
      <div className={`flex items-center ${config.gap}`}>
        {/* Search Input */}
        <div className="relative flex-1 min-w-48">
          {React.createElement(getIcon("Search"), {
            className: "absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400",
          })}
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search" as keyof T, e.target.value)}
            className={`
              w-full pl-8 ${config.input} 
              border border-gray-300 rounded-md
              focus:ring-1 focus:ring-blue-500 focus:border-blue-500
              bg-white
            `.trim()}
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search" as keyof T, "")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {React.createElement(getIcon("X"), { className: "h-3 w-3" })}
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {filterConfigs.map((filterConfig) => {
          if (filterConfig.type === "select") {
            return (
              <select
                key={filterConfig.key}
                value={
                  (filters[filterConfig.key as keyof T] as string) ||
                  filterConfig.defaultValue ||
                  "all"
                }
                onChange={(e) => handleFilterChange(filterConfig.key as keyof T, e.target.value)}
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
      </div>
    </div>
  );
}

export default StandardFilters;
