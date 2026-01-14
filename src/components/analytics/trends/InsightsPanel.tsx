import React from "react";
import { getIcon } from "../../../utils";
import { formatPercent } from "@/utils/analytics/trendHelpers";

import { Insights, ForecastInsights } from "@/types/analytics";

interface InsightsPanelProps {
  forecastInsights: ForecastInsights;
  insights: Insights;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ forecastInsights, insights }) => {
  return (
    <div className="rounded-xl p-6 border-2 border-black bg-blue-100/40 backdrop-blur-sm shadow-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full border-2 border-black bg-blue-500">
          {React.createElement(getIcon("Target"), {
            className: "h-5 w-5 text-white",
          })}
        </div>
        <div>
          <h3 className="font-black text-black text-base mb-2">
            <span className="text-lg">K</span>EY <span className="text-lg">I</span>NSIGHTS
          </h3>
          <ul className="space-y-2 text-sm text-purple-900">
            <li>
              • Your spending trend is currently{" "}
              <strong className="text-black">{forecastInsights.trend.toUpperCase()}</strong> with{" "}
              <strong className="text-black">{forecastInsights.confidence}%</strong> confidence
            </li>
            <li>
              • Seasonal analysis shows highest spending in{" "}
              <strong className="text-black">{insights.highestSpendingSeason.toUpperCase()}</strong>
            </li>
            <li>
              • Average monthly spending velocity:{" "}
              <strong className="text-black">{formatPercent(insights.avgVelocity)}</strong>
            </li>
            {insights.hasHighGrowth && (
              <li className="flex items-center gap-2 text-orange-700">
                <div className="p-1 rounded border border-orange-700">
                  {React.createElement(getIcon("AlertTriangle"), {
                    className: "h-4 w-4",
                  })}
                </div>
                <span className="font-bold">
                  HIGH SPENDING GROWTH DETECTED - CONSIDER BUDGET REVIEW
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
