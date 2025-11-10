import React from "react";
import { getIcon } from "@/utils";

interface CategoryStat {
  name: string;
  amount: number;
  frequency: number;
  trend?: number;
  totalAmount?: number;
  transactionCount?: number;
  avgAmount?: number;
  lastUsed?: string;
}

interface CategoryAnalysisTabProps {
  categoryStats: CategoryStat[];
}

const CategoryAnalysisTab = ({ categoryStats }: CategoryAnalysisTabProps) => {
  const getFrequencyIndicator = (frequency: number) => {
    if (frequency > 2)
      return React.createElement(getIcon("TrendingUp"), {
        className: "h-4 w-4 text-green-500",
      });
    if (frequency < 0.5)
      return React.createElement(getIcon("TrendingDown"), {
        className: "h-4 w-4 text-red-500",
      });
    return React.createElement(getIcon("CreditCard"), {
      className: "h-4 w-4 text-blue-500",
    });
  };

  const getFrequencyColor = (frequency: number) => {
    if (frequency > 2) return "border-green-200 bg-green-50/80";
    if (frequency < 0.5) return "border-red-200 bg-red-50/80";
    return "border-blue-200 bg-blue-50/80";
  };

  if (categoryStats.length === 0) {
    return (
      <div className="text-center py-8 text-purple-800">
        {React.createElement(getIcon("Tag"), {
          className: "h-12 w-12 mx-auto mb-4 text-gray-400",
        })}
        <p className="font-medium">No category data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryStats.map((stat: CategoryStat) => (
          <div
            key={stat.name}
            className={`glassmorphism backdrop-blur-sm rounded-xl p-4 border-2 border-black shadow-md hover:shadow-lg transition-all ${getFrequencyColor(stat.frequency)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {React.createElement(getIcon("Tag"), {
                  className: "h-4 w-4 text-purple-600",
                })}
                <h4 className="font-bold text-gray-900">{stat.name}</h4>
              </div>
              <div className="flex items-center gap-1">
                {getFrequencyIndicator(stat.frequency)}
                <span className="text-xs text-purple-800 font-bold capitalize">{stat.name}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700 font-medium">Total Amount:</span>
                <span className="font-black text-gray-900">${stat.totalAmount?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 font-medium">Transactions:</span>
                <span className="font-bold text-gray-900">{stat.transactionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 font-medium">Avg Amount:</span>
                <span className="font-bold text-gray-900">${stat.avgAmount?.toFixed(2) || "0.00"}</span>
              </div>
              {stat.lastUsed && (
                <div className="flex justify-between">
                  <span className="text-purple-700 font-medium">Last Used:</span>
                  <span className="font-bold text-gray-900">
                    {new Date(stat.lastUsed).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-purple-700 font-medium">Frequency:</span>
                <span className="font-bold text-gray-900">{stat.frequency.toFixed(1)}/month</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryAnalysisTab;
