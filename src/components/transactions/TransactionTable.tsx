import React from "react";
import useTransactionTable from "../../hooks/transactions/useTransactionTable";
import TransactionRow from "./components/TransactionRow";
import DeleteConfirmation from "./components/DeleteConfirmation";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";
import { COLUMN_STYLES, COLUMN_WIDTHS } from "../../utils/transactions/tableHelpers";
import type { Transaction, Envelope } from "../../types/finance";
import { validateComponentProps } from "@/utils/validation/propValidator";
import { TransactionTablePropsSchema } from "@/domain/schemas/component-props";

interface TransactionTableProps {
  transactions?: Transaction[];
  envelopes?: Envelope[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string | number) => void;
  onSplit: (transaction: Transaction) => void;
}

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

  const minTableWidth = "62rem";

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
      <div ref={parentRef} className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <div style={{ minWidth: minTableWidth }}>
          <div
            className="bg-white/90 backdrop-blur-sm sticky top-0 z-20 border-b-2 border-gray-300 shadow-sm grid"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </div>
            <div className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </div>
            <div className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </div>
            <div className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Envelope
            </div>
            <div className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </div>
            <div className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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

      {/* Transaction History Modal */}
      {historyTransaction && (
        <ObjectHistoryViewer
          objectId={historyTransaction.id}
          objectType="Transaction"
          objectName={historyTransaction.description}
          onClose={closeHistory}
        />
      )}
    </div>
  );
};

export default TransactionTable;
