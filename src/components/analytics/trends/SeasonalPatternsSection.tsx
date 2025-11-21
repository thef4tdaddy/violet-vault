import React from "react";
import { formatCurrency } from "../../../utils/analytics/trendHelpers";

import { SeasonalPattern } from "@/types/analytics";

interface SeasonalPatternsSectionProps {
  seasonalPatterns: SeasonalPattern[];
}

const SeasonalPatternsSection: React.FC<SeasonalPatternsSectionProps> = ({ seasonalPatterns }) => {
  return (
    <div className="rounded-xl p-6 border-2 border-black bg-white/90 backdrop-blur-sm shadow-xl">
      <h3 className="font-black text-black text-base mb-4">
        <span className="text-lg">S</span>EASONAL <span className="text-lg">S</span>PENDING{" "}
        <span className="text-lg">P</span>ATTERNS
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {seasonalPatterns.map((season) => (
          <div
            key={season.name}
            className="border-2 border-black rounded-xl p-4 bg-white/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded border border-black"
                style={{ backgroundColor: season.color }}
              ></div>
              <h4 className="font-bold text-purple-900">{season.name.toUpperCase()}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-900">Avg Spending:</span>
                <span className="font-bold text-black">{formatCurrency(season.avgSpending)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900">Avg Income:</span>
                <span className="font-bold text-black">{formatCurrency(season.avgIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-900">Net:</span>
                <span
                  className={`font-bold ${season.avgNet >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(Math.abs(season.avgNet))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonalPatternsSection;
