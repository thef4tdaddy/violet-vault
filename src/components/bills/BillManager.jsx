/**
 * BillManager Component - Refactored for Issue #152
 *
 * UI-only component using useBillManager hook for business logic
 * Reduced from 1,156 LOC to ~400 LOC by extracting business logic
 */
import React from "react";
import {
  FileText,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Bell,
  Settings,
  Target,
  Filter,
  Eye,
  History,
} from "lucide-react";
import { useBillManager } from "../../hooks/bills/useBillManager";
import { useBillManagerUI } from "../../hooks/bills/useBillManagerUI";
import useEditLock from "../../hooks/common/useEditLock";
import { useAuth } from "../../stores/auth/authStore";
import AddBillModal from "./AddBillModal";
import BulkBillUpdateModal from "./BulkBillUpdateModal";
import logger from "../../utils/common/logger";
import BillDiscoveryModal from "./BillDiscoveryModal";
import BillDetailModal from "./modals/BillDetailModal";
import ObjectHistoryViewer from "../history/ObjectHistoryViewer";
import ConnectionDisplay, {
  ConnectionItem,
  ConnectionInfo,
  UniversalConnectionManager,
} from "../ui/ConnectionDisplay";
import BillManagerHeader from "./BillManagerHeader";
import BillSummaryCards from "./BillSummaryCards";

const BillManager = ({
  transactions: propTransactions = [],
  envelopes: propEnvelopes = [],
  onUpdateBill,
  onCreateRecurringBill,
  onSearchNewBills,
  onError,
  className = "",
}) => {
  // Use the extracted business logic hook
  const {
    // Data
    bills,
    categorizedBills,
    filteredBills,
    totals,
    envelopes,

    // UI State
    selectedBills,
    viewMode,
    isSearching,
    showBillDetail,
    showAddBillModal,
    editingBill,
    showBulkUpdateModal,
    showDiscoveryModal,
    discoveredBills,
    historyBill,
    filterOptions,
    isLoading,

    // Actions
    searchNewBills,
    handleAddDiscoveredBills,
    handleBulkUpdate,
    setSelectedBills,
    setViewMode,
    setShowBillDetail,
    setShowAddBillModal,
    setEditingBill,
    setShowBulkUpdateModal,
    setShowDiscoveryModal,
    setHistoryBill,
    setFilterOptions,

    // Bill operations
    billOperations,
    addBill,
    updateBill,
    deleteBill,
  } = useBillManager({
    propTransactions,
    propEnvelopes,
    onUpdateBill,
    onCreateRecurringBill,
    onSearchNewBills,
    onError,
  });

  // UI logic hook
  const {
    viewModes,
    getSummaryCards,
    toggleBillSelection,
    selectAllBills,
    clearSelection,
    selectionState,
    handleAddNewBill,
    handleEditBill,
    handleCloseModal,
    _handleViewHistory,
    getBillDisplayData,
  } = useBillManagerUI({
    bills,
    categorizedBills,
    filteredBills,
    selectedBills,
    setSelectedBills,
    setShowAddBillModal,
    setEditingBill,
    setHistoryBill,
  });

  // Generate summary cards from totals
  const summaryCards = getSummaryCards(totals);

  // Edit lock for collaborative editing
  const { budgetId, currentUser } = useAuth();
  const { isLocked: isEditLocked, currentEditor } = useEditLock(
    `bills-${budgetId}`,
    currentUser?.userName || "User"
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Actions */}
      <BillManagerHeader 
        isEditLocked={isEditLocked}
        currentEditor={currentEditor}
        isSearching={isSearching}
        searchNewBills={searchNewBills}
        handleAddNewBill={handleAddNewBill}
      />

      {/* Summary Cards */}
      <BillSummaryCards totals={totals} />

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {mode.label}
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {mode.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <input
          type="text"
          placeholder="Search bills..."
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <select
          value={filterOptions.urgency}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, urgency: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Urgency</option>
          <option value="overdue">Overdue</option>
          <option value="urgent">Urgent</option>
          <option value="soon">Soon</option>
          <option value="normal">Normal</option>
        </select>
      </div>

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
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
              DEBUG: Bills={bills.length}, Categorized=
              {JSON.stringify(
                Object.keys(categorizedBills).map((k) => `${k}:${categorizedBills[k]?.length || 0}`)
              )}
              , ViewMode={viewMode}, Filtered={filteredBills.length}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddBillModal && (
        <AddBillModal
          isOpen={showAddBillModal}
          onClose={handleCloseModal}
          editingBill={editingBill}
          availableEnvelopes={envelopes}
          onAddBill={addBill}
          onUpdateBill={updateBill}
          onDeleteBill={deleteBill}
          onError={onError}
        />
      )}

      {showBulkUpdateModal && (
        <BulkBillUpdateModal
          isOpen={showBulkUpdateModal}
          onClose={() => setShowBulkUpdateModal(false)}
          selectedBills={Array.from(selectedBills)
            .map((id) => bills.find((b) => b.id === id))
            .filter(Boolean)}
          availableEnvelopes={envelopes}
          onUpdateBills={handleBulkUpdate}
          onError={onError}
        />
      )}

      {showDiscoveryModal && (
        <BillDiscoveryModal
          isOpen={showDiscoveryModal}
          onClose={() => {
            setShowDiscoveryModal(false);
          }}
          discoveredBills={discoveredBills}
          existingBills={bills}
          availableEnvelopes={envelopes}
          onAddBills={handleAddDiscoveredBills}
          onError={onError}
        />
      )}

      {showBillDetail && (
        <BillDetailModal
          bill={showBillDetail}
          isOpen={!!showBillDetail}
          onClose={() => setShowBillDetail(null)}
          onDelete={deleteBill}
          onMarkPaid={billOperations.handlePayBill}
          onEdit={(bill) => {
            setShowBillDetail(null);
            handleEditBill(bill);
          }}
          onCreateRecurring={(bill) => {
            // Handle making a one-time bill recurring
            // TODO: Implement recurring bill functionality
            logger.warn("Recurring bill creation not yet implemented:", bill.name);
          }}
        />
      )}

      {historyBill && (
        <ObjectHistoryViewer
          isOpen={!!historyBill}
          onClose={() => setHistoryBill(null)}
          objectId={historyBill.id}
          objectType="bill"
          title={`Bill History: ${historyBill.name}`}
        />
      )}
    </div>
  );
};

export default BillManager;
