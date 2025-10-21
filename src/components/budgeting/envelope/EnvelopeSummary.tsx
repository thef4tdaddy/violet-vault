import React from "react";
import EnvelopeSummaryCards from "../EnvelopeSummaryCards";

const EnvelopeSummary = ({ totals, unassignedCash = 0 }) => {
  return (
    <div className="mb-6">
      <EnvelopeSummaryCards totals={totals} unassignedCash={unassignedCash} />
    </div>
  );
};

export default EnvelopeSummary;
