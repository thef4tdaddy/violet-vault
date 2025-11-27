import React from "react";

interface FinancialSummary {
  currentBalance: string;
  secondaryLabel: string;
  secondaryValue: string;
  secondaryColor: string;
}

interface EnvelopeFinancialSummaryProps {
  financialSummary: FinancialSummary;
}

export const EnvelopeFinancialSummary: React.FC<EnvelopeFinancialSummaryProps> = React.memo(
  ({ financialSummary }) => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="text-lg font-semibold text-gray-900">{financialSummary.currentBalance}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">{financialSummary.secondaryLabel}</p>
          <p className={`text-lg font-semibold ${financialSummary.secondaryColor}`}>
            {financialSummary.secondaryValue}
          </p>
        </div>
      </div>
    );
  }
);

EnvelopeFinancialSummary.displayName = "EnvelopeFinancialSummary";
