import React from "react";
import MetricCard from "./MetricCard";

interface PerformanceMetrics {
  budgetAdherence: number;
  savingsRate: number;
  spendingEfficiency: number;
  balanceStability: number;
  [key: string]: unknown; // Allow other properties if needed
}

interface MetricsGridProps {
  performanceMetrics: PerformanceMetrics;
}

/**
 * MetricsGrid component - displays performance metric cards
 * Extracted from PerformanceMonitor.jsx for better organization
 */
const MetricsGrid: React.FC<MetricsGridProps> = ({ performanceMetrics }) => {
  const metricsConfig = [
    {
      title: "Budget Adherence",
      score: performanceMetrics.budgetAdherence,
      iconName: "Target",
      description: "How well you're sticking to your planned spending",
    },
    {
      title: "Savings Rate",
      score: performanceMetrics.savingsRate,
      iconName: "TrendingUp",
      description: "Your ability to save and build wealth",
    },
    {
      title: "Spending Efficiency",
      score: performanceMetrics.spendingEfficiency,
      iconName: "DollarSign",
      description: "How balanced your spending is across categories",
    },
    {
      title: "Balance Stability",
      score: performanceMetrics.balanceStability,
      iconName: "Wallet",
      description: "Accuracy between your actual and virtual balances",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metricsConfig.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          score={metric.score}
          iconName={metric.iconName}
          description={metric.description}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
