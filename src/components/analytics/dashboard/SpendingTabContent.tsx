import React from "react";
import ChartsAndAnalytics from "../ChartsAndAnalytics";

interface SpendingTabContentProps {
  transactions: unknown[];
  envelopes: unknown[];
  timeFilter: string;
}

const SpendingTabContent: React.FC<SpendingTabContentProps> = ({
  transactions,
  envelopes,
  timeFilter,
}) => {
  return (
    <div>
      <h2 className="font-black text-black text-base mb-4">
        <span className="text-lg">S</span>PENDING <span className="text-lg">A</span>NALYSIS
      </h2>
      <ChartsAndAnalytics
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
        focus="spending"
      />
    </div>
  );
};

export default SpendingTabContent;
