import { useMemo, useCallback } from "react";

/**
 * Custom hook for chart configuration and styling
 * Extracted from ChartsAndAnalytics.jsx for better reusability
 * Issue #151 - ChartsAndAnalytics refactoring
 */
export const useChartConfig = () => {
  // Memoized chart colors
  const chartColors = useMemo(
    () => [
      "#a855f7",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#14b8a6",
      "#f97316",
      "#84cc16",
      "#6366f1",
    ],
    [],
  );

  // Custom tooltip component
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload
            .filter((entry) => entry != null)
            .map((entry, index) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {entry.name}: ${entry.value?.toFixed(2)}
              </p>
            ))}
        </div>
      );
    }
    return null;
  }, []);

  // Chart configuration presets
  const chartDefaults = useMemo(
    () => ({
      responsive: {
        width: "100%",
        height: 300,
      },
      cartesianGrid: {
        strokeDasharray: "3 3",
        stroke: "#e5e7eb",
      },
      axis: {
        stroke: "#6b7280",
      },
      margins: {
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      },
    }),
    [],
  );

  // Chart type configurations
  const chartTypeConfigs = useMemo(
    () => ({
      line: {
        type: "monotone",
        strokeWidth: 3,
        dot: false,
        activeDot: { r: 6 },
      },
      bar: {
        radius: [4, 4, 0, 0],
        maxBarSize: 60,
      },
      area: {
        type: "monotone",
        fillOpacity: 0.6,
        strokeWidth: 2,
      },
      pie: {
        cx: "50%",
        cy: "50%",
        outerRadius: 100,
        innerRadius: 0,
        startAngle: 90,
        endAngle: 450,
      },
    }),
    [],
  );

  // Color scheme utilities
  const getColorByCategory = useCallback(
    (category, index) => {
      const categoryColors = {
        income: "#10b981",
        expenses: "#ef4444",
        net: "#06b6d4",
        savings: "#8b5cf6",
        budget: "#a855f7",
        actual: "#06b6d4",
      };

      return (
        categoryColors[category?.toLowerCase()] ||
        chartColors[index % chartColors.length]
      );
    },
    [chartColors],
  );

  // Status color utilities
  const getStatusColor = useCallback((status, type = "text") => {
    const colors = {
      critical: type === "text" ? "text-red-600" : "bg-red-100",
      warning: type === "text" ? "text-yellow-600" : "bg-yellow-100",
      healthy: type === "text" ? "text-green-600" : "bg-green-100",
      overfunded: type === "text" ? "text-blue-600" : "bg-blue-100",
    };

    return (
      colors[status] || (type === "text" ? "text-gray-600" : "bg-gray-100")
    );
  }, []);

  // Chart animation configurations
  const animationConfig = useMemo(
    () => ({
      begin: 0,
      duration: 800,
      type: "ease-in-out",
    }),
    [],
  );

  // Export utilities
  const getExportFilename = useCallback((chartType, timeFilter) => {
    const timestamp = new Date().toISOString().split("T")[0];
    return `VioletVault_${chartType}_${timeFilter}_${timestamp}`;
  }, []);

  // Format utilities for display
  const formatters = useMemo(
    () => ({
      currency: (value) => `$${(value || 0).toLocaleString()}`,
      percentage: (value) => `${(value || 0).toFixed(1)}%`,
      count: (value) => (value || 0).toLocaleString(),
      shortCurrency: (value) => {
        const num = value || 0;
        if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
      },
      monthYear: (monthKey) => {
        if (!monthKey) return "";
        const [year, month] = monthKey.split("-");
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      },
    }),
    [],
  );

  // Responsive breakpoint utilities
  const getResponsiveHeight = useCallback((breakpoint, chartType) => {
    const heights = {
      mobile: {
        default: 250,
        pie: 200,
        bar: 300,
      },
      tablet: {
        default: 300,
        pie: 250,
        bar: 350,
      },
      desktop: {
        default: 400,
        pie: 350,
        bar: 450,
      },
    };

    return (
      heights[breakpoint]?.[chartType] || heights[breakpoint]?.default || 300
    );
  }, []);

  return {
    // Colors and styling
    chartColors,
    getColorByCategory,
    getStatusColor,

    // Chart configurations
    chartDefaults,
    chartTypeConfigs,
    animationConfig,

    // Components
    CustomTooltip,

    // Utilities
    formatters,
    getExportFilename,
    getResponsiveHeight,
  };
};

export default useChartConfig;
