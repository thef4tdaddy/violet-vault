import React from "react";
import ChartsAndAnalytics from "../ChartsAndAnalytics";

interface OverviewTabContentProps {
  transactions: unknown[];
  envelopes: unknown[];
  timeFilter: string;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  transactions,
  envelopes,
  timeFilter,
}) => {
  return (
    <div>
      <h2 className="font-black text-black text-base mb-4">
        <span className="text-lg">F</span>INANCIAL <span className="text-lg">O</span>VERVIEW
      </h2>
      <ChartsAndAnalytics
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
      />
    </div>
  );
};

export default OverviewTabContent;
