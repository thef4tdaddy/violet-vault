import React from "react";
import { Card } from "./Card";
import { getIcon } from "@/utils";

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
  // Variant colors
  const variantColors = {
    default: "text-purple-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    info: "text-cyan-600",
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
    if (change === undefined || change === null) {
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

  const Icon = icon ? getIcon(icon) : null;

  // Loading state skeleton
  if (loading) {
    return (
      <Card variant="default" padding="md">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-32 mb-2"></div>
          {subtitle && <div className="h-3 bg-gray-300 rounded w-20"></div>}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="md" onClick={onClick}>
      <div className="space-y-3">
        {/* Icon and Title */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex-shrink-0">
              {React.createElement(Icon, {
                className: `h-5 w-5 ${variantColors[variant]}`,
              })}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>

        {/* Value and Change */}
        <div className="flex items-baseline justify-between gap-4">
          <div className="text-3xl font-bold text-gray-900">{formatValue(value)}</div>
          {getChangeIndicator()}
        </div>

        {/* Subtitle */}
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </Card>
  );
};
