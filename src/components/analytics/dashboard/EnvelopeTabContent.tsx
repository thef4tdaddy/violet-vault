import React from "react";
import ChartsAndAnalytics from "../ChartsAndAnalytics";

interface EnvelopeTabContentProps {
  transactions: unknown[];
  envelopes: unknown[];
  timeFilter: string;
}

const EnvelopeTabContent: React.FC<EnvelopeTabContentProps> = ({
  transactions,
  envelopes,
  timeFilter,
}) => {
  return (
    <div>
      <h2 className="font-black text-black text-base mb-4">
        <span className="text-lg">E</span>NVELOPE <span className="text-lg">A</span>NALYSIS
      </h2>
      <ChartsAndAnalytics
        transactions={transactions}
        envelopes={envelopes}
        timeFilter={timeFilter}
        focus="envelopes"
      />
    </div>
  );
};

export default EnvelopeTabContent;
