import React from "react";
import { FileText, CheckCircle } from "lucide-react";

/**
 * Bill table with bulk actions and selection
 * Pure UI component that preserves exact visual appearance
 */
const BillTable = ({
  filteredBills,
  selectionState,
  clearSelection,
  selectAllBills,
  toggleBillSelection,
  setShowBulkUpdateModal,
  setShowBillDetail,
  getBillDisplayData,
  billOperations,
  categorizedBills,
  viewMode,
}) => {
  return (
    <>
      {/* Bulk Actions */}
      {selectionState.hasSelection && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectionState.selectedCount} bill
            {selectionState.selectedCount > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkUpdateModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Bulk Update
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-white/20 ring-1 ring-gray-800/10">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectionState.isAllSelected}
                  onChange={selectionState.isAllSelected ? clearSelection : selectAllBills}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill) => {
              const displayData = getBillDisplayData(bill);

              return (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setShowBillDetail(bill)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={displayData.isSelected}
                      onChange={() => toggleBillSelection(bill.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <displayData.Icon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bill.name}</div>
                        <div className="text-sm text-gray-500">{bill.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${displayData.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {displayData.dueDateDisplay}
                    {displayData.daysDisplay && (
                      <div className="text-xs text-gray-500">{displayData.daysDisplay}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${displayData.urgencyColors}`}
                    >
                      {displayData.statusText}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      {!bill.isPaid && (
                        <button
                          onClick={() => billOperations.handlePayBill(bill.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-medium text-xs flex items-center gap-1.5"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredBills.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === "all"
                ? "Get started by adding a new bill."
                : "Try switching to a different view or adjusting filters."}
            </p>
            <div className="mt-4 text-xs text-gray-400 font-mono">
              DEBUG: Bills={filteredBills.length}, Categorized=
              {JSON.stringify(
                Object.keys(categorizedBills).map((k) => `${k}:${categorizedBills[k]?.length || 0}`)
              )}
              , ViewMode={viewMode}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BillTable;
