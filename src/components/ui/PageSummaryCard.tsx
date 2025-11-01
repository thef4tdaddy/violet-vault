import React from "react";

type ColorType =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "gray";

interface ColorConfig {
  gradient: string;
  textMain: string;
  textValue: string;
  textSub: string;
}

interface PageSummaryCardProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: ColorType;
  onClick?: () => void;
  className?: string;
  alert?: boolean;
}

/**
 * Page-Level Summary Card Component
 * Based on the bill summary card design pattern with gradient backgrounds
 *
 * This component standardizes the look across all page-specific summary cards:
 * - Bills page
 * - Debt page
 * - Transactions page
 * - Envelopes page
 * - Stats/Analytics page
 *
 * Distinct from main dashboard summary cards (SummaryCard.jsx) which use solid colors.
 * Page-level cards use gradients and are for specific page metrics.
 */
const PageSummaryCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = "blue",
  onClick,
  className = "",
  alert = false,
}: PageSummaryCardProps) => {
  // Color configurations for gradient backgrounds and text
  const colorConfig: Record<ColorType, ColorConfig> = {
    red: {
      gradient: "from-red-500 to-red-600",
      textMain: "text-red-100",
      textValue: "text-white",
      textSub: "text-red-100",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      textMain: "text-orange-100",
      textValue: "text-white",
      textSub: "text-orange-100",
    },
    amber: {
      gradient: "from-amber-500 to-amber-600",
      textMain: "text-amber-100",
      textValue: "text-white",
      textSub: "text-amber-100",
    },
    yellow: {
      gradient: "from-yellow-500 to-yellow-600",
      textMain: "text-yellow-100",
      textValue: "text-white",
      textSub: "text-yellow-100",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      textMain: "text-green-100",
      textValue: "text-white",
      textSub: "text-green-100",
    },
    emerald: {
      gradient: "from-emerald-500 to-emerald-600",
      textMain: "text-emerald-100",
      textValue: "text-white",
      textSub: "text-emerald-100",
    },
    teal: {
      gradient: "from-teal-500 to-teal-600",
      textMain: "text-teal-100",
      textValue: "text-white",
      textSub: "text-teal-100",
    },
    cyan: {
      gradient: "from-cyan-500 to-cyan-600",
      textMain: "text-cyan-100",
      textValue: "text-white",
      textSub: "text-cyan-100",
    },
    blue: {
      gradient: "from-blue-500 to-blue-600",
      textMain: "text-blue-100",
      textValue: "text-white",
      textSub: "text-blue-100",
    },
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      textMain: "text-indigo-100",
      textValue: "text-white",
      textSub: "text-indigo-100",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      textMain: "text-purple-100",
      textValue: "text-white",
      textSub: "text-purple-100",
    },
    pink: {
      gradient: "from-pink-500 to-pink-600",
      textMain: "text-pink-100",
      textValue: "text-white",
      textSub: "text-pink-100",
    },
    gray: {
      gradient: "from-gray-500 to-gray-600",
      textMain: "text-gray-100",
      textValue: "text-white",
      textSub: "text-gray-100",
    },
  };

  const config = colorConfig[color];

  return (
    <div
      className={`bg-gradient-to-br ${config.gradient} p-4 rounded-lg text-white transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""
      } ${alert ? "ring-2 ring-white ring-opacity-50" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.textMain} text-sm`}>{label}</p>
          <p className={`text-2xl font-bold ${config.textValue}`}>{value}</p>
          {subtext && <p className={`text-xs ${config.textSub} mt-2`}>{subtext}</p>}
        </div>
        {Icon &&
          React.createElement(Icon, {
            className: `h-8 w-8 ${config.textMain}`,
          })}
      </div>
    </div>
  );
};

export default PageSummaryCard;
