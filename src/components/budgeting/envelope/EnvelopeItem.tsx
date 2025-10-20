import React, { useState } from "react";
import { getStatusStyle } from "../../../utils/budgeting";
import { getButtonClasses } from "../../../utils/ui/touchFeedback";
import { useEnvelopeSwipeGestures } from "../../../hooks/useEnvelopeSwipeGestures";
import SwipeIndicatorOverlay from "./SwipeIndicatorOverlay";
import EnvelopeActivitySummary from "./EnvelopeActivitySummary";
import { useEnvelopeDisplayData } from "./hooks/useEnvelopeDisplayData";
import { EnvelopeStatusBadge } from "./EnvelopeStatusBadge";
import { EnvelopeFinancialSummary } from "./EnvelopeFinancialSummary";
import { EnvelopeProgressBar } from "./EnvelopeProgressBar";
import { EnvelopeHeader } from "./EnvelopeHeader";
import { BillEnvelopeStatus } from "./BillEnvelopeStatus";

interface Envelope {
  id: string;
  name: string;
  category: string;
  color?: string;
  envelopeType: string;
  status: string;
  utilizationRate: number;
  currentBalance: number;
  available: number;
  monthlyBudget?: number;
  monthlyAmount?: number;
}

interface Bill {
  id: string;
  name: string;
  envelopeId: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

interface EnvelopeItemProps {
  envelope: Envelope;
  onSelect?: (envelopeId: string) => void;
  onEdit?: (envelope: Envelope) => void;
  onViewHistory?: (envelope: Envelope) => void;
  onQuickFund?: (envelopeId: string) => void;
  isSelected?: boolean;
  bills?: Bill[];
  unassignedCash?: number;
}

const EnvelopeItem: React.FC<EnvelopeItemProps> = ({
  envelope,
  onSelect,
  onEdit,
  onViewHistory,
  onQuickFund,
  isSelected = false,
  bills = [],
  unassignedCash = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Enhanced swipe gesture handling
  const { swipeState, swipeHandlers, swipeStyles } = useEnvelopeSwipeGestures({
    envelopeId: envelope.id,
    unassignedCash,
    onQuickFund,
    onViewHistory: onViewHistory ? (_envelopeId: string) => onViewHistory(envelope) : undefined,
  });

  // Extract all display data logic
  const {
    statusIcon,
    utilizationColorClass,
    financialSummary,
    showProgressBar,
    progressBarColor,
  } = useEnvelopeDisplayData(envelope, bills);

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
      <EnvelopeHeader
        envelope={envelope}
        isCollapsed={isCollapsed}
        onSelect={onSelect}
        onEdit={onEdit}
        onViewHistory={onViewHistory}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex items-center gap-2 ml-4">
        <EnvelopeStatusBadge
          status={envelope.status}
          utilizationRate={envelope.utilizationRate}
          statusIcon={statusIcon}
          utilizationColorClass={utilizationColorClass}
        />
      </div>

      {/* Collapsible Content - Always visible on desktop, collapsible on mobile */}
      <div className={`${isCollapsed ? "hidden md:block" : "block"}`}>
        <EnvelopeFinancialSummary financialSummary={financialSummary} />

        {/* Activity Summary - Different display for Variable vs Bill envelopes */}
        <EnvelopeActivitySummary envelope={envelope} />

        <BillEnvelopeStatus envelope={envelope} bills={bills} />

        {/* Progress Bar */}
        {showProgressBar && (
          <EnvelopeProgressBar
            utilizationRate={envelope.utilizationRate}
            progressBarColor={progressBarColor}
          />
        )}
      </div>

      {/* Enhanced Swipe Indicator Overlays */}
      <SwipeIndicatorOverlay swipeState={swipeState} unassignedCash={unassignedCash} />
    </div>
  );
};

export default EnvelopeItem;
