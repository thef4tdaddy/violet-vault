import React, { useRef, useState } from "react";
import { Edit3, Trash2, Scissors, History } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";

const TransactionTable = ({ transactions = [], envelopes = [], onEdit, onDelete, onSplit }) => {
  const [historyTransaction, setHistoryTransaction] = useState(null);

  const handleDelete = (transactionId) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      onDelete(transactionId);
    }
  };

  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
      <div ref={parentRef} className="overflow-auto max-h-[70vh]">
        <table className="w-full relative">
          <thead className="bg-white/50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Envelope
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className="divide-y divide-gray-200"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const transaction = transactions[virtualRow.index];
                const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
                return (
                  <tr
                    key={transaction.id}
                    className="hover:bg-white/30"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.notes && (
                        <div className="text-xs text-gray-500">{transaction.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.category || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {envelope ? (
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: envelope.color }}
                          />
                          {envelope.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span
                        className={transaction.amount >= 0 ? "text-emerald-600" : "text-red-600"}
                      >
                        {transaction.amount >= 0 ? "+" : ""}$
                        {Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        {onSplit && (
                          <button
                            onClick={() => onSplit(transaction)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Split transaction"
                          >
                            <Scissors className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setHistoryTransaction(transaction)}
                          className="text-gray-600 hover:text-blue-600"
                          title="View history"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit transaction"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
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
          onClose={() => setHistoryTransaction(null)}
        />
      )}
    </div>
  );
};

export default TransactionTable;
