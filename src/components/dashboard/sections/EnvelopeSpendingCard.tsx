import React from "react";
import { getIcon } from "@/utils";
import { Button } from "@/components/ui";

interface EnvelopeSpending {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface EnvelopeSpendingCardProps {
  spendingData: EnvelopeSpending[];
  onViewFullEnvelopes?: () => void;
}

/**
 * Envelope Spending Breakdown Card
 * Shows spending percentages for current period
 */
const EnvelopeSpendingCard = ({
  spendingData,
  onViewFullEnvelopes,
}: EnvelopeSpendingCardProps) => {
  return (
    <div className="glassmorphism rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        {React.createElement(getIcon("Wallet"), {
          className: "h-5 w-5 mr-2 text-green-600",
        })}
        Envelope Spending (This Period)
      </h3>

      <div className="space-y-3">
        {spendingData.length === 0 ? (
          <p className="text-sm text-gray-600">No spending data available for this period.</p>
        ) : (
          spendingData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-gray-900 font-bold">
                  ${item.amount.toFixed(2)} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-300`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))
        )}

        {onViewFullEnvelopes && (
          <Button
            onClick={onViewFullEnvelopes}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            View Full Envelopes
            {React.createElement(getIcon("ArrowRight"), {
              className: "h-4 w-4",
            })}
          </Button>
        )}
      </div>
    </div>
  );
};

export default React.memo(EnvelopeSpendingCard);
