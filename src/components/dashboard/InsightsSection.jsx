import React from "react";
import { getIcon } from "../../utils";
import { useInsights } from "../../hooks/dashboard/useInsights";

/**
 * Insights Section - AI-driven suggestions and tips
 *
 * Features:
 * - Personalized financial insights
 * - Spending pattern observations
 * - Goal achievement suggestions
 * - Action recommendations
 */
const InsightsSection = () => {
  const { insights, isLoading } = useInsights();

  const getInsightIcon = (type) => {
    const iconMap = {
      spending: "TrendingUp",
      saving: "Target",
      budgeting: "PieChart",
      debt: "TrendingDown",
      general: "Lightbulb",
    };
    return iconMap[type] || iconMap.general;
  };

  const getInsightColor = (type) => {
    const colorMap = {
      spending: "text-red-600 bg-red-50",
      saving: "text-green-600 bg-green-50",
      budgeting: "text-blue-600 bg-blue-50",
      debt: "text-orange-600 bg-orange-50",
      general: "text-purple-600 bg-purple-50",
    };
    return colorMap[type] || colorMap.general;
  };

  if (isLoading) {
    return (
      <div className="px-6 mb-6">
        <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            {React.createElement(getIcon("Sparkles"), {
              className: "h-6 w-6 text-purple-700 animate-pulse",
            })}
            <h3 className="text-lg font-black text-black">
              <span className="text-xl">I</span>NSIGHTS
            </h3>
          </div>
          <div className="text-center py-8 text-purple-700">
            <div className="text-sm">Analyzing your financial patterns...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 mb-6">
      <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          {React.createElement(getIcon("Sparkles"), {
            className: "h-6 w-6 text-purple-700",
          })}
          <h3 className="text-lg font-black text-black">
            <span className="text-xl">I</span>NSIGHTS
          </h3>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights && insights.length > 0 ? (
            insights.map((insight, index) => (
              <div
                key={insight.id || index}
                className={`p-4 rounded-lg border border-gray-200 ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {React.createElement(
                      getIcon(getInsightIcon(insight.type)),
                      {
                        className: "h-5 w-5",
                      },
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <div className="text-xs font-medium text-gray-800 bg-white/50 px-3 py-2 rounded">
                        <span className="font-semibold">Action:</span>{" "}
                        {insight.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-purple-700">
              <div className="mb-2">
                {React.createElement(getIcon("Sparkles"), {
                  className: "h-8 w-8 mx-auto text-purple-500",
                })}
              </div>
              <p className="text-sm mb-1">No insights available yet</p>
              <p className="text-xs text-purple-600">
                Keep using the app to generate personalized suggestions
              </p>
            </div>
          )}
        </div>

        {/* Footer Tip */}
        {insights && insights.length > 0 && (
          <div className="mt-6 p-3 bg-purple-50/60 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-purple-900">
              {React.createElement(getIcon("Info"), {
                className: "h-4 w-4 text-purple-600",
              })}
              <span className="text-sm">
                Insights are updated daily based on your financial activity
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsSection;
