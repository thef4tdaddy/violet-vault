import React from "react";
import { Button } from "@/components/ui";
import useTransactionTable from "@/hooks/transactions/useTransactionTable";
import TransactionRow from "@/components/transactions/components/TransactionRow";
import DeleteConfirmation from "@/components/transactions/components/DeleteConfirmation";
import ObjectHistoryViewer from "@/components/history/ObjectHistoryViewer";
import type { Transaction, Envelope } from "@/types/finance";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { TransactionTablePropsSchema } from "@/domain/schemas/component-props";
import {
  COLUMN_STYLES,
  COLUMN_WIDTHS,
  MIN_TABLE_WIDTH,
  findEnvelopeForTransaction,
  formatTransactionAmount,
  formatTransactionDate,
  getEnvelopeDisplay,
} from "@/utils/transactions/tableHelpers";

interface TransactionTableProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string | number) => void;
  onSplit: (transaction: Transaction) => void;
}

type TransactionTableState = ReturnType<typeof useTransactionTable>;

interface DesktopTransactionTableProps {
  transactions: Transaction[];
  envelopes: Envelope[];
  gridTemplate: string;
  minTableWidth: string;
  parentRef: TransactionTableState["parentRef"];
  rowVirtualizer: TransactionTableState["rowVirtualizer"];
  deletingTransaction: Transaction | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
  handleDeleteClick: (transaction: Transaction) => void;
  handleHistoryClick: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
}

const DesktopTransactionTable = ({
  transactions,
  envelopes,
  gridTemplate,
  minTableWidth,
  parentRef,
  rowVirtualizer,
  deletingTransaction,
  confirmDelete,
  cancelDelete,
  handleDeleteClick,
  handleHistoryClick,
  onEdit,
  onSplit,
}: DesktopTransactionTableProps) => {
  return (
    <div className="hidden md:block">
      <div ref={parentRef} className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <div style={{ minWidth: minTableWidth }}>
          <div
            className="bg-white/90 backdrop-blur-sm sticky top-0 z-20 border-b-2 border-gray-300 shadow-sm grid"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div
              style={COLUMN_STYLES.date}
              className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </div>
            <div
              style={COLUMN_STYLES.description}
              className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Description
            </div>
            <div
              style={COLUMN_STYLES.category}
              className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Category
            </div>
            <div
              style={COLUMN_STYLES.envelope}
              className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Envelope
            </div>
            <div
              style={COLUMN_STYLES.amount}
              className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </div>
            <div
              style={COLUMN_STYLES.actions}
              className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </div>
          </div>

          <div
            className="divide-y divide-gray-200"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {transactions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">No transactions found</div>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const transaction = transactions[virtualRow.index];
                const isDeleting = deletingTransaction?.id === transaction.id;

                return isDeleting ? (
                  <DeleteConfirmation
                    key={`delete-${transaction.id}`}
                    transaction={transaction}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    virtualRow={virtualRow}
                    gridTemplate={gridTemplate}
                  />
                ) : (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    envelopes={envelopes}
                    virtualRow={virtualRow}
                    columnStyles={COLUMN_STYLES}
                    onEdit={onEdit}
                    onSplit={onSplit}
                    onDeleteClick={handleDeleteClick}
                    onHistoryClick={handleHistoryClick}
                    gridTemplate={gridTemplate}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileTransactionListProps extends Pick<
  TransactionTableProps,
  "transactions" | "envelopes" | "onEdit" | "onSplit"
> {
  deletingTransaction: Transaction | null;
  handleDeleteClick: (transaction: Transaction) => void;
  handleHistoryClick: (transaction: Transaction) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

const MobileTransactionList = ({
  transactions = [],
  envelopes = [],
  deletingTransaction,
  handleDeleteClick,
  handleHistoryClick,
  confirmDelete,
  cancelDelete,
  onEdit,
  onSplit,
}: MobileTransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-500">No transactions found</div>
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

  const {
    parentRef,
    rowVirtualizer,
    historyTransaction,
    deletingTransaction,
    handleDeleteClick,
    cancelDelete,
    handleHistoryClick,
    closeHistory,
  } = useTransactionTable(transactions);

  const confirmDelete = () => {
    if (deletingTransaction) {
      onDelete(deletingTransaction.id);
      cancelDelete();
    }
  };

  const gridTemplate = [
    COLUMN_WIDTHS.date,
    COLUMN_WIDTHS.description,
    COLUMN_WIDTHS.category,
    COLUMN_WIDTHS.envelope,
    COLUMN_WIDTHS.amount,
    COLUMN_WIDTHS.actions,
  ].join(" ");

  const minTableWidth = MIN_TABLE_WIDTH;

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
      <DesktopTransactionTable
        transactions={transactions}
        envelopes={envelopes}
        gridTemplate={gridTemplate}
        minTableWidth={minTableWidth}
        parentRef={parentRef}
        rowVirtualizer={rowVirtualizer}
        deletingTransaction={deletingTransaction}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
        handleDeleteClick={handleDeleteClick}
        handleHistoryClick={handleHistoryClick}
        onEdit={onEdit}
        onSplit={onSplit}
      />
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
