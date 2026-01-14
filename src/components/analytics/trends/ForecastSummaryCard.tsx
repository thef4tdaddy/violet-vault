import React from "react";
import { getIcon } from "../../../utils";
import {
  formatCurrency,
  formatPercent,
  getTrendIconConfig,
} from "@/utils/analytics/trendHelpers";

import { ForecastInsights } from "@/types/analytics";

interface ForecastSummaryCardProps {
  forecastInsights: ForecastInsights;
}

const ForecastSummaryCard: React.FC<ForecastSummaryCardProps> = ({ forecastInsights }) => {
  const iconConfig = getTrendIconConfig(forecastInsights.trend);

  const renderTrendIcon = () => {
    switch (iconConfig.iconType) {
      case "trending-up":
        return React.createElement(getIcon("TrendingUp"), {
          className: `h-6 w-6 ${iconConfig.iconColor}`,
        });
      case "trending-down":
        return React.createElement(getIcon("TrendingDown"), {
          className: `h-6 w-6 ${iconConfig.iconColor}`,
        });
      default:
        return React.createElement(getIcon("BarChart3"), {
          className: `h-6 w-6 ${iconConfig.iconColor}`,
        });
    }
  };

  return (
    <div className="rounded-xl p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-black text-black text-base">
            <span className="text-lg">S</span>PENDING <span className="text-lg">F</span>ORECAST
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-purple-900">Next Month Projection</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(forecastInsights.projectedSpending || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-900">Growth Rate</p>
              <p
                className={`text-2xl font-bold ${
                  (forecastInsights.growthRate || 0) > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {formatPercent(forecastInsights.growthRate || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-900">Confidence Level</p>
              <p className="text-2xl font-bold text-blue-600">{forecastInsights.confidence}%</p>
            </div>
          </div>
        </div>
        <div className={`p-3 rounded-full border-2 border-black ${iconConfig.bgClass}`}>
          {renderTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default ForecastSummaryCard;
