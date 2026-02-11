import React from "react";
import { getIcon } from "../../utils";

interface CashFlowData {
  unassignedCash?: number;
}

const CashFlowSummary = ({ cashFlow }: { cashFlow: CashFlowData }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        {React.createElement(getIcon("DollarSign"), {
          className: "h-5 w-5 mr-2 text-green-600",
        })}
        Cash Flow Summary
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Unassigned Cash</div>
          <div className="text-2xl font-bold text-green-700">
            ${cashFlow.unassignedCash?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowSummary;
