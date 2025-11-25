import React from "react";
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
import type { Envelope as DbEnvelope, Bill as DbBill } from "@/db/types";

type Envelope = DbEnvelope & {
  color?: string;
  status: string;
  utilizationRate: number;
  available: number;
};

type Bill = DbBill;

interface EnvelopeItemProps {
  envelope: Envelope;
  onSelect?: (envelopeId: string) => void;
  onEdit?: (envelope: Envelope) => void;
  onViewHistory?: (envelope: Envelope) => void;
  onQuickFund?: (envelopeId: string) => void;
  isSelected?: boolean;
  bills?: Bill[];
  unassignedCash?: number;
  viewMode?: string; // "overview" or "detailed"
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
  viewMode = "overview",
}) => {
  // viewMode controls display: overview = simplified/collapsed, detailed = full/expanded
  const isCollapsed = viewMode === "overview";

  // Enhanced swipe gesture handling
  const { swipeState, swipeHandlers, swipeStyles } = useEnvelopeSwipeGestures({
    envelopeId: envelope.id,
    unassignedCash,
    onQuickFund,
    onViewHistory: onViewHistory ? (_envelopeId: string) => onViewHistory(envelope) : undefined,
  });

  // Extract all display data logic
  const { statusIcon, utilizationColorClass, financialSummary, showProgressBar, progressBarColor } =
    useEnvelopeDisplayData(envelope, bills);

  return (
    <div
      {...swipeHandlers}
      className={getButtonClasses(
        `relative p-6 rounded-lg border-2 cursor-pointer hover:shadow-lg ${getStatusStyle(envelope as never)} ${
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
        onToggleCollapse={() => {}} // Disabled when viewMode controls collapse
      />

      <div className="flex items-center gap-2 ml-4">
        <EnvelopeStatusBadge
          status={envelope.status}
          utilizationRate={envelope.utilizationRate}
          statusIcon={statusIcon}
          utilizationColorClass={utilizationColorClass}
        />
      </div>

      {/* Collapsible Content - Controlled by viewMode */}
      <div className={`${isCollapsed ? "hidden" : "block"}`}>
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
