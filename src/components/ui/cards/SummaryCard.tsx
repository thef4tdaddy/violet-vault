import React from "react";

export type SummaryCardColor =
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

export interface SummaryCardProps {
  /** Icon component (from lucide-react via utils) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Main label text */
  label: string;
  /** Large value display */
  value: string | number;
  /** Optional subtext below value */
  subtext?: string;
  /** Gradient color scheme */
  color?: SummaryCardColor;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Custom className */
  className?: string;
  /** Show alert ring */
  alert?: boolean;
}

/**
 * Summary Card Component (Gradient Background)
 * Used for page-level metrics and statistics
 *
 * Features:
 * - 14 color variants with gradients
 * - Optional icon (top-right)
 * - Interactive with onClick
 * - Alert ring support
 * - Responsive hover effects
 *
 * Usage:
 * <SummaryCard
 *   icon={TransactionIcon}
 *   label="Total Transactions"
 *   value={425}
 *   color="blue"
 *   onClick={() => handleClick()}
 * />
 */
const SummaryCard: React.FC<SummaryCardProps> = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = "blue",
  onClick,
  className = "",
  alert = false,
}) => {
  // Color configurations for gradient backgrounds and text
  const colorConfig: Record<
    SummaryCardColor,
    {
      gradient: string;
      textMain: string;
      textValue: string;
      textSub: string;
    }
  > = {
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

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div
      className={`bg-linear-to-br ${config.gradient} p-4 rounded-lg text-white transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""
      } ${alert ? "ring-2 ring-white ring-opacity-50" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            }
          : undefined
      }
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

export default SummaryCard;
