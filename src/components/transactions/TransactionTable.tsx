import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { DataTable, type Column } from "@/components/primitives/tables/DataTable";
import { ConfirmModal } from "@/components/primitives/modals";
import ObjectHistoryViewer from "@/components/history/ObjectHistoryViewer";
import type { Transaction, Envelope } from "@/types/finance";
import { validateComponentProps } from "@/utils/core/validation/propValidator";
import { TransactionTablePropsSchema } from "@/domain/schemas/component-props";
import {
  COLUMN_WIDTHS,
  findEnvelopeForTransaction,
  formatTransactionAmount,
  formatTransactionDate,
  getEnvelopeDisplay,
} from "@/utils/domain/transactions/tableHelpers";
import { getIcon } from "@/utils";

interface TransactionTableProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string | number) => void;
  onSplit: (transaction: Transaction) => void;
}

/**
 * Desktop transaction table using DataTable primitive
 */
interface DesktopTransactionTableProps {
  transactions: Transaction[];
  envelopes: Envelope[];
  onEdit: (transaction: Transaction) => void;
  onDeleteClick: (transaction: Transaction) => void;
  onHistoryClick: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
}

const DesktopTransactionTable: React.FC<DesktopTransactionTableProps> = ({
  transactions,
  envelopes,
  onEdit,
  onDeleteClick,
  onHistoryClick,
  onSplit,
}) => {
  // Define columns for DataTable
  const columns = useMemo<Column<Transaction>[]>(() => {
    return [
      {
        key: "date",
        header: "Date",
        accessor: (txn) => <span className="truncate">{formatTransactionDate(txn.date)}</span>,
        width: COLUMN_WIDTHS.date,
      },
      {
        key: "description",
        header: "Description",
        accessor: (txn) => (
          <div className="flex flex-col gap-1 overflow-hidden">
            <div
              className="font-medium text-gray-900 overflow-x-auto whitespace-nowrap pr-2"
              title={txn.description}
            >
              {txn.description}
            </div>
            {txn.notes && (
              <div className="text-xs text-gray-500 overflow-y-auto max-h-16 pr-2 mt-1 whitespace-pre-wrap wrap-break-word">
                {txn.notes}
              </div>
            )}
          </div>
        ),
        width: COLUMN_WIDTHS.description,
      },
      {
        key: "category",
        header: "Category",
        accessor: (txn) => (
          <span className="text-gray-500 truncate">{txn.category || "Uncategorized"}</span>
        ),
        width: COLUMN_WIDTHS.category,
      },
      {
        key: "envelope",
        header: "Envelope",
        accessor: (txn) => {
          const envelope = findEnvelopeForTransaction(txn, envelopes);
          const { name, color, className } = getEnvelopeDisplay(envelope);
          return (
            <div className="flex items-center min-w-0">
              <div
                className="w-3 h-3 rounded-full mr-2 shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className={`${className} truncate`}>{name}</span>
            </div>
          );
        },
        width: COLUMN_WIDTHS.envelope,
      },
      {
        key: "amount",
        header: "Amount",
        accessor: (txn) => {
          const { formatted, className } = formatTransactionAmount(txn.amount);
          return (
            <div className="text-right">
              <span className={`${className} font-semibold`}>{formatted}</span>
            </div>
          );
        },
        width: COLUMN_WIDTHS.amount,
      },
      {
        key: "actions",
        header: "Actions",
        accessor: (txn) => (
          <div className="flex items-center justify-end gap-2 flex-nowrap">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSplit(txn);
              }}
              className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all shrink-0"
              title="Split transaction"
              aria-label="Split transaction"
            >
              {React.createElement(getIcon("SplitSquareHorizontal"), {
                className: "h-4 w-4 shrink-0",
              })}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onHistoryClick(txn);
              }}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0"
              title="View history"
              aria-label="View history"
            >
              {React.createElement(getIcon("ClockHistory"), { className: "h-4 w-4 shrink-0" })}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(txn);
              }}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all shrink-0"
              title="Edit transaction"
              aria-label="Edit transaction"
            >
              {React.createElement(getIcon("PencilLine"), { className: "h-4 w-4 shrink-0" })}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(txn);
              }}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all shrink-0"
              title="Delete transaction"
              aria-label="Delete transaction"
            >
              {React.createElement(getIcon("Trash2"), { className: "h-4 w-4 shrink-0" })}
            </Button>
          </div>
        ),
        width: COLUMN_WIDTHS.actions,
      },
    ];
  }, [envelopes, onEdit, onSplit, onDeleteClick, onHistoryClick]);

  return (
    <div className="hidden md:block">
      <DataTable
        data={transactions}
        columns={columns}
        getRowId={(txn) => String(txn.id)}
        virtualized={true}
        emptyMessage="No transactions found"
        className="glassmorphism border border-white/20"
      />
    </div>
  );
};

/**
 * Mobile transaction list component
 */
interface MobileTransactionListProps {
  transactions: Transaction[];
  envelopes: Envelope[];
  deletingTransaction: Transaction | null;
  handleDeleteClick: (transaction: Transaction) => void;
  handleHistoryClick: (transaction: Transaction) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  onEdit: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
}

const MobileTransactionList: React.FC<MobileTransactionListProps> = ({
  transactions,
  envelopes,
  deletingTransaction,
  handleDeleteClick,
  handleHistoryClick,
  confirmDelete,
  cancelDelete,
  onEdit,
  onSplit,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="md:hidden px-4 py-10 text-center text-sm text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <div className="divide-y divide-purple-200">
        {transactions.map((transaction) => {
          const envelope = findEnvelopeForTransaction(transaction, envelopes);
          const {
            name: envelopeName,
            color: envelopeColor,
            className: envelopeClassName,
          } = getEnvelopeDisplay(envelope);
          const { formatted: formattedAmount, className: amountClassName } =
            formatTransactionAmount(transaction.amount);
          const formattedDate = formatTransactionDate(transaction.date);
          const isDeleting = deletingTransaction?.id === transaction.id;

          return (
            <div key={transaction.id} className="p-4 space-y-3 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                </div>
                <span className={`text-sm font-semibold ${amountClassName}`}>
                  {formattedAmount}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Description</p>
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                {transaction.notes && (
                  <p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap">
                    {transaction.notes}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Category</p>
                  <p className="font-medium text-gray-700">
                    {transaction.category || "Uncategorized"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Envelope</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: envelopeColor }}
                    />
                    <span className={`${envelopeClassName} text-sm`}>{envelopeName}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {onSplit && (
                  <Button
                    onClick={() => onSplit(transaction)}
                    className="px-3 py-1.5 text-xs font-semibold text-purple-700 border border-purple-200 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    Split
                  </Button>
                )}
                <Button
                  onClick={() => handleHistoryClick(transaction)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                >
                  History
                </Button>
                <Button
                  onClick={() => onEdit(transaction)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteClick(transaction)}
                  className="px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                >
                  Delete
                </Button>
              </div>

              {isDeleting && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-red-700">
                    Delete "{transaction.description}"?
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={cancelDelete}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmDelete}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * TransactionTable - Main component
 * Uses DataTable primitive for desktop view and custom mobile view
 */
const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions = [],
  envelopes = [],
  onEdit,
  onDelete,
  onSplit,
}) => {
  // Validate props in development
  validateComponentProps(
    "TransactionTable",
    {
      transactions,
      envelopes,
      onEdit,
      onDelete,
      onSplit,
    },
    TransactionTablePropsSchema
  );

  // State management
  const [historyTransaction, setHistoryTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Handlers
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const cancelDelete = () => {
    setDeletingTransaction(null);
  };

  const confirmDelete = () => {
    if (deletingTransaction) {
      onDelete(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  const handleHistoryClick = (transaction: Transaction) => {
    setHistoryTransaction(transaction);
  };

  const closeHistory = () => {
    setHistoryTransaction(null);
  };

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
      {/* Desktop Table */}
      <DesktopTransactionTable
        transactions={transactions}
        envelopes={envelopes}
        onEdit={onEdit}
        onDeleteClick={handleDeleteClick}
        onHistoryClick={handleHistoryClick}
        onSplit={onSplit}
      />

      {/* Mobile List */}
      <MobileTransactionList
        transactions={transactions}
        envelopes={envelopes}
        deletingTransaction={deletingTransaction}
        handleDeleteClick={handleDeleteClick}
        handleHistoryClick={handleHistoryClick}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
        onEdit={onEdit}
        onSplit={onSplit}
      />

      {/* Delete Confirmation Modal (Desktop) */}
      {deletingTransaction && (
        <div className="hidden md:block">
          <ConfirmModal
            isOpen={!!deletingTransaction}
            onClose={cancelDelete}
            onConfirm={confirmDelete}
            title="Delete Transaction?"
            message={`Are you sure you want to delete "${deletingTransaction.description}"? This action cannot be undone.`}
            variant="danger"
            confirmLabel="Delete"
          />
        </div>
      )}

      {/* Transaction History Modal */}
      {historyTransaction && (
        <ObjectHistoryViewer
          objectId={String(historyTransaction.id)}
          objectType="Transaction"
          objectName={historyTransaction.description}
          onClose={closeHistory}
        />
      )}
    </div>
  );
};

export default TransactionTable;
