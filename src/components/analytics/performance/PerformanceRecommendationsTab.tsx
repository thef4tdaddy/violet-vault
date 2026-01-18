import React from "react";
import { getIcon } from "../../../utils";
import { getRecommendationIconType } from "@/utils/performanceUtils";

import { Recommendation } from "@/types/analytics";

interface PerformanceRecommendationsTabProps {
  recommendations: Recommendation[];
}

/**
 * PerformanceRecommendationsTab component - recommendations tab content
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const PerformanceRecommendationsTab: React.FC<PerformanceRecommendationsTabProps> = ({
  recommendations,
}) => {
  const CheckCircle = getIcon("CheckCircle");

  const renderRecommendationIcon = (type: string) => {
    const iconConfig = getRecommendationIconType(type);
    const Icon = getIcon(iconConfig.name);
    return React.createElement(Icon, {
      className: `h-5 w-5 ${iconConfig.color}`,
    });
  };

  return (
    <div className="space-y-3">
      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {React.createElement(CheckCircle, {
            className: "h-12 w-12 mx-auto mb-4 text-green-500",
          })}
          <p className="text-lg font-medium">You're doing great!</p>
          <p>No specific recommendations at this time.</p>
        </div>
      ) : (
        recommendations.map((rec, index) => (
          <div
            key={index}
            className="bg-white/60 rounded-lg p-4 border border-white/20 flex items-start"
          >
            <div className="mr-3 mt-0.5">{renderRecommendationIcon(rec.type)}</div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{rec.message}</p>
              {rec.action && <p className="text-purple-600 text-sm font-medium">🎯 {rec.action}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PerformanceRecommendationsTab;
