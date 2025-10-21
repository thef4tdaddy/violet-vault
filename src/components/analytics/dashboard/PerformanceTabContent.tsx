import React from "react";
import PerformanceMonitor from "../PerformanceMonitor";

interface PerformanceTabContentProps {
  analyticsData: unknown;
  balanceData: unknown;
}

const PerformanceTabContent: React.FC<PerformanceTabContentProps> = ({
  analyticsData,
  balanceData,
}) => {
  return (
    <div>
      <h2 className="font-black text-black text-base mb-4">
        <span className="text-lg">P</span>ERFORMANCE <span className="text-lg">M</span>ONITOR
      </h2>
      <PerformanceMonitor
        analyticsData={analyticsData}
        balanceData={balanceData}
      />
    </div>
  );
};

export default PerformanceTabContent;
