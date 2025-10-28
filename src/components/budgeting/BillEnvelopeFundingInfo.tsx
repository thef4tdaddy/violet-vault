import React, { memo } from "react";
import { getIcon } from "../../utils";
import { getBillEnvelopeDisplayInfo } from "../../utils/budgeting/billEnvelopeCalculations";

// Helper to get progress bar color based on funding percentage
const getProgressBarColor = (progress) => {
  if (progress >= 100) return "bg-green-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

// Helper to get days until bill color class
const getDaysUntilColor = (days) => {
  if (days <= 3) return "text-red-600 font-medium";
  if (days <= 7) return "text-orange-600";
  return "text-gray-500";
};

// Status header component
const StatusHeader = ({
  status,
  displayText,
  priority,
  iconName,
}: {
  status: { textColor: string };
  displayText: { primaryStatus: string };
  priority: { priorityLevel: string };
  iconName: string;
}) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center space-x-2">
      {React.createElement(getIcon(iconName), {
        className: `h-4 w-4 ${status.textColor}`,
      })}
      <span className={`text-sm font-medium ${status.textColor}`}>{displayText.primaryStatus}</span>
    </div>
    {priority.priorityLevel === "critical" && (
      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
        URGENT
      </span>
    )}
  </div>
);

// Progress bar component
const ProgressBar = ({ fundingProgress }: { fundingProgress: number }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs text-gray-600 mb-1">
      <span>Funding Progress</span>
      <span>{fundingProgress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(fundingProgress)}`}
        style={{ width: `${Math.min(100, fundingProgress)}%` }}
      />
    </div>
  </div>
);

// Next bill info component
const NextBillInfo = ({
  nextBill,
  daysUntilNextBill,
}: {
  nextBill: { name: string; amount: number };
  daysUntilNextBill: number | null;
}) => (
  <div className="text-sm text-gray-600 mb-1">
    <span className="font-medium">Next Bill:</span> {nextBill.name} - ${nextBill.amount.toFixed(2)}
    {daysUntilNextBill !== null && (
      <span className={`ml-2 ${getDaysUntilColor(daysUntilNextBill)}`}>
        ({daysUntilNextBill} day{daysUntilNextBill !== 1 ? "s" : ""})
      </span>
    )}
  </div>
);

// Simplified status display
const StatusDisplay = ({
  targetMonthlyAmount,
  nextBill,
  remainingToFund,
  currentBalance,
}: {
  targetMonthlyAmount: number;
  nextBill?: { amount: number; frequency?: string };
  remainingToFund: number;
  currentBalance: number;
}) => (
  <div className="text-xs">
    <div className="text-gray-500">
      {targetMonthlyAmount > 0 && nextBill && (
        <span>
          Target: ${targetMonthlyAmount.toFixed(2)}/{nextBill.frequency || "month"}
        </span>
      )}
    </div>
    {remainingToFund <= 0 && currentBalance > nextBill?.amount && (
      <div className="text-green-600 font-medium">
        ${(currentBalance - (nextBill?.amount || 0)).toFixed(2)} surplus available
      </div>
    )}
  </div>
);

// Detailed info section
const DetailedInfo = ({
  displayInfo,
  upcomingBillsAmount,
  remainingToFund,
  targetMonthlyAmount,
  daysUntilNextBill,
  currentBalance,
  priority,
}: {
  displayInfo: { linkedBills?: number };
  upcomingBillsAmount: number;
  remainingToFund: number;
  targetMonthlyAmount: number;
  daysUntilNextBill: number | null;
  currentBalance: number;
  priority: { reason?: string };
}) => (
  <div className="mt-3 pt-2 border-t border-gray-200">
    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
      <div className="flex items-center space-x-1">
        {React.createElement(getIcon("Receipt"), {
          className: "h-3 w-3 text-gray-400",
        })}
        <span className="text-gray-600">
          {displayInfo.linkedBills} linked bill
          {displayInfo.linkedBills !== 1 ? "s" : ""}
        </span>
      </div>
      {upcomingBillsAmount > 0 && (
        <div className="flex items-center space-x-1">
          {React.createElement(getIcon("Target"), {
            className: "h-3 w-3 text-gray-400",
          })}
          <span className="text-gray-600">${upcomingBillsAmount.toFixed(2)} due (30d)</span>
        </div>
      )}
    </div>

    {remainingToFund > 0 && targetMonthlyAmount > 0 && (
      <FundingRecommendations
        remainingToFund={remainingToFund}
        daysUntilNextBill={daysUntilNextBill}
        targetMonthlyAmount={targetMonthlyAmount}
        currentBalance={currentBalance}
      />
    )}

    {currentBalance > targetMonthlyAmount && targetMonthlyAmount > 0 && (
      <WellFundedAlert currentBalance={currentBalance} targetMonthlyAmount={targetMonthlyAmount} />
    )}

    {priority.reason && <div className="mt-2 text-xs text-gray-500 italic">{priority.reason}</div>}
  </div>
);

// Funding recommendations component
const FundingRecommendations = ({
  remainingToFund,
  daysUntilNextBill,
  targetMonthlyAmount,
  currentBalance,
}: {
  remainingToFund: number;
  daysUntilNextBill: number | null;
  targetMonthlyAmount: number;
  currentBalance: number;
}) => (
  <div className="bg-blue-50 p-2 rounded text-xs">
    <div className="flex items-center space-x-1 mb-1">
      {React.createElement(getIcon("TrendingUp"), {
        className: "h-3 w-3 text-blue-600",
      })}
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
);

// Well funded alert component
const WellFundedAlert = ({
  currentBalance,
  targetMonthlyAmount,
}: {
  currentBalance: number;
  targetMonthlyAmount: number;
}) => (
  <div className="bg-green-50 p-2 rounded text-xs">
    <div className="flex items-center space-x-1 mb-1">
      {React.createElement(getIcon("CheckCircle"), {
        className: "h-3 w-3 text-green-600",
      })}
      <span className="font-medium text-green-700">Well Funded</span>
    </div>
    <div className="text-green-600">
      This envelope is {Math.round((currentBalance / targetMonthlyAmount) * 100)}% funded for the
      month
    </div>
  </div>
);

/**
 * Component to display bill envelope funding information
 * Shows remaining amount needed for next bill payment and funding progress
 */
const BillEnvelopeFundingInfo = memo(
  ({
    envelope,
    bills = [],
    showDetails = false,
  }: {
    envelope: { id: string; name?: string; currentBalance?: number; [key: string]: unknown };
    bills?: unknown[];
    showDetails?: boolean;
  }) => {
    const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

    if (!displayInfo) {
      return null;
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
    } = displayInfo as {
      nextBill?: { name: string; amount: number; frequency?: string };
      remainingToFund: number;
      daysUntilNextBill: number | null;
      fundingProgress: number;
      isFullyFunded: boolean;
      currentBalance: number;
      targetMonthlyAmount: number;
      upcomingBillsAmount: number;
      priority: { priorityLevel: string; reason?: string };
      status: { bgColor: string; textColor: string; color: string; icon?: string };
      displayText: { primaryStatus: string; secondaryStatus?: string; fundingProgress?: string };
      linkedBills?: number;
    };

    const iconName = status.icon || "DollarSign";

    return (
      <div className={`${status.bgColor} border border-${status.color}-200 rounded-lg p-3`}>
        <StatusHeader
          status={status}
          displayText={displayText}
          priority={priority}
          iconName={iconName}
        />

        {!isFullyFunded && <ProgressBar fundingProgress={fundingProgress} />}

        {nextBill && <NextBillInfo nextBill={nextBill} daysUntilNextBill={daysUntilNextBill} />}

        <StatusDisplay
          targetMonthlyAmount={targetMonthlyAmount}
          nextBill={nextBill}
          remainingToFund={remainingToFund}
          currentBalance={currentBalance}
        />

        {showDetails && (
          <DetailedInfo
            displayInfo={displayInfo as unknown as { linkedBills?: number }}
            upcomingBillsAmount={upcomingBillsAmount}
            remainingToFund={remainingToFund}
            targetMonthlyAmount={targetMonthlyAmount}
            daysUntilNextBill={daysUntilNextBill}
            currentBalance={currentBalance}
            priority={priority}
          />
        )}
      </div>
    );
  }
);

BillEnvelopeFundingInfo.displayName = "BillEnvelopeFundingInfo";

export default BillEnvelopeFundingInfo;
