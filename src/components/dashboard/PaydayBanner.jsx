import React from "react";
import { getIcon } from "../../utils";

/**
 * Full-width Payday Banner - Prominent payday information
 *
 * Features:
 * - Next payday date with countdown
 * - Estimated deposit amount
 * - Helpful tips and suggestions
 * - Full-width prominent design
 */
const PaydayBanner = () => {
  // TODO: Connect to existing payday prediction logic
  // For now using mock data for dashboard redesign
  const mockPaydayData = {
    nextPayday: "2024-09-20",
    daysUntilPayday: 9,
    estimatedDeposit: 2500.0,
    biweeklyShortfall: 300.0,
    paydayTip:
      "You're slightly behind your biweekly goal. Consider adjusting allocations when this paycheck arrives.",
  };

  const {
    nextPayday,
    daysUntilPayday,
    estimatedDeposit,
    biweeklyShortfall,
    paydayTip,
  } = mockPaydayData;

  const formatPaydayDate = (date) => {
    if (!date) return "Not Available";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const getDaysText = (days) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  return (
    <div className="mx-6 mb-6">
      <div className="glassmorphism rounded-lg p-6 border-2 border-black bg-gradient-to-r from-green-100/60 to-emerald-100/60 backdrop-blur-sm">
        <div className="text-center">
          {/* Main Payday Info */}
          <div className="flex items-center justify-center gap-3 mb-2">
            {React.createElement(getIcon("Calendar"), {
              className: "h-8 w-8 text-green-700",
            })}
            <h2 className="text-2xl font-black text-black">
              <span className="text-lg">N</span>EXT{" "}
              <span className="text-lg">E</span>STIMATED{" "}
              <span className="text-lg">P</span>AYDAY
            </h2>
          </div>

          {/* Date and Countdown */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-xl font-bold text-green-800">
              {formatPaydayDate(nextPayday)} ({getDaysText(daysUntilPayday)})
            </div>

            {estimatedDeposit && (
              <>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-2">
                  {React.createElement(getIcon("DollarSign"), {
                    className: "h-5 w-5 text-green-700",
                  })}
                  <span className="text-lg font-semibold text-green-800">
                    Est. deposit: ${estimatedDeposit.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Tip Section */}
          {paydayTip && (
            <div className="flex items-center justify-center gap-3 text-green-900 max-w-4xl mx-auto">
              {React.createElement(getIcon("Lightbulb"), {
                className: "h-5 w-5 text-amber-600 flex-shrink-0",
              })}
              <span className="text-base">
                <span className="font-semibold">Tip:</span> {paydayTip}
                {biweeklyShortfall > 0 && (
                  <span className="font-medium">
                    {" "}
                    — consider pre-allocating now
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaydayBanner;
