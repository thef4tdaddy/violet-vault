import React from "react";
import TrendAnalysisCharts from "../TrendAnalysisCharts";

interface TrendsTabContentProps {
  analyticsData: unknown;
  timeFilter: string;
}

const TrendsTabContent: React.FC<TrendsTabContentProps> = ({ analyticsData, timeFilter }) => {
  return (
    <div>
      <h2 className="font-black text-black text-base mb-4">
        <span className="text-lg">T</span>RENDS & <span className="text-lg">F</span>ORECASTING
      </h2>
      <TrendAnalysisCharts analyticsData={analyticsData} timeFilter={timeFilter} />
    </div>
  );
};

export default TrendsTabContent;
