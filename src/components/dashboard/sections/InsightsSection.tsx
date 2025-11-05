import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface Insight {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InsightsSectionProps {
  insights: Insight[];
}

/**
 * Insights Section
 * Shows AI-driven suggestions and notifications
 */
const InsightsSection = ({ insights }: InsightsSectionProps) => {
  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "AlertTriangle";
      case "success":
        return "CheckCircle";
      default:
        return "Lightbulb";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "warning":
        return "text-yellow-600";
      case "success":
        return "text-green-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("Lightbulb"), {
          className: "h-5 w-5 mr-2 text-yellow-600",
        })}
        Insights / Notifications
      </h3>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              {React.createElement(getIcon(getInsightIcon(insight.type)), {
                className: `h-5 w-5 flex-shrink-0 mt-0.5 ${getIconColor(insight.type)}`,
              })}
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.message}</p>
                {insight.action && (
                  <Button
                    onClick={insight.action.onClick}
                    className="mt-2 text-sm font-medium underline hover:no-underline"
                  >
                    {insight.action.label}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(InsightsSection);
