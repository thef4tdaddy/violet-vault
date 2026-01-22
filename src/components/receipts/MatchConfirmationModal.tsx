import React, { useState } from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils/ui/icons";
import { formatCurrency, formatDisplayDate } from "@/utils/features/receipts/receiptHelpers";

// Get icons from centralized utility
const XIcon = getIcon("X");
const Link = getIcon("Link");
const RefreshCw = getIcon("RefreshCw");
const DollarSign = getIcon("DollarSign");
const Calendar = getIcon("Calendar");
const Store = getIcon("Store");
const AlertTriangle = getIcon("AlertTriangle");
const Receipt = getIcon("Receipt");
const CreditCard = getIcon("CreditCard");
const Sparkles = getIcon("Sparkles");
import {
  getConfidenceLabel,
  type Receipt as ReceiptType,
  type DataDifference,
} from "@/utils/features/receipts/matchingAlgorithm";
import type { Transaction } from "@/db/types";

interface SelectedMatch {
  receipt: ReceiptType;
  transaction: Transaction;
  confidence: number;
  differences: DataDifference[];
}

interface UpdateOptions {
  updateMerchant: boolean;
  updateAmount: boolean;
  updateDate: boolean;
}

interface MatchConfirmationModalProps {
  selectedMatch: SelectedMatch | null;
  onLinkOnly: () => void;
  onLinkAndUpdate: (options: UpdateOptions) => void;
  onClose: () => void;
  isLinking?: boolean;
  isLinkingAndUpdating?: boolean;
}

interface DataRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  highlighted?: boolean;
  highlightColor?: "purple" | "blue";
}

interface DifferencesSectionProps {
  differences: DataDifference[];
  updateOptions: UpdateOptions;
  onToggleUpdate: (field: keyof UpdateOptions) => void;
}

interface DifferenceRowProps {
  difference: DataDifference;
  isSelected: boolean;
  onToggle: () => void;
}

interface ConfidenceBadgeProps {
  confidence: number;
}

/**
 * MatchConfirmationModal Component
 *
 * Modal for confirming a receipt-to-transaction match.
 */
const MatchConfirmationModal: React.FC<MatchConfirmationModalProps> = ({
  selectedMatch,
  onLinkOnly,
  onLinkAndUpdate,
  onClose,
  isLinking = false,
  isLinkingAndUpdating = false,
}) => {
  const [updateOptions, setUpdateOptions] = useState<UpdateOptions>({
    updateMerchant: false,
    updateAmount: false,
    updateDate: false,
  });

  if (!selectedMatch) return null;

  const { receipt, transaction, confidence, differences } = selectedMatch;
  const hasSelectedUpdates = Object.values(updateOptions).some(Boolean);
  const isProcessing = isLinking || isLinkingAndUpdating;

  const handleToggleUpdate = (field: keyof UpdateOptions) => {
    setUpdateOptions((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleLinkAndUpdate = () => {
    onLinkAndUpdate(updateOptions);
  };

  const colorScheme = getConfidenceColorScheme(confidence);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glassmorphism rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-black bg-purple-100/40 backdrop-blur-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Link className={`h-6 w-6 ${colorScheme.iconColor}`} />
            <h2 className="text-lg font-bold text-gray-900">
              <span className="text-xl">C</span>ONFIRM <span className="text-xl">M</span>ATCH
            </h2>
            <ConfidenceBadge confidence={confidence} />
          </div>
          <Button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Side by Side Comparison */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Receipt Details (Left) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Receipt className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-purple-800">
                  <span className="text-lg">R</span>ECEIPT <span className="text-lg">D</span>ATA
                </h3>
              </div>

              <div className="bg-white/70 rounded-lg border-2 border-purple-200 p-4 space-y-3">
                <DataRow
                  icon={Store}
                  label="Merchant"
                  value={receipt.merchant || "Unknown"}
                  highlighted={differences?.some((d) => d.field === "merchant")}
                  highlightColor="purple"
                />
                <DataRow
                  icon={DollarSign}
                  label="Amount"
                  value={formatCurrency(receipt.amount || receipt.total || 0)}
                  highlighted={differences?.some((d) => d.field === "amount")}
                  highlightColor="purple"
                />
                <DataRow
                  icon={Calendar}
                  label="Date"
                  value={formatDisplayDate(receipt.date)}
                  highlighted={differences?.some((d) => d.field === "date")}
                  highlightColor="purple"
                />
              </div>
            </div>

            {/* Transaction Details (Right) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-blue-800">
                  <span className="text-lg">T</span>RANSACTION <span className="text-lg">D</span>ATA
                </h3>
              </div>

              <div className="bg-white/70 rounded-lg border-2 border-blue-200 p-4 space-y-3">
                <DataRow
                  icon={Store}
                  label="Description"
                  value={transaction.description || transaction.category || "Unknown"}
                  highlighted={differences?.some((d) => d.field === "merchant")}
                  highlightColor="blue"
                />
                <DataRow
                  icon={DollarSign}
                  label="Amount"
                  value={formatCurrency(transaction.amount)}
                  highlighted={differences?.some((d) => d.field === "amount")}
                  highlightColor="blue"
                />
                <DataRow
                  icon={Calendar}
                  label="Date"
                  value={formatDisplayDate(transaction.date)}
                  highlighted={differences?.some((d) => d.field === "date")}
                  highlightColor="blue"
                />
              </div>
            </div>
          </div>

          {/* Differences Section */}
          {differences && differences.length > 0 && (
            <DifferencesSection
              differences={differences}
              updateOptions={updateOptions}
              onToggleUpdate={handleToggleUpdate}
            />
          )}

          {/* No Differences */}
          {(!differences || differences.length === 0) && (
            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">Perfect Match!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Receipt and transaction data match exactly. Click "Link Only" to connect them.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50/50">
          <Button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </Button>

          <div className="flex items-center space-x-3">
            {/* Link Only Button */}
            <Button
              type="button"
              onClick={onLinkOnly}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg border-2 border-black shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLinking ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Link Only
                </>
              )}
            </Button>

            {/* Link & Update Button (only show if differences exist) */}
            {differences && differences.length > 0 && (
              <Button
                type="button"
                onClick={handleLinkAndUpdate}
                disabled={isProcessing || !hasSelectedUpdates}
                className={`flex items-center px-4 py-2 rounded-lg border-2 border-black shadow-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  hasSelectedUpdates
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
                title={
                  hasSelectedUpdates
                    ? "Update transaction with selected receipt data"
                    : "Select fields to update first"
                }
              >
                {isLinkingAndUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Link & Update
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Data row component for displaying a labeled value
 */
const DataRow: React.FC<DataRowProps> = ({
  icon: IconComponent,
  label,
  value,
  highlighted = false,
  highlightColor,
}) => {
  const bgClass = highlighted
    ? highlightColor === "purple"
      ? "bg-purple-100"
      : "bg-blue-100"
    : "";
  const borderClass = highlighted
    ? highlightColor === "purple"
      ? "border-l-4 border-purple-500 pl-3"
      : "border-l-4 border-blue-500 pl-3"
    : "";

  return (
    <div className={`flex items-center ${bgClass} ${borderClass} py-1 rounded`}>
      <IconComponent className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
      <span className="text-gray-600 text-sm mr-2">{label}:</span>
      <span className="font-medium text-gray-900 truncate">{value}</span>
    </div>
  );
};

/**
 * Differences section with update checkboxes
 */
const DifferencesSection: React.FC<DifferencesSectionProps> = ({
  differences,
  updateOptions,
  onToggleUpdate,
}) => {
  const getFieldKey = (field: string): keyof UpdateOptions => {
    const fieldMap: Record<string, keyof UpdateOptions> = {
      merchant: "updateMerchant",
      amount: "updateAmount",
      date: "updateDate",
    };
    return fieldMap[field] || "updateMerchant";
  };

  return (
    <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h4 className="font-bold text-amber-800">
          <span className="text-lg">D</span>IFFERENCES <span className="text-lg">F</span>OUND
        </h4>
      </div>
      <p className="text-sm text-amber-700 mb-4">
        The receipt and transaction have some differences. Select which fields to update from the
        receipt:
      </p>

      <div className="space-y-3">
        {differences.map((diff) => (
          <DifferenceRow
            key={diff.field}
            difference={diff}
            isSelected={updateOptions[getFieldKey(diff.field)]}
            onToggle={() => onToggleUpdate(getFieldKey(diff.field))}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual difference row with checkbox
 */
const DifferenceRow: React.FC<DifferenceRowProps> = ({ difference, isSelected, onToggle }) => {
  const { field, label, receiptValue, transactionValue, diff, daysDiff } = difference;

  const formatValue = (value: string | number | Date, fieldType: string): string => {
    if (fieldType === "amount" && typeof value === "number") return formatCurrency(value);
    if (fieldType === "date") return formatDisplayDate(value);
    return String(value);
  };

  const getDiffDescription = (): string | null => {
    if (field === "amount" && diff !== undefined) {
      return `$${diff.toFixed(2)} difference`;
    }
    if (field === "date" && daysDiff !== undefined) {
      return `${daysDiff} day${daysDiff !== 1 ? "s" : ""} apart`;
    }
    return null;
  };

  const diffDescription = getDiffDescription();

  return (
    <label
      className={`flex items-start p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-green-100 border-2 border-green-300"
          : "bg-white border-2 border-gray-200 hover:border-gray-300"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
      />
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{label}</span>
          {diffDescription && (
            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {diffDescription}
            </span>
          )}
        </div>
        <div className="mt-1 text-sm grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <span className="text-purple-600 font-medium">Receipt:</span>
            <span className="ml-1 text-gray-700">{formatValue(receiptValue, field)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 font-medium">Transaction:</span>
            <span className="ml-1 text-gray-700">{formatValue(transactionValue, field)}</span>
          </div>
        </div>
      </div>
    </label>
  );
};

/**
 * Confidence badge component
 */
const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const colorScheme = getConfidenceColorScheme(confidence);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${colorScheme.badgeBg} ${colorScheme.badgeText}`}
    >
      {confidence}% {getConfidenceLabel(confidence)}
    </span>
  );
};

/**
 * Get color scheme based on confidence level
 */
const getConfidenceColorScheme = (confidence: number) => {
  if (confidence >= 80) {
    return {
      iconColor: "text-green-600",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
    };
  }

  if (confidence >= 60) {
    return {
      iconColor: "text-yellow-600",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-800",
    };
  }

  return {
    iconColor: "text-orange-600",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
  };
};

export default MatchConfirmationModal;
