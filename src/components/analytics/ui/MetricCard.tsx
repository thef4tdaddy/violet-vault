import React from "react";
import { getIcon } from "../../../utils";

const GRADIENT_CLASSES = {
  red: "from-red-500 to-red-600",
  orange: "from-orange-500 to-orange-600",
  amber: "from-amber-500 to-amber-600",
  yellow: "from-yellow-500 to-yellow-600",
  emerald: "from-emerald-500 to-emerald-600",
  teal: "from-teal-500 to-teal-600",
  cyan: "from-cyan-500 to-cyan-600",
  blue: "from-blue-500 to-blue-600",
  indigo: "from-indigo-500 to-indigo-600",
  purple: "from-purple-500 to-purple-600",
  pink: "from-pink-500 to-pink-600",
  gray: "from-gray-500 to-gray-600",
};

const TEXT_CLASSES = {
  red: "text-red-100",
  orange: "text-orange-100",
  amber: "text-amber-100",
  yellow: "text-yellow-100",
  emerald: "text-emerald-100",
  teal: "text-teal-100",
  cyan: "text-cyan-100",
  blue: "text-blue-100",
  indigo: "text-indigo-100",
  purple: "text-purple-100",
  pink: "text-pink-100",
  gray: "text-gray-100",
};

const ICON_CLASSES = {
  red: "text-red-200",
  orange: "text-orange-200",
  amber: "text-amber-200",
  yellow: "text-yellow-200",
  emerald: "text-emerald-200",
  teal: "text-teal-200",
  cyan: "text-cyan-200",
  blue: "text-blue-200",
  indigo: "text-indigo-200",
  purple: "text-purple-200",
  pink: "text-pink-200",
  gray: "text-gray-200",
};

type MetricColor = keyof typeof GRADIENT_CLASSES;

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number | null;
  color?: MetricColor;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}) => {
  const Icon = icon;

  const fallbackGradient = GRADIENT_CLASSES.blue;
  const fallbackText = TEXT_CLASSES.blue;
  const fallbackIcon = ICON_CLASSES.blue;

  return (
    <div
      className={`bg-gradient-to-br ${GRADIENT_CLASSES[color] || fallbackGradient} p-4 rounded-lg text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${TEXT_CLASSES[color] || fallbackText} text-sm`}>{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className={`text-xs ${TEXT_CLASSES[color] || fallbackText} mt-2`}>{subtitle}</p>
          )}
        </div>
        {React.createElement(Icon, {
          className: `h-8 w-8 ${ICON_CLASSES[color] || fallbackIcon}`,
        })}
      </div>
      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center text-sm">
          {trend > 0
            ? React.createElement(getIcon("ArrowUpRight"), {
                className: "h-4 w-4 text-white mr-1",
              })
            : React.createElement(getIcon("ArrowDownRight"), {
                className: "h-4 w-4 text-white mr-1",
              })}
          <span className="text-white">{Math.abs(trend).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
