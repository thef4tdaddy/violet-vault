import React from "react";
import { getIcon } from "../../../utils";

interface PaymentImpactScenario {
  extraPayment: number;
  avalanche: {
    timeSavings: number;
    interestSavings: number;
  };
  snowball: {
    timeSavings: number;
    interestSavings: number;
  };
}

interface PaymentImpactTableProps {
  paymentImpact?: PaymentImpactScenario[];
}

/**
 * Table component for showing payment impact analysis
 * Pure UI component - receives impact data as props
 */
const PaymentImpactTable: React.FC<PaymentImpactTableProps> = ({ paymentImpact = [] }) => {
  if (!paymentImpact.length) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <p className="text-gray-500 text-center">No payment impact data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          {React.createElement(getIcon("TrendingUp"), {
            className: "h-5 w-5 mr-2",
          })}
          Extra Payment Impact
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          See how extra payments affect your debt payoff timeline
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Extra Payment
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strategy
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Saved
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest Saved
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paymentImpact.map((scenario: PaymentImpactScenario, index: number) => (
              <React.Fragment key={scenario.extraPayment}>
                {/* Avalanche row */}
                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {React.createElement(getIcon("DollarSign"), {
                        className: "h-4 w-4 text-green-500 mr-1",
                      })}
                      <span className="font-medium text-gray-900">+${scenario.extraPayment}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Avalanche
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {React.createElement(getIcon("Calendar"), {
                        className: "h-3 w-3 text-blue-500 mr-1",
                      })}
                      <span className="text-sm font-medium text-blue-600">
                        {scenario.avalanche.timeSavings || 0} months
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-green-600">
                      ${(scenario.avalanche.interestSavings || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
                {/* Snowball row */}
                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3">{/* Empty cell for alignment */}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Snowball
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {React.createElement(getIcon("Calendar"), {
                        className: "h-3 w-3 text-blue-500 mr-1",
                      })}
                      <span className="text-sm font-medium text-blue-600">
                        {scenario.snowball.timeSavings || 0} months
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium text-green-600">
                      ${(scenario.snowball.interestSavings || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Pro Tip:</strong> Even small extra payments can significantly reduce your debt
          payoff time and interest costs. Consider rounding up payments or applying windfalls to
          accelerate your debt freedom.
        </p>
      </div>
    </div>
  );
};

export default PaymentImpactTable;
