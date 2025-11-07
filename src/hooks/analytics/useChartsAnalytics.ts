import { useState, useCallback } from "react";
import logger from "../../utils/common/logger";

/**
 * Hook for managing charts and analytics UI state and interactions
 * Extracts all business logic from ChartsAndAnalytics component
 */
export const useChartsAnalytics = (initialTimeFilter = "3months", initialFocus = "overview") => {
  const [activeTab, setActiveTab] = useState(initialFocus);
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState(initialTimeFilter);

  const handleDateRangeChange = useCallback((e) => {
    setDateRange(e.target.value);
    logger.debug("Date range changed:", e.target.value);
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  return {
    // State
    activeTab,
    chartType,
    dateRange,

    // Actions
    handleDateRangeChange,
    handleChartTypeChange,
    handleTabChange,
  };
};
