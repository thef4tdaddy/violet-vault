import React from "react";
import { getIcon } from "@/utils/ui/icons";
import type { DashboardReceiptItem } from "@/types/import-dashboard.types";

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
 * ReceiptCard - Individual receipt display with Hard Line v2.1 aesthetic
 * Shows merchant, amount, date, status with confidence glow indicator
 */
const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onClick, className = "" }) => {
  const confidenceStyles = getConfidenceStyles(receipt.matchConfidence);
  const statusStyles = getStatusStyles(receipt.status);

  const handleClick = () => {
    if (onClick) {
      onClick(receipt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(receipt);
    }
  };

  return (
    <div
      className={`
        group relative
        bg-white border-2 rounded-2xl
        ${confidenceStyles}
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        transition-all
        ${onClick ? "cursor-pointer hover:shadow-none hover:translate-x-1 hover:translate-y-1" : ""}
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid="receipt-card"
      data-receipt-id={receipt.id}
      aria-label={`Receipt from ${receipt.merchant} for ${formatCurrency(receipt.amount)}`}
    >
      {/* Source badge */}
      <div className="absolute top-3 right-3">
        <span
          className={`
            px-2 py-1 rounded border border-black
            font-mono text-[10px] font-black uppercase tracking-widest
            ${receipt.source === "sentinel" ? "bg-purple-200 text-purple-900" : "bg-cyan-200 text-cyan-900"}
          `}
          aria-label={`Source: ${receipt.source}`}
        >
          {receipt.source === "sentinel" ? "DGTL" : "SCAN"}
        </span>
      </div>

      <div className="p-4">
        {/* Merchant */}
        <div className="flex items-start gap-2 mb-3">
          <Store className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" aria-hidden="true" />
          <h3 className="font-mono font-black uppercase tracking-tight text-black text-lg leading-tight">
            {receipt.merchant}
          </h3>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-purple-600" aria-hidden="true" />
          <span className="font-mono font-bold text-xl text-black">
            {formatCurrency(receipt.amount)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-purple-600" aria-hidden="true" />
          <span className="font-mono text-sm text-gray-700">{formatDate(receipt.date)}</span>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span
            className={`
              px-2 py-1 rounded border border-black
              font-mono text-xs font-black uppercase tracking-wide
              ${statusStyles.bg} ${statusStyles.text}
            `}
          >
            {statusStyles.label}
          </span>

          {/* Confidence indicator text (if applicable) */}
          {receipt.matchConfidence !== undefined && receipt.matchConfidence >= 0.6 && (
            <span className="font-mono text-xs font-bold text-gray-600">
              {Math.round(receipt.matchConfidence * 100)}% match
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptCard;
