import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, getCategoryChartColor } from "@/utils/analytics/trendHelpers";

import { CategoryTrend } from "@/types/analytics";

interface CategoryTrendsSectionProps {
  categoryTrends: CategoryTrend[];
}

const CategoryTrendsSection: React.FC<CategoryTrendsSectionProps> = ({ categoryTrends }) => {
  const tooltipFormatter = (value: number | undefined) => [
    formatCurrency(Number(value || 0)),
    "Amount",
  ];

  return (
    <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">T</span>OP <span className="text-lg">C</span>
        ATEGORY <span className="text-lg">T</span>RENDS
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryTrends.map((category, index) => (
          <div
            key={category.name}
            className="border-2 border-black rounded-xl p-4 bg-white/50 backdrop-blur-sm"
          >
            <h4 className="font-bold text-purple-900 mb-2">{category.name.toUpperCase()}</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={category.trend}>
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={getCategoryChartColor(index)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTrendsSection;
