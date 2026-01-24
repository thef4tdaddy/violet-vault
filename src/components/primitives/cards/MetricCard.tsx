import React from "react";
import { getIcon, type IconComponent } from "@/utils";

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  format?: "currency" | "number" | "percentage" | "custom";
  customFormatter?: (value: number | string) => string;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * Metric Card Component
 *
 * Displays a metric with optional change indicator, built on top of Card component.
 *
 * Features:
 * - Value formatting (currency, number, percentage, custom)
 * - Change indicator (positive/negative/zero)
 * - Variant styling for different metric types
 * - Loading state with skeleton
 * - Clickable support
 *
 * Usage:
 * ```tsx
 * <MetricCard
 *   title="Total Revenue"
 *   value={123456.78}
 *   change={5.2}
 *   icon="DollarSign"
 *   variant="success"
 *   format="currency"
 *   subtitle="Last 30 days"
 * />
 * ```
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = "default",
  format = "number",
  customFormatter,
  subtitle,
  loading = false,
  onClick,
}) => {
  // Variant background colors for circles
  const variantBgColors = {
    default: "bg-purple-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-red-600",
    info: "bg-cyan-600",
  };

  // Format value based on format type
  const formatValue = (val: number | string): string => {
    if (format === "custom" && customFormatter) {
      return customFormatter(val);
    }

    const numValue = typeof val === "string" ? parseFloat(val) : val;

    if (isNaN(numValue)) {
      return String(val);
    }

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numValue);

      case "number":
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numValue);

      case "percentage":
        return `${numValue.toFixed(1)}%`;

      default:
        return String(val);
    }
  };

  // Get change indicator icon and color
  const getChangeIndicator = () => {
    if (change === undefined) {
      return null;
    }

    let changeIcon: string;
    let changeColor: string;

    if (change > 0) {
      changeIcon = "TrendingUp";
      changeColor = "text-emerald-600";
    } else if (change < 0) {
      changeIcon = "TrendingDown";
      changeColor = "text-red-600";
    } else {
      changeIcon = "Minus";
      changeColor = "text-gray-600";
    }

    const ChangeIcon = getIcon(changeIcon);

    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
        {React.createElement(ChangeIcon, {
          className: "h-4 w-4",
        })}
        <span>
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
    );
  };

  const Icon: IconComponent | null = icon ? getIcon(icon) : null;

  // Loading state skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 hard-border h-full flex flex-col justify-between">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 mb-2"></div>
          {subtitle && <div className="h-3 bg-gray-200 rounded w-20"></div>}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-white rounded-2xl p-6 hard-border h-full flex flex-col justify-between transition-all duration-300 active:scale-95 ${onClick ? "cursor-pointer hover:bg-gray-50 shadow-lg" : ""}`}
    >
      <div className="space-y-4">
        {/* Icon (Circular) and Title */}
        <div className="flex items-center gap-4">
          {Icon && (
            <div
              data-testid="metric-card-icon-container"
              className={`shrink-0 h-12 w-12 rounded-full ${variantBgColors[variant]} flex items-center justify-center shadow-md border border-white/20`}
            >
              {React.createElement(Icon, {
                className: "h-6 w-6 text-white",
                "data-testid": "mock-icon",
              })}
            </div>
          )}
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-500">{title}</h3>
        </div>

        {/* Value and Change */}
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-black text-black tracking-tight">{formatValue(value)}</div>
          {getChangeIndicator()}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs font-bold text-gray-400 mt-4 pt-4 border-t border-gray-100 flex items-center">
          {React.createElement(getIcon("Info"), { className: "h-3 w-3 mr-1" })}
          {subtitle}
        </p>
      )}
    </div>
  );
};
