import { useState, useCallback, useEffect, useMemo } from "react";
import logger from "../../utils/common/logger";

/**
 * Hook for managing charts and analytics UI state and interactions
 * Extracts all business logic from ChartsAndAnalytics component
 */
export const useChartsAnalytics = (initialTimeFilter = "3months", initialFocus = "overview") => {
  const normalizeDateRange = useCallback((value: string) => {
    const mapping: Record<string, string> = {
      thisWeek: "thisWeek",
      thisMonth: "1month",
      lastMonth: "1month",
      thisYear: "1year",
      allTime: "all",
      all: "all",
      "1month": "1month",
      "3months": "3months",
      "6months": "6months",
      "1year": "1year",
    };

    return mapping[value] || value || "3months";
  }, []);

  const initialRange = useMemo(() => normalizeDateRange(initialTimeFilter), [initialTimeFilter, normalizeDateRange]);
  const [activeTab, setActiveTab] = useState(initialFocus);
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState(initialRange);

  useEffect(() => {
    setDateRange(normalizeDateRange(initialTimeFilter));
  }, [initialTimeFilter, normalizeDateRange]);

  const handleDateRangeChange = useCallback(
    (e) => {
      const nextValue = normalizeDateRange(e.target.value);
      setDateRange(nextValue);
      logger.debug("Date range changed:", nextValue);
    },
    [normalizeDateRange]
  );

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
