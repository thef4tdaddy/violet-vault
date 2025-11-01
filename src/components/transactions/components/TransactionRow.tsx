import React from "react";
import { Button } from "@/components/ui";
import { getIcon } from "@/utils";
import {
  COLUMN_WIDTHS,
  findEnvelopeForTransaction,
  formatTransactionAmount,
  formatTransactionDate,
  getEnvelopeDisplay,
} from "@/utils/transactions/tableHelpers";
import type { Transaction, Envelope } from "@/types/finance";

interface VirtualRow {
  index: number;
  start: number;
  size: number;
}

interface TransactionRowProps {
  transaction: Transaction;
  envelopes: Envelope[];
  virtualRow: VirtualRow;
  onEdit: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
  onDeleteClick: (transaction: Transaction) => void;
  onHistoryClick: (transaction: Transaction) => void;
}

/**
 * Individual transaction row component - pure UI component
 */
const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  envelopes,
  virtualRow,
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
    <tr
      className="hover:bg-white/30 transition-colors"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {/* Date */}
      <td className={`${COLUMN_WIDTHS.date} px-4 py-4 text-sm text-gray-900 truncate`}>
        {formattedDate}
      </td>

      {/* Description */}
      <td className={`${COLUMN_WIDTHS.description} px-4 py-4 text-sm`}>
        <div className="font-medium text-gray-900 truncate">{transaction.description}</div>
        {transaction.notes && (
          <div className="text-xs text-gray-500 truncate mt-1">{transaction.notes}</div>
        )}
      </td>

      {/* Category */}
      <td className={`${COLUMN_WIDTHS.category} px-4 py-4 text-sm text-gray-500 truncate`}>
        {transaction.category || "Uncategorized"}
      </td>

      {/* Envelope */}
      <td className={`${COLUMN_WIDTHS.envelope} px-4 py-4 text-sm`}>
        <div className="flex items-center min-w-0">
          <div
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: envelopeColor }}
          />
          <span className={`${envelopeClassName} truncate`}>{envelopeName}</span>
        </div>
      </td>

      {/* Amount */}
      <td className={`${COLUMN_WIDTHS.amount} px-4 py-4 text-right text-sm font-medium`}>
        <span className={`${amountClassName} font-semibold`}>{formattedAmount}</span>
      </td>

      {/* Actions */}
      <td className={`${COLUMN_WIDTHS.actions} px-4 py-4 text-right`}>
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
      </td>
    </tr>
  );
};

export default TransactionRow;
