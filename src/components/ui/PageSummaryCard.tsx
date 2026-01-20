import React from "react";
import { type IconComponent } from "@/utils/ui/icons";

export interface PageSummaryCardProps {
  icon?: IconComponent;
  label: string;
  value: string | number;
  subtext?: string;
  color?:
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
  onClick?: () => void;
  className?: string;
  alert?: boolean;
  "data-testid"?: string;
}

/**
 * Page-Level Summary Card Component
 * Based on the legacy design pattern with gradient backgrounds
 *
 * Used for specific page metrics (Bills, Debt, Transactions, etc.)
 */
const PageSummaryCard: React.FC<PageSummaryCardProps> = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = "blue",
  onClick,
  className = "",
  alert = false,
  "data-testid": testId,
}) => {
  // Color configurations for gradient backgrounds and text
  const colorConfig = {
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
      data-testid={testId}
      className={`bg-linear-to-br ${config.gradient} p-4 rounded-xl text-white hard-border transition-all duration-200 shadow-lg ${
        onClick ? "cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-95" : ""
      } ${alert ? "ring-4 ring-white ring-opacity-30" : ""} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={`${config.textMain} text-xs font-black uppercase tracking-widest mb-1`}>
            {label}
          </p>
          <p className={`text-2xl font-black ${config.textValue} truncate tracking-tight`}>
            {value}
          </p>
          {subtext && (
            <p className={`text-xs ${config.textSub} mt-2 font-bold opacity-90`}>{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className="bg-white/10 p-2 rounded-lg ml-4">
            {React.createElement(Icon, { className: `h-8 w-8 ${config.textValue}` })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageSummaryCard;
