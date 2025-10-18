import React, { Suspense, useState } from "react";
import { Select } from "@/components/ui";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import { getStatusStyle, getUtilizationColor } from "../../../utils/budgeting";
import { ENVELOPE_TYPES } from "../../../constants/categories";
import { getBillEnvelopeDisplayInfo } from "../../../utils/budgeting/billEnvelopeCalculations";
import { getButtonClasses, withHapticFeedback } from "../../../utils/ui/touchFeedback";
import { useEnvelopeSwipeGestures } from "../../../hooks/useEnvelopeSwipeGestures";
import SwipeIndicatorOverlay from "./SwipeIndicatorOverlay";
import EnvelopeActivitySummary from "./EnvelopeActivitySummary";
import EnvelopeStatusDisplay from "./EnvelopeStatusDisplay";
import EnvelopeActions from "./EnvelopeActions";

// Lazy load the bill funding info component
const BillEnvelopeFundingInfo = React.lazy(() => import("../BillEnvelopeFundingInfo"));

const EnvelopeItem = ({
  envelope,
  onSelect,
  onEdit,
  onViewHistory,
  onQuickFund,
  isSelected,
  bills = [],
  unassignedCash = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Enhanced swipe gesture handling
  const { swipeState, swipeHandlers, swipeStyles } = useEnvelopeSwipeGestures({
    envelopeId: envelope.id,
    unassignedCash,
    onQuickFund,
    onViewHistory,
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "overdue":
      case "overspent":
        return React.createElement(getIcon("AlertTriangle"), {
          className: "h-4 w-4",
        });
      case "underfunded":
        return React.createElement(getIcon("Clock"), { className: "h-4 w-4" });
      case "healthy":
      default:
        return React.createElement(getIcon("CheckCircle"), {
          className: "h-4 w-4",
        });
    }
  };

  // Get utilization color - use sophisticated logic for bill envelopes
  const utilizationColorClass =
    envelope.envelopeType === ENVELOPE_TYPES.BILL
      ? (() => {
          const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);
          if (!displayInfo) {
            // Fallback to original function
            return getUtilizationColor(envelope.utilizationRate, envelope.status);
          }

          const { displayText } = displayInfo;
          const isOnTrack = displayText.primaryStatus === "On Track";
          const isFullyFunded = displayText.primaryStatus === "Fully Funded";
          const isBehind = displayText.primaryStatus.startsWith("Behind");

          if (isFullyFunded) return "bg-green-100 text-green-800";
          if (isOnTrack) return "bg-blue-100 text-blue-800";
          if (isBehind) return "bg-red-100 text-red-800";
          return "bg-orange-100 text-orange-800"; // Default for other states
        })()
      : // Non-bill envelopes use original function
        getUtilizationColor(envelope.utilizationRate, envelope.status);

  return (
    <div
      {...swipeHandlers}
      className={getButtonClasses(
        `relative p-6 rounded-lg border-2 cursor-pointer hover:shadow-lg ${getStatusStyle(envelope)} ${
          isSelected ? "ring-2 ring-purple-500" : ""
        } ${swipeState.isSwipeActive ? "select-none" : ""}`,
        "card"
      )}
      style={swipeStyles}
    >
      {/* Header - Always visible */}
      <div
        className="flex justify-between items-start mb-4"
        onClick={withHapticFeedback(() => onSelect?.(envelope.id), "light")}
      >
        {/* Mobile collapse button */}
        <Button
          onClick={withHapticFeedback((e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }, "light")}
          className={getButtonClasses(
            "md:hidden flex-shrink-0 mr-2 p-2 text-gray-400 hover:text-blue-600",
            "small"
          )}
          aria-label={isCollapsed ? "Expand envelope" : "Collapse envelope"}
        >
          {React.createElement(getIcon(isCollapsed ? "ChevronRight" : "ChevronDown"), {
            className: "h-4 w-4",
          })}
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {/* Color indicator */}
            {envelope.color && (
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: envelope.color }}
                title={`Color: ${envelope.color}`}
              />
            )}
            <h3 className="font-semibold text-gray-900 truncate">{envelope.name}</h3>
          </div>
          <p className="text-xs text-gray-600 mt-1">{envelope.category}</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <div
            className={`flex items-center px-2 py-1 rounded-full text-xs ${utilizationColorClass}`}
          >
            {envelope.status !== "healthy" && getStatusIcon(envelope.status)}
            <span className="ml-1">{(envelope.utilizationRate * 100).toFixed(0)}%</span>
          </div>

          <div className="flex gap-1">
            <Button
              onClick={withHapticFeedback((e) => {
                e.stopPropagation();
                onEdit?.(envelope);
              }, "light")}
              className={getButtonClasses(
                "p-2 text-gray-400 hover:text-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center",
                "small"
              )}
            >
              {React.createElement(getIcon("Edit"), { className: "h-4 w-4" })}
            </Button>
            <Button
              onClick={withHapticFeedback((e) => {
                e.stopPropagation();
                onViewHistory?.(envelope);
              }, "light")}
              className={getButtonClasses(
                "p-2 text-gray-400 hover:text-green-600 min-h-[44px] min-w-[44px] flex items-center justify-center",
                "small"
              )}
            >
              {React.createElement(getIcon("History"), {
                className: "h-4 w-4",
              })}
            </Button>
          </div>
        </div>
      </div>
      {/* Collapsible Content - Always visible on desktop, collapsible on mobile */}
      <div className={`${isCollapsed ? "hidden md:block" : "block"}`}>
        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Current Balance</p>
            <p className="text-lg font-semibold text-gray-900">
              ${(envelope.currentBalance || 0).toFixed(2)}
            </p>
          </div>
          <div>
            {envelope.envelopeType === ENVELOPE_TYPES.BILL ? (
              // For bill envelopes, use the same sophisticated logic as bottom section
              (() => {
                const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

                if (!displayInfo) {
                  // Fallback to simple calculation if sophisticated logic fails
                  const linkedBills = bills.filter(
                    (bill) => bill.envelopeId === envelope.id && !bill.isPaid
                  );
                  const nextBill = linkedBills
                    .filter((bill) => new Date(bill.dueDate) >= new Date())
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
                  const targetAmount = nextBill
                    ? nextBill.amount || 0
                    : envelope.monthlyBudget || envelope.monthlyAmount || 0;
                  const currentBalance = envelope.currentBalance || 0;
                  const amountNeeded = Math.max(0, targetAmount - currentBalance);

                  return (
                    <>
                      <p className="text-xs text-gray-500">
                        {amountNeeded > 0 ? "Still Need" : "Surplus"}
                      </p>
                      <p className="text-lg font-semibold text-orange-600">
                        ${amountNeeded.toFixed(2)}
                      </p>
                    </>
                  );
                }

                const { displayText, remainingToFund, currentBalance, targetMonthlyAmount } =
                  displayInfo;
                const isOnTrack = displayText.primaryStatus === "On Track";
                const isFullyFunded = displayText.primaryStatus === "Fully Funded";
                const isBehind = displayText.primaryStatus.startsWith("Behind");

                // Calculate amount to display based on status
                let displayAmount = remainingToFund;
                let displayLabel = "Still Need";
                let textColor = "text-orange-600";

                if (isFullyFunded) {
                  displayAmount = currentBalance - targetMonthlyAmount;
                  displayLabel = "Surplus";
                  textColor = "text-green-600";
                } else if (isOnTrack) {
                  displayLabel = "On Track";
                  displayAmount = remainingToFund;
                  textColor = "text-blue-600";
                } else if (isBehind) {
                  displayLabel = "Behind";
                  textColor = "text-red-600";
                }

                return (
                  <>
                    <p className="text-xs text-gray-500">{displayLabel}</p>
                    <p className={`text-lg font-semibold ${textColor}`}>
                      {isOnTrack && !isFullyFunded
                        ? `$${displayAmount.toFixed(2)}`
                        : `$${Math.abs(displayAmount).toFixed(2)}`}
                    </p>
                  </>
                );
              })()
            ) : (
              // For non-bill envelopes, keep the original "Available" display
              <>
                <p className="text-xs text-gray-500">Available</p>
                <p
                  className={`text-lg font-semibold ${
                    envelope.available >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${envelope.available.toFixed(2)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Activity Summary - Different display for Variable vs Bill envelopes */}
        <EnvelopeActivitySummary envelope={envelope} />

        {/* Minimal Bill Info for Bill Envelopes - most info already shown above */}
        {envelope.envelopeType === ENVELOPE_TYPES.BILL && bills.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <Suspense
              fallback={<div className="text-xs text-gray-500">Loading funding info...</div>}
            >
              {(() => {
                // Use the imported function
                const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);

                if (!displayInfo) return null;

                const { nextBill, daysUntilNextBill, displayText } = displayInfo;

                return (
                  <div className="space-y-1">
                    {/* Status Text */}
                    <div
                      className={`text-sm font-medium ${
                        displayText.primaryStatus === "Fully Funded"
                          ? "text-green-600"
                          : displayText.primaryStatus === "On Track"
                            ? "text-blue-600"
                            : displayText.primaryStatus.startsWith("Behind")
                              ? "text-red-600"
                              : "text-orange-600"
                      }`}
                    >
                      {displayText.primaryStatus}
                    </div>

                    {/* Next Bill Info */}
                    {nextBill && (
                      <div className="text-xs text-gray-500">
                        Next: {nextBill.name} in {daysUntilNextBill} day
                        {daysUntilNextBill !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                );
              })()}
            </Suspense>
          </div>
        )}

        {/* Progress Bar - Hide for Variable Expenses */}
        {envelope.envelopeType !== ENVELOPE_TYPES.VARIABLE && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  envelope.envelopeType === ENVELOPE_TYPES.BILL
                    ? (() => {
                        const displayInfo = getBillEnvelopeDisplayInfo(envelope, bills);
                        if (!displayInfo) {
                          // Fallback to old logic if sophisticated calculation fails
                          return envelope.utilizationRate > 1
                            ? "bg-red-500"
                            : envelope.utilizationRate > 0.8
                              ? "bg-orange-500"
                              : envelope.utilizationRate > 0.5
                                ? "bg-blue-500"
                                : "bg-green-500";
                        }

                        const { displayText } = displayInfo;
                        const isOnTrack = displayText.primaryStatus === "On Track";
                        const isFullyFunded = displayText.primaryStatus === "Fully Funded";
                        const isBehind = displayText.primaryStatus.startsWith("Behind");

                        if (isFullyFunded) return "bg-green-500";
                        if (isOnTrack) return "bg-blue-500";
                        if (isBehind) return "bg-red-500";
                        return "bg-orange-500"; // Default for other states
                      })()
                    : // Non-bill envelopes use original logic
                      envelope.utilizationRate > 1
                      ? "bg-red-500"
                      : envelope.utilizationRate > 0.8
                        ? "bg-orange-500"
                        : envelope.utilizationRate > 0.5
                          ? "bg-blue-500"
                          : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(envelope.utilizationRate * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>{" "}
      {/* End collapsible content */}
      {/* Enhanced Swipe Indicator Overlays */}
      <SwipeIndicatorOverlay swipeState={swipeState} unassignedCash={unassignedCash} />
    </div>
  );
};

export default EnvelopeItem;
