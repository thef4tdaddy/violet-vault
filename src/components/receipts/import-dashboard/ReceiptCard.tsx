import React from "react";
import { getIcon } from "@/utils/ui/icons";
import type { DashboardReceiptItem } from "@/types/import-dashboard.types";
import { useOCRJobStatus } from "@/hooks/platform/receipts/useOCRJobStatus";
import ErrorState from "./ErrorState";

const Calendar = getIcon("Calendar");
const DollarSign = getIcon("DollarSign");
const Store = getIcon("Store");

interface ReceiptCardProps {
  receipt: DashboardReceiptItem;
  onClick?: (receipt: DashboardReceiptItem) => void;
  className?: string;
}

/**
 * Get border and shadow classes based on match confidence
 */
function getConfidenceStyles(confidence?: number): string {
  if (!confidence) return "border-black";

  if (confidence >= 0.8) {
    // HIGH confidence - green glow
    return "border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
  } else if (confidence >= 0.6) {
    // MEDIUM confidence - yellow glow
    return "border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
  }

  // LOW confidence - no glow
  return "border-black";
}

/**
 * Format currency with proper decimal places
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Get status badge styling
 */
function getStatusStyles(status: DashboardReceiptItem["status"]): {
  bg: string;
  text: string;
  label: string;
} {
  switch (status) {
    case "pending":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "PENDING" };
    case "processing":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "PROCESSING" };
    case "matched":
      return { bg: "bg-green-100", text: "text-green-700", label: "MATCHED" };
    case "failed":
      return { bg: "bg-red-100", text: "text-red-700", label: "FAILED" };
    case "ignored":
      return { bg: "bg-gray-100", text: "text-gray-700", label: "IGNORED" };
  }
}

/**
 * Build card className based on state
 */
const buildCardClassName = (
  confidenceStyles: string,
  isProcessing: boolean,
  onClick: ((receipt: DashboardReceiptItem) => void) | undefined,
  className: string
): string => {
  const baseClasses =
    "group relative bg-white border-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all";
  const processingClasses = isProcessing
    ? "animate-[pulse_3s_ease-in-out_infinite] ring-2 ring-blue-400 ring-offset-2"
    : "";
  const interactiveClasses =
    onClick && !isProcessing
      ? "cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1"
      : "";

  return `${baseClasses} ${confidenceStyles} ${processingClasses} ${interactiveClasses} ${className}`;
};

/**
 * Source badge component
 */
const SourceBadge: React.FC<{ source: "sentinel" | "ocr"; isProcessing: boolean }> = ({
  source,
  isProcessing,
}) => (
  <div className="absolute top-3 right-3 flex gap-2">
    {isProcessing && (
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent" />
    )}
    <span
      className={`px-2 py-1 rounded border border-black font-mono text-[10px] font-black uppercase tracking-widest ${
        source === "sentinel" ? "bg-purple-200 text-purple-900" : "bg-cyan-200 text-cyan-900"
      }`}
      aria-label={`Source: ${source}`}
    >
      {source === "sentinel" ? "DGTL" : "SCAN"}
    </span>
  </div>
);

/**
 * Processing progress bar component
 */
const ProcessingProgress: React.FC<{ jobStatus: string; progress: number }> = ({
  jobStatus,
  progress,
}) => (
  <div className="w-full flex flex-col gap-1">
    <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-blue-700">
      <span>{jobStatus}</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full h-2 bg-blue-100 border border-black rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

/**
 * Status badge and confidence display
 */
const StatusDisplay: React.FC<{
  statusStyles: { bg: string; text: string; label: string };
  matchConfidence?: number;
}> = ({ statusStyles, matchConfidence }) => (
  <>
    <span
      className={`px-2 py-1 rounded border border-black font-mono text-xs font-black uppercase tracking-wide ${statusStyles.bg} ${statusStyles.text}`}
    >
      {statusStyles.label}
    </span>
    {matchConfidence !== undefined && matchConfidence >= 0.6 && (
      <span className="font-mono text-xs font-bold text-gray-600">
        {Math.round(matchConfidence * 100)}% match
      </span>
    )}
  </>
);

/**
 * ReceiptCard - Individual receipt display with Hard Line v2.1 aesthetic
 * Shows merchant, amount, date, status with confidence glow indicator
 */
// eslint-disable-next-line complexity -- Component handles multiple display states (processing, failed, success) with polling logic; further extraction would harm readability
const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onClick, className = "" }) => {
  const confidenceStyles = getConfidenceStyles(receipt.matchConfidence);
  const statusStyles = getStatusStyles(receipt.status);

  // Poll for status if this is a scan that might be processing
  const {
    status: jobStatus,
    progress,
    error,
  } = useOCRJobStatus(receipt.source === "ocr" ? receipt.id : "");

  // Determine effective status (merge prop status with polled status)
  const isProcessing =
    receipt.status === "processing" || ["queued", "processing", "extracting"].includes(jobStatus);

  const isFailed = receipt.status === "failed" || jobStatus === "failed";

  // Display values (handle processing state)
  const displayMerchant = isProcessing ? "Processing..." : receipt.merchant;
  const displayAmount = isProcessing ? "---" : formatCurrency(receipt.amount);
  const displayDate = isProcessing ? "---" : formatDate(receipt.date);

  const handleClick = () => {
    if (onClick && !isProcessing && !isFailed) {
      onClick(receipt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && !isProcessing && !isFailed && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(receipt);
    }
  };

  if (isFailed) {
    return (
      <div className={`p-1 ${className}`}>
        <ErrorState
          title="Processing Failed"
          message={error?.message || "Could not extract receipt data."}
          className="h-full bg-white shadow-xl"
        />
      </div>
    );
  }

  return (
    <div
      className={buildCardClassName(confidenceStyles, isProcessing, onClick, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick && !isProcessing ? "button" : undefined}
      tabIndex={onClick && !isProcessing ? 0 : undefined}
      data-testid="receipt-card"
      data-receipt-id={receipt.id}
      data-status={jobStatus}
      aria-label={`Receipt from ${receipt.merchant} for ${formatCurrency(receipt.amount)}`}
    >
      <SourceBadge source={receipt.source} isProcessing={isProcessing} />

      <div className="p-4">
        {/* Merchant */}
        <div className="flex items-start gap-2 mb-3">
          <Store className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" aria-hidden="true" />
          <h3 className="font-mono font-black uppercase tracking-tight text-black text-lg leading-tight">
            {displayMerchant}
          </h3>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-purple-600" aria-hidden="true" />
          <span className="font-mono font-bold text-xl text-black">{displayAmount}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-purple-600" aria-hidden="true" />
          <span className="font-mono text-sm text-gray-700">{displayDate}</span>
        </div>

        {/* Status badge / Progress Bar */}
        <div className="flex items-center justify-between w-full">
          {isProcessing ? (
            <ProcessingProgress jobStatus={jobStatus} progress={progress} />
          ) : (
            <StatusDisplay statusStyles={statusStyles} matchConfidence={receipt.matchConfidence} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;
