import React from "react";
import { renderIcon } from "@/utils/ui/icons";
import InsightCard, { type InsightType } from "./InsightCard";
import { useFinancialInsights } from "@/hooks/dashboard/useFinancialInsights";

interface InsightsWidgetProps {
  className?: string;
}

const InsightsWidget: React.FC<InsightsWidgetProps> = ({ className = "" }) => {
  const { insights, isLoading } = useFinancialInsights();

  if (isLoading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`}>
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="h-24 bg-gray-100 rounded-xl border-2 border-black" />
        <div className="h-24 bg-gray-100 rounded-xl border-2 border-black" />
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {renderIcon("activity", { className: "h-5 w-5 text-black" })}
        <h3 className="font-black text-lg tracking-tighter uppercase">
          Financial <span className="text-purple-600">Insights</span>
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            iconName={insight.iconName}
            title={insight.title}
            description={insight.description}
            type={insight.type as InsightType}
            actionLabel={insight.actionLabel}
            onAction={insight.onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default InsightsWidget;
