import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/ui/icons";
import { formatCurrency, formatDisplayDate } from "@/utils/features/receipts/receiptHelpers";

// Get icons from centralized utility
const CheckCircle = getIcon("CheckCircle");
const Link = getIcon("Link");
const DollarSign = getIcon("DollarSign");
const Calendar = getIcon("Calendar");
const Store = getIcon("Store");
const ChevronRight = getIcon("ChevronRight");
const XIcon = getIcon("X");
const Sparkles = getIcon("Sparkles");
import {
  getConfidenceLabel,
  getConfidenceColorScheme,
  getScoreIndicatorColor,
  CONFIDENCE_LEVELS,
  type Receipt,
  type MatchSuggestion as MatchSuggestionType,
} from "@/utils/features/receipts/matchingAlgorithm";

interface MatchSuggestionProps {
  receipt: Receipt;
  matchSuggestion: MatchSuggestionType;
  onConfirm?: (receipt: Receipt, matchSuggestion: MatchSuggestionType) => void;
  onDismiss?: (receiptId: string, transactionId: string) => void;
  compact?: boolean;
  showAllReasons?: boolean;
}

interface CompactMatchSuggestionProps {
  receipt: Receipt;
  matchSuggestion: MatchSuggestionType;
  colorScheme: ReturnType<typeof getConfidenceColorScheme>;
  onConfirm?: (receipt: Receipt, matchSuggestion: MatchSuggestionType) => void;
  onDismiss?: (receiptId: string, transactionId: string) => void;
}

interface ConfidenceBadgeProps {
  confidence: number;
  colorScheme: ReturnType<typeof getConfidenceColorScheme>;
  small?: boolean;
}

interface QuickScoreBreakdownProps {
  matchReasons: MatchSuggestionType["matchReasons"];
}

interface MatchReasonsDisplayProps {
  matchReasons: MatchSuggestionType["matchReasons"];
}

interface MatchReasonRowProps {
  icon: React.ElementType;
  label: string;
  score: number;
  detail: string;
}

/**
 * MatchSuggestion Component
 *
 * Displays a match suggestion for a receipt with confidence indicator
 * and transaction details. Supports one-click confirmation and dismiss actions.
 */
const MatchSuggestion: React.FC<MatchSuggestionProps> = ({
  receipt,
  matchSuggestion,
  onConfirm,
  onDismiss,
  compact = false,
  showAllReasons = false,
}) => {
  const { transaction, confidence, matchReasons } = matchSuggestion;
  const colorScheme = getConfidenceColorScheme(confidence);

  if (compact) {
    return (
      <CompactMatchSuggestion
        receipt={receipt}
        matchSuggestion={matchSuggestion}
        colorScheme={colorScheme}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <div
      className={`glassmorphism rounded-lg border-2 ${colorScheme.border} p-4 transition-all duration-200 hover:shadow-lg`}
    >
      {/* Header with confidence badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {confidence >= CONFIDENCE_LEVELS.HIGH ? (
            <Sparkles className={`h-5 w-5 ${colorScheme.iconColor}`} />
          ) : (
            <Link className={`h-5 w-5 ${colorScheme.iconColor}`} />
          )}
          <span className={`font-bold text-sm ${colorScheme.textColor}`}>
            {getConfidenceLabel(confidence)}
          </span>
        </div>
        <ConfidenceBadge confidence={confidence} colorScheme={colorScheme} />
      </div>

      {/* Transaction details */}
      <div className="bg-white/50 rounded-lg p-3 mb-3 border border-gray-200">
        <p className="font-medium text-gray-900 mb-2 truncate">
          {transaction.description || transaction.category || "Transaction"}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDisplayDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      {/* Match reasons */}
      {showAllReasons && <MatchReasonsDisplay matchReasons={matchReasons} />}

      {/* Quick match score breakdown */}
      {!showAllReasons && <QuickScoreBreakdown matchReasons={matchReasons} />}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <Button
          type="button"
          onClick={() => onDismiss?.(receipt.id, transaction.id)}
          className="flex items-center px-3 py-1.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
        >
          <XIcon className="h-4 w-4 mr-1" />
          Dismiss
        </Button>

        <Button
          type="button"
          onClick={() => onConfirm?.(receipt, matchSuggestion)}
          className={`flex items-center px-4 py-2 ${colorScheme.buttonBg} text-white rounded-lg border-2 border-black shadow-sm hover:shadow-md transition-all duration-200 font-medium text-sm`}
        >
          <CheckCircle className="h-4 w-4 mr-1.5" />
          Confirm Match
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Compact version of MatchSuggestion for inline display
 */
const CompactMatchSuggestion: React.FC<CompactMatchSuggestionProps> = ({
  receipt,
  matchSuggestion,
  colorScheme,
  onConfirm,
  onDismiss,
}) => {
  const { transaction, confidence } = matchSuggestion;

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg ${colorScheme.bgLight} border ${colorScheme.border}`}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <ConfidenceBadge confidence={confidence} colorScheme={colorScheme} small />
        <span className="text-sm font-medium text-gray-800 truncate">
          {transaction.description || transaction.category || "Transaction"}
        </span>
        <span className="text-sm text-gray-600">{formatCurrency(transaction.amount)}</span>
      </div>

      <div className="flex items-center space-x-1 ml-2">
        <Button
          type="button"
          onClick={() => onDismiss?.(receipt.id, transaction.id)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Dismiss"
        >
          <XIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm?.(receipt, matchSuggestion)}
          className={`flex items-center px-2 py-1 ${colorScheme.buttonBg} text-white rounded border border-black text-xs font-medium transition-all`}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Match
        </Button>
      </div>
    </div>
  );
};

/**
 * Confidence badge component
 */
const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  colorScheme,
  small = false,
}) => {
  const sizeClasses = small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full font-bold ${colorScheme.badgeBg} ${colorScheme.badgeText}`}
    >
      {confidence}%
    </span>
  );
};

/**
 * Quick score breakdown showing match quality indicators
 */
const QuickScoreBreakdown: React.FC<QuickScoreBreakdownProps> = ({ matchReasons }) => {
  const indicators = [
    { label: "Amount", score: matchReasons.amount.score, icon: DollarSign },
    { label: "Date", score: matchReasons.date.score, icon: Calendar },
    { label: "Merchant", score: matchReasons.merchant.score, icon: Store },
  ];

  return (
    <div className="flex items-center space-x-3">
      {indicators.map((indicator) => {
        const IconComponent = indicator.icon;
        const scoreColor = getScoreIndicatorColor(indicator.score);

        return (
          <div
            key={indicator.label}
            className="flex items-center text-xs text-gray-600"
            title={`${indicator.label}: ${indicator.score}%`}
          >
            <IconComponent className={`h-3.5 w-3.5 mr-1 ${scoreColor}`} />
            <span className={scoreColor}>{indicator.score}%</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Detailed match reasons display
 */
const MatchReasonsDisplay: React.FC<MatchReasonsDisplayProps> = ({ matchReasons }) => {
  return (
    <div className="space-y-2 text-sm">
      <MatchReasonRow
        icon={DollarSign}
        label="Amount"
        score={matchReasons.amount.score}
        detail={
          matchReasons.amount.diff === 0
            ? "Exact match"
            : `$${matchReasons.amount.diff.toFixed(2)} difference`
        }
      />

      <MatchReasonRow
        icon={Calendar}
        label="Date"
        score={matchReasons.date.score}
        detail={
          matchReasons.date.daysDiff === 0
            ? "Same day"
            : `${matchReasons.date.daysDiff} day${matchReasons.date.daysDiff !== 1 ? "s" : ""} apart`
        }
      />

      <MatchReasonRow
        icon={Store}
        label="Merchant"
        score={matchReasons.merchant.score}
        detail={`${matchReasons.merchant.similarity}% similar`}
      />
    </div>
  );
};

/**
 * Individual match reason row
 */
const MatchReasonRow: React.FC<MatchReasonRowProps> = ({
  icon: IconComponent,
  label,
  score,
  detail,
}) => {
  const scoreColor = getScoreIndicatorColor(score);
  const bgColor = score >= 80 ? "bg-green-50" : score >= 60 ? "bg-yellow-50" : "bg-gray-50";

  return (
    <div className={`flex items-center justify-between p-2 rounded ${bgColor}`}>
      <div className="flex items-center">
        <IconComponent className={`h-4 w-4 mr-2 ${scoreColor}`} />
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500 text-xs">{detail}</span>
        <span className={`font-bold ${scoreColor}`}>{score}%</span>
      </div>
    </div>
  );
};

export default MatchSuggestion;
