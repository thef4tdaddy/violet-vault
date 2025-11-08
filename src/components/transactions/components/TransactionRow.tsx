import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "../../../utils";
import {
  COLUMN_STYLES,
  findEnvelopeForTransaction,
  formatTransactionAmount,
  formatTransactionDate,
  getEnvelopeDisplay,
} from "../../../utils/transactions/tableHelpers";

/**
 * Individual transaction row component - pure UI component
 */
const TransactionRow = ({
  transaction,
  envelopes,
  virtualRow,
  columnStyles = COLUMN_STYLES,
  gridTemplate,
  onEdit,
  onSplit,
  onDeleteClick,
  onHistoryClick,
}) => {
  const envelope = findEnvelopeForTransaction(transaction, envelopes);
  const { formatted: formattedAmount, className: amountClassName } = formatTransactionAmount(
    transaction.amount
  );
  const formattedDate = formatTransactionDate(transaction.date);
  const {
    name: envelopeName,
    color: envelopeColor,
    className: envelopeClassName,
  } = getEnvelopeDisplay(envelope);

  return (
    <div
      className="grid hover:bg-white/30 transition-colors"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
        gridTemplateColumns: gridTemplate,
      }}
    >
      <div style={columnStyles.date} className="px-4 py-4 text-sm text-gray-900 truncate">
        {formattedDate}
      </div>

      <div style={columnStyles.description} className="px-4 py-4 text-sm">
        <div className="flex flex-col gap-1 overflow-hidden">
          <div
            className="font-medium text-gray-900 overflow-x-auto whitespace-nowrap pr-2"
            title={transaction.description}
          >
            {transaction.description}
          </div>
        </div>
        {transaction.notes && (
          <div className="text-xs text-gray-500 overflow-y-auto max-h-16 pr-2 mt-1 whitespace-pre-wrap break-words">
            {transaction.notes}
          </div>
        )}
      </div>

      <div style={columnStyles.category} className="px-4 py-4 text-sm text-gray-500 truncate">
        {transaction.category || "Uncategorized"}
      </div>

      <div style={columnStyles.envelope} className="px-4 py-4 text-sm">
        <div className="flex items-center min-w-0">
          <div
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: envelopeColor }}
          />
          <span className={`${envelopeClassName} truncate`}>{envelopeName}</span>
        </div>
      </div>

      <div style={columnStyles.amount} className="px-4 py-4 text-right text-sm font-medium">
        <span className={`${amountClassName} font-semibold`}>{formattedAmount}</span>
      </div>

      <div style={columnStyles.actions} className="px-4 py-4 text-right">
        <div className="flex items-center justify-end space-x-1">
          {onSplit && (
            <Button
              onClick={() => onSplit(transaction)}
              className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
              title="Split transaction"
            >
              {React.createElement(getIcon("Scissors"), {
                className: "h-4 w-4",
              })}
            </Button>
          )}
          <Button
            onClick={() => onHistoryClick(transaction)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View history"
          >
            {React.createElement(getIcon("History"), { className: "h-4 w-4" })}
          </Button>
          <Button
            onClick={() => onEdit(transaction)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Edit transaction"
          >
            {React.createElement(getIcon("Edit3"), { className: "h-4 w-4" })}
          </Button>
          <Button
            onClick={() => onDeleteClick(transaction)}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Delete transaction"
          >
            {React.createElement(getIcon("Trash2"), { className: "h-4 w-4" })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionRow;
