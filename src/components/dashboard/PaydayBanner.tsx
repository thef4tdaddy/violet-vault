import React from "react";
import { usePaydayProgress } from "@/hooks/dashboard/usePaydayProgress";
import { getIcon } from "@/utils";
import { StylizedButtonText } from "@/components/ui";

/**
 * Get countdown display text based on days until payday
 */
const getCountdownText = (daysUntilPayday: number | null): string => {
  if (daysUntilPayday === null) return "N/A";
  if (daysUntilPayday === 0) return "TODAY";
  if (daysUntilPayday === 1) return "TOMORROW";
  if (daysUntilPayday < 0) return "OVERDUE";
  return `${daysUntilPayday} DAYS`;
};

/**
 * Get countdown color based on days until payday
 */
const getCountdownColor = (daysUntilPayday: number | null): string => {
  if (daysUntilPayday === null) return "text-gray-600";
  if (daysUntilPayday < 0) return "text-red-600";
  if (daysUntilPayday === 0) return "text-green-600";
  if (daysUntilPayday === 1) return "text-emerald-600";
  if (daysUntilPayday <= 3) return "text-amber-600";
  return "text-purple-600";
};

/**
 * PaydayBanner Component
 * Displays payday countdown, progress tracking, and safe-to-spend calculations
 * Uses v2.0 Glassmorphism aesthetics
 *
 * Features:
 * - Payday countdown (days/hours)
 * - Biweekly progress bar with animation
 * - Safe-to-spend calculation
 * - Responsive design
 * - Loading and error states
 */
const PaydayBanner: React.FC = () => {
  const {
    daysUntilPayday,
    hoursUntilPayday,
    progressPercentage,
    safeToSpend,
    formattedPayday,
    isLoading,
    hasError,
  } = usePaydayProgress();

  // Loading state
  if (isLoading) {
    return (
      <div
        className="bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-3xl border-2 border-black rounded-xl shadow-2xl p-6 animate-pulse"
        data-testid="payday-banner"
      >
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div
        className="bg-gradient-to-br from-red-50/95 to-red-100/90 backdrop-blur-3xl border-2 border-red-600 rounded-xl shadow-2xl p-6"
        data-testid="payday-banner"
      >
        <div className="flex items-center">
          {React.createElement(getIcon("AlertTriangle"), {
            className: "h-6 w-6 text-red-600 mr-3",
          })}
          <StylizedButtonText firstLetterClassName="text-xl" restClassName="text-lg">
            ERROR LOADING PAYDAY DATA
          </StylizedButtonText>
        </div>
      </div>
    );
  }

  // No payday prediction available
  if (!formattedPayday || daysUntilPayday === null) {
    return (
      <div
        className="bg-gradient-to-br from-white/95 to-blue-50/90 backdrop-blur-3xl border-2 border-black rounded-xl shadow-2xl p-6"
        data-testid="payday-banner"
      >
        <div className="flex items-center mb-4">
          {React.createElement(getIcon("Calendar"), {
            className: "h-6 w-6 text-blue-600 mr-3",
          })}
          <StylizedButtonText firstLetterClassName="text-xl" restClassName="text-lg">
            PAYDAY TRACKING
          </StylizedButtonText>
        </div>
        <p className="text-gray-700">
          Add at least 2 paycheck transactions to enable payday predictions
        </p>
      </div>
    );
  }

  const countdownText = getCountdownText(daysUntilPayday);
  const countdownColor = getCountdownColor(daysUntilPayday);

  return (
    <div
      className="bg-gradient-to-br from-white/95 to-purple-50/90 backdrop-blur-3xl border-2 border-black rounded-xl shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl"
      data-testid="payday-banner"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {React.createElement(getIcon("Calendar"), {
            className: "h-6 w-6 text-purple-600 mr-3",
          })}
          <div>
            {/* Mobile: shorter title */}
            <div className="sm:hidden">
              <StylizedButtonText firstLetterClassName="text-xl" restClassName="text-lg">
                PAYDAY
              </StylizedButtonText>
            </div>
            {/* Desktop: full title */}
            <div className="hidden sm:block">
              <StylizedButtonText firstLetterClassName="text-xl" restClassName="text-lg">
                PAYDAY PROGRESS
              </StylizedButtonText>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl sm:text-4xl font-black ${countdownColor}`}>{countdownText}</div>
          {hoursUntilPayday !== null && hoursUntilPayday > 0 && hoursUntilPayday <= 48 && (
            <div className="text-sm text-gray-600 mt-1">{hoursUntilPayday}h remaining</div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Pay Cycle Progress</span>
          <span className="text-sm font-bold text-purple-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border border-black/20">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            data-testid="progress-bar"
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-600">
          <span>Last Payday</span>
          <span>{formattedPayday.date}</span>
        </div>
      </div>

      {/* Safe to Spend Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center mb-2">
            {React.createElement(getIcon("DollarSign"), {
              className: "h-5 w-5 text-green-600 mr-2",
            })}
            <span className="text-sm font-medium text-green-900">SAFE TO SPEND</span>
          </div>
          <div className="text-3xl font-black text-green-700" data-testid="safe-to-spend">
            ${safeToSpend.toFixed(2)}
          </div>
          <p className="text-xs text-green-700 mt-1">After upcoming bills</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-2">
            {React.createElement(getIcon("TrendingUp"), {
              className: "h-5 w-5 text-blue-600 mr-2",
            })}
            <span className="text-sm font-medium text-blue-900">NEXT PAYDAY</span>
          </div>
          <div className="text-xl font-bold text-blue-700">{formattedPayday.shortText}</div>
          <p className="text-xs text-blue-700 mt-1">
            {formattedPayday.pattern} ({formattedPayday.confidence}% confidence)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaydayBanner;
