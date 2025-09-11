import React from "react";
import { getIcon } from "../../../utils";

/**
 * Envelope Spending Card - Spending breakdown for current period
 *
 * Features:
 * - Top spending categories with percentages
 * - Visual progress bars for each category
 * - Color-coded spending categories
 * - Link to full envelopes view
 */
const EnvelopeSpendingCard = ({ setActiveView }) => {
  // TODO: Connect to existing envelope spending data
  // For now using mock data for dashboard redesign
  const mockSpendingData = {
    topSpendingCategories: [
      { name: "Groceries", amount: 325.5, percentage: 35 },
      { name: "Gas & Transportation", amount: 180.0, percentage: 20 },
      { name: "Entertainment", amount: 125.75, percentage: 15 },
      { name: "Dining Out", amount: 95.25, percentage: 10 },
      { name: "Utilities", amount: 85.0, percentage: 9 },
    ],
    totalSpent: 811.5,
    currentPeriod: "Sep 1-14",
  };

  const { topSpendingCategories, totalSpent, currentPeriod } = mockSpendingData;

  const getCategoryColor = (index) => {
    const colors = [
      "bg-purple-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  const handleViewEnvelopes = () => {
    if (setActiveView) {
      setActiveView("envelopes");
    }
  };

  return (
    <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {React.createElement(getIcon("PieChart"), {
            className: "h-6 w-6 text-purple-700",
          })}
          <h3 className="text-lg font-black text-black">
            <span className="text-xl">E</span>NVELOPE{" "}
            <span className="text-xl">S</span>PENDING
          </h3>
        </div>
        <span className="text-sm text-purple-900 font-medium">
          ({currentPeriod || "This Period"})
        </span>
      </div>

      {/* Spending Categories */}
      <div className="space-y-3 mb-6">
        {topSpendingCategories && topSpendingCategories.length > 0 ? (
          topSpendingCategories.map((category, index) => (
            <div
              key={category.name || index}
              className="flex items-center gap-3"
            >
              {/* Category Name and Amount */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-purple-900 truncate">
                    {category.name}
                  </span>
                  <span className="text-sm font-semibold text-black">
                    ${category.amount?.toLocaleString() || "0.00"} (
                    {category.percentage || 0}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getCategoryColor(index)}`}
                    style={{
                      width: `${Math.min(category.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-purple-700">
            <div className="mb-2">
              {React.createElement(getIcon("Package"), {
                className: "h-8 w-8 mx-auto text-purple-500",
              })}
            </div>
            <p className="text-sm">No spending data available</p>
            <p className="text-xs text-purple-600">
              Start adding transactions to see breakdown
            </p>
          </div>
        )}
      </div>

      {/* Total and Action */}
      <div className="border-t border-purple-200 pt-4">
        {totalSpent > 0 && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-purple-900">
              Total Spent:
            </span>
            <span className="text-lg font-bold text-black">
              ${totalSpent.toLocaleString()}
            </span>
          </div>
        )}

        <button
          onClick={handleViewEnvelopes}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-black bg-white/60 hover:bg-purple-200/60 transition-colors"
        >
          {React.createElement(getIcon("ArrowRight"), { className: "h-4 w-4" })}
          <span className="text-sm font-medium">View Full Envelopes</span>
        </button>
      </div>
    </div>
  );
};

export default EnvelopeSpendingCard;
