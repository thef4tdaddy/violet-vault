import React from "react";

export interface StatCardProps {
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional description */
  description?: string;
  /** Color for icon and accents */
  color?: string;
  /** Custom className */
  className?: string;
}

/**
 * Stat Card Component (Smaller Card for Grids)
 * Used for metric/statistic displays in grid layouts
 *
 * Features:
 * - Compact card suitable for multi-column layouts
 * - Icon + title + value layout
 * - Customizable colors
 * - Optional description
 *
 * Usage:
 * <StatCard
 *   icon={DollarIcon}
 *   title="Total Budget"
 *   value="$5,200"
 *   color="purple"
 * />
 */
const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  description,
  color = "blue",
  className = "",
}) => {
  // Color classes for icon
  const iconColorClasses = {
    red: "text-red-600",
    orange: "text-orange-600",
    amber: "text-amber-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    emerald: "text-emerald-600",
    teal: "text-teal-600",
    cyan: "text-cyan-600",
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    purple: "text-purple-600",
    pink: "text-pink-600",
    gray: "text-gray-600",
  };

  // Background classes for icon
  const bgColorClasses = {
    red: "bg-red-50",
    orange: "bg-orange-50",
    amber: "bg-amber-50",
    yellow: "bg-yellow-50",
    green: "bg-green-50",
    emerald: "bg-emerald-50",
    teal: "bg-teal-50",
    cyan: "bg-cyan-50",
    blue: "bg-blue-50",
    indigo: "bg-indigo-50",
    purple: "bg-purple-50",
    pink: "bg-pink-50",
    gray: "bg-gray-50",
  };

  const iconColor =
    iconColorClasses[color as keyof typeof iconColorClasses] || iconColorClasses.blue;
  const bgColor = bgColorClasses[color as keyof typeof bgColorClasses] || bgColorClasses.blue;

  return (
    <div className={`${bgColor} p-4 rounded-lg text-center border border-gray-200 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-3">
          {React.createElement(Icon, {
            className: `h-6 w-6 ${iconColor}`,
          })}
        </div>
      )}
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );
};

export default StatCard;
