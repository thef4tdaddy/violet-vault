import React from "react";
import useTransactionTable from "../../hooks/transactions/useTransactionTable";
import TransactionRow from "./components/TransactionRow";
import DeleteConfirmation from "./components/DeleteConfirmation";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";
import { COLUMN_WIDTHS } from "../../utils/transactions/tableHelpers";
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

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
      <div ref={parentRef} className="overflow-auto" style={{ maxHeight: "70vh" }}>
        <table className="w-full">
          {/* Table Header */}
          <thead className="bg-white/90 backdrop-blur-sm sticky top-0 z-20 border-b-2 border-gray-300 shadow-sm">
            <tr>
              <th
                className={`${COLUMN_WIDTHS.date} px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Date
              </th>
              <th
                className={`${COLUMN_WIDTHS.description} px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Description
              </th>
              <th
                className={`${COLUMN_WIDTHS.category} px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Category
              </th>
              <th
                className={`${COLUMN_WIDTHS.envelope} px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Envelope
              </th>
              <th
                className={`${COLUMN_WIDTHS.amount} px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Amount
              </th>
              <th
                className={`${COLUMN_WIDTHS.actions} px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody
            className="divide-y divide-gray-200"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
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
                  />
                ) : (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    envelopes={envelopes}
                    virtualRow={virtualRow}
                    onEdit={onEdit}
                    onSplit={onSplit}
                    onDeleteClick={handleDeleteClick}
                    onHistoryClick={handleHistoryClick}
                  />
                );
              })
            )}
          </tbody>
        </table>
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
