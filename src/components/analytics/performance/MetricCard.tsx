import React from "react";
import { getIcon } from "../../../utils";
import { getScoreColor, getScoreBgColor } from "../../../utils/performanceUtils";

interface MetricCardProps {
  title: string;
  score: number;
  iconName: string;
  description?: string;
}

/**
 * MetricCard component for displaying performance metrics
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const MetricCard: React.FC<MetricCardProps> = ({ title, score, iconName, description }) => {
  const Icon = getIcon(iconName);

  return (
    <div className="bg-white/60 rounded-lg p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {React.createElement(Icon, {
            className: "h-5 w-5 text-gray-600 mr-2",
          })}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
          {score}/100
        </span>
      </div>

      <div className="mb-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getScoreBgColor(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
};

export default MetricCard;
