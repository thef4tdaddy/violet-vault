import React, { memo } from "react";
import { getIcon } from "../../utils";
import { getBillEnvelopeDisplayInfo } from "../../utils/budgeting/billEnvelopeCalculations";

/**
 * Component to display bill envelope funding information
 * Shows remaining amount needed for next bill payment and funding progress
 */
const BillEnvelopeFundingInfo = memo(({ envelope, bills = [], showDetails = false }) => {
  const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

  if (!displayInfo) {
    return null; // Not a bill envelope
  }

  const {
    nextBill,
    remainingToFund,
    daysUntilNextBill,
    fundingProgress,
    isFullyFunded,
    currentBalance,
    targetMonthlyAmount,
    upcomingBillsAmount,
    priority,
    status,
    displayText,
  } = displayInfo;

  const iconName = status.icon || "DollarSign";

  return (
    <div className={`${status.bgColor} border border-${status.color}-200 rounded-lg p-3`}>
      {/* Header with status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {React.createElement(getIcon(iconName), { className: `h-4 w-4 ${status.textColor}` })}
          <span className={`text-sm font-medium ${status.textColor}`}>
            {displayText.primaryStatus}
          </span>
        </div>
        {priority.priorityLevel === "critical" && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            URGENT
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isFullyFunded && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Funding Progress</span>
            <span>{fundingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                fundingProgress >= 100
                  ? "bg-green-500"
                  : fundingProgress >= 75
                    ? "bg-blue-500"
                    : fundingProgress >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, fundingProgress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Next bill info */}
      {nextBill && (
        <div className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Next Bill:</span> {nextBill.name} - $
          {nextBill.amount.toFixed(2)}
          {daysUntilNextBill !== null && (
            <span
              className={`ml-2 ${
                daysUntilNextBill <= 3
                  ? "text-red-600 font-medium"
                  : daysUntilNextBill <= 7
                    ? "text-orange-600"
                    : "text-gray-500"
              }`}
            >
              ({daysUntilNextBill} day{daysUntilNextBill !== 1 ? "s" : ""})
            </span>
          )}
        </div>
      )}

      {/* Simplified status display */}
      <div className="text-xs">
        <div className="text-gray-500">
          {targetMonthlyAmount > 0 && nextBill && (
            <span>
              Target: ${targetMonthlyAmount.toFixed(2)}/{nextBill.frequency || "month"}
            </span>
          )}
        </div>

        {/* Show funding surplus if overfunded */}
        {remainingToFund <= 0 && currentBalance > nextBill?.amount && (
          <div className="text-green-600 font-medium">
            ${(currentBalance - (nextBill?.amount || 0)).toFixed(2)} surplus available
          </div>
        )}
      </div>

      {/* Detailed information if requested */}
      {showDetails && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="flex items-center space-x-1">
              <Receipt className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">
                {displayInfo.linkedBills} linked bill
                {displayInfo.linkedBills !== 1 ? "s" : ""}
              </span>
            </div>
            {upcomingBillsAmount > 0 && (
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3 text-gray-400" />
                <span className="text-gray-600">${upcomingBillsAmount.toFixed(2)} due (30d)</span>
              </div>
            )}
          </div>

          {/* Funding timeline and recommendations */}
          {remainingToFund > 0 && targetMonthlyAmount > 0 && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-700">Funding Recommendations</span>
              </div>
              <div className="text-blue-600 space-y-1">
                {daysUntilNextBill && daysUntilNextBill > 0 && (
                  <div>
                    • Need ${(remainingToFund / daysUntilNextBill).toFixed(2)}
                    /day to fund on time
                  </div>
                )}
                {targetMonthlyAmount > currentBalance && (
                  <div>
                    • Monthly allocation: ${targetMonthlyAmount.toFixed(2)}
                    (${(targetMonthlyAmount / 2).toFixed(2)} per paycheck)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overfunding alert */}
          {currentBalance > targetMonthlyAmount && targetMonthlyAmount > 0 && (
            <div className="bg-green-50 p-2 rounded text-xs">
              <div className="flex items-center space-x-1 mb-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700">Well Funded</span>
              </div>
              <div className="text-green-600">
                This envelope is {Math.round((currentBalance / targetMonthlyAmount) * 100)}% funded
                for the month
              </div>
            </div>
          )}

          {priority.reason && (
            <div className="mt-2 text-xs text-gray-500 italic">{priority.reason}</div>
          )}
        </div>
      )}
    </div>
  );
});

BillEnvelopeFundingInfo.displayName = "BillEnvelopeFundingInfo";

export default BillEnvelopeFundingInfo;
